import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { sampleData, type AppData } from './data'

const ARCHIVE_KEY = 'mein-live-archive'
const ACTIVE_KEY = 'mein-live-active'
const DATA_KEY = 'mein-live-data'
const META_KEY = 'mein-live-meta'

export const closeMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
export const closeMonthNames: Record<string, string> = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December',
}

export type MonthPack = {
  id: string
  year: string
  month: string
  file: string
  at: string
  source: 'sample' | 'upload' | 'published'
  data: AppData
}

export type LiveMeta = {
  source: MonthPack['source']
  file: string
  at: string
  year: string
  month: string
  id: string
}

type Ctx = {
  data: AppData
  meta: LiveMeta
  packs: MonthPack[]
  active: MonthPack
  apply: (next: AppData, file: string, close: { year: string; month: string }) => void
  select: (id: string) => void
  step: (dir: -1 | 1) => void
  remove: (id: string) => void
  reset: () => void
}

const LiveCtx = createContext<Ctx | null>(null)

function merge(base: AppData, patch: Partial<AppData>): AppData {
  const next = { ...base }
  ;(Object.keys(base) as (keyof AppData)[]).forEach((key) => {
    const rows = patch[key]
    if (Array.isArray(rows) && rows.length) (next[key] as unknown) = rows
  })
  return next
}

export function packId(year: string, month: string) {
  const i = closeMonths.indexOf(month as (typeof closeMonths)[number])
  return `${year}-${String((i >= 0 ? i : 0) + 1).padStart(2, '0')}`
}

export function packLabel(year: string, month: string) {
  return `${closeMonthNames[month] ?? month} ${year}`
}

export function nextClose(packs: { year: string; month: string }[]) {
  if (!packs.length) return { year: '2026', month: 'Aug' }
  const last = [...packs].sort((a, b) => packId(a.year, a.month).localeCompare(packId(b.year, b.month))).at(-1)!
  const i = closeMonths.indexOf(last.month as (typeof closeMonths)[number])
  if (i < 0 || i === 11) return { year: String(Number(last.year) + 1), month: 'Jan' }
  return { year: last.year, month: closeMonths[i + 1] }
}

export function samplePack(): MonthPack {
  return {
    id: packId('2026', 'Jul'),
    year: '2026',
    month: 'Jul',
    file: 'sample extract',
    at: '',
    source: 'sample',
    data: sampleData(),
  }
}

function sortPacks(packs: MonthPack[]) {
  return [...packs].sort((a, b) => a.id.localeCompare(b.id))
}

function hydratePack(raw: Partial<MonthPack>): MonthPack | null {
  if (!raw.year || !raw.month) return null
  return {
    id: raw.id || packId(raw.year, raw.month),
    year: String(raw.year),
    month: String(raw.month),
    file: raw.file || 'uploaded.xlsx',
    at: raw.at || '',
    source: raw.source === 'sample' || raw.source === 'published' ? raw.source : 'upload',
    data: merge(sampleData(), raw.data ?? {}),
  }
}

function inferClose(data: Partial<AppData>) {
  const last = data.monthly?.at(-1)?.m
  const month = last && closeMonths.includes(last as (typeof closeMonths)[number]) ? last : 'Jul'
  return { year: '2026', month }
}

function readArchive(): { packs: MonthPack[]; activeId: string } {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MonthPack>[]
      const packs = sortPacks(parsed.map(hydratePack).filter((p): p is MonthPack => !!p))
      if (packs.length) {
        const activeId = localStorage.getItem(ACTIVE_KEY) || packs.at(-1)!.id
        return { packs, activeId: packs.some((p) => p.id === activeId) ? activeId : packs.at(-1)!.id }
      }
    }
    const legacy = localStorage.getItem(DATA_KEY)
    if (legacy) {
      const data = JSON.parse(legacy) as Partial<AppData>
      const meta = JSON.parse(localStorage.getItem(META_KEY) || '{}') as { file?: string; at?: string }
      const close = inferClose(data)
      const pack: MonthPack = {
        id: packId(close.year, close.month),
        year: close.year,
        month: close.month,
        file: meta.file || 'uploaded.xlsx',
        at: meta.at || '',
        source: 'upload',
        data: merge(sampleData(), data),
      }
      return { packs: [pack], activeId: pack.id }
    }
  } catch {
    /* keep sample */
  }
  const seed = samplePack()
  return { packs: [seed], activeId: seed.id }
}

function persist(packs: MonthPack[], activeId: string) {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(packs))
    localStorage.setItem(ACTIVE_KEY, activeId)
    const active = packs.find((p) => p.id === activeId) ?? packs.at(-1)
    if (active) {
      localStorage.setItem(DATA_KEY, JSON.stringify(active.data))
      localStorage.setItem(META_KEY, JSON.stringify({ file: active.file, at: active.at }))
    }
  } catch {
    /* quota — keep the pack in memory for this session */
  }
}

function metaOf(pack: MonthPack): LiveMeta {
  return {
    source: pack.source,
    file: pack.file,
    at: pack.at,
    year: pack.year,
    month: pack.month,
    id: pack.id,
  }
}

type Published = {
  version?: number
  active?: string
  packs?: Partial<MonthPack>[]
  file?: string
  uploadedAt?: string
} & Partial<AppData>

export function LiveProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => readArchive(), [])
  const [packs, setPacks] = useState<MonthPack[]>(seed.packs)
  const [activeId, setActiveId] = useState(seed.activeId)

  const active = packs.find((p) => p.id === activeId) ?? packs[0] ?? samplePack()

  useEffect(() => {
    let cancelled = false
    fetch('/live-data.json', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: Published | null) => {
        if (cancelled || !json) return
        const incoming = json.packs?.map(hydratePack).filter((p): p is MonthPack => !!p) ?? []
        if (!incoming.length && (json.monthly || json.orders || json.invoices)) {
          const close = inferClose(json)
          incoming.push({
            id: packId(close.year, close.month),
            year: close.year,
            month: close.month,
            file: json.file || 'live-data.json',
            at: json.uploadedAt || '',
            source: 'published',
            data: merge(sampleData(), json),
          })
        }
        if (!incoming.length) return
        setPacks((prev) => {
          const currentActive = localStorage.getItem(ACTIVE_KEY) || activeId
          const byId = new Map(prev.map((p) => [p.id, p]))
          incoming.forEach((pack) => {
            const cur = byId.get(pack.id)
            if (!cur || (pack.at && pack.at >= (cur.at || ''))) byId.set(pack.id, { ...pack, source: 'published' })
          })
          const next = sortPacks([...byId.values()])
          const prefer = json.active && next.some((p) => p.id === json.active) ? json.active : currentActive
          const localNewer = prev.some((p) => p.at && incoming.every((n) => !n.at || p.at > n.at))
          const nextActive = localNewer ? currentActive : prefer
          const resolved = next.some((p) => p.id === nextActive) ? nextActive : next.at(-1)!.id
          persist(next, resolved)
          if (!localNewer) setActiveId(resolved)
          return next
        })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const apply = useCallback((nextData: AppData, file: string, close: { year: string; month: string }) => {
    const at = new Date().toISOString()
    const id = packId(close.year, close.month)
    const pack: MonthPack = { id, year: close.year, month: close.month, file, at, source: 'upload', data: nextData }
    setPacks((prev) => {
      const next = sortPacks([...prev.filter((p) => p.id !== id), pack])
      persist(next, id)
      return next
    })
    setActiveId(id)
  }, [])

  const select = useCallback((id: string) => {
    setActiveId(id)
    setPacks((prev) => {
      persist(prev, id)
      return prev
    })
  }, [])

  const step = useCallback((dir: -1 | 1) => {
    setPacks((prev) => {
      const i = prev.findIndex((p) => p.id === activeId)
      const next = prev[Math.min(prev.length - 1, Math.max(0, (i < 0 ? 0 : i) + dir))]
      if (next) {
        setActiveId(next.id)
        persist(prev, next.id)
      }
      return prev
    })
  }, [activeId])

  const remove = useCallback((id: string) => {
    setPacks((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((p) => p.id !== id)
      const nextActive = activeId === id ? next.at(-1)!.id : activeId
      setActiveId(nextActive)
      persist(next, nextActive)
      return next
    })
  }, [activeId])

  const reset = useCallback(() => {
    const seedPack = samplePack()
    setPacks([seedPack])
    setActiveId(seedPack.id)
    persist([seedPack], seedPack.id)
  }, [])

  return (
    <LiveCtx.Provider
      value={{
        data: active.data,
        meta: metaOf(active),
        packs,
        active,
        apply,
        select,
        step,
        remove,
        reset,
      }}
    >
      {children}
    </LiveCtx.Provider>
  )
}

export function useLive() {
  const ctx = useContext(LiveCtx)
  if (!ctx) throw new Error('useLive')
  return ctx
}
