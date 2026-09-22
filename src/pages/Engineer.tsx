import { useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { engineers } from '../data'
import { matchRegion, useFilters } from '../filters'
import { Banner, Card, H, Kpi, PageHead, ScopeLine, Table, axis, chart } from '../ui'

export function Engineer() {
  const { filters, moneyLakh, registerExport, exportCsv, flash } = useFilters()
  const rows = engineers.filter((e) => {
    const plants = e.plants.split(', ')
    if (filters.plant !== 'All' && !plants.includes(filters.plant)) return false
    if (filters.region !== 'All' && !plants.some((p) => matchRegion(p, filters.region))) return false
    return true
  })
  const scatter = rows.map((e) => ({ name: e.name, calls: e.calls, cost: e.cost }))
  const cost = rows.reduce((s, e) => s + e.cost, 0)
  const calls = rows.reduce((s, e) => s + e.calls, 0)
  const util = rows.length ? rows.reduce((s, e) => s + e.util, 0) / rows.length : 0
  const per = calls ? Math.round((cost * 100000) / calls) : 0

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'engineer-cost',
        ['Employee', 'Name', 'AMC', 'Plants', 'Calls', 'Cost Lakh', 'Cost per call', 'Utilisation', 'First-time fix'],
        rows.map((e) => [e.id, e.name, e.amc, e.plants, e.calls, e.cost, e.per, e.util, e.first]),
      ),
    )
  }, [rows, registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Contracts"
        title="Engineer Cost"
        note="On hold for a new allocation model. Figures stay on the current direct-cost basis and still slice by region and plant."
      />
      <Banner
        title="Reporting model under client review."
        body="Engineer cost stays on a direct-cost basis by engineer and by plant. Allocation across FM and Service is not invented here."
        action="Keep current basis"
        onAction={() => flash('Engineer cost stays on hold. Current basis is still sliceable and exportable.')}
      />
      <ScopeLine text={`${rows.length} engineers. Region ${filters.region}. Plant ${filters.plant}.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Cost per revenue rupee" value="₹0.0411" note="Share of contract revenue — current basis" />
        <Kpi label="Total engineer cost" value={moneyLakh(cost)} note={`${rows.length} engineers · ${calls} calls`} />
        <Kpi label="Cost per call" value={`₹${per.toLocaleString('en-IN')}`} note="Target ₹9,000" />
        <Kpi label="Utilisation" value={`${util.toFixed(0)}%`} />
        <Kpi label="Loss-making coverage" value={moneyLakh(rows.filter((e) => e.plants.includes('Lucknow') || e.plants.includes('Jaipur')).reduce((s, e) => s + e.cost, 0))} tone="rose" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="Cost per engineer" hint="Sorted by cost on the current basis." />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={rows} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis()} />
                <YAxis type="category" dataKey="name" width={100} tick={axis()} />
                <Tooltip />
                <Bar dataKey="cost" fill={chart.teal} barSize={12} name="Cost ₹ Lakh" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H title="Cost against calls" />
          <div className="h-64">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid stroke={chart.grid} />
                <XAxis dataKey="calls" name="Calls" tick={axis()} />
                <YAxis dataKey="cost" name="Cost" tick={axis()} />
                <Tooltip />
                <Scatter data={scatter} fill={chart.green} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H title="Engineer detail" />
        <Table
          cols={['Employee', 'Name', 'AMC', 'Plants covered', 'Calls', 'Cost', 'Cost per call', 'Utilisation', 'First-time fix']}
          rows={rows.map((e) => [
            e.id,
            e.name,
            e.amc,
            e.plants,
            String(e.calls),
            moneyLakh(e.cost),
            `₹${e.per.toLocaleString('en-IN')}`,
            `${e.util}%`,
            `${e.first}%`,
          ])}
          foot={['Total', `${rows.length} engineers`, '', '', String(calls), moneyLakh(cost), `₹${per.toLocaleString('en-IN')}`, `${util.toFixed(0)}%`, '']}
        />
      </Card>
    </div>
  )
}
