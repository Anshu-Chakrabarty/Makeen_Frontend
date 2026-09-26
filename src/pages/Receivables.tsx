import { useEffect, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ageTrend, ageing, customers, invoices } from '../data'
import { matchOmc, matchRegion, useFilters } from '../filters'
import { Card, H, Kpi, PageHead, ScopeLine, Table, axis, chart, hPad, nW, useNarrow } from '../ui'

const shortAge: Record<string, string> = {
  'Not due': 'Not due',
  '0–30 days': '0–30',
  '31–60 days': '31–60',
  '61–90 days': '61–90',
  '91–180 days': '91–180',
  'Older than 180': '180+',
}

export function Receivables() {
  const narrow = useNarrow()
  const { filters, money, registerExport, exportCsv, flash } = useFilters()
  const [owners, setOwners] = useState<Record<string, string>>({})
  const custs = customers.filter((c) => matchOmc(c.name, filters.omc))
  const bills = invoices.filter((r) => matchOmc(r.cust, filters.omc) && matchRegion(r.plant, filters.region))
  const overdue = custs.reduce((s, c) => s + c.overdue, 0)
  const gross = custs.reduce((s, c) => s + c.gross, 0) + 1.8
  const old = bills.reduce((s, r) => s + r.amt, 0)

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'receivables',
        ['Invoice', 'Customer', 'Plant', 'Amount', 'Days', 'Owner'],
        bills.map((r) => [r.id, r.cust, r.plant, r.amt, r.days, owners[r.id] ?? r.owner]),
      ),
    )
  }, [bills, owners, registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Cash & Stock"
        title="Receivables"
        note="Internal receivables sit in the gross book with external and WIP. Ageing splits 91–180 and older than 180."
      />
      <ScopeLine text={`Gross = external + WIP + internal ₹1.8 Cr. Customer ${filters.omc}.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Overdue exposure" value={money(overdue || 17.9)} note="40% of the external book" tone="rose" />
        <Kpi label="Gross book" value={money(gross || 45.7)} note="External + WIP + internal" />
        <Kpi label="Over 180 days" value={money(old || 8.1)} note="Watch block" />
        <Kpi label="DSO" value="67 days" note="Target 55 days" />
        <Kpi label="Provision" value={money(-2.5)} note="31% of the 180+ exposure" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="External debtors ageing" hint="Severity ramps with age. The dashed band marks the 91+ watch zone." />
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageing} margin={hPad(narrow)}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={axis(narrow)}
                  interval={0}
                  angle={narrow ? -28 : -12}
                  height={narrow ? 48 : 50}
                  tickFormatter={narrow ? (v) => shortAge[String(v)] ?? String(v) : undefined}
                />
                <YAxis width={nW(narrow)} tick={axis(narrow)} />
                <Tooltip />
                <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                  {ageing.map((a, i) => (
                    <Cell key={a.name} fill={i < 3 ? chart.green : i < 5 ? chart.amber : chart.rose} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[12px] text-mute">Reconciliation: External ₹43.8 Cr + Contract WIP ₹2.2 Cr + Internal ₹1.8 Cr = Gross book ₹45.7 Cr. Provision ₹2.5 Cr is shown separately.</p>
        </Card>
        <Card>
          <H title="Ageing trend" hint="Whether the 180+ block is being worked down, it is not." />
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ageTrend} margin={hPad(narrow)}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axis(narrow)} />
                <YAxis width={nW(narrow)} tick={axis(narrow)} />
                <Tooltip />
                <Area dataKey="current" stackId="a" fill="#16a34a55" stroke={chart.green} name="Current / 0–90" />
                <Area dataKey="mid" stackId="a" fill="#b4530955" stroke={chart.amber} name="91–180" />
                <Area dataKey="old" stackId="a" fill="#dc262655" stroke={chart.rose} name="Older than 180" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[12px] text-mute">The 180+ stock grew every month until February, from ₹6.2 Cr to ₹8.1 Cr.</p>
        </Card>
      </div>

      <Card className="mt-4">
        <H title="Customer concentration" hint="Bars are 91+ exposure. The line is the cumulative share. Three accounts carry the whole overdue book." />
        <div className="h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={custs} margin={hPad(narrow)}>
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis dataKey="name" tick={axis(narrow)} />
              <YAxis yAxisId="b" width={nW(narrow)} tick={axis(narrow)} />
              <YAxis yAxisId="p" orientation="right" width={nW(narrow)} tick={axis(narrow)} unit="%" />
              <Tooltip />
              <Bar yAxisId="b" dataKey="overdue" fill={chart.amber} barSize={48} name="91+ exposure" radius={[4, 4, 0, 0]} />
              <Line yAxisId="p" dataKey="share" stroke={chart.blue} strokeWidth={2} name="Cumulative %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-4">
        <H title="Collection worklist" hint="Click Assign to put a name on the row. Export writes the current owners." />
        <Table
          cols={['Invoice', 'Customer', 'Plant', 'Amount', 'Days overdue', 'Owner', 'Next action']}
          rows={bills.map((r) => [
            r.id,
            r.cust,
            r.plant,
            money(r.amt),
            <span className="text-rose num">{r.days}</span>,
            owners[r.id] ?? r.owner,
            <button
              type="button"
              className="text-[12px] font-semibold text-green underline"
              onClick={() => {
                setOwners((o) => ({ ...o, [r.id]: 'Assigned — collection' }))
                flash(`Owner set on ${r.id}`)
              }}
            >
              Assign
            </button>,
          ])}
        />
      </Card>

      <Card className="mt-4">
        <H title="By customer" />
        <Table
          cols={['Customer', 'Gross', 'Not due', '91–180', '180+', 'DSO', 'Share of overdue']}
          rows={custs.map((c) => [c.name, money(c.gross), money(c.notDue), money(c.mid), money(c.old), String(c.dso), `${c.share}%`])}
          foot={[
            'Total',
            money(custs.reduce((s, c) => s + c.gross, 0)),
            money(custs.reduce((s, c) => s + c.notDue, 0)),
            money(custs.reduce((s, c) => s + c.mid, 0)),
            money(custs.reduce((s, c) => s + c.old, 0)),
            '67',
            '100%',
          ]}
        />
      </Card>
    </div>
  )
}
