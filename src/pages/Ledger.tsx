import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ledger, ledgerTrend } from '../data'
import { matchOmc, matchRegion, useFilters } from '../filters'
import { Card, H, Kpi, PageHead, Pill, ScopeLine, Table, axis, chart, hPad, nW, shortTick, useNarrow } from '../ui'

const kinds = ['All', 'Credit note', 'Neg. COGS', 'Reversal', 'DO NOT USE', '> ₹10 L'] as const

export function Ledger() {
  const narrow = useNarrow()
  const [params, setParams] = useSearchParams()
  const { filters, moneyLakh, registerExport, exportCsv, flash } = useFilters()
  const [owners, setOwners] = useState<Record<string, string>>({})
  const kind = (params.get('kind') as (typeof kinds)[number]) || 'All'
  const scoped = ledger.filter((r) => matchRegion(r.plant, filters.region) && (filters.plant === 'All' || r.plant === filters.plant) && matchOmc(r.plant, filters.omc))
  const rows = kind === 'All' ? scoped : scoped.filter((r) => r.type === kind)
  const counts: Record<string, number> = { All: scoped.length }
  for (const r of scoped) counts[r.type] = (counts[r.type] ?? 0) + 1
  const net = rows.reduce((s, r) => s + r.amt, 0)

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'ledger-exceptions',
        ['Severity', 'Date', 'Age', 'Doc', 'Type', 'Account', 'Plant', 'Amount', 'Note', 'Owner'],
        rows.map((r) => [r.sev, r.date, r.age, r.doc, r.type, r.account, r.plant, r.amt, r.note, owners[r.doc] ?? r.owner]),
      ),
    )
  }, [rows, owners, registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Control"
        title="Ledger Exceptions"
        note="A triage queue. Assign an owner on the row. Export writes the current owners."
      />
      <ScopeLine text={`${rows.length} items on this slice. Region ${filters.region}. Plant ${filters.plant}.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Net exception value" value={moneyLakh(net)} note={`${rows.length} open items`} tone="rose" />
        <Kpi label="Unassigned" value={String(rows.filter((r) => (owners[r.doc] ?? r.owner) === 'Unassigned').length)} />
        <Kpi label="Oldest open" value={rows.length ? `${Math.max(...rows.map((r) => r.age))} days` : '—'} />
        <Kpi label="Recurring patterns" value="3" note="Same account flagged in 2 or more months" />
        <Kpi label="High severity" value={String(rows.filter((r) => r.sev === 'High').length)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              const n = new URLSearchParams(params)
              n.set('kind', k)
              setParams(n, { replace: true })
            }}
            className={`h-8 rounded-lg px-3 text-[12px] font-semibold ${
              kind === k ? 'bg-side text-white' : 'border border-line bg-card text-ink'
            }`}
          >
            {k} · {counts[k] ?? 0}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="By type and age" />
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kinds.slice(1).map((name) => ({ name, v: counts[name] ?? 0 }))}
                margin={hPad(narrow)}
              >
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="name" tick={axis(narrow)} interval={0} angle={narrow ? -24 : 0} height={narrow ? 48 : 30} tickFormatter={narrow ? shortTick(9) : undefined} />
                <YAxis width={nW(narrow)} tick={axis(narrow)} />
                <Tooltip />
                <Bar dataKey="v" fill={chart.amber} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H title="Raised against resolved" />
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ledgerTrend} margin={hPad(narrow)}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axis(narrow)} />
                <YAxis width={nW(narrow)} tick={axis(narrow)} />
                <Tooltip />
                <Line dataKey="raised" stroke={chart.rose} strokeWidth={2} name="Raised" />
                <Line dataKey="resolved" stroke={chart.green} strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H title="Exception queue" hint="Click Assign to put a name on the row." />
        <Table
          cols={['Severity', 'Date', 'Age', 'Doc', 'Type', 'Account', 'Plant', 'Amount', 'Note', 'Owner']}
          rows={rows.map((r) => [
            <Pill tone={r.sev === 'High' ? 'bad' : r.sev === 'Medium' ? 'warn' : 'mute'}>{r.sev}</Pill>,
            r.date,
            `${r.age}d`,
            r.doc,
            r.type,
            r.account,
            r.plant,
            <span className={r.amt < 0 ? 'text-rose num' : 'num'}>{moneyLakh(r.amt)}</span>,
            r.note,
            <button
              type="button"
              className="text-[12px] font-semibold text-green underline"
              onClick={() => {
                setOwners((o) => ({ ...o, [r.doc]: 'Assigned — finance' }))
                flash(`Owner set on ${r.doc}`)
              }}
            >
              {owners[r.doc] ?? r.owner}
            </button>,
          ])}
        />
      </Card>
    </div>
  )
}
