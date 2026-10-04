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

export type OccupancyConflictInfo = {
  kind: 'stand' | 'team' | 'both'
  primary: 'stand' | 'team'
  message: string
}

export type FlightConflictRow = {
  flightId: number
  flightNo: string
  arrival: string
  standNo: string
  teamName: string
  kind: 'stand' | 'team' | 'both'
  primary: 'stand' | 'team'
  message: string
}

export type FilterConflictReport = {
  scanned: number
  conflictCount: number
  standEvidenceCount: number
  teamEvidenceCount: number
  conflicts: FlightConflictRow[]
}

export type CreateFlightInput = {
  航班号: string
  机型: string
  计划到达: string
  机位号: string
  保障等级: string
  保障班组: string
}

export type CreateFlightResult = {
  ok: boolean
  message: string
  entry: EntryRow | null
  conflict: OccupancyConflictInfo | null
}

export type OverviewResult = {
  cards: { label: string; value: number }[]
  modules: { name: string; created: number; pending: number; abnormal: number }[]
}
