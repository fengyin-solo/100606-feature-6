/** 纯前端数据层的公共类型：与全栈版后端返回的结构保持一致，换回后端时页面不用改。 */

export type EntryRow = {
  id: number
  status: string
  pending: boolean
  abnormal: boolean
  [field: string]: string | number | boolean
}

export type ModuleMeta = {
  key: string
  name: string
  entity: string
  desc: string
  fields: string[]
  statuses: string[]
  actions: string[]
  actionTargets: Record<string, string>
  metrics: string[]
  // 有顺序的状态链：命中的模块走动作时只允许推进到链条里的下一态，不许跳步。
  flow?: string[]
}

export type PageResult = {
  items: EntryRow[]
  total: number
  page: number
  size: number
}

export type ActionResult = {
  ok: boolean
  message: string
}

export type OverviewResult = {
  cards: { label: string; value: number }[]
  modules: { name: string; created: number; pending: number; abnormal: number }[]
}

/** 占用冲突证据类型：机位、班组两类，顺序即优先级（机位冲突先算）。 */
export type ConflictKind = 'stand' | 'team'

/** 单条占用记录：一条航班任务对应一条，是机位/班组占用判定的唯一事实来源。 */
export type OccupancyClaim = {
  flightId: number
  航班号: string
  机位号: string
  保障班组: string
  计划到达: string
  保障等级: string
  windowStart: number
  windowEnd: number
  /** 该任务在机位/班组两处当前是否真的占着资源；回填让位或接收被拦时为 false。 */
  holdsStand: boolean
  holdsTeam: boolean
  /** 让位/被拦时保留的冲突证据，按机位→班组的优先级排列。 */
  conflicts: { kind: ConflictKind; otherFlightId: number; other航班号: string }[]
  /** 任务是否已接收（保障中/保障完成）。待接收任务只挂预警，不占资源。 */
  accepted: boolean
  source: 'backfill' | 'register'
}

export type FlightConflict = {
  flightId: number
  航班号: string
  primaryKind: ConflictKind
  evidences: OccupancyClaim['conflicts']
  standConflict: boolean
  teamConflict: boolean
}

export type FlightListResult = PageResult & {
  conflicts: FlightConflict[]
  /**
   * 冲突计数三条口径同源对账：
   * total（逐行冲突任务数）= standSide（机位占用待办汇总）+ teamSide（班组在岗冲突汇总）- bothSide（两处同撞）。
   */
  conflictSummary: {
    total: number
    standSide: number
    teamSide: number
    bothSide: number
  }
}
