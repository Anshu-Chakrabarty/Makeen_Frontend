import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { closeMonthNames, useLive } from './live'

export type Currency = 'INR' | 'EUR' | 'Both'

export type Filters = {
  year: string
  period: string
  region: string
  omc: string
  segment: string
  plant: string
  currency: Currency
  warehouse: string
  origin: string
  reported: string
}

const defaults: Filters = {
  year: '2026',
  period: 'ytd',
  region: 'All',
  omc: 'All',
  segment: 'All',
  plant: 'All',
  currency: 'INR',
  warehouse: 'scope',
  origin: 'All',
  reported: 'All',
}

export const years = ['2025', '2026']
export const periods = [
  { value: 'ytd', label: 'YTD July' },
  { value: 'jul', label: 'July' },
  { value: 'jun', label: 'June' },
  { value: 'may', label: 'May' },
  { value: 'apr', label: 'April' },
]

const monthKey: Record<string, string> = {
  ytd: 'Jul',
  jan: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  apr: 'Apr',
  may: 'May',
  jun: 'Jun',
  jul: 'Jul',
  aug: 'Aug',
  sep: 'Sep',
  oct: 'Oct',
  nov: 'Nov',
  dec: 'Dec',
}

function periodsFromMonthly(rows: { m: string }[]) {
  if (!rows.length) return periods
  const last = rows[rows.length - 1]?.m ?? 'Jul'
  return [
    { value: 'ytd', label: `YTD ${closeMonthNames[last] ?? last}` },
    ...[...rows].reverse().map((r) => ({
      value: r.m.toLowerCase().slice(0, 3),
      label: closeMonthNames[r.m] ?? r.m,
    })),
  ]
}
export const regions = ['All', 'North', 'South', 'East', 'West']
export const omcs = ['All', 'IOCL', 'BPCL', 'HPCL']
export const segments = ['All', 'Service', 'Projects', 'Parts & Components', 'FM', 'Gas equipment']
export const currencies: Currency[] = ['INR', 'EUR', 'Both']
export const origins = ['All', 'Domestic', 'International']
export const reporteds = ['All', 'FM', 'Service', 'Provisional']
export const warehouseOpts = [
  { value: 'scope', label: 'Spare Parts Sales (2 of 8)' },
  { value: 'all', label: 'All warehouses' },
]

export const plantRegion: Record<string, string> = {
  'IOCL Trombay': 'West',
  'HPCL Ennore': 'South',
  'IOCL Mannarode': 'South',
  'IOCL Haldia': 'East',
  'BPCL Cherlapalli': 'South',
  'BPCL Sanand': 'West',
  'IOCL Piyala': 'North',
  'BPCL Piyala': 'North',
  'IOCL Jaipur': 'North',
  'HPCL Lucknow': 'North',
  'IOCL Barauni': 'East',
  'IOCL Panipat': 'North',
  'HPCL Mangalore': 'South',
  'HPCL Kochi': 'South',
  'IOCL Mumbai': 'West',
  'HPCL Vizag': 'South',
  'IOCL Sanand': 'West',
  'BPCL Haldia': 'East',
}

const defaultRates: Record<string, number> = {
  Jan: 90.2,
  Feb: 91.1,
  Mar: 92.4,
  Apr: 93.8,
  May: 95.1,
  Jun: 96.4,
  Jul: 97.2,
  Aug: 97.2,
  Sep: 97.2,
  Oct: 97.2,
  Nov: 97.2,
  Dec: 97.2,
}

export const plantOpts = ['All', ...Object.keys(plantRegion)]

type Ctx = {
  filters: Filters
  set: (key: keyof Filters, value: string) => void
  apply: (next: Partial<Filters>) => void
  reset: () => void
  rates: Record<string, number>
  setRate: (month: string, rate: number) => void
  monthSlice: { m: string; rev: number; gp: number; ebitda: number; ebitdaPct: number; np: number; rate: number }[]
  scale: number
  money: (inrCr: number, month?: string) => string
  moneyLakh: (inrLakh: number, month?: string) => string
  moneyYtd: (rows: { v: number; m: string }[]) => string
  exportCsv: (name: string, cols: string[], rows: (string | number)[][]) => void
  registerExport: (fn: () => void) => void
  runExport: () => void
  toast: string
  flash: (msg: string) => void
  periods: { value: string; label: string }[]
  years: string[]
}

const FilterCtx = createContext<Ctx | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const { data, active, packs } = useLive()
  const monthly = data.monthly
  const plantRows = data.plants
  const mix = data.mix
  const periodOpts = useMemo(() => periodsFromMonthly(monthly), [monthly])
  const yearOpts = useMemo(
    () => Array.from(new Set([...years, ...packs.map((p) => p.year)])).sort(),
    [packs],
  )
  const [filters, setFilters] = useState<Filters>(() => {
    try {
      const raw = localStorage.getItem('mein-filters')
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
    } catch {
      return defaults
    }
  })
  const skipCloseSync = useRef(true)
  useEffect(() => {
    if (skipCloseSync.current) {
      skipCloseSync.current = false
      return
    }
    setFilters((prev) => {
      const next = { ...prev, year: active.year, period: 'ytd' }
      localStorage.setItem('mein-filters', JSON.stringify(next))
      return next
    })
  }, [active.id, active.year])
  const [rates, setRates] = useState(defaultRates)
  useEffect(() => {
    setRates((prev) => {
      const next = { ...prev }
      monthly.forEach((r) => {
        if (r.rate) next[r.m] = r.rate
      })
      return next
    })
  }, [monthly])
  const exportRef = useRef<() => void>(() => {})
  const [toast, setToast] = useState('')

  const persist = (next: Filters) => {
    setFilters(next)
    localStorage.setItem('mein-filters', JSON.stringify(next))
  }

  const monthSlice = useMemo(() => {
    if (filters.period === 'ytd') return monthly
    const m = monthKey[filters.period] ?? monthly[monthly.length - 1]?.m ?? 'Jul'
    const hit = monthly.filter((r) => r.m === m)
    return hit.length ? hit : monthly.slice(-1)
  }, [filters.period, monthly])

  const scale = useMemo(() => {
    let s = 1
    if (filters.region !== 'All') {
      const inR = plantRows.filter((p) => plantRegion[p.name] === filters.region)
      const num = inR.reduce((a, p) => a + Math.abs(p.v), 0)
      const den = plantRows.reduce((a, p) => a + Math.abs(p.v), 0)
      s *= den ? num / den : 1
    }
    if (filters.segment !== 'All') {
      const total = mix.reduce((a, r) => a + r.value, 0)
      const row = mix.find((r) => r.name === filters.segment)
      s *= total && row ? row.value / total : 1
    }
    if (filters.year === '2025') s *= 0.92
    return s
  }, [filters, plantRows, mix])

  const money = useCallback((inrCr: number, month?: string) => {
    const close = monthly[monthly.length - 1]?.m ?? 'Jul'
    const m = month ?? (filters.period === 'ytd' ? close : monthKey[filters.period] ?? close)
    const rate = rates[m] ?? 97.2
    const v = inrCr * scale
    if (filters.currency === 'EUR') return `€${(v / (rate / 10)).toFixed(2)}m`
    if (filters.currency === 'Both') return `₹${v.toFixed(1)} Cr  ·  €${(v / (rate / 10)).toFixed(2)}m`
    const sign = v < 0 ? '−' : ''
    return `${sign}₹${Math.abs(v).toFixed(1)} Cr`
  }, [filters.period, filters.currency, rates, scale, monthly])

  const moneyLakh = useCallback((inrLakh: number, month?: string) => {
    const close = monthly[monthly.length - 1]?.m ?? 'Jul'
    const m = month ?? (filters.period === 'ytd' ? close : monthKey[filters.period] ?? close)
    const rate = rates[m] ?? 97.2
    const v = inrLakh * scale
    if (filters.currency === 'EUR') return `€${((v * 100000) / rate / 1000).toFixed(1)}k`
    if (filters.currency === 'Both') return `₹${v.toFixed(1)} L  ·  €${((v * 100000) / rate / 1000).toFixed(1)}k`
    const sign = v < 0 ? '−' : ''
    return `${sign}₹${Math.abs(v).toFixed(1)} L`
  }, [filters.period, filters.currency, rates, scale, monthly])

  const moneyYtd = useCallback((rows: { v: number; m: string }[]) => {
    const inr = rows.reduce((s, r) => s + r.v, 0) * scale
    if (filters.currency === 'INR') {
      const sign = inr < 0 ? '−' : ''
      return `${sign}₹${Math.abs(inr).toFixed(1)} Cr`
    }
    const eur = rows.reduce((s, r) => s + (r.v * scale) / ((rates[r.m] ?? 97.2) / 10), 0)
    if (filters.currency === 'Both') return `₹${inr.toFixed(1)} Cr  ·  €${eur.toFixed(2)}m`
    return `€${eur.toFixed(2)}m`
  }, [filters.currency, rates, scale])

  const flash = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2400)
  }, [])

  const exportCsv = useCallback((name: string, cols: string[], rows: (string | number)[][]) => {
    const body = [cols, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${name}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    flash(`Exported ${name}.csv`)
  }, [flash])

  const registerExport = useCallback((fn: () => void) => {
    exportRef.current = fn
  }, [])

  const runExport = useCallback(() => {
    exportRef.current()
  }, [])

  const value: Ctx = {
    filters,
    set: (key, value) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value as never }
        localStorage.setItem('mein-filters', JSON.stringify(next))
        return next
      })
    },
    apply: (patch) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch }
        localStorage.setItem('mein-filters', JSON.stringify(next))
        return next
      })
    },
    reset: () => persist(defaults),
    rates,
    setRate: (month, rate) => setRates((r) => ({ ...r, [month]: rate })),
    monthSlice,
    scale,
    money,
    moneyLakh,
    moneyYtd,
    exportCsv,
    registerExport,
    runExport,
    toast,
    flash,
    periods: periodOpts,
    years: yearOpts,
  }

  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>
}

export function useFilters() {
  const ctx = useContext(FilterCtx)
  if (!ctx) throw new Error('useFilters')
  return ctx
}

export function matchRegion(name: string, region: string) {
  if (region === 'All') return true
  return plantRegion[name] === region
}

export function matchOmc(name: string, omc: string) {
  if (omc === 'All') return true
  return name.startsWith(omc)
}
