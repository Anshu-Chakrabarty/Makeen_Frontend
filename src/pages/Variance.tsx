import { useEffect } from 'react'
import { yearMonths, varianceExceptions, varianceGrid } from '../data'
import { matchOmc, useFilters } from '../filters'
import { Banner, Card, H, Kpi, PageHead, ScopeLine, Table } from '../ui'

function tone(v: number, future: boolean) {
  if (future) return 'bg-[repeating-linear-gradient(45deg,#e5e7eb,#e5e7eb_2px,transparent_2px,transparent_6px)] text-mute'
  if (v <= -10) return 'bg-rose text-white'
  if (v <= -5) return 'bg-rose/25 text-rose'
  if (v < 0) return 'bg-rose/10 text-rose'
  if (v >= 3) return 'bg-green text-white'
  if (v > 0) return 'bg-green/15 text-green'
  return 'bg-black/5 text-mute'
}

export function Variance() {
  const { filters, set, moneyLakh, registerExport, exportCsv, flash } = useFilters()
  const grid = varianceGrid.filter((r) => {
    if (filters.region !== 'All' && r.region !== filters.region) return false
    if (filters.plant !== 'All' && r.plant !== filters.plant) return false
    if (!matchOmc(r.plant, filters.omc)) return false
    return true
  })
  const exceptions = varianceExceptions.filter((r) => {
    if (filters.region !== 'All' && r.region !== filters.region) return false
    if (filters.plant !== 'All' && r.plant !== filters.plant) return false
    if (!matchOmc(r.plant, filters.omc)) return false
    return true
  })
  const ytds = grid.map((r) => r.months.slice(0, 7).reduce((s, v) => s + v, 0))
  const total = ytds.reduce((s, v) => s + v, 0)
  const below = ytds.filter((v) => v < 0).length

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'budget-variance',
        ['Plant', 'Region', ...yearMonths.slice(0, 7), 'YTD'],
        grid.map((r) => {
          const ytd = r.months.slice(0, 7).reduce((s, v) => s + v, 0)
          return [r.plant, r.region, ...r.months.slice(0, 7), ytd]
        }),
      ),
    )
  }, [grid, registerExport, exportCsv])

  return (
    <div>
      <PageHead
        kicker="Control"
        title="Budget Variance"
        note="All plants on the slice, unpaginated. Click a plant name or a cell to lock that plant."
      />
      <Banner
        title="Monthly budget sheet still missing."
        body="The grid is built on an evenly spread annual plan. August onward is hatched — no data yet, which is not the same as a zero variance."
        action="Keep indicative grid"
        onAction={() => flash('Grid stays indicative until the monthly budget sheet arrives.')}
      />
      <ScopeLine text={`${grid.length} plants. ${filters.region}. ${filters.year}. Displayed in ${filters.currency === 'INR' ? '₹ Lakh' : filters.currency}.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Total variance" value={moneyLakh(total)} note={`Against YTD plan across ${grid.length} plants`} tone="rose" />
        <Kpi label="Plants below plan" value={`${below} of ${grid.length}`} />
        <Kpi label="Worst month" value="April" note="Gross profit ratio across plants" tone="rose" />
        <Kpi label="Worst plant" value={grid[0]?.plant ?? '—'} note={grid[0] ? moneyLakh(ytds[0]) : ''} tone="rose" />
        <Kpi label="Consistently short" value={String(grid.filter((r) => r.months.slice(0, 7).every((v) => v < 0)).length)} note="Below plan every month" />
      </div>

      <Card className="mt-4 overflow-x-auto">
        <H title="Variance to plan · ₹ Lakh" hint="Click a cell to lock that plant in the header." />
        <table className="w-full min-w-[900px] text-center text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.1em] text-mute">
              <th className="pb-2 pr-3 text-left font-semibold">Plant</th>
              {yearMonths.map((m) => (
                <th key={m} className="pb-2 font-semibold">
                  {m}
                </th>
              ))}
              <th className="pb-2 font-semibold">YTD</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((r) => {
              const ytd = r.months.slice(0, 7).reduce((s, v) => s + v, 0)
              return (
                <tr key={r.plant}>
                  <td className="py-1 pr-3 text-left font-medium">
                    <button type="button" className="underline" onClick={() => set('plant', r.plant)}>
                      {r.plant}
                    </button>
                  </td>
                  {r.months.map((v, i) => (
                    <td key={yearMonths[i]} className="p-0.5">
                      <button
                        type="button"
                        className={`num w-full rounded px-1 py-1 ${tone(v, i >= 7)}`}
                        onClick={() => {
                          set('plant', r.plant)
                          flash(`${r.plant} · ${yearMonths[i]} · ${i >= 7 ? 'no actual yet' : `${v.toFixed(1)} L`}`)
                        }}
                      >
                        {i >= 7 ? '' : v.toFixed(1)}
                      </button>
                    </td>
                  ))}
                  <td className="p-0.5">
                    <div className={`num rounded px-1 py-1 font-semibold ${tone(ytd, false)}`}>{ytd.toFixed(1)}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4">
        <H title="Exception list" hint="Worst plant-months on this slice." />
        <Table
          cols={['Plant', 'Region', 'Month', 'Variance', 'Variance %', 'Primary driver', 'Owner']}
          rows={exceptions.map((r) => [
            <button type="button" className="underline" onClick={() => set('plant', r.plant)}>
              {r.plant}
            </button>,
            r.region,
            r.month,
            <span className="text-rose num">{moneyLakh(r.v)}</span>,
            `${r.pct}%`,
            r.driver,
            r.owner,
          ])}
        />
      </Card>
    </div>
  )
}
