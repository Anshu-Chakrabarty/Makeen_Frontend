import { useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { useFilters } from '../filters'
import { useLive } from '../live'
import { Banner, Card, Guide, H, Kpi, PageHead, Pill, ScopeLine, Table, axis, chart, hPad, nW, shortTick, useNarrow, vPad, vW } from '../ui'

export function Contracts() {
  const narrow = useNarrow()
  const { contracts } = useLive().data
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
  const provisional = rows.filter((c) => c.reported === 'Provisional')
  const renewals = rows.filter((c) => c.status === 'Renewal' || c.days < 90)
  const dueRenewal = rows.filter((c) => c.status === 'Renewal')
  const expired = rows.filter((c) => c.days < 0)
  const loss = rows.filter((c) => c.cm < 0)
  const rev = rows.reduce((s, c) => s + c.rev, 0)
  const regionLabel = filters.region === 'All' ? 'every region in India' : `the ${filters.region} region only`
  const customerLabel = filters.omc === 'All' ? 'all three oil marketing companies (IOCL, BPCL and HPCL)' : `${filters.omc} only`
  const bookedLabel =
    filters.reported === 'All'
      ? 'every booking flag'
      : filters.reported === 'FM'
        ? 'contracts the ledger already books as Facility Management'
        : filters.reported === 'Service'
          ? 'contracts that sit on this register but are still booked as Service'
          : 'contracts whose ledger line is still provisional'

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
        kicker="Facility Management"
        title="Facility Management contracts"
        note={
          <>
            <p>
              This page is the contract book for Facility Management (FM) work that MAKEEN Energy India does at oil-company plants.
              Each row is one Annual Maintenance Contract (AMC) at one plant: we keep the site running, send engineers, and bill the oil marketing company.
            </p>
            <p>
              Use the filters at the top to look at one region, one customer, or one booking flag. The numbers, charts and table below all follow that slice.
              Nothing here is a second product. Service-flagged rows stay on this register until the client confirms how they should be classified.
            </p>
          </>
        }
      />
      <Banner
        title="Some contracts are still waiting for a Facility Management versus Service decision."
        body={
          <>
            <p>
              {serviceFlag.length} contract{serviceFlag.length === 1 ? '' : 's'} on this slice sit in the Facility Management register but are posted as Service in the source book.
              {provisional.length ? ` ${provisional.length} more ${provisional.length === 1 ? 'is' : 'are'} marked Provisional, which means the ledger line is not yet confirmed.` : ''}
            </p>
            <p>
              We do not move those rows to another page and we do not invent a new split. They stay in these totals and carry a flag so finance and operations can agree the rule with the client.
            </p>
          </>
        }
        action="Show only Service-flagged contracts"
        onAction={() => {
          set('reported', 'Service')
          flash('Now showing only contracts that are still booked as Service')
        }}
      />
      <ScopeLine
        text={`You are looking at ${rows.length} of ${contracts.length} Facility Management contracts, covering ${regionLabel}, ${customerLabel}, and ${bookedLabel}.`}
      />

      <Guide
        title="What every word on this page means"
        lead="Read this once if you have not used the register before. The same words appear in the tiles, the charts and the table."
        items={[
          { term: 'Plant', text: 'The fuel terminal or depot where the AMC runs. The name starts with the oil company, for example IOCL Trombay or HPCL Lucknow.' },
          { term: 'OMC / Customer', text: 'Oil Marketing Company. In this book that is IOCL, BPCL or HPCL — the customer who signs and pays the AMC.' },
          { term: 'Region', text: 'North, South, East or West. Used only to group plants, not to change how a contract is priced.' },
          { term: 'Reported as / Booked as', text: 'How the contract is posted in the ledger today: Facility Management, Service, or Provisional. This is a flag on the same row, not a second list of contracts.' },
          { term: 'AMC type', text: 'What the contract covers. Labour only means people, not parts. Comprehensive covers labour and most parts. Spares included covers agreed spare parts. Non-comprehensive is a narrower cover than comprehensive.' },
          { term: 'End date and Days', text: 'End date is when the current AMC expires. Days is how many days remain from the close you are viewing. A negative number means the contract has already run past that date and needs a renewal decision.' },
          { term: 'Revenue', text: 'Contract income on the current close, in the currency selected at the top. This is what we bill for keeping that plant under the AMC.' },
          { term: 'Engineer cost', text: 'Direct engineer cost currently sitting on this contract. The allocation model across Facility Management and Service is still under client review, so we do not re-split this figure here.' },
          { term: 'CM (contribution margin)', text: 'Revenue minus the cost we attach to the contract, as a percentage of revenue. Below zero means the site is losing money on this basis. A thin positive margin on a large contract is still a watch item.' },
          { term: 'Status', text: 'Active means the AMC is running. Renewal means commercial work is already open because the end date is close or has passed.' },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          label="Contracts that need attention"
          value={String(renewals.length)}
          note={`${expired.length} already past the end date and ${dueRenewal.length} marked Renewal. Together with any site inside 90 days, these are the contracts that need a commercial conversation.`}
        />
        <Kpi
          label="Active contracts on this slice"
          value={`${rows.filter((c) => c.status === 'Active').length} of ${rows.length}`}
          note={`These AMCs are running. Together they bill ${money(rev)} on the current close. Change a filter above and this count and value move with the slice.`}
        />
        <Kpi
          label="Renewal already opened"
          value={String(dueRenewal.length)}
          note={`Status is Renewal, not only “days left”. Revenue on those rows is ${money(dueRenewal.reduce((s, c) => s + c.rev, 0))}. If this is zero, no row on the slice has been marked Renewal yet.`}
        />
        <Kpi
          label="Loss-making sites"
          value={String(loss.length)}
          note={`Contribution margin is below zero. Engineer cost on these sites is ${moneyLakh(loss.reduce((s, c) => s + c.eng, 0))} on the current basis. Red in the table and charts is the same test.`}
          tone="rose"
        />
        <Kpi
          label="Still waiting for a booking rule"
          value={String(serviceFlag.length)}
          note={`${serviceFlag.length} booked as Service and ${provisional.length} Provisional. They stay in Facility Management totals until the client confirms the classification.`}
        />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H
            title="How soon each contract ends"
            hint="Each bar is one plant. The length of the bar is days left until the AMC end date. A bar that crosses into negative days has already expired. Green means contribution margin is healthy (3% or more). Amber means the margin is thin. Red means the end date has already passed."
          />
          <div className="mb-3 flex flex-wrap gap-3 text-[12px] text-mute">
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#16a34a]" /> Healthy margin, still running</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#b45309]" /> Thin margin (under 3%)</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#dc2626]" /> End date already passed</span>
          </div>
          <div className="h-48 w-full min-w-0 overflow-hidden sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={vPad(narrow, 110)}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis(narrow)} />
                <YAxis type="category" dataKey="plant" width={vW(narrow, 110)} tick={axis(narrow)} tickFormatter={narrow ? shortTick(12) : undefined} />
                <Tooltip />
                <Bar dataKey="days" barSize={10} name="Days to end date">
                  {rows.map((c) => (
                    <Cell key={c.plant} fill={c.days < 0 ? chart.rose : c.cm < 3 ? chart.amber : chart.green} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H
            title="Is the contract large, and does it still make money?"
            hint="Each dot is one plant. Further to the right means more revenue. Higher up means a better contribution margin. A large contract with a weak margin sits toward the bottom-right — that is the combination to discuss first. Red dots are already below zero margin."
          />
          <div className="mb-3 flex flex-wrap gap-3 text-[12px] text-mute">
            <span>Right = higher revenue</span>
            <span>Up = higher contribution margin %</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#16a34a]" /> Making a margin</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#dc2626]" /> Losing money</span>
          </div>
          <div className="h-48 w-full min-w-0 overflow-hidden sm:h-64">
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
        <H
          title="The full Facility Management contract book"
          hint="One row is one plant AMC. Click a booking flag in the Reported as column to keep only that flag. Status Renewal is a commercial state. A negative Days value is the same contract after its end date. Service-flagged rows stay here on purpose."
        />
        <Table
          cols={['Plant', 'Customer (OMC)', 'Region', 'Booked as', 'What the AMC covers', 'End date', 'Days left', 'Revenue', 'Engineer cost', 'Contribution margin', 'Commercial status']}
          rows={rows.map((c) => [
            c.plant,
            c.omc,
            c.region,
            <button type="button" className="underline" onClick={() => set('reported', c.reported)}>
              {c.reported === 'FM' ? 'Facility Management' : c.reported === 'Service' ? 'Service (still on this register)' : 'Provisional'}
            </button>,
            c.amc,
            c.end,
            c.days < 0 ? `${c.days} (ended)` : String(c.days),
            money(c.rev),
            money(c.eng),
            <span className={c.cm < 0 ? 'text-rose' : ''}>{c.cm}%{c.cm < 0 ? ' · loss' : ''}</span>,
            <Pill tone={c.status === 'Renewal' ? 'warn' : 'ok'}>{c.status === 'Renewal' ? 'Renewal open' : 'Active — running'}</Pill>,
          ])}
        />
      </Card>
    </div>
  )
}
