import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  currencies,
  omcs,
  origins,
  periods,
  regions,
  reporteds,
  segments,
  useFilters,
  warehouseOpts,
  years,
  plantOpts,
  type Filters,
} from './filters'
import { ic } from './icons'
import { searchIndex } from './search'
import { useTheme } from './theme'

type Item = { to: string; label: string; end?: boolean; icon: ReactNode; badge?: string }

const nav: { title: string; items: Item[] }[] = [
  {
    title: 'Performance',
    items: [
      { to: '/', label: 'Overview', end: true, icon: ic.overview },
      { to: '/budget', label: 'Actual vs Budget', icon: ic.budget },
      { to: '/orders', label: 'Order Book', icon: ic.orders },
    ],
  },
  {
    title: 'Cash & Stock',
    items: [
      { to: '/receivables', label: 'Receivables', icon: ic.receivables },
      { to: '/working-capital', label: 'Working Capital & Inventory', icon: ic.stock },
    ],
  },
  {
    title: 'Contracts',
    items: [
      { to: '/contracts', label: 'FM Contracts', icon: ic.contracts },
      { to: '/engineer', label: 'Engineer Cost', icon: ic.engineer, badge: '2' },
    ],
  },
  {
    title: 'Control',
    items: [
      { to: '/variance', label: 'Budget Variance', icon: ic.variance },
      { to: '/ledger', label: 'Ledger Exceptions', icon: ic.ledger, badge: '8' },
    ],
  },
]

const planned = [
  { label: 'Service Contract Analytics', icon: ic.contracts },
  { label: 'Cash Flow Forecast', icon: ic.budget },
  { label: 'Plant P&L', icon: ic.variance },
]

const crumbs: Record<string, [string, string]> = {
  '/': ['Performance', 'Overview'],
  '/budget': ['Performance', 'Actual vs Budget'],
  '/orders': ['Performance', 'Order Book'],
  '/receivables': ['Cash & Stock', 'Receivables'],
  '/working-capital': ['Cash & Stock', 'Working Capital & Inventory'],
  '/contracts': ['Contracts', 'FM Contracts'],
  '/engineer': ['Contracts', 'Engineer Cost'],
  '/variance': ['Control', 'Budget Variance'],
  '/ledger': ['Control', 'Ledger Exceptions'],
}

const chipsByPath: Record<string, { key: keyof Filters; label: string }[]> = {
  '/': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'region', label: 'Region' },
    { key: 'segment', label: 'Line of business' },
    { key: 'currency', label: 'Currency' },
  ],
  '/budget': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'region', label: 'Region' },
    { key: 'segment', label: 'Line of business' },
    { key: 'currency', label: 'Currency' },
  ],
  '/orders': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'segment', label: 'Line of business' },
    { key: 'omc', label: 'Customer' },
    { key: 'currency', label: 'Currency' },
  ],
  '/receivables': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'omc', label: 'Customer' },
    { key: 'region', label: 'Region' },
    { key: 'currency', label: 'Currency' },
  ],
  '/working-capital': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'region', label: 'Region' },
    { key: 'warehouse', label: 'Warehouses' },
    { key: 'origin', label: 'Origin' },
    { key: 'currency', label: 'Currency' },
  ],
  '/contracts': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'region', label: 'Region' },
    { key: 'omc', label: 'Customer' },
    { key: 'reported', label: 'Reported as' },
    { key: 'currency', label: 'Currency' },
  ],
  '/engineer': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'region', label: 'Region' },
    { key: 'plant', label: 'Plant' },
    { key: 'currency', label: 'Currency' },
  ],
  '/variance': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'region', label: 'Region' },
    { key: 'plant', label: 'Plant' },
    { key: 'currency', label: 'Currency' },
  ],
  '/ledger': [
    { key: 'year', label: 'Scope' },
    { key: 'period', label: 'Period' },
    { key: 'region', label: 'Region' },
    { key: 'plant', label: 'Plant' },
    { key: 'currency', label: 'Currency' },
  ],
}

function options(key: keyof Filters) {
  if (key === 'year') return years.map((v) => ({ value: v, label: v }))
  if (key === 'period') return periods
  if (key === 'region') return regions.map((v) => ({ value: v, label: v === 'All' ? 'All regions' : v }))
  if (key === 'omc') return omcs.map((v) => ({ value: v, label: v === 'All' ? 'All customers' : v }))
  if (key === 'segment') return segments.map((v) => ({ value: v, label: v === 'All' ? 'All lines' : v }))
  if (key === 'currency') return currencies.map((v) => ({ value: v, label: v === 'INR' ? 'INR ₹' : v === 'EUR' ? 'EUR €' : 'Both ₹ and €' }))
  if (key === 'warehouse') return warehouseOpts
  if (key === 'origin') return origins.map((v) => ({ value: v, label: v }))
  if (key === 'reported') return reporteds.map((v) => ({ value: v, label: v === 'All' ? 'All reported as' : v }))
  if (key === 'plant') return plantOpts.map((v) => ({ value: v, label: v === 'All' ? 'All plants' : v }))
  return []
}

function Chip({ field, label }: { field: keyof Filters; label: string }) {
  const { filters, set } = useFilters()
  const [open, setOpen] = useState(false)
  const opts = options(field)
  const current = opts.find((o) => o.value === filters[field])?.label ?? filters[field]
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] text-ink"
      >
        <span className="text-mute">{label}</span>
        <span className="font-medium">{current}</span>
        <span className="scale-75 text-mute">{ic.chev}</span>
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-50 max-h-72 min-w-full overflow-auto rounded-lg border border-line bg-card py-1 shadow-lg">
            {opts.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`block w-full px-3 py-1.5 text-left text-[13px] text-ink hover:bg-black/5 dark:hover:bg-white/10 ${
                  o.value === filters[field] ? 'bg-black/5 font-semibold dark:bg-white/10' : ''
                }`}
                onClick={() => {
                  set(field, o.value)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function Shell() {
  const { dark, toggle } = useTheme()
  const { filters, apply, reset, runExport, toast, flash, rates, setRate } = useFilters()
  const loc = useLocation()
  const navTo = useNavigate()
  const crumb = crumbs[loc.pathname] ?? ['Finance', '']
  const chips = chipsByPath[loc.pathname] ?? chipsByPath['/']
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showViews, setShowViews] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showBell, setShowBell] = useState(false)
  const [showFx, setShowFx] = useState(false)
  const [views, setViews] = useState<{ name: string; filters: Filters }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mein-views') || '[]')
    } catch {
      return []
    }
  })

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return searchIndex.filter((i) => `${i.label} ${i.q}`.toLowerCase().includes(s)).slice(0, 8)
  }, [q])

  const saveView = () => {
    const name = window.prompt('Name this view', `${crumb[1]} · ${filters.period}`)
    if (!name) return
    const next = [...views.filter((v) => v.name !== name), { name, filters: { ...filters } }]
    setViews(next)
    localStorage.setItem('mein-views', JSON.stringify(next))
    flash(`Saved view “${name}”`)
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {open && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col bg-[#03160f] text-white ${open ? 'flex' : 'hidden'} lg:flex`}>
        <div className="flex items-center gap-2.5 px-4 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f3f4f2] text-[13px] font-bold text-[#03160f]">M</div>
          <div className="leading-tight">
            <div className="text-[12px] font-semibold tracking-[0.04em]">MAKEEN</div>
            <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/40">Energy · India</div>
          </div>
        </div>
        <div className="px-4 pb-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">Product</div>
        <ProductMenu />

        <nav className="flex-1 overflow-y-auto px-2 pb-8">
          <NavGroups pathname={loc.pathname} onNavigate={() => setOpen(false)} flash={flash} />
        </nav>
      </aside>

      <div className="lg:pl-[256px]">
        <header className="sticky top-0 z-20 border-b border-line bg-card">
          <div className="flex h-12 items-center gap-3 px-4">
            <button type="button" className="lg:hidden" onClick={() => setOpen(true)}>
              {ic.orders}
            </button>
            <div className="text-[13px] text-mute">
              {crumb[0]} <span className="mx-1 text-[#d4d6d4]">/</span>
              <span className="text-ink">{crumb[1]}</span>
            </div>
            <div className="relative ml-auto flex items-center gap-2">
              <label className="relative hidden md:block">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mute">{ic.search}</span>
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setShowSearch(true)
                  }}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search pages"
                  className="h-8 w-48 rounded-lg border border-line bg-paper px-3 pl-8 text-[12px] text-ink outline-none placeholder:text-mute"
                />
                {showSearch && hits.length > 0 && (
                  <div className="absolute left-0 top-9 z-30 w-64 rounded-lg border border-line bg-card py-1 shadow-lg">
                    {hits.map((h) => (
                      <button
                        key={h.to}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-[13px] text-ink hover:bg-black/5 dark:hover:bg-white/10"
                        onClick={() => {
                          navTo(h.to)
                          setQ('')
                          setShowSearch(false)
                        }}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                )}
              </label>
              <button
                type="button"
                onClick={() => setShowFx((v) => !v)}
                className="hidden items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-[11px] text-mute sm:flex"
              >
                <i className="h-1.5 w-1.5 rounded-full bg-[#1b8a43]" />
                Vena · {filters.year} · {periods.find((p) => p.value === filters.period)?.label} · rate ₹{rates.Jul}=€1
              </button>
              <IconBtn onClick={toggle}>{dark ? ic.sun : ic.moon}</IconBtn>
              <div className="relative">
                <IconBtn onClick={() => setShowBell((v) => !v)}>{ic.bell}</IconBtn>
                {showBell && (
                  <div className="absolute right-0 top-9 z-30 w-72 rounded-lg border border-line bg-card p-2 shadow-lg">
                    {[
                      { to: '/ledger', t: 'April EBITDA −15%', d: 'Open ledger exceptions' },
                      { to: '/receivables', t: '₹8.1 Cr older than 180', d: 'Open ageing' },
                      { to: '/variance', t: '3 plants loss-making', d: 'Open plant variance' },
                    ].map((n) => (
                      <button
                        key={n.to}
                        type="button"
                        className="block w-full rounded-md px-2 py-2 text-left text-ink hover:bg-black/5 dark:hover:bg-white/10"
                        onClick={() => {
                          navTo(n.to)
                          setShowBell(false)
                        }}
                      >
                        <div className="text-[13px] font-medium">{n.t}</div>
                        <div className="text-[11px] text-mute">{n.d}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={runExport}
                className="hidden h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-medium text-ink sm:flex"
              >
                {ic.export} Export
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#03160f] text-[11px] font-semibold text-white">A</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2">
            {chips.map((c) => (
              <Chip key={c.key} field={c.key} label={c.label} />
            ))}
            <button type="button" onClick={reset} className="h-8 px-2 text-[12px] text-mute underline">
              Clear slice
            </button>
            <div className="relative ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setShowViews((v) => !v)} className="h-8 rounded-lg px-2.5 text-[12px] text-mute hover:text-ink">
                Saved views
              </button>
              {showViews && (
                <div className="absolute right-28 top-9 z-30 w-56 rounded-lg border border-line bg-card p-2 shadow-lg">
                  <button type="button" onClick={saveView} className="mb-1 w-full rounded-md bg-[#1b8a43] px-2 py-1.5 text-left text-[12px] text-white">
                    Save current slice
                  </button>
                  {views.length === 0 && <div className="px-2 py-2 text-[12px] text-mute">No saved views yet.</div>}
                  {views.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      className="block w-full rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-black/5"
                      onClick={() => {
                        apply(v.filters)
                        setShowViews(false)
                        flash(`Opened “${v.name}”`)
                      }}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-[12px] font-medium text-ink"
              >
                {ic.sliders} Filters
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="grid gap-3 border-t border-line px-4 py-3 sm:grid-cols-3 lg:grid-cols-6">
              {chipsByPath['/'].concat(chipsByPath['/working-capital'], chipsByPath['/contracts']).map((c) => (
                <Chip key={`all-${c.key}`} field={c.key} label={c.label} />
              ))}
            </div>
          )}
          {showFx && (
            <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 text-[12px] text-ink">
              <span className="text-mute">Monthly INR per €1 — convert each month, then add for YTD. Sample until the client files the official rate.</span>
              {Object.entries(rates).map(([m, r]) => (
                <label key={m} className="flex items-center gap-1">
                  <span className="text-mute">{m}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={r}
                    onChange={(e) => setRate(m, Number(e.target.value) || r)}
                    className="h-8 w-16 rounded-lg border border-line bg-card px-2 text-ink num"
                  />
                </label>
              ))}
            </div>
          )}
        </header>

        <main className="p-5 lg:p-6">
          <Outlet />
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#03160f] px-4 py-2 text-[13px] text-white shadow-lg">{toast}</div>
      )}
    </div>
  )
}

function loadOpenMenus() {
  try {
    const raw = localStorage.getItem('mein-nav')
    if (raw) return JSON.parse(raw) as Record<string, boolean>
  } catch {
    /* keep defaults */
  }
  return { Performance: true, 'Cash & Stock': true, Contracts: true, Control: true, Planned: false }
}

function NavGroups({ pathname, onNavigate, flash }: { pathname: string; onNavigate: () => void; flash: (msg: string) => void }) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(loadOpenMenus)
  const current = crumbs[pathname]?.[0]

  useEffect(() => {
    if (!current) return
    setOpenMenus((prev) => {
      if (prev[current]) return prev
      const next = { ...prev, [current]: true }
      localStorage.setItem('mein-nav', JSON.stringify(next))
      return next
    })
  }, [current])

  const toggle = (title: string) => {
    setOpenMenus((prev) => {
      const next = { ...prev, [title]: !prev[title] }
      localStorage.setItem('mein-nav', JSON.stringify(next))
      return next
    })
  }

  return (
    <>
      {nav.map((s) => {
        const expanded = openMenus[s.title] ?? current === s.title
        return (
          <div key={s.title} className="mb-1">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => toggle(s.title)}
              className="mb-0.5 flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45 hover:bg-white/5 hover:text-white/70"
            >
              <span className={`transition-transform ${expanded ? '' : '-rotate-90'}`}>{ic.chev}</span>
              <span className="flex-1 truncate">{s.title}</span>
            </button>
            {expanded &&
              s.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `mb-0.5 flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] ${
                      isActive ? 'bg-[#1b8a43] font-medium text-white' : 'text-white/70 hover:bg-white/6 hover:text-white'
                    }`
                  }
                >
                  <span className="opacity-90">{item.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge && <span className="rounded-full bg-white/15 px-1.5 text-[10px] font-semibold leading-4">{item.badge}</span>}
                </NavLink>
              ))}
          </div>
        )
      })}
      <div className="mb-1">
        <button
          type="button"
          aria-expanded={!!openMenus.Planned}
          onClick={() => toggle('Planned')}
          className="mb-0.5 flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45 hover:bg-white/5 hover:text-white/70"
        >
          <span className={`transition-transform ${openMenus.Planned ? '' : '-rotate-90'}`}>{ic.chev}</span>
          <span className="flex-1 truncate">Planned</span>
        </button>
        {openMenus.Planned &&
          planned.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => flash(`${p.label} is planned — not in this release.`)}
              className="mb-0.5 flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] text-white/28 hover:bg-white/5"
            >
              <span>{p.icon}</span>
              <span className="min-w-0 flex-1 truncate">{p.label}</span>
              <span className="rounded-full bg-white/8 px-1.5 text-[9px] font-medium leading-4">planned</span>
            </button>
          ))}
      </div>
    </>
  )
}

function ProductMenu() {
  const { flash } = useFilters()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative mx-3 mb-4">
      <button
        type="button"
        aria-label="Product"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-lg bg-white/10 px-3 text-left text-[13px] text-white"
      >
        Finance
        <span className="scale-75 text-white/50">{ic.chev}</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-10 z-50 overflow-hidden rounded-lg border border-white/10 bg-[#06261a] py-1 shadow-lg">
          <button
            type="button"
            className="flex h-9 w-full items-center bg-[#1b8a43] px-3 text-left text-[13px] text-white"
            onClick={() => setOpen(false)}
          >
            Finance
          </button>
          <button
            type="button"
            className="flex h-9 w-full items-center px-3 text-left text-[13px] text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              setOpen(false)
              flash('Facility Management is a separate paper — not this site.')
            }}
          >
            Facility Management
          </button>
        </div>
      )}
    </div>
  )
}

function IconBtn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-card text-mute hover:text-ink"
    >
      {children}
    </button>
  )
}
