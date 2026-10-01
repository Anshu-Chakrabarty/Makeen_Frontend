import { useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { matchRegion, useFilters } from '../filters'
import { useLive } from '../live'
import { Banner, Card, Guide, H, Kpi, PageHead, ScopeLine, Table, axis, chart, hPad, nW, useNarrow, vPad, vW } from '../ui'

export function Engineer() {
  const narrow = useNarrow()
  const { engineers } = useLive().data
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
  const first = rows.length ? rows.reduce((s, e) => s + e.first, 0) / rows.length : 0
  const per = calls ? Math.round((cost * 100000) / calls) : 0
  const watchCost = rows.filter((e) => e.plants.includes('Lucknow') || e.plants.includes('Jaipur')).reduce((s, e) => s + e.cost, 0)
  const regionLabel = filters.region === 'All' ? 'every region' : `plants in the ${filters.region} region`
  const plantLabel = filters.plant === 'All' ? 'every plant on the register' : `${filters.plant} only`

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
        kicker="Facility Management"
        title="Engineer cost on Facility Management contracts"
        note={
          <>
            <p>
              This page shows what it costs to put MAKEEN engineers on the Facility Management plants.
              Each row is one engineer: which AMC they are booked to, which plants they cover, how many calls they took, and what they cost on the current close.
            </p>
            <p>
              The client has asked for a new way to share engineer cost between Facility Management and Service. Until that model is agreed, every figure on this page stays on the current direct-cost basis — the cost as booked against the engineer and the plants they cover. We do not invent a split.
            </p>
          </>
        }
      />
      <Banner
        title="This page is on hold for a new allocation model. The current numbers are still here so you can review them."
        body={
          <>
            <p>
              Finance and operations still need a client-approved rule for how one engineer’s cost should be shared when the same person works Facility Management and Service jobs.
            </p>
            <p>
              Until that rule exists, we keep showing the direct cost by engineer and by plant. You can still filter by region or plant, and you can still export the table. The tiles do not pretend the new model is already decided.
            </p>
          </>
        }
        action="Keep the current cost basis"
        onAction={() => flash('Engineer cost stays on the current direct-cost basis. Nothing has been re-allocated.')}
      />
      <ScopeLine
        text={`You are looking at ${rows.length} of ${engineers.length} engineers, covering ${regionLabel} and ${plantLabel}. Cost figures are in lakh rupees unless you change the currency filter.`}
      />

      <Guide
        title="What every word on this page means"
        lead="These are the same words used in the tiles, the charts and the engineer table."
        items={[
          { term: 'Engineer / Employee', text: 'The person who attends plant calls. The employee number is the payroll identity. The name is how they appear on the roster.' },
          { term: 'AMC code', text: 'The Annual Maintenance Contract the engineer is booked against, for example AMC-NORTH-11. One AMC can cover more than one plant.' },
          { term: 'Plants covered', text: 'The sites this engineer actually visits. A person can appear against two plants when they travel the same region.' },
          { term: 'Calls', text: 'How many job tickets that engineer closed on the current close. This is activity, not hours.' },
          { term: 'Cost', text: 'Direct engineer cost on the current basis, in lakh rupees (or the currency you picked). This is not yet split between Facility Management and Service.' },
          { term: 'Cost per call', text: 'Total cost divided by the number of calls. The working target on this book is ₹9,000 per call. A number above that means the engineer is expensive for the volume they closed.' },
          { term: 'Utilisation', text: 'Share of available time spent on productive plant work, as a percentage. A low number with a high cost is a capacity question, not only a rate question.' },
          { term: 'First-time fix', text: 'Share of calls closed on the first visit, as a percentage. A low number usually means repeat travel and more cost on the same fault.' },
          { term: 'Cost per revenue rupee', text: 'How many rupees of engineer cost sit against each rupee of Facility Management contract revenue on the current basis. This is a holding ratio until the allocation model is approved.' },
          { term: 'Loss-making coverage', text: 'Engineer cost that is sitting on plants the contract book already shows as loss-making (today Lucknow and Jaipur). It is the same people cost, pointed at the weak sites.' },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          label="Engineer cost for each revenue rupee"
          value="₹0.0411"
          note="On the current basis, about four paise of engineer cost sit against every rupee of Facility Management contract revenue. This ratio will move when the client approves a new allocation."
        />
        <Kpi
          label="Total engineer cost on this slice"
          value={moneyLakh(cost)}
          note={`${rows.length} engineer${rows.length === 1 ? '' : 's'} closed ${calls} calls. Change the region or plant filter and both the cost and the call count follow the slice.`}
        />
        <Kpi
          label="Average cost of one call"
          value={`₹${per.toLocaleString('en-IN')}`}
          note={`This is total cost divided by total calls on the slice. The working target is ₹9,000. ${per > 9000 ? 'The slice is above that target.' : 'The slice is at or below that target.'}`}
        />
        <Kpi
          label="Average utilisation"
          value={`${util.toFixed(0)}%`}
          note={`Simple average of each engineer’s utilisation on the slice. First-time fix on the same people averages ${first.toFixed(0)}%. Neither figure is re-weighted by calls.`}
        />
        <Kpi
          label="Cost sitting on loss-making plants"
          value={moneyLakh(watchCost)}
          note="Engineer cost booked to HPCL Lucknow or IOCL Jaipur — the plants the contract book already shows as loss-making. This does not re-open the allocation debate; it only points the current cost at those sites."
          tone="rose"
        />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H
            title="What each engineer costs on the current basis"
            hint="Each bar is one person. Longer means a higher direct cost in lakh rupees on this close. The list is the filtered roster, not a ranking of performance. Use it to see who is carrying the cost before you open the table."
          />
          <div className="h-48 w-full min-w-0 overflow-hidden sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={vPad(narrow, 100)}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis(narrow)} />
                <YAxis type="category" dataKey="name" width={vW(narrow, 100)} tick={axis(narrow)} />
                <Tooltip />
                <Bar dataKey="cost" fill={chart.teal} barSize={12} name="Cost ₹ Lakh" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H
            title="Do higher costs go with more calls?"
            hint="Each dot is one engineer. Further to the right means more calls closed. Higher up means a higher direct cost. A person high on the chart with few calls is expensive for the volume they delivered. A person far to the right and lower down is covering more work for less cost."
          />
          <div className="mb-3 flex flex-wrap gap-3 text-[12px] text-mute">
            <span>Right = more calls closed</span>
            <span>Up = higher direct cost</span>
          </div>
          <div className="h-48 w-full min-w-0 overflow-hidden sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={hPad(narrow)}>
                <CartesianGrid stroke={chart.grid} />
                <XAxis dataKey="calls" name="Calls closed" tick={axis(narrow)} />
                <YAxis dataKey="cost" name="Cost" width={nW(narrow)} tick={axis(narrow)} />
                <Tooltip />
                <Scatter data={scatter} fill={chart.green} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H
          title="Engineer by engineer"
          hint="One row is one person. Plants covered lists every site they visit. Cost per call above ₹9,000 is above the working target. The total row adds cost and calls; utilisation and first-time fix in that row are simple averages, not weighted by calls."
        />
        <Table
          cols={['Employee number', 'Name', 'AMC they are booked to', 'Plants they cover', 'Calls closed', 'Direct cost', 'Cost of one call', 'Utilisation', 'Fixed on first visit']}
          rows={rows.map((e) => [
            e.id,
            e.name,
            e.amc,
            e.plants,
            String(e.calls),
            moneyLakh(e.cost),
            `₹${e.per.toLocaleString('en-IN')}`,
            `${e.util}% of available time`,
            `${e.first}% of calls`,
          ])}
          foot={['Total', `${rows.length} engineers`, '', '', String(calls), moneyLakh(cost), `₹${per.toLocaleString('en-IN')}`, `${util.toFixed(0)}% average`, `${first.toFixed(0)}% average`]}
        />
      </Card>
    </div>
  )
}
