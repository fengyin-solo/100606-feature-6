import { MODULE_BY_KEY } from '@/data/modules'
import { allRows, listRows, resetRows, saveRows } from '@/data/local-store'
import {
  FLIGHT_ACTIVE,
  FLIGHT_DONE,
  FLIGHT_MODULE,
  FLIGHT_PENDING,
  STAND_MODULE,
  TEAM_MODULE,
  conflictOfFlight,
  ensureBackfill,
  getFilteredConflictReport,
  mirrorWrite,
  parseArrival,
  registerClaim,
  resetOccupancyLedger,
} from '@/data/occupancy'
import type { ActionResult, CreateFlightInput, CreateFlightResult, EntryRow, FilterConflictReport, ModuleMeta, OverviewResult, PageResult } from '@/data/types'

// 会写进数据的「往回走」动作：命中就把这条记录标成异常态，看板上能一眼看出来。
const NEGATIVE_ACTIONS = ['撤销', '作废', '拒绝', '驳回', '停用', '忽略', '下线', '回滚']

export function moduleMeta(key: string): ModuleMeta {
  const meta = MODULE_BY_KEY.get(key)
  if (!meta) {
    throw new Error(`没有登记名为 ${key} 的业务模块`)
  }
  return meta
}

export function filterRows(rows: EntryRow[], filters: Record<string, string>): EntryRow[] {
  const pairs = Object.entries(filters).filter(([, value]) => value.trim() !== '')
  if (pairs.length === 0) {
    return rows
  }
  return rows.filter((row) =>
    pairs.every(([field, value]) => String(row[field] ?? '').includes(value.trim())),
  )
}

export function listEntries(key: string, filters: Record<string, string> = {}): PageResult {
  const matched = filterRows(listRows(key), filters)
  return { items: matched, total: matched.length, page: 1, size: matched.length }
}

// 航班保障的合法状态推进：待接收 → 保障中 → 保障完成，只许顺序推进，不许跳步。
const FLIGHT_TRANSITIONS: Record<string, string[]> = {
  接收任务: [FLIGHT_PENDING, FLIGHT_ACTIVE],
  开始保障: [FLIGHT_ACTIVE, FLIGHT_ACTIVE],
  确认完成: [FLIGHT_ACTIVE, FLIGHT_DONE],
}

function flightActionResult(action: string, id: number): ActionResult {
  const [from, to] = FLIGHT_TRANSITIONS[action]
  const rows = listRows(FLIGHT_MODULE)
  const index = rows.findIndex((row) => Number(row.id) === id)
  if (index < 0) {
    return { ok: false, message: `没有找到编号为 ${id} 的航班保障任务` }
  }
  const row = rows[index]
  const current = String(row.status)

  // 同一条任务重复接收只算一次占用：已经是保障中/保障完成时原样返回，不再重复落占用。
  if (action === '接收任务' && current !== FLIGHT_PENDING) {
    return { ok: true, message: `任务已接收过，占用只登记一次；当前状态「${current}」` }
  }
  if (current !== from) {
    return {
      ok: false,
      message: `任务当前为「${current}」，需先到「${from}」才能${action}，不许跳步`,
    }
  }

  // 接收时按计划到达时段把机位号与保障班组核一遍；撞车任务留在占用待办，不允许接收上岗。
  if (action === '接收任务') {
    const conflict = conflictOfFlight(id)
    if (conflict) {
      return {
        ok: false,
        message: `接收被占用校验拦截（${conflict.kind === 'stand' ? '机位冲突' : conflict.kind === 'team' ? '班组冲突' : '机位+班组双冲突'}）：${conflict.message}`,
      }
    }
  }

  const updated: EntryRow = {
    ...row,
    status: to,
    pending: to === FLIGHT_PENDING || to === FLIGHT_ACTIVE,
    abnormal: false,
    保障状态: to,
  }
  if (action === '开始保障') {
    updated['实际开工'] = new Date().toISOString().slice(0, 16).replace('T', ' ')
  }
  const next = [...rows]
  next[index] = updated
  saveRows(FLIGHT_MODULE, next)
  // 状态推进后重算占用并回写机位/班组：接收成功落占用，完成后释放。
  mirrorWrite()
  if (action === '开始保障') {
    return { ok: true, message: '保障已开始，当前状态「保障中」' }
  }
  return { ok: true, message: `任务已${action.replace('任务', '')}，当前状态「${to}」` }
}

export function createFlight(input: CreateFlightInput): CreateFlightResult {
  const required: Array<[keyof CreateFlightInput, string]> = [
    ['航班号', '航班号'],
    ['机型', '机型'],
    ['计划到达', '计划到达'],
    ['机位号', '机位号'],
    ['保障等级', '保障等级'],
    ['保障班组', '保障班组'],
  ]
  for (const [field, label] of required) {
    if (!String(input[field] ?? '').trim()) {
      return { ok: false, message: `${label}不能为空`, entry: null, conflict: null }
    }
  }
  if (Number.isNaN(parseArrival(input['计划到达']))) {
    return { ok: false, message: '计划到达时间格式无法识别，示例：2026-10-04 09:30', entry: null, conflict: null }
  }
  const rows = listRows(FLIGHT_MODULE)
  const id = rows.reduce((max, row) => Math.max(max, Number(row.id)), 0) + 1
  const serial = String(id).padStart(4, '0')
  const entry: EntryRow = {
    id,
    status: FLIGHT_PENDING,
    pending: true,
    abnormal: false,
    保障编号: `FLIG-${serial}`,
    航班号: input['航班号'].trim(),
    机型: input['机型'].trim(),
    计划到达: input['计划到达'].trim(),
    机位号: input['机位号'].trim(),
    保障等级: input['保障等级'].trim(),
    保障班组: input['保障班组'].trim(),
    保障状态: FLIGHT_PENDING,
  }
  saveRows(FLIGHT_MODULE, [...rows, entry])

  // 登记即校验：冲突仍登记入账（回写到机位/班组占用待办），由值班员调整，接收环节再拦截。
  const report = registerClaim(id)
  const conflict = report.conflicts.find((item) => item.flightId === id) ?? null
  if (conflict) {
    return {
      ok: true,
      message: `已登记为待接收，但占用校验发现${conflict.kind === 'stand' ? '机位冲突' : conflict.kind === 'team' ? '班组冲突' : '机位+班组双冲突'}：${conflict.message}`,
      entry,
      conflict: { kind: conflict.kind, primary: conflict.primary, message: conflict.message },
    }
  }
  return { ok: true, message: '已登记为待接收，机位与班组时段均空闲', entry, conflict: null }
}

/** 值班员筛选后核冲突：走列表筛选这条路，返回的条数与机位、班组两侧一致。 */
export function flightConflictReport(filters: Record<string, string> = {}): FilterConflictReport {
  return getFilteredConflictReport(filterRows(listRows(FLIGHT_MODULE), filters))
}

export function runAction(key: string, id: number, action: string): ActionResult {
  const meta = moduleMeta(key)
  const target = meta.actionTargets[action]
  if (!target) {
    return { ok: false, message: `${meta.entity}没有登记「${action}」这个动作` }
  }
  if (key === FLIGHT_MODULE) {
    return flightActionResult(action, id)
  }
  const rows = listRows(key)
  const index = rows.findIndex((row) => Number(row.id) === id)
  if (index < 0) {
    return { ok: false, message: `没有找到编号为 ${id} 的${meta.entity}` }
  }
  const current = String(rows[index].status)
  if (current === target) {
    return { ok: false, message: `${meta.entity}已经是「${target}」，不用重复操作` }
  }
  const lastStatus = meta.statuses[meta.statuses.length - 1]
  const updated: EntryRow = {
    ...rows[index],
    status: target,
    pending: target !== lastStatus,
    abnormal: NEGATIVE_ACTIONS.some((verb) => action.startsWith(verb)),
  }
  const next = [...rows]
  next[index] = updated
  saveRows(key, next)
  return { ok: true, message: `${meta.entity}已${action}，当前状态「${target}」` }
}

export function resetModule(key: string): PageResult {
  resetRows(key)
  if (key === FLIGHT_MODULE || key === STAND_MODULE || key === TEAM_MODULE) {
    // 重置航班先清占用账本；重置机位/班组后要按当前航班任务重新回写占用待办。
    if (key === FLIGHT_MODULE) {
      resetOccupancyLedger()
    }
    ensureBackfill()
  }
  return listEntries(key)
}

/** 首次加载时回填存量任务占用记录（幂等）。 */
export function bootstrapOccupancy(): void {
  ensureBackfill()
}

export function exportEntries(key: string): { filename: string; content: string } {
  const meta = moduleMeta(key)
  const header = ['编号', ...meta.fields, '当前状态']
  const lines = [header.join(',')]
  const escape = (value: unknown) => {
    const cell = String(value ?? '')
    return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
  }
  for (const row of listRows(key)) {
    lines.push([row.id, ...meta.fields.map((field) => escape(row[field])), escape(row.status)].join(','))
  }
  return { filename: `${meta.name}-清单.csv`, content: `\uFEFF${lines.join('\n')}` }
}

export function downloadEntries(key: string): void {
  const { filename, content } = exportEntries(key)
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function loadOverview(): OverviewResult {
  const rows = allRows()
  const modules = [...MODULE_BY_KEY.values()].map((meta) => {
    const entries = rows[meta.key] ?? []
    return {
      name: meta.name,
      created: entries.length,
      pending: entries.filter((row) => row.pending).length,
      abnormal: entries.filter((row) => row.abnormal).length,
    }
  })
  const cards = [
    { label: '业务模块', value: modules.length },
    { label: '登记总量', value: modules.reduce((sum, item) => sum + item.created, 0) },
    { label: '待处理', value: modules.reduce((sum, item) => sum + item.pending, 0) },
    { label: '异常量', value: modules.reduce((sum, item) => sum + item.abnormal, 0) },
  ]
  return { cards, modules }
}
