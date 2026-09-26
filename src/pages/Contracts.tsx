import { useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { contracts } from '../data'
import { useFilters } from '../filters'
import { Banner, Card, H, Kpi, PageHead, Pill, ScopeLine, Table, axis, chart, hPad, nW, shortTick, useNarrow, vPad, vW } from '../ui'

export function Contracts() {
  const narrow = useNarrow()
  const { filters, set, money, moneyLakh, registerExport, exportCsv, flash } = useFilters()
  const rows = contracts.filter((c) => {
    if (filters.region !== 'All' && c.region !== filters.region) return false
    if (filters.omc !== 'All' && c.omc !== filters.omc) return false
    if (filters.reported !== 'All' && c.reported !== filters.reported) return false
    if (filters.plant !== 'All' && c.plant !== filters.plant) return false
    return true
  })
  const scatter = rows.map((c) => ({ ...c, x: c.rev, y: c.cm }))
  const serviceFlag = rows.filter((c) => c.reported === 'Service')
  const renewals = rows.filter((c) => c.status === 'Renewal' || c.days < 90)
  const loss = rows.filter((c) => c.cm < 0)
  const rev = rows.reduce((s, c) => s + c.rev, 0)

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'fm-contracts',
        ['Plant', 'OMC', 'Region', 'Reported as', 'AMC', 'End', 'Days', 'Revenue', 'Engineer', 'CM', 'Status'],
        rows.map((c) => [c.plant, c.omc, c.region, c.reported, c.amc, c.end, c.days, c.rev, c.eng, c.cm, c.status]),
      ),
    )
  }, [rows, registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Contracts"
        title="FM Contracts"
        note="Reported as is a flag on the row and a filter, not a second tab. Engineer cost on a contract stays on the current basis."
      />
      <Banner
        title="Contract classification pending client confirmation."
        body={`${serviceFlag.length || 3} contracts are posted as Service in the source book but sit in the FM register. They stay in FM totals and carry the flag.`}
        action="View the Service-flagged contracts"
        onAction={() => {
          set('reported', 'Service')
          flash('Filter set to Reported as · Service')
        }}
      />
      <ScopeLine text={`${rows.length} contracts. Region ${filters.region}. Customer ${filters.omc}. Reported as ${filters.reported}.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Contracts at risk" value={String(renewals.length)} note="Renewal or inside 90 days" />
        <Kpi label="Active on this slice" value={`${rows.filter((c) => c.status === 'Active').length} of ${rows.length}`} note={money(rev)} />
        <Kpi label="Renewal due" value={String(rows.filter((c) => c.status === 'Renewal').length)} note={money(rows.filter((c) => c.status === 'Renewal').reduce((s, c) => s + c.rev, 0))} />
        <Kpi label="Loss-making sites" value={String(loss.length)} note={`Engineer ${moneyLakh(loss.reduce((s, c) => s + c.eng, 0))}`} tone="rose" />
        <Kpi label="Pending classification" value={String(serviceFlag.length)} note="Awaiting FM vs Service rule" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="Renewal timeline" hint="Days to renewal, coloured by contribution margin." />
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={vPad(narrow, 110)}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis(narrow)} />
                <YAxis type="category" dataKey="plant" width={vW(narrow, 110)} tick={axis(narrow)} tickFormatter={narrow ? shortTick(12) : undefined} />
                <Tooltip />
                <Bar dataKey="days" barSize={10}>
                  {rows.map((c) => (
                    <Cell key={c.plant} fill={c.days < 0 ? chart.rose : c.cm < 3 ? chart.amber : chart.green} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H title="Margin against revenue" hint="Large thin contracts land bottom-right." />
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={hPad(narrow)}>
                <CartesianGrid stroke={chart.grid} />
                <XAxis dataKey="x" name="Revenue" tick={axis(narrow)} />
                <YAxis dataKey="y" name="CM %" width={nW(narrow)} tick={axis(narrow)} />
                <Tooltip />
                <Scatter data={scatter}>
                  {scatter.map((c) => (
                    <Cell key={c.plant} fill={c.cm < 0 ? chart.rose : chart.green} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H title="Contract book" hint="Reported as Service carry a provisional tag." />
        <Table
          cols={['Plant', 'OMC', 'Region', 'Reported as', 'AMC type', 'End', 'Days', 'Revenue', 'Engineer', 'CM', 'Status']}
          rows={rows.map((c) => [
            c.plant,
            c.omc,
            c.region,
            <button type="button" className="underline" onClick={() => set('reported', c.reported)}>
              {c.reported}
            </button>,
            c.amc,
            c.end,
            String(c.days),
            money(c.rev),
            money(c.eng),
            <span className={c.cm < 0 ? 'text-rose' : ''}>{c.cm}%</span>,
            <Pill tone={c.status === 'Renewal' ? 'warn' : 'ok'}>{c.status}</Pill>,
          ])}
        />
      </Card>
    </div>
  )
}
