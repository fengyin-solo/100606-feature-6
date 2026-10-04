import { listRows, saveRows } from './local-store'
import type { EntryRow, FilterConflictReport, FlightConflictRow } from './types'

/**
 * 航班保障占用校验：
 * - 占用账本是机位（stand）与班组（team）两侧冲突数据的唯一来源（single source of truth），
 *   机位、班组页面读到的占用待办都由这里同一次计算成对回写，保证两侧条数一致。
 * - 占用时段：以「计划到达」为起点的固定 60 分钟（OCCUPANCY_WINDOW_MINUTES），
 *   区间为左闭右开 [到达, 到达+60)，到点边界不撞车。
 * - 让位次序：占用按「计划到达升序」逐条落位（first-come-first-served 到场先后）；
 *   计划到达相同则保障等级高者优先（要客 > 重要 > 普通）；仍相同则任务 id 小者优先。
 *   落位晚的一方让位，让位任务不被删除，冲突证据成对写进机位与班组的占用待办。
 * - 双证据成立时以机位冲突为主判定（机位是现场硬约束），班组冲突作为配对证据并列展示。
 */

export const OCCUPANCY_WINDOW_MINUTES = 60
export const FLIGHT_MODULE = 'flight'
export const STAND_MODULE = 'stand'
export const TEAM_MODULE = 'team'

export const FLIGHT_PENDING = '待接收'
export const FLIGHT_ACTIVE = '保障中'
export const FLIGHT_DONE = '保障完成'

export type ConflictKind = 'stand' | 'team' | 'both'

export type OccupancyClaim = {
  flightId: number
  flightNo: string
  standNo: string
  teamName: string
  arrival: string
  endTime: string
  level: string
  status: string
  received: boolean
  source: 'backfill' | 'register'
}

export type OccupancyEvidence = {
  kind: ConflictKind
  primary: 'stand' | 'team'
  standNo: string
  teamName: string
  ownerFlightId: number
  ownerFlightNo: string
  ownerArrival: string
  message: string
}

export type FlightConflict = FlightConflictRow & {
  standEvidence: OccupancyEvidence
  teamEvidence: OccupancyEvidence
}

export type TodoEntry = {
  side: 'stand' | 'team'
  flightId: number
  flightNo: string
  arrival: string
  standNo: string
  teamName: string
  kind: ConflictKind
  primary: 'stand' | 'team'
  message: string
}

type Evaluation = {
  claims: OccupancyClaim[]
  conflicts: Map<number, FlightConflict>
}

type LedgerShape = {
  version: number
  claims: Record<string, OccupancyClaim>
}

const LEDGER_KEY = 'airport-ground-ops:occupancy-ledger'
const LEDGER_VERSION = 1
const MIRROR_SOURCE = '航班保障占用账'
// 仅班组冲突时，机位侧没有对应的具体机位行；用这个虚拟机位号承载成对证据，保证两侧条数一致。
const STAND_TEAM_ONLY_KEY = '班组联动待办'

// 机位行的内部字段（导出 CSV 时不带这两个）：
const TODO_FIELD = '占用待办'
const SOURCE_FIELD = '占用来源'

let memoryLedger: LedgerShape | null = null

function text(row: EntryRow, field: string): string {
  return String(row[field] ?? '').trim()
}

/** 解析计划到达；只给日期时按当天 00:00 起算。 */
export function parseArrival(value: string): number {
  const raw = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T00:00:00`).getTime()
  }
  const parsed = new Date(raw.replace(/\//g, '-')).getTime()
  return Number.isNaN(parsed) ? Number.NaN : parsed
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatTime(ms: number): string {
  const date = new Date(ms)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function dayLabel(arrival: string): string {
  const ms = parseArrival(arrival)
  if (Number.isNaN(ms)) {
    return arrival.slice(0, 10)
  }
  return new Date(ms).toISOString().slice(0, 10)
}

export function windowLabel(arrival: string): string {
  const start = parseArrival(arrival)
  if (Number.isNaN(start)) {
    return arrival
  }
  return `${formatTime(start)}~${formatTime(start + OCCUPANCY_WINDOW_MINUTES * 60000)}`
}

/** 保障等级优先级：数字越大越优先；同等级到场次序一致时由任务 id 兜底。 */
function levelRank(level: string): number {
  if (level.includes('要客')) {
    return 3
  }
  if (level.includes('重要')) {
    return 2
  }
  return 1
}

function readLedger(): LedgerShape {
  if (memoryLedger) {
    return memoryLedger
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = window.localStorage.getItem(LEDGER_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as LedgerShape
        if (parsed && parsed.version === LEDGER_VERSION && parsed.claims) {
          memoryLedger = parsed
          return parsed
        }
      } catch {
        // 账本损坏时回退到按存量任务回填，不影响页面读取。
      }
    }
  }
  const fresh: LedgerShape = { version: LEDGER_VERSION, claims: {} }
  memoryLedger = fresh
  return fresh
}

function writeLedger(ledger: LedgerShape): void {
  memoryLedger = ledger
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger))
  }
}

export function resetOccupancyLedger(): void {
  memoryLedger = null
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(LEDGER_KEY)
  }
}

function claimFromRow(row: EntryRow, source: 'backfill' | 'register'): OccupancyClaim | null {
  const arrival = text(row, '计划到达')
  const start = parseArrival(arrival)
  if (Number.isNaN(start)) {
    return null
  }
  const status = text(row, 'status')
  return {
    flightId: Number(row.id),
    flightNo: text(row, '航班号') || text(row, '保障编号'),
    standNo: text(row, '机位号'),
    teamName: text(row, '保障班组'),
    arrival,
    endTime: formatTime(start + OCCUPANCY_WINDOW_MINUTES * 60000),
    level: text(row, '保障等级'),
    status,
    received: status !== FLIGHT_PENDING,
    source,
  }
}

function sortClaims(claims: OccupancyClaim[]): OccupancyClaim[] {
  return [...claims].sort((a, b) => {
    const timeDiff = parseArrival(a.arrival) - parseArrival(b.arrival)
    if (timeDiff !== 0) {
      return timeDiff
    }
    const levelDiff = levelRank(b.level) - levelRank(a.level)
    if (levelDiff !== 0) {
      return levelDiff
    }
    return a.flightId - b.flightId
  })
}

function isActiveStatus(status: string): boolean {
  return status === FLIGHT_PENDING || status === FLIGHT_ACTIVE
}

function overlap(a: OccupancyClaim, b: OccupancyClaim): boolean {
  const aStart = parseArrival(a.arrival)
  const bStart = parseArrival(b.arrival)
  const aEnd = aStart + OCCUPANCY_WINDOW_MINUTES * 60000
  const bEnd = bStart + OCCUPANCY_WINDOW_MINUTES * 60000
  return aStart < bEnd && bStart < aEnd
}

function buildEvidence(
  claim: OccupancyClaim,
  owner: OccupancyClaim,
  kind: ConflictKind,
  side: 'stand' | 'team',
): OccupancyEvidence {
  const standClash = kind !== 'team'
  const primary: 'stand' | 'team' = standClash ? 'stand' : 'team'
  let message: string
  if (side === 'stand') {
    message = standClash
      ? `机位 ${claim.standNo} 在 ${windowLabel(claim.arrival)} 已被航班 ${owner.flightNo}（计划 ${owner.arrival}）占用`
      : `班组联动待办：本航班机位 ${claim.standNo} 空闲，但保障班组 ${claim.teamName} 在 ${windowLabel(claim.arrival)} 已挂在航班 ${owner.flightNo}（计划 ${owner.arrival}）上`
  } else {
    message = kind === 'stand'
      ? `机位联动待办：本航班班组 ${claim.teamName} 空闲，但机位 ${claim.standNo} 在 ${windowLabel(claim.arrival)} 已被航班 ${owner.flightNo}（计划 ${owner.arrival}）占用`
      : `班组 ${claim.teamName} 在 ${windowLabel(claim.arrival)} 已被航班 ${owner.flightNo}（计划 ${owner.arrival}）占用`
  }
  return {
    kind,
    primary,
    standNo: claim.standNo,
    teamName: claim.teamName,
    ownerFlightId: owner.flightId,
    ownerFlightNo: owner.flightNo,
    ownerArrival: owner.arrival,
    message,
  }
}

/**
 * 核心占用评估：按让位次序落位。
 * 每个机位/班组同一时段只允许一条在岗占用；后到者让位，
 * 机位与班组两处冲突各自留证据，任何一处让位都成对生成两侧证据。
 */
function evaluate(flights: EntryRow[], ledger: LedgerShape): Evaluation {
  const claims: OccupancyClaim[] = []
  for (const row of flights) {
    const saved = ledger.claims[String(row.id)]
    const claim = claimFromRow(row, saved ? (saved.source as 'backfill' | 'register') : 'backfill')
    if (claim) {
      claims.push(claim)
    }
  }

  const standOwners = new Map<string, OccupancyClaim>()
  const teamOwners = new Map<string, OccupancyClaim>()
  const conflicts = new Map<number, FlightConflict>()

  for (const claim of sortClaims(claims)) {
    if (!isActiveStatus(claim.status)) {
      continue
    }
    let standOwner: OccupancyClaim | undefined
    let teamOwner: OccupancyClaim | undefined
    if (claim.standNo) {
      const holder = standOwners.get(claim.standNo)
      if (holder && overlap(holder, claim)) {
        standOwner = holder
      }
    }
    if (claim.teamName) {
      const holder = teamOwners.get(claim.teamName)
      if (holder && overlap(holder, claim)) {
        teamOwner = holder
      }
    }

    const standClash = Boolean(standOwner)
    const teamClash = Boolean(teamOwner)
    if (standClash || teamClash) {
      const kind: ConflictKind = standClash && teamClash ? 'both' : standClash ? 'stand' : 'team'
      // 双证据成立时以机位冲突为主判定（机位为现场硬约束），班组冲突并列保留。
      const primary: 'stand' | 'team' = standClash ? 'stand' : 'team'
      const standEvidence = buildEvidence(claim, (standOwner ?? teamOwner)!, kind, 'stand')
      const teamEvidence = buildEvidence(claim, (teamOwner ?? standOwner)!, kind, 'team')
      const parts = [standEvidence, teamEvidence].map((item) => item.message)
      conflicts.set(claim.flightId, {
        flightId: claim.flightId,
        flightNo: claim.flightNo,
        arrival: claim.arrival,
        standNo: claim.standNo,
        teamName: claim.teamName,
        kind,
        primary,
        message: parts.join('；'),
        standEvidence,
        teamEvidence,
      })
      continue
    }

    // 只有不撞车的任务才能拿到占用；已终止/已完成不参与落位。
    if (claim.standNo) {
      standOwners.set(claim.standNo, claim)
    }
    if (claim.teamName) {
      teamOwners.set(claim.teamName, claim)
    }
  }

  return { claims, conflicts }
}

/** 存量任务回填：按计划到达升序（同刻等级优先、再 id）逐条落位，撞车者让位并成对留冲突待办。 */
export function ensureBackfill(): void {
  const ledger = readLedger()
  const flights = listRows(FLIGHT_MODULE)
  const { claims } = evaluate(flights, ledger)
  const next: LedgerShape['claims'] = {}
  for (const claim of claims) {
    next[String(claim.flightId)] = { ...claim }
  }
  writeLedger({ version: LEDGER_VERSION, claims: next })
  mirrorWrite()
}

/** 登记新任务：先落占用评估，冲突照常登记（进占用待办），接收环节再拦截。 */
export function registerClaim(flightId: number): FilterConflictReport {
  const ledger = readLedger()
  const flights = listRows(FLIGHT_MODULE)
  const row = flights.find((item) => Number(item.id) === flightId)
  if (row) {
    const claim = claimFromRow(row, 'register')
    if (claim) {
      ledger.claims[String(flightId)] = claim
      writeLedger(ledger)
    }
  }
  return rebuildMirror(flights)
}

/** 重新评估并把占用结果成对回写到机位、班组两侧。 */
function rebuildMirror(flights: EntryRow[] = listRows(FLIGHT_MODULE)): FilterConflictReport {
  const ledger = readLedger()
  const { claims, conflicts } = evaluate(flights, ledger)
  const next: LedgerShape['claims'] = {}
  for (const claim of claims) {
    next[String(claim.flightId)] = { ...claim }
  }
  writeLedger({ version: LEDGER_VERSION, claims: next })
  writeStandMirror(conflicts)
  writeTeamMirror(conflicts)
  return {
    scanned: claims.filter((claim) => isActiveStatus(claim.status)).length,
    conflictCount: conflicts.size,
    standEvidenceCount: conflicts.size,
    teamEvidenceCount: conflicts.size,
    conflicts: [...conflicts.values()],
  }
}

/** 机位、班组任一侧数据变动后调用：账本不变，只重算回写。 */
export function mirrorWrite(): FilterConflictReport {
  return rebuildMirror()
}

function todosOf(conflicts: Map<number, FlightConflict>, side: 'stand' | 'team'): Map<string, TodoEntry[]> {
  const grouped = new Map<string, TodoEntry[]>()
  const put = (key: string, entry: TodoEntry) => {
    const list = grouped.get(key) ?? []
    list.push(entry)
    grouped.set(key, list)
  }
  for (const conflict of conflicts.values()) {
    const evidence = side === 'stand' ? conflict.standEvidence : conflict.teamEvidence
    const entry: TodoEntry = {
      side,
      flightId: conflict.flightId,
      flightNo: conflict.flightNo,
      arrival: conflict.arrival,
      standNo: conflict.standNo,
      teamName: conflict.teamName,
      kind: conflict.kind,
      primary: conflict.primary,
      message: evidence.message,
    }
    if (side === 'stand') {
      // 机位冲突挂在被占机位；仅班组冲突挂到「班组联动待办」虚拟行，两侧条数才能对齐。
      put(conflict.kind === 'team' ? STAND_TEAM_ONLY_KEY : conflict.standNo, entry)
    } else {
      put(conflict.teamName, entry)
    }
  }
  return grouped
}

function todoText(entries: TodoEntry[]): string {
  return entries
    .slice()
    .sort((a, b) => parseArrival(a.arrival) - parseArrival(b.arrival) || a.flightId - b.flightId)
    .map((entry) => `${entry.flightNo}(${entry.arrival})：${entry.message}`)
    .join('\n')
}

/** 冲突结果回写停机位占用待办；当前航班只认账本里同一来源的占用。 */
function writeStandMirror(conflicts: Map<number, FlightConflict>): void {
  const rows = listRows(STAND_MODULE)
  const ledger = readLedger()
  const todos = todosOf(conflicts, 'stand')

  // 仅班组冲突需要一行虚拟机位承载成对证据；没有时把上一轮的虚拟行回收掉。
  const virtualEntries = todos.get(STAND_TEAM_ONLY_KEY) ?? []
  const workingRows = virtualEntries.length
    ? upsertVirtualStand(rows, nextStandVirtualId(rows), virtualEntries)
    : rows.filter((row) => row['机位编号'] !== STAND_TEAM_ONLY_KEY)

  const holders = new Map<string, OccupancyClaim>()
  for (const claim of ledger.claims ? Object.values(ledger.claims) : []) {
    if (claim.status === FLIGHT_ACTIVE && claim.standNo && !conflicts.has(claim.flightId)) {
      const list = holders.get(claim.standNo)
      if (!list || parseArrival(claim.arrival) < parseArrival(list.arrival)) {
        holders.set(claim.standNo, claim)
      }
    }
  }

  const next = workingRows.map((row) => {
    const standNo = text(row, '机位编号')
    const entries = todos.get(standNo) ?? []
    const holder = holders.get(standNo)
    const isLedgerRow = row[SOURCE_FIELD] === MIRROR_SOURCE
    if (standNo === STAND_TEAM_ONLY_KEY) {
      return { ...row, [TODO_FIELD]: todoText(entries), [SOURCE_FIELD]: MIRROR_SOURCE } as EntryRow
    }
    if (!entries.length && !holder) {
      // 本轮既无待办也无在岗占用：只回收账本上一轮写过的机位，人工维护的行不动。
      if (isLedgerRow) {
        const updated: EntryRow = {
          ...row,
          status: '空闲',
          当前航班: '',
          占用时段: '',
        }
        updated[TODO_FIELD] = ''
        delete updated[SOURCE_FIELD]
        return updated
      }
      return row
    }
    const updated: EntryRow = {
      ...row,
      [TODO_FIELD]: entries.length ? todoText(entries) : '',
      [SOURCE_FIELD]: MIRROR_SOURCE,
    }
    if (holder) {
      updated['当前航班'] = holder.flightNo
      updated['占用时段'] = windowLabel(holder.arrival)
      updated.status = '占用中'
    } else {
      // 冲突待办还在、但无在岗占用：机位回到空闲，清掉同一账本写入的当前航班。
      updated['当前航班'] = ''
      updated['占用时段'] = ''
      updated.status = '空闲'
    }
    return updated
  })
  saveRows(STAND_MODULE, next)
}

function nextStandVirtualId(rows: EntryRow[]): number {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1
}

function upsertVirtualStand(rows: EntryRow[], id: number, entries: TodoEntry[]): EntryRow[] {
  const index = rows.findIndex((row) => row['机位编号'] === STAND_TEAM_ONLY_KEY)
  const virtual: EntryRow = {
    id,
    status: '空闲',
    pending: false,
    abnormal: false,
    机位编号: STAND_TEAM_ONLY_KEY,
    机位类型: '虚拟汇总（不对应实际机位）',
    适用机型: '—',
    廊桥配置: '—',
    近远机位: '—',
    占用时段: '—',
    当前航班: '—',
    [TODO_FIELD]: todoText(entries),
    [SOURCE_FIELD]: MIRROR_SOURCE,
  }
  if (index < 0) {
    return [...rows, virtual]
  }
  const next = [...rows]
  next[index] = { ...virtual, id: Number(rows[index].id) }
  return next
}

function writeTeamMirror(conflicts: Map<number, FlightConflict>): void {
  const rows = listRows(TEAM_MODULE)
  const todos = todosOf(conflicts, 'team')

  const next = rows.map((row) => {
    const entries = todos.get(text(row, '班组名称'))
    if (entries) {
      return {
        ...row,
        [TODO_FIELD]: todoText(entries),
        [SOURCE_FIELD]: MIRROR_SOURCE,
      }
    }
    if (row[SOURCE_FIELD] === MIRROR_SOURCE) {
      const updated: EntryRow = { ...row }
      updated[TODO_FIELD] = ''
      delete updated[SOURCE_FIELD]
      return updated
    }
    return row
  })
  saveRows(TEAM_MODULE, next)
}

/**
 * 筛选结果内逐条核冲突：必须在全量任务上评估占用（冲突对方可能不在筛选子集内），
 * 再只取筛选结果里的任务；冲突条数与机位、班组两侧读到的证据数严格一致。
 */
export function getFilteredConflictReport(filteredFlights: EntryRow[]): FilterConflictReport {
  const all = listRows(FLIGHT_MODULE)
  const ledger = readLedger()
  const { conflicts } = evaluate(all, ledger)
  const ids = new Set(filteredFlights.map((row) => Number(row.id)))
  const list = [...conflicts.values()].filter((conflict) => ids.has(conflict.flightId))
  return {
    scanned: filteredFlights.filter((row) => isActiveStatus(text(row, 'status'))).length,
    conflictCount: list.length,
    // 每条冲突成对生成机位/班组证据，三处口径必然相等。
    standEvidenceCount: list.length,
    teamEvidenceCount: list.length,
    conflicts: list,
  }
}

export function conflictOfFlight(flightId: number): FlightConflict | undefined {
  const flights = listRows(FLIGHT_MODULE)
  const ledger = readLedger()
  return evaluate(flights, ledger).conflicts.get(flightId)
}

/** 机位侧占用待办读到的条数（与筛选报告口径同源）。 */
export function standTodoCount(): number {
  const flights = listRows(FLIGHT_MODULE)
  const { conflicts } = evaluate(flights, readLedger())
  return conflicts.size
}

/** 班组侧占用待办读到的条数。 */
export function teamTodoCount(): number {
  const flights = listRows(FLIGHT_MODULE)
  const { conflicts } = evaluate(flights, readLedger())
  return conflicts.size
}

/** 读取停机位当前航班：只认占用账本，保证与航班任务是同一份。 */
export function standCurrentFlight(standNo: string): string {
  const ledger = readLedger()
  const { conflicts } = evaluate(listRows(FLIGHT_MODULE), ledger)
  let holder: OccupancyClaim | undefined
  for (const claim of Object.values(ledger.claims)) {
    if (
      claim.status === FLIGHT_ACTIVE &&
      claim.standNo === standNo &&
      !conflicts.has(claim.flightId) &&
      (!holder || parseArrival(claim.arrival) < parseArrival(holder.arrival))
    ) {
      holder = claim
    }
  }
  return holder ? holder.flightNo : ''
}
