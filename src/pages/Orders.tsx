import { useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { intakeTrend, orders } from '../data'
import { useFilters } from '../filters'
import { Card, H, Kpi, PageHead, ScopeLine, Table, axis, chart, hPad, nW, shortTick, useNarrow, vPad, vW } from '../ui'

export function Orders() {
  const narrow = useNarrow()
  const { filters, money, registerExport, exportCsv, monthSlice } = useFilters()
  const shown = filters.segment === 'All' ? orders : orders.filter((o) => o.name.startsWith(filters.segment) || o.reserved)
  const work = shown.filter((o) => !o.reserved)
  const intake = work.reduce((s, o) => s + o.intake, 0)
  const billed = work.reduce((s, o) => s + o.billed, 0)
  const budget = work.reduce((s, o) => s + o.budget, 0)
  const backlog = work.reduce((s, o) => s + o.backlog, 0)
  const b2b = billed ? intake / billed : 0
  const trend = filters.period === 'ytd' ? intakeTrend : intakeTrend.filter((r) => monthSlice.some((m) => m.m === r.m))

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'order-book',
        ['Segment', 'Intake', 'Budget', 'Billed', 'Backlog', 'Book-to-bill'],
        shown.map((o) => [o.name, o.intake, o.budget, o.billed, o.backlog, o.reserved ? 'Reserved' : o.b2b]),
      ),
    )
  }, [shown, registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Performance"
        title="Order Book"
        note="Service, Projects, Parts & Components stay. FM and Gas equipment are on. Two reserved slots stay visible and stay out of every total."
      />
      <ScopeLine text={`${work.length} live lines. Reserved slots excluded from totals.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total backlog" value={money(backlog)} note={`Intake ${money(intake)} · billed ${money(billed)}`} />
        <Kpi label="Book-to-bill blended" value={`${b2b.toFixed(2)}×`} note={b2b >= 1.2 ? 'Above 1.20× threshold' : 'Below 1.20× threshold'} />
        <Kpi label="Intake vs plan" value={money(intake - budget)} />
        <Kpi label="Coverage" value="3.1 months" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="Segment matrix" hint="Reserved rows have no bar." />
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={work} layout="vertical" margin={vPad(narrow, 130)}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis(narrow)} />
                <YAxis type="category" dataKey="name" width={vW(narrow, 130)} tick={axis(narrow)} tickFormatter={narrow ? shortTick(12) : undefined} />
                <Tooltip />
                <Bar dataKey="intake" fill={chart.teal} name="Actual intake" barSize={10} />
                <Bar dataKey="budget" fill={chart.green} name="Budget YTD" barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H title="Book-to-bill" hint="Against a 1.20× threshold." />
          <div className="space-y-3 pt-2">
            {work.map((o) => (
              <div key={o.name}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span>{o.name}</span>
                  <span className="num">{o.b2b.toFixed(2)}×</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10">
                  <div className={`h-1.5 rounded-full ${o.b2b >= 1.2 ? 'bg-green' : 'bg-amber'}`} style={{ width: `${Math.min(100, (o.b2b / 1.6) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H title="Intake against billing" />
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={hPad(narrow)}>
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis dataKey="m" tick={axis(narrow)} />
              <YAxis width={nW(narrow)} tick={axis(narrow)} />
              <Tooltip />
              <Line dataKey="backlog" stroke={chart.blue} strokeWidth={2} name="Backlog" />
              <Line dataKey="intake" stroke={chart.green} strokeWidth={2} name="Intake" />
              <Line dataKey="billed" stroke={chart.teal} strokeWidth={2} name="Billed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-4">
        <H title="Segment detail" hint="Reserved lines stay on the table with zero intake." />
        <Table
          cols={['Segment', 'Intake', 'Budget', 'Variance', 'Billed', 'Backlog', 'Book-to-bill', 'Coverage']}
          rows={shown.map((o) => [
            o.name,
            money(o.intake),
            money(o.budget),
            o.reserved ? 'Reserved' : money(o.intake - o.budget),
            money(o.billed),
            money(o.backlog),
            o.reserved ? 'Reserved' : `${o.b2b.toFixed(2)}×`,
            o.reserved ? '—' : `${o.cover.toFixed(1)} mo`,
          ])}
          foot={['Total (live only)', money(intake), money(budget), money(intake - budget), money(billed), money(backlog), `${b2b.toFixed(2)}×`, '3.1 mo']}
        />
        <p className="mt-3 text-[12px] text-mute">Two slots reserved for the next lines the client names. They do not enter backlog or book-to-bill.</p>
      </Card>
    </div>
  )
}
