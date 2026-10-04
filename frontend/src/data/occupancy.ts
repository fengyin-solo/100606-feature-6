import { listRows, saveRows } from './local-store'
import type { ConflictKind, EntryRow, FlightConflict, OccupancyClaim } from './types'

// 占用台账：机位号与保障班组的占用都以这份记录为准，停机位页读到的「当前航班」
// 与航班页、班组页的冲突数都从同一份台账投影，杜绝「筛出十条只报六条」。
const OCCUPANCY_STORAGE_KEY = 'airport-ground-ops:occupancy'
const OCCUPANCY_VERSION = 1

// 占用窗口口径：计划到达前 30 分钟进场、到达后 90 分钟离场；窗口相交即视为同一时段。
export const WINDOW_BEFORE_MIN = 30
export const WINDOW_AFTER_MIN = 90

// 回填让位次序里的保障等级权重：要客最先保位，其后一/二/三级。
const LEVEL_RANK: Record<string, number> = { 要客: 0, 一级: 1, 二级: 2, 三级: 3 }

// 两条证据同时成立时的判定次序：机位冲突先算，班组冲突其次（两条都保留，不丢证据）。
const KIND_ORDER: Record<ConflictKind, number> = { stand: 0, team: 1 }

let claimCache: OccupancyClaim[] | null = null

type LedgerPayload = { version: number; claims: OccupancyClaim[] }

function parsePlanTime(value: string): number {
  const text = String(value ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(`${text}T00:00:00`).getTime()
  }
  return new Date(text.replace(' ', 'T')).getTime()
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatStamp(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function formatRange(start: number, end: number): string {
  return `${formatStamp(start)} ~ ${formatStamp(end)}`
}

function overlap(a: OccupancyClaim, b: OccupancyClaim): boolean {
  return a.windowStart < b.windowEnd && b.windowStart < a.windowEnd
}

/** 存量回填让位次序：计划到达早者先保位；同时到达按保障等级（要客→一级→二级→三级）；再同则按任务 id。 */
export function backfillOrder(a: OccupancyClaim, b: OccupancyClaim): number {
  if (a.windowStart !== b.windowStart) return a.windowStart - b.windowStart
  const rankA = LEVEL_RANK[a.保障等级] ?? 99
  const rankB = LEVEL_RANK[b.保障等级] ?? 99
  if (rankA !== rankB) return rankA - rankB
  return a.flightId - b.flightId
}

function toClaim(row: EntryRow, prior: OccupancyClaim | undefined): OccupancyClaim {
  const plan = String(row['计划到达'] ?? '')
  const arrival = parsePlanTime(plan)
  return {
    flightId: Number(row.id),
    航班号: String(row['航班号'] ?? ''),
    机位号: String(row['机位号'] ?? ''),
    保障班组: String(row['保障班组'] ?? ''),
    计划到达: plan,
    保障等级: String(row['保障等级'] ?? ''),
    windowStart: arrival - WINDOW_BEFORE_MIN * 60_000,
    windowEnd: arrival + WINDOW_AFTER_MIN * 60_000,
    holdsStand: false,
    holdsTeam: false,
    conflicts: [],
    accepted: String(row.status) !== '待接收',
    source: prior?.source ?? 'register',
  }
}

/**
 * 按统一次序重算整条占用台账：
 * - 只有已接收（保障中/保障完成）的任务才占资源；待接收任务只挂冲突预警，不占位。
 * - 已接收任务先按回填次序落位并互相让位；待接收任务随后只对照持位者核时段，
 *   无论计划到达多早都不会遮蔽已在岗的持位者。
 * - 机位证据排在班组证据之前（同一撞机航班可能同时贡献两条）。
 */
export function buildClaims(flights: EntryRow[], prior: OccupancyClaim[] = []): OccupancyClaim[] {
  const priorMap = new Map(prior.map((c) => [c.flightId, c]))
  const all = flights.map((row) => toClaim(row, priorMap.get(Number(row.id)))).sort(backfillOrder)
  // 已接收的先落位，待接收的只做对照：保证待接收任务永远不抢占在岗持位者。
  const ordered = [...all.filter((c) => c.accepted), ...all.filter((c) => !c.accepted)]

  const standHolders: OccupancyClaim[] = []
  const teamHolders: OccupancyClaim[] = []
  const settled = new Map<number, OccupancyClaim>()

  for (const claim of ordered) {
    const evidences: OccupancyClaim['conflicts'] = []
    for (const holder of standHolders) {
      if (holder.机位号 === claim.机位号 && overlap(holder, claim)) {
        evidences.push({ kind: 'stand', otherFlightId: holder.flightId, other航班号: holder.航班号 })
      }
    }
    for (const holder of teamHolders) {
      if (holder.保障班组 === claim.保障班组 && overlap(holder, claim)) {
        evidences.push({ kind: 'team', otherFlightId: holder.flightId, other航班号: holder.航班号 })
      }
    }
    evidences.sort((x, y) => KIND_ORDER[x.kind] - KIND_ORDER[y.kind] || x.otherFlightId - y.otherFlightId)

    const standConflict = evidences.some((e) => e.kind === 'stand')
    const teamConflict = evidences.some((e) => e.kind === 'team')
    claim.conflicts = evidences
    if (claim.accepted) {
      claim.holdsStand = !standConflict
      claim.holdsTeam = !teamConflict
      if (claim.holdsStand) standHolders.push(claim)
      if (claim.holdsTeam) teamHolders.push(claim)
    }
    settled.set(claim.flightId, claim)
  }

  return all.map((c) => settled.get(c.flightId) as OccupancyClaim)
}

function standTodoText(claim: OccupancyClaim): string {
  const standEv = claim.conflicts.find((e) => e.kind === 'stand')
  const teamEv = claim.conflicts.find((e) => e.kind === 'team')
  const parts: string[] = []
  if (standEv) {
    parts.push(`${claim.accepted ? '机位让位' : '待接收机位冲突'}，撞 ${standEv.other航班号}`)
  }
  if (teamEv) {
    parts.push(`班组时段冲突，${claim.保障班组}撞 ${teamEv.other航班号}`)
  }
  return `${claim.accepted ? '让位' : '待接收'} ${claim.航班号}（计划 ${claim.计划到达}）：${parts.join('；')}`
}

/**
 * 把占用台账回写到停机位：当前航班/占用时段/机位状态全部从台账投影，
 * 机位冲突逐条进「占用待办」（纯班组撞车不写机位待办，避免机位侧虚增条数）。
 * 维护中、已封闭的机位不参与占用回写。
 */
export function projectStands(claims: OccupancyClaim[]): void {
  const stands = listRows('stand')
  const next = stands.map((stand) => {
    if (stand.status === '维护中' || stand.status === '已封闭') {
      return stand
    }
    const code = String(stand['机位编号'] ?? '')
    const mine = claims.filter((c) => c.机位号 === code)
    const holder = mine.filter((c) => c.holdsStand).sort((a, b) => a.windowStart - b.windowStart)[0]
    // 机位侧只汇总机位证据：班组撞车若发生在一个空闲机位上，不应挂到该机位待办。
    const todos = mine.filter((c) => c.conflicts.some((e) => e.kind === 'stand'))
    const status = holder ? '占用中' : '空闲'
    return {
      ...stand,
      status,
      pending: Boolean(holder) || todos.length > 0,
      abnormal: false,
      占用时段: holder ? formatRange(holder.windowStart, holder.windowEnd) : '',
      当前航班: holder ? holder.航班号 : '',
      占用待办: todos.map(standTodoText).join(' | '),
      机位状态: status,
    }
  })
  saveRows('stand', next)
}

function readStoredClaims(): OccupancyClaim[] | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  try {
    const raw = window.localStorage.getItem(OCCUPANCY_STORAGE_KEY)
    if (!raw) return null
    const payload = JSON.parse(raw) as LedgerPayload
    if (payload.version !== OCCUPANCY_VERSION || !Array.isArray(payload.claims)) return null
    return payload.claims
  } catch {
    return null
  }
}

function persistClaims(claims: OccupancyClaim[]): void {
  claimCache = claims
  if (typeof window !== 'undefined' && window.localStorage) {
    const payload: LedgerPayload = { version: OCCUPANCY_VERSION, claims }
    window.localStorage.setItem(OCCUPANCY_STORAGE_KEY, JSON.stringify(payload))
  }
}

/** 按台账重算航班异常标记与保障状态镜像：撞车任务在列表上一眼能看出。 */
function syncFlights(claims: OccupancyClaim[], forceWrite: boolean): void {
  const byId = new Map(claims.map((c) => [c.flightId, c]))
  const flights = listRows('flight')
  let changed = false
  const next = flights.map((row) => {
    const claim = byId.get(Number(row.id))
    if (!claim) return row
    const abnormal = claim.conflicts.length > 0
    const updated = { ...row, abnormal, 保障状态: String(row.status) }
    if (updated.abnormal !== row.abnormal || updated.保障状态 !== row['保障状态']) {
      changed = true
    }
    return updated
  })
  if (changed || forceWrite) {
    saveRows('flight', next)
  }
}

function rebuild(markSource: 'backfill' | 'live'): OccupancyClaim[] {
  const prior = claimCache ?? readStoredClaims() ?? []
  if (markSource === 'backfill') {
    // 存量回填：现有任务一律按回填来源登记，随后按回填次序让位。
    prior.forEach((c) => {
      c.source = 'backfill'
    })
  }
  const claims = buildClaims(listRows('flight'), prior)
  syncFlights(claims, markSource === 'backfill')
  projectStands(claims)
  persistClaims(claims)
  return claims
}

/** 首次打开（或老数据升级）时，按计划到达把存量任务回填成占用记录。 */
export function ensureOccupancy(): OccupancyClaim[] {
  if (claimCache) return claimCache
  const stored = readStoredClaims()
  if (stored) {
    claimCache = stored
    // 仍把台账投影到机位，保证机位页读到的当前航班与台账是同一份。
    projectStands(stored)
    return stored
  }
  return rebuild('backfill')
}

/** 用当前航班任务整表重算台账（登记新任务、接收任务后调用）。 */
export function rebuildOccupancy(): OccupancyClaim[] {
  return rebuild('live')
}

/** 航班模块复位时清掉台账缓存与持久化，随后由 ensureOccupancy 按新种子重新回填。 */
export function resetOccupancyLedger(): void {
  claimCache = null
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(OCCUPANCY_STORAGE_KEY)
  }
}

export function listClaims(): OccupancyClaim[] {
  return ensureOccupancy()
}

export function getClaim(flightId: number): OccupancyClaim | undefined {
  return listClaims().find((c) => c.flightId === flightId)
}

/** 假设某条待接收任务被接收，预演其冲突证据；不写数据，供接收拦截判定。 */
export function previewAccept(flightId: number): OccupancyClaim[] {
  const flights = listRows('flight').map((row) =>
    Number(row.id) === flightId ? { ...row, status: '保障中' } : row,
  )
  return buildClaims(flights, listClaims())
}

function toFlightConflict(claim: OccupancyClaim): FlightConflict {
  const standConflict = claim.conflicts.some((e) => e.kind === 'stand')
  const teamConflict = claim.conflicts.some((e) => e.kind === 'team')
  return {
    flightId: claim.flightId,
    航班号: claim.航班号,
    primaryKind: claim.conflicts[0]?.kind ?? 'stand',
    evidences: claim.conflicts,
    standConflict,
    teamConflict,
  }
}

/**
 * 顺着列表筛选结果逐条核冲突：入参是筛选后航班 id，输出逐行冲突与三条口径的计数。
 * 三条计数来自同一份台账：总数=机位口径+班组口径-两处同撞；机位侧从机位占用待办汇总，
 * 班组侧从班组在岗冲突汇总，任何一边都不会少报。
 */
export function conflictReport(flightIds: number[]): {
  conflicts: FlightConflict[]
  total: number
  standSide: number
  teamSide: number
  bothSide: number
  standByCode: Map<string, number>
  teamByName: Map<string, number>
} {
  const scoped = new Set(flightIds)
  const conflicts = listClaims()
    .filter((c) => scoped.has(c.flightId) && c.conflicts.length > 0)
    .map(toFlightConflict)
  const standSide = conflicts.filter((c) => c.standConflict).length
  const teamSide = conflicts.filter((c) => c.teamConflict).length
  const bothSide = conflicts.filter((c) => c.standConflict && c.teamConflict).length

  const standByCode = new Map<string, number>()
  const teamByName = new Map<string, number>()
  for (const c of conflicts) {
    if (c.standConflict) {
      const claim = getClaim(c.flightId)
      const code = claim?.机位号 ?? ''
      standByCode.set(code, (standByCode.get(code) ?? 0) + 1)
    }
    if (c.teamConflict) {
      const claim = getClaim(c.flightId)
      const name = claim?.保障班组 ?? ''
      teamByName.set(name, (teamByName.get(name) ?? 0) + 1)
    }
  }
  return { conflicts, total: conflicts.length, standSide, teamSide, bothSide, standByCode, teamByName }
}
