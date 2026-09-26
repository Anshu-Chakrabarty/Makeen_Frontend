import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { bridge, costLines } from '../data'
import { useFilters } from '../filters'
import { Banner, Card, H, Kpi, PageHead, ScopeLine, Table, axis, chart, hPad, nW, shortTick, useNarrow, vPad, vW } from '../ui'

const steps = [
  { step: 'Budget EBITDA', v: 71.44, pct: '—', driver: '—', owner: '—' },
  { step: 'Higher revenue', v: 7.17, pct: '+10%', driver: 'Projects intake ahead of plan', owner: 'Sales' },
  { step: 'Lower GP ratio', v: -13.33, pct: '−19%', driver: 'Material cost and job mix', owner: 'Operations' },
  { step: 'Sales expense saved', v: 2.15, pct: '+3%', driver: 'Headcount timing', owner: 'Sales' },
  { step: 'Higher G&A', v: -13.91, pct: '−19%', driver: 'Legal and audit', owner: 'Finance' },
  { step: 'Higher staff', v: -19.87, pct: '−28%', driver: 'Annual increment timing', owner: 'HR' },
  { step: 'Overheads saved', v: 0.97, pct: '+1%', driver: 'Utilities', owner: 'Facilities' },
  { step: 'FC / allocations', v: 30.4, pct: '+43%', driver: 'Group recharge', owner: 'Group' },
  { step: 'Actual EBITDA', v: 57.14, pct: '—', driver: '—', owner: '—' },
]

const shortStep: Record<string, string> = {
  'Budget EBITDA': 'Budget',
  'Higher revenue': 'Revenue',
  'Lower GP ratio': 'GP',
  'Sales expense saved': 'Sales',
  'Higher G&A': 'G&A',
  'Higher staff': 'Staff',
  'Overheads saved': 'OH',
  'FC / allocations': 'FC',
  'Actual EBITDA': 'Actual',
}

export function Budget() {
  const narrow = useNarrow()
  const nav = useNavigate()
  const { filters, money, moneyLakh, registerExport, exportCsv } = useFilters()
  const bars = bridge.map((b, i) => ({
    ...b,
    fill: i === 0 || i === bridge.length - 1 ? '#334155' : b.v < 0 ? chart.rose : chart.green,
  }))
  const vs = costLines.map((c) => ({ name: c.name, gap: ((c.actual - c.plan) / c.plan) * 100 }))

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'actual-vs-budget',
        ['Step', 'Lakh', '% of budget EBITDA', 'Driver', 'Owner'],
        steps.map((s) => [s.step, s.v, s.pct, s.driver, s.owner]),
      ),
    )
  }, [registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Performance"
        title="Actual vs Budget"
        note="Why the result moved, not only that it moved. Currency and region follow the header slice."
      />
      <Banner
        title="Monthly Jan–Dec budget sheet not in the current extract."
        body="Plan figures are spread evenly from the annual budget. Open the plant-month grid for the same plan."
        action="Open plant variance"
        onAction={() => nav('/variance')}
      />
      <ScopeLine text={`${filters.region === 'All' ? 'All India' : filters.region}. ${filters.year}. ${filters.segment === 'All' ? 'All lines' : filters.segment}. ${filters.currency}.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="EBITDA variance" value={moneyLakh(-14.3)} note={`Actual ${money(3.7)} against plan ${money(4.3)}`} tone="rose" />
        <Kpi label="Revenue" value={money(131)} note="+2.9% vs plan · favourable" />
        <Kpi label="Salaries" value={money(8.3)} note="−2.4% vs plan · adverse" />
        <Kpi label="Overheads" value={money(5.9)} note="+1.8% vs plan · favourable" />
      </div>

      <Card className="mt-4">
        <H title="Budget EBITDA to actual" hint="Waterfall in ₹ Lakh. Click a step to open the plant grid." />
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bars}
              margin={hPad(narrow)}
              onClick={() => nav('/variance')}
            >
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis
                dataKey="name"
                interval={0}
                angle={narrow ? -40 : -18}
                height={narrow ? 76 : 70}
                tick={axis(narrow)}
                tickFormatter={narrow ? (v) => shortStep[String(v)] ?? String(v) : undefined}
              />
              <YAxis width={nW(narrow)} tick={axis(narrow)} />
              <Tooltip />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {bars.map((b) => (
                  <Cell key={b.name} fill={b.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="Cost lines" hint="Sorted by absolute variance." />
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costLines} layout="vertical" margin={vPad(narrow, 110)}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis(narrow)} />
                <YAxis type="category" dataKey="name" width={vW(narrow, 110)} tick={axis(narrow)} tickFormatter={narrow ? shortTick(12) : undefined} />
                <Tooltip />
                <Bar dataKey="actual" fill={chart.teal} barSize={10} name="Actual" />
                <Bar dataKey="plan" fill={chart.green} barSize={10} name="Plan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H title="Against plan" />
          <div className="space-y-3">
            {vs.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span>{c.name}</span>
                  <span className={`num ${c.gap > 0 ? 'text-rose' : 'text-green'}`}>
                    {c.gap > 0 ? '+' : ''}
                    {c.gap.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className={`h-1.5 rounded-full ${c.gap > 0 ? 'bg-rose' : 'bg-green'}`}
                    style={{ width: `${Math.min(100, Math.abs(c.gap) * 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H title="Bridge steps" hint="Driver and owner turn a step into assignable work." />
        <Table
          cols={['Step', 'Amount', '% of budget EBITDA', 'Driver', 'Owner']}
          rows={steps.map((s) => [
            s.step,
            <span className={s.v < 0 ? 'text-rose num' : 'num'}>{moneyLakh(s.v)}</span>,
            s.pct,
            s.driver,
            s.owner,
          ])}
        />
      </Card>
    </div>
  )
}
