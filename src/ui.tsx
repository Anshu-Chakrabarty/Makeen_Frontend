import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useFilters } from './filters'

export function useNarrow(bp = 640) {
  const [n, setN] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`)
    const apply = () => setN(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [bp])
  return n
}

export function cr(n: number, d = 1) {
  const sign = n < 0 ? '−' : ''
  return `${sign}₹${Math.abs(n).toFixed(d)} Cr`
}

export function lakh(n: number, d = 1) {
  const sign = n < 0 ? '−' : ''
  return `${sign}₹${Math.abs(n).toFixed(d)} L`
}

export function inr(n: number) {
  const sign = n < 0 ? '−' : ''
  return `${sign}₹${Math.abs(n).toLocaleString('en-IN')}`
}

export function PageHead({
  kicker,
  title,
  note,
}: {
  kicker: string
  title: string
  note: string
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-mute">{kicker}</div>
        <h1 className="mt-1 text-[28px] font-semibold text-ink">{title}</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-mute">{note}</p>
      </div>
      <ExportBtn />
    </div>
  )
}

export function ExportBtn() {
  const { runExport } = useFilters()
  return (
    <button
      type="button"
      onClick={runExport}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-medium text-ink"
    >
      Export
    </button>
  )
}

export function ScopeLine({ text }: { text: string }) {
  return <p className="mb-4 text-[12px] text-mute">{text}</p>
}

export function Alert({
  tone,
  title,
  body,
  to,
}: {
  tone: 'rose' | 'amber' | 'ink'
  title: string
  body: string
  to: string
}) {
  const bar = tone === 'rose' ? 'bg-rose' : tone === 'amber' ? 'bg-amber' : 'bg-ink dark:bg-white/40'
  return (
    <Link
      to={to}
      className="flex gap-3 rounded-2xl border border-line bg-card p-4 hover:border-ink/20"
    >
      <i className={`mt-1 h-8 w-1 rounded-full ${bar}`} />
      <div>
        <div className="text-[15px] font-semibold text-ink">{title}</div>
        <p className="mt-1 text-[12px] text-mute">{body}</p>
      </div>
    </Link>
  )
}

export function Kpi({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: ReactNode
  note?: ReactNode
  tone?: 'rose' | 'ok'
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-mute">{label}</div>
      <div
        className={`num mt-2 text-[26px] font-semibold ${
          tone === 'rose' ? 'text-rose' : tone === 'ok' ? 'text-green' : 'text-ink'
        }`}
      >
        {value}
      </div>
      {note && <div className="mt-1 text-[12px] text-mute">{note}</div>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-line bg-card p-3 sm:p-5 ${className}`}>
      {children}
    </div>
  )
}

export function H({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {hint && <p className="mt-0.5 text-[12px] text-mute">{hint}</p>}
    </div>
  )
}

export function Banner({
  title,
  body,
  action,
  onAction,
}: {
  title: string
  body: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-ink">{title}</div>
          <p className="mt-1 max-w-3xl text-[12px] text-mute">{body}</p>
        </div>
        {action && (
          <button
            type="button"
            onClick={onAction}
            className="h-8 rounded-lg border border-line px-3 text-[12px] font-medium text-ink"
          >
            {action}
          </button>
        )}
      </div>
    </div>
  )
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/10">
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`h-8 rounded-lg px-3 text-[13px] font-medium ${
            value === t.id ? 'bg-card text-ink shadow-sm' : 'text-mute hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Pill({ children, tone = 'mute' }: { children: ReactNode; tone?: 'ok' | 'warn' | 'bad' | 'mute' }) {
  const c =
    tone === 'ok'
      ? 'bg-green/10 text-green'
      : tone === 'warn'
        ? 'bg-amber/10 text-amber'
        : tone === 'bad'
          ? 'bg-rose/10 text-rose'
          : 'bg-black/5 text-mute dark:bg-white/10'
  return <span className={`inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold ${c}`}>{children}</span>
}

export function Table({
  cols,
  rows,
  foot,
}: {
  cols: string[]
  rows: ReactNode[][]
  foot?: ReactNode[]
}) {
  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead>
          <tr className="text-[10px] font-semibold uppercase tracking-wide text-mute">
            {cols.map((c) => (
              <th key={c} className="pb-2 pr-3 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-line dark:border-white/8">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-3 text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {foot && (
          <tfoot>
            <tr className="border-t-2 border-line font-semibold dark:border-white/15">
              {foot.map((cell, i) => (
                <td key={i} className="py-2.5 pr-3">
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export const chart = {
  grid: '#e5e7eb',
  tick: '#6b7280',
  green: '#16a34a',
  rose: '#dc2626',
  amber: '#b45309',
  ink: '#111827',
  blue: '#2563eb',
  teal: '#0f766e',
  grey: '#94a3b8',
}

export function axis(narrow = false) {
  return { fill: '#6b7280', fontSize: narrow ? 10 : 11 }
}

export function hPad(narrow: boolean) {
  return narrow ? { top: 8, right: 12, bottom: 6, left: 4 } : { top: 5, right: 5, bottom: 5, left: 5 }
}

export function vPad(narrow: boolean, desktopLeft: number) {
  return narrow ? { top: 8, right: 12, bottom: 4, left: 4 } : { left: desktopLeft }
}

export function vW(narrow: boolean, desktop: number) {
  return narrow ? Math.min(78, desktop) : desktop
}

export function nW(narrow: boolean) {
  return narrow ? 32 : 60
}

export function shortTick(n = 12) {
  return (v: string | number) => {
    const s = String(v)
    return s.length > n ? `${s.slice(0, n - 1)}…` : s
  }
}
