import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { sampleData, type AppData } from './data'

const DATA_KEY = 'mein-live-data'
const META_KEY = 'mein-live-meta'

export type LiveMeta = {
  source: 'sample' | 'upload' | 'published'
  file: string
  at: string
}

type Ctx = {
  data: AppData
  meta: LiveMeta
  apply: (next: AppData, file: string) => void
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

function readLocal(): { data: AppData; meta: LiveMeta } | null {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AppData>
    const meta = JSON.parse(localStorage.getItem(META_KEY) || '{}') as Partial<LiveMeta>
    return {
      data: merge(sampleData(), parsed),
      meta: { source: 'upload', file: meta.file || 'uploaded.xlsx', at: meta.at || '' },
    }
  } catch {
    return null
  }
}

export function LiveProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(sampleData)
  const [meta, setMeta] = useState<LiveMeta>({ source: 'sample', file: '', at: '' })

  useEffect(() => {
    let cancelled = false
    const local = readLocal()
    if (local) {
      setData(local.data)
      setMeta(local.meta)
    }
    fetch('/live-data.json', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: (Partial<AppData> & { file?: string; uploadedAt?: string }) | null) => {
        if (cancelled || !json) return
        if (local?.meta.at && json.uploadedAt && local.meta.at >= json.uploadedAt) return
        setData(merge(sampleData(), json))
        setMeta({ source: 'published', file: json.file || 'live-data.json', at: json.uploadedAt || '' })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const apply = useCallback((next: AppData, file: string) => {
    const at = new Date().toISOString()
    localStorage.setItem(DATA_KEY, JSON.stringify(next))
    localStorage.setItem(META_KEY, JSON.stringify({ file, at }))
    setData(next)
    setMeta({ source: 'upload', file, at })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(DATA_KEY)
    localStorage.removeItem(META_KEY)
    setData(sampleData())
    setMeta({ source: 'sample', file: '', at: '' })
  }, [])

  return <LiveCtx.Provider value={{ data, meta, apply, reset }}>{children}</LiveCtx.Provider>
}

export function useLive() {
  const ctx = useContext(LiveCtx)
  if (!ctx) throw new Error('useLive')
  return ctx
}
