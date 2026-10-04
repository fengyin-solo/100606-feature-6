import { SEED_ROWS } from './seed'
import type { EntryRow } from './types'

// 本地持久化：数据放在 localStorage 里，刷新、关掉再打开都还在。
const STORAGE_KEY = 'airport-ground-ops:entries'
// 示例数据结构变动（占用校验需要真实的计划到达/机位/班组）时抬版本，老缓存自动重新播种。
const SEED_VERSION = 2
const VERSION_KEY = 'airport-ground-ops:seed-version'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function seedFallback(): Record<string, EntryRow[]> {
  return clone(SEED_ROWS)
}

function persist(data: Record<string, EntryRow[]>): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    window.localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
  }
}

function readStorage(): Record<string, EntryRow[]> {
  const fallback = seedFallback()
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback
  }
  const version = window.localStorage.getItem(VERSION_KEY)
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw || version !== String(SEED_VERSION)) {
    persist(fallback)
    return fallback
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, EntryRow[]>
    return { ...fallback, ...parsed }
  } catch {
    persist(fallback)
    return fallback
  }
}

let cache: Record<string, EntryRow[]> | null = null

export function allRows(): Record<string, EntryRow[]> {
  if (cache === null) {
    cache = readStorage()
  }
  return cache
}

export function listRows(key: string): EntryRow[] {
  return allRows()[key] ?? []
}

export function saveRows(key: string, rows: EntryRow[]): void {
  const next = { ...allRows(), [key]: rows }
  cache = next
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
}

export function resetRows(key: string): EntryRow[] {
  const rows = clone(SEED_ROWS[key] ?? [])
  saveRows(key, rows)
  return rows
}

export function storageKey(): string {
  return STORAGE_KEY
}
