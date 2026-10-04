import { MODULE_BY_KEY } from '@/data/modules'
import { allRows, listRows, resetRows, saveRows } from '@/data/local-store'
import {
  conflictReport,
  ensureOccupancy,
  getClaim,
  previewAccept,
  rebuildOccupancy,
  resetOccupancyLedger,
} from '@/data/occupancy'
import type {
  ActionResult,
  EntryRow,
  FlightListResult,
  ModuleMeta,
  OverviewResult,
  PageResult,
} from '@/data/types'

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

/** 机位列表：先确保占用台账已回填并已把当前航班/占用待办投影到机位行，再读。 */
export function listStandEntries(filters: Record<string, string> = {}): PageResult {
  ensureOccupancy()
  return listEntries('stand', filters)
}

/**
 * 航班保障列表：先按筛选条件（值班员按计划到达、保障等级筛当天要接的任务）取子集，
 * 再逐条核占用冲突。三条计数同源于占用台账，按
 * 总数 = 机位侧 + 班组侧 − 两处同撞 对账，任何一侧都不会少报，不会出现「筛出十条只报六条」。
 */
export function listFlightEntries(filters: Record<string, string> = {}): FlightListResult {
  ensureOccupancy()
  const matched = filterRows(listRows('flight'), filters)
  const report = conflictReport(matched.map((row) => Number(row.id)))
  const conflictById = new Map(report.conflicts.map((c) => [c.flightId, c]))
  const items = matched.map((row) => {
    const conflict = conflictById.get(Number(row.id))
    if (!conflict) return row
    const labels = conflict.evidences.map((e) =>
      e.kind === 'stand' ? `机位撞 ${e.other航班号}` : `班组撞 ${e.other航班号}`,
    )
    return {
      ...row,
      冲突标记: conflict.standConflict && conflict.teamConflict ? '机位+班组冲突' : conflict.standConflict ? '机位冲突' : '班组冲突',
      冲突证据: labels.join('；'),
    }
  })
  return {
    items,
    total: items.length,
    page: 1,
    size: items.length,
    conflicts: report.conflicts,
    conflictSummary: {
      total: report.total,
      standSide: report.standSide,
      teamSide: report.teamSide,
      bothSide: report.bothSide,
    },
  }
}

export type FlightDraft = {
  航班号: string
  机型: string
  计划到达: string
  机位号: string
  保障等级: string
  保障班组: string
}

function nextId(rows: EntryRow[]): number {
  return rows.reduce((max, row) => Math.max(max, Number(row.id)), 0) + 1
}

function conflictMessage(flightId: number): string {
  const claim = getClaim(flightId)
  if (!claim || claim.conflicts.length === 0) return ''
  const stand = claim.conflicts.find((e) => e.kind === 'stand')
  const team = claim.conflicts.find((e) => e.kind === 'team')
  const parts: string[] = []
  // 机位与班组两条证据同时成立时，机位冲突先报，班组证据随后附上。
  if (stand) parts.push(`机位 ${claim.机位号} 在同一时段已被 ${stand.other航班号} 占用`)
  if (team) parts.push(`保障班组 ${claim.保障班组} 在同一时段已有 ${team.other航班号} 的在岗任务`)
  return parts.join('；')
}

/** 登记航班保障任务：登记时即按计划到达时段核机位与班组，冲突只预警不拦截，并回写机位占用待办。 */
export function registerFlight(draft: FlightDraft): ActionResult & { id?: number } {
  ensureOccupancy()
  for (const field of ['航班号', '计划到达', '机位号', '保障等级', '保障班组'] as const) {
    if (!String(draft[field] ?? '').trim()) {
      return { ok: false, message: `${field}不能为空` }
    }
  }
  const rows = listRows('flight')
  const id = nextId(rows)
  const created: EntryRow = {
    id,
    status: '待接收',
    pending: true,
    abnormal: false,
    保障编号: `FLIG-${String(id).padStart(4, '0')}`,
    航班号: draft.航班号.trim(),
    机型: draft.机型.trim(),
    计划到达: draft.计划到达.trim(),
    机位号: draft.机位号.trim(),
    保障等级: draft.保障等级.trim(),
    保障班组: draft.保障班组.trim(),
    保障状态: '待接收',
  }
  saveRows('flight', [...rows, created])
  rebuildOccupancy()
  const warn = conflictMessage(id)
  return {
    ok: true,
    id,
    message: warn
      ? `航班 ${created.航班号} 已登记（待接收），但存在占用冲突：${warn}，冲突已写入对应机位占用待办`
      : `航班 ${created.航班号} 已登记，状态「待接收」，机位与班组时段均无冲突`,
  }
}

function advanceStatus(meta: ModuleMeta, current: string, target: string): boolean {
  if (!meta.flow) return true
  const index = meta.flow.indexOf(current)
  if (index < 0) return false
  return meta.flow[index + 1] === target
}

/**
 * 航班动作：
 * - 接收任务：只允许「待接收→保障中」，不许跳步；接收时按计划到达时段核机位与班组，
 *   冲突则拦截、任务留在待接收（冲突预警仍回写机位占用待办）。同一条任务重复接收只算一次占用。
 * - 确认完成：只允许「保障中→保障完成」。
 */
export function runFlightAction(id: number, action: string): ActionResult {
  ensureOccupancy()
  const meta = moduleMeta('flight')
  const target = meta.actionTargets[action]
  if (!target) {
    return { ok: false, message: `${meta.entity}没有登记「${action}」这个动作` }
  }
  const rows = listRows('flight')
  const index = rows.findIndex((row) => Number(row.id) === id)
  if (index < 0) {
    return { ok: false, message: `没有找到编号为 ${id} 的${meta.entity}` }
  }
  const current = String(rows[index].status)
  if (current === target) {
    return { ok: false, message: `${meta.entity}已经是「${target}」，不用重复操作` }
  }
  if (!advanceStatus(meta, current, target)) {
    return { ok: false, message: `状态只能按 待接收→保障中→保障完成 依次推进，不能从「${current}」直接操作「${action}」` }
  }

  if (action === '接收任务') {
    // 预演接收后的台账：本任务进入已接收序列重新占位，有冲突就拦住，状态不推进。
    const previewed = previewAccept(id)
    const claim = previewed.find((c) => c.flightId === id)
    if (claim && claim.conflicts.length > 0) {
      // 用真实状态（仍待接收）重算一遍，保证预警标记与机位占用待办是最新的。
      rebuildOccupancy()
      return {
        ok: false,
        message: `接收被占用校验拦截：${conflictMessage(id)}。请调整机位或班组后再接收，任务仍为「待接收」`,
      }
    }
  }

  const lastStatus = meta.statuses[meta.statuses.length - 1]
  const updated: EntryRow = {
    ...rows[index],
    status: target,
    pending: target !== lastStatus,
    abnormal: false,
    保障状态: target,
  }
  const next = [...rows]
  next[index] = updated
  saveRows('flight', next)
  rebuildOccupancy()
  return { ok: true, message: `${meta.entity}已${action}，当前状态「${target}」` }
}

export function runAction(key: string, id: number, action: string): ActionResult {
  const meta = moduleMeta(key)
  const target = meta.actionTargets[action]
  if (!target) {
    return { ok: false, message: `${meta.entity}没有登记「${action}」这个动作` }
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
  if (meta.flow && !advanceStatus(meta, current, target)) {
    return { ok: false, message: `状态只能按 ${meta.flow.join('→')} 依次推进，不能从「${current}」直接操作「${action}」` }
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
  if (key === 'flight') {
    // 航班复位会动占用台账：连同台账与机位占用回写一起重建，保持同一份事实。
    resetOccupancyLedger()
    ensureOccupancy()
    return listFlightEntries()
  }
  if (key === 'stand') {
    // 机位复位后立刻用占用台账重新投影当前航班/占用待办。
    ensureOccupancy()
  }
  return listEntries(key)
}

/** 班组口径的同读数：每个保障班组当前同时段在岗冲突任务数，与航班筛选页班组侧计数同源。 */
export function teamConflictLoad(): Map<string, number> {
  ensureOccupancy()
  const report = conflictReport(listRows('flight').map((row) => Number(row.id)))
  return report.teamByName
}

export function exportEntries(key: string): { filename: string; content: string } {
  const meta = moduleMeta(key)
  const header = ['编号', ...meta.fields, '当前状态']
  const lines = [header.join(',')]
  for (const row of listRows(key)) {
    lines.push([row.id, ...meta.fields.map((field) => row[field] ?? ''), row.status].join(','))
  }
  return { filename: `${meta.name}-清单.csv`, content: `﻿${lines.join('\n')}` }
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
  ensureOccupancy()
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
