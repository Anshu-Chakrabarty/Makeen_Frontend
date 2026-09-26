import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cccTrend, cycle, originShare, returnLines, returnReasons, returnWh, returnsMonth, twc, warehouses } from '../data'
import { matchOmc, useFilters } from '../filters'
import { Banner, Card, H, Kpi, PageHead, Pill, ScopeLine, Table, Tabs, axis, chart, hPad, nW, shortTick, useNarrow, vPad, vW } from '../ui'

const tabs = [
  { id: 'cycle', label: 'Cycle' },
  { id: 'twc', label: 'TWC' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'returns', label: 'Returns & Cancellations' },
]

export function WorkingCapital() {
  const [params, setParams] = useSearchParams()
  const view = tabs.some((t) => t.id === params.get('view')) ? params.get('view')! : 'cycle'
  const invView = params.get('inv') ?? 'table'
  const set = (key: string, val: string) => {
    const next = new URLSearchParams(params)
    next.set(key, val)
    setParams(next, { replace: true })
  }
  const { filters } = useFilters()

  return (
    <div>
      <PageHead
        kicker="Cash & Stock"
        title="Working Capital & Inventory"
        note="Turns use the Service spare-parts sales warehouses only. Locations stay on the table. Cancel and return carry quantity and value. Origin is domestic against import."
      />
      <ScopeLine
        text={`${filters.region === 'All' ? 'All India' : filters.region}. ${filters.warehouse === 'scope' ? 'Spare-parts sales (2 of 8) for turns' : 'All 8 warehouses shown'}. Origin ${filters.origin}. ${filters.currency}.`}
      />
      <Tabs items={tabs} value={view} onChange={(id) => set('view', id)} />
      {view === 'cycle' && <Cycle />}
      {view === 'twc' && <Twc />}
      {view === 'inventory' && <Inventory invView={invView} setInv={(v) => set('inv', v)} />}
      {view === 'returns' && <Returns />}
    </div>
  )
}

function Cycle() {
  const narrow = useNarrow()
  const { registerExport, exportCsv } = useFilters()
  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'cash-cycle',
        ['Measure', 'Days', 'Target', 'Variance'],
        cycle.map((c) => [c.name, c.days, c.target, c.days - c.target]),
      ),
    )
  }, [registerExport, exportCsv])

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cycle.map((c) => (
          <Kpi
            key={c.name}
            label={c.name}
            value={`${c.days} days`}
            note={`${c.days - c.target > 0 ? '+' : ''}${c.days - c.target} vs target ${c.target}`}
            tone={c.name === 'CCC' ? 'ok' : undefined}
          />
        ))}
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="The cycle as an equation" hint="DSO and DIO extend the cycle. DPO shortens it." />
          <div className="mt-6 flex h-10 overflow-hidden rounded-lg">
            <div className="flex items-center justify-center bg-green text-[12px] font-semibold text-white" style={{ width: '45%' }}>
              DSO 67
            </div>
            <div className="flex items-center justify-center bg-teal-700 text-[12px] font-semibold text-white" style={{ width: '30%' }}>
              DIO 42
            </div>
            <div className="flex items-center justify-center bg-slate-400 text-[12px] font-semibold text-white" style={{ width: '25%' }}>
              DPO −38
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-[13px] text-mute">67 + 42 − 38 =</div>
            <div className="num mt-1 text-3xl font-semibold">71 days</div>
          </div>
        </Card>
        <Card>
          <H title="Cash conversion cycle trend" hint="Twelve months against the 60-day target." />
          <div className="h-48 w-full min-w-0 overflow-hidden sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cccTrend} margin={hPad(narrow)}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axis(narrow)} />
                <YAxis width={nW(narrow)} domain={[50, 85]} tick={axis(narrow)} />
                <Tooltip />
                <Line dataKey="ccc" stroke={chart.teal} strokeWidth={2} name="CCC" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <Table
          cols={['Measure', 'Days', 'Target', 'Variance', 'What it is']}
          rows={cycle.map((c) => [c.name, String(c.days), String(c.target), `${c.days - c.target > 0 ? '+' : ''}${c.days - c.target} d`, c.note])}
        />
      </Card>
    </>
  )
}

function Twc() {
  const narrow = useNarrow()
  const { filters, money, moneyYtd, monthSlice, registerExport, exportCsv } = useFilters()
  const slice = twc.filter((r) => monthSlice.some((m) => m.m === r.m))
  const last = slice[slice.length - 1] ?? twc[twc.length - 1]

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'working-capital',
        ['Month', 'Receivables', 'Inventory', 'Payables', 'TWC', 'TWC %'],
        slice.map((r) => [r.m, r.ar, r.inv, r.ap, r.twc, r.pct]),
      ),
    )
  }, [slice, registerExport, exportCsv])

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Receivables" value={money(last.ar, last.m)} note="External + WIP + internal" />
        <Kpi label="Inventory" value={money(last.inv, last.m)} note={filters.warehouse === 'scope' ? 'In-scope stock drives turns' : 'All warehouses'} />
        <Kpi label="Payables" value={money(last.ap, last.m)} note="Extracted from TWC" />
        <Kpi
          label="Total working capital"
          value={moneyYtd(slice.map((r) => ({ v: r.twc, m: r.m })))}
          note={`${last.pct}% of sales`}
          tone="ok"
        />
      </div>
      <Card className="mt-4">
        <H title="Working capital by month" hint="Receivables plus inventory minus payables." />
        <div className="h-52 w-full min-w-0 overflow-hidden sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={slice} margin={hPad(narrow)}>
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis dataKey="m" tick={axis(narrow)} />
              <YAxis yAxisId="a" width={nW(narrow)} tick={axis(narrow)} />
              <YAxis yAxisId="b" orientation="right" width={nW(narrow)} tick={axis(narrow)} unit="%" />
              <Tooltip />
              {!narrow && <Legend />}
              <Bar yAxisId="a" dataKey="ar" fill={chart.green} name="Receivables" />
              <Bar yAxisId="a" dataKey="inv" fill={chart.blue} name="Inventory" />
              <Bar yAxisId="a" dataKey="ap" fill={chart.amber} name="Payables" />
              <Line yAxisId="b" dataKey="pct" stroke={chart.ink} strokeWidth={2} name="TWC % of sales" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="mt-4">
        <Table
          cols={['Month', 'Receivables', 'Inventory', 'Payables', 'TWC', 'TWC %']}
          rows={slice.map((r) => [r.m, money(r.ar, r.m), money(r.inv, r.m), money(r.ap, r.m), money(r.twc, r.m), `${r.pct}%`])}
        />
      </Card>
    </>
  )
}

function useWarehouseSlice() {
  const { filters } = useFilters()
  return warehouses.filter((w) => {
    if (filters.warehouse === 'scope' && !w.inScope) return false
    if (filters.region !== 'All' && w.region !== filters.region) return false
    if (filters.origin !== 'All' && w.origin !== filters.origin) return false
    return true
  })
}

function Inventory({ invView, setInv }: { invView: string; setInv: (v: string) => void }) {
  const narrow = useNarrow()
  const { filters, set, money, registerExport, exportCsv, monthSlice } = useFilters()
  const shown = useWarehouseSlice()
  const scoped = warehouses.filter((w) => w.inScope)
  const turnsWh = shown.filter((w) => w.inScope)
  const stock = shown.reduce((s, w) => s + w.val, 0)
  const scopedStock = turnsWh.reduce((s, w) => s + w.val, 0)
  const turns = turnsWh.length ? turnsWh.reduce((s, w) => s + (w.turns ?? 0), 0) / turnsWh.length : 0
  const originRows = originShare.filter((r) => monthSlice.some((m) => m.m === r.m))
  const domestic = shown.filter((w) => w.origin === 'Domestic').reduce((s, w) => s + w.val, 0)
  const intl = shown.filter((w) => w.origin === 'International').reduce((s, w) => s + w.val, 0)

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'inventory',
        ['Warehouse', 'Region', 'Origin', 'Qty', 'Value', 'Turns', 'DIO', 'Slow %', 'In scope'],
        shown.map((w) => [w.name, w.region, w.origin, w.qty, w.val, w.turns ?? '', w.dio ?? '', w.slow, w.inScope ? 'yes' : 'no']),
      ),
    )
  }, [shown, registerExport, exportCsv])

  return (
    <>
      <Card className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold">Turnover scope · spare parts sales only</div>
            <p className="mt-1 text-[12px] text-mute">
              Included: {scoped.length} of {warehouses.length}. Turns never use plant stores. Locations stay — top items is gone.
            </p>
          </div>
          <button
            type="button"
            className="h-8 rounded-lg border border-line px-3 text-[12px] font-medium dark:border-white/15"
            onClick={() => set('warehouse', filters.warehouse === 'scope' ? 'all' : 'scope')}
          >
            {filters.warehouse === 'scope' ? 'Show all warehouses' : 'Back to spare-parts scope'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
          {scoped.map((w) => (
            <Pill key={w.name} tone="ok">
              {w.name}
            </Pill>
          ))}
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Inventory turns" value={`${turns.toFixed(1)}×`} note="Spare Parts Sales only" />
        <Kpi label="Stock value, in scope" value={money(scopedStock)} note={`${turnsWh.length} warehouses`} />
        <Kpi label="Days inventory" value="42" note="Target 38 days" />
        <Kpi label="Slow-moving" value={money(shown.reduce((s, w) => s + (w.val * w.slow) / 100, 0))} note="No movement in 90 days" />
        <Kpi label="Stock on this slice" value={money(stock)} />
      </div>
      <div className="mt-4 flex justify-end">
        <Tabs
          items={[
            { id: 'table', label: 'Ranked table' },
            { id: 'cards', label: 'Performance cards' },
            { id: 'chart', label: 'Bar chart' },
          ]}
          value={invView}
          onChange={setInv}
        />
      </div>
      {invView === 'cards' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shown.map((w) => (
            <Card key={w.name}>
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] font-semibold">{w.name}</div>
                <Pill tone={w.inScope ? 'ok' : 'mute'}>{w.inScope ? 'in scope' : 'excluded'}</Pill>
              </div>
              <div className="num mt-3 text-2xl font-semibold">{money(w.val)}</div>
              <div className="mt-2 text-[12px] text-mute">
                {w.turns ? `${w.turns}× turns` : 'no turnover'} · {w.region} · {w.origin}
              </div>
            </Card>
          ))}
        </div>
      ) : invView === 'chart' ? (
        <Card>
          <H title="Value by warehouse" hint="Fill encodes turns. Plant stores stay grey." />
          <div className="h-52 w-full min-w-0 overflow-hidden sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shown} layout="vertical" margin={vPad(narrow, 180)}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis(narrow)} />
                <YAxis type="category" dataKey="name" width={vW(narrow, 180)} tick={axis(narrow)} tickFormatter={narrow ? shortTick(12) : undefined} />
                <Tooltip />
                <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                  {shown.map((w) => (
                    <Cell key={w.name} fill={w.inScope ? (w.turns && w.turns >= 8 ? chart.green : chart.amber) : chart.grey} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card>
          <H title="By warehouse and location" hint="Ranked by value — the Top Items view is gone." />
          <Table
            cols={['Warehouse', 'Region', 'Origin', 'Qty', 'Value', 'Turns', 'DIO', 'Slow %', 'Returns']}
            rows={shown.map((w) => [
              <span>
                {w.name} {w.inScope ? <Pill tone="ok">in scope</Pill> : <Pill>excluded</Pill>}
              </span>,
              w.region,
              w.origin,
              String(w.qty),
              money(w.val),
              w.turns ? `${w.turns}×` : '—',
              w.dio ?? '—',
              `${w.slow}%`,
              money(w.ret),
            ])}
          />
        </Card>
      )}

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <Card>
          <H title="Domestic against international purchase" />
          <div className="mx-auto h-40 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Domestic', value: domestic || 0.01, fill: chart.green },
                    { name: 'International', value: intl || 0.01, fill: chart.blue },
                  ]}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={62}
                >
                  <Cell fill={chart.green} />
                  <Cell fill={chart.blue} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="num text-center text-lg font-semibold">{money(domestic + intl)}</div>
        </Card>
        <Card>
          <div className="text-[13px] font-semibold">Domestic</div>
          <div className="num mt-2 text-2xl font-semibold">{money(domestic)}</div>
          <p className="mt-2 text-[12px] text-mute">{shown.filter((w) => w.origin === 'Domestic').length} warehouses on this slice</p>
        </Card>
        <Card>
          <div className="text-[13px] font-semibold">International</div>
          <div className="num mt-2 text-2xl font-semibold">{money(intl)}</div>
          <p className="mt-2 text-[12px] text-mute">{shown.filter((w) => w.origin === 'International').length} warehouses on this slice</p>
        </Card>
      </div>
      <Card className="mt-4">
        <H title="Import share over time" />
        <div className="h-44 w-full min-w-0 overflow-hidden sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={originRows} margin={hPad(narrow)}>
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis dataKey="m" tick={axis(narrow)} />
              <YAxis width={nW(narrow)} tick={axis(narrow)} unit="%" />
              <Tooltip />
              <Bar dataKey="domestic" stackId="a" fill={chart.green} name="Domestic" />
              <Bar dataKey="intl" stackId="a" fill={chart.blue} name="International" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  )
}

function Returns() {
  const narrow = useNarrow()
  const { filters, moneyLakh, registerExport, exportCsv, flash, monthSlice } = useFilters()
  const lines = returnLines.filter((r) => matchOmc(r.cust, filters.omc) && (filters.origin === 'All' || warehouses.find((w) => w.name === r.wh)?.origin === filters.origin))
  const shownWh = returnWh.filter((w) => {
    const meta = warehouses.find((x) => x.name === w.name)
    if (!meta) return true
    if (filters.warehouse === 'scope' && !meta.inScope) return false
    if (filters.region !== 'All' && meta.region !== filters.region) return false
    if (filters.origin !== 'All' && meta.origin !== filters.origin) return false
    return true
  })
  const trend = returnsMonth.filter((r) => monthSlice.some((m) => m.m === r.m))
  const cancelVal = shownWh.reduce((s, w) => s + w.cVal, 0)
  const retVal = shownWh.reduce((s, w) => s + w.rVal, 0)
  const cancelQty = shownWh.reduce((s, w) => s + w.cQty, 0)
  const retQty = shownWh.reduce((s, w) => s + w.rQty, 0)

  useEffect(() => {
    registerExport(() =>
      exportCsv(
        'returns',
        ['Date', 'Document', 'Type', 'Customer', 'Warehouse', 'Qty', 'Value', 'Reason'],
        lines.map((r) => [r.date, r.doc, r.type, r.cust, r.wh, r.qty, r.val, r.reason]),
      ),
    )
  }, [lines, registerExport, exportCsv])

  return (
    <>
      <Banner
        title="Data source and Vena mapping pending confirmation."
        body="Cancellation and return figures are derived from document-type flags. Quantity and value both sit on every line."
        action="Noted — keep using current extract"
        onAction={() => flash('Kept on the current extract. Official Vena mapping still sits with the client.')}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Cancelled quantity" value={`${shownWh.reduce((s, w) => s + w.cLines, 0)} lines`} note={`${cancelQty} units`} />
        <Kpi label="Cancelled value" value={moneyLakh(cancelVal)} />
        <Kpi label="Returned quantity" value={`${shownWh.reduce((s, w) => s + w.rLines, 0)} lines`} note={`${retQty} units`} />
        <Kpi label="Returned value" value={moneyLakh(retVal)} />
        <Kpi label="Combined" value={moneyLakh(cancelVal + retVal)} />
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <Card>
          <H title="Monthly trend" hint="Columns are value in ₹ Lakh." />
          <div className="h-44 w-full min-w-0 overflow-hidden sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={hPad(narrow)}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axis(narrow)} />
                <YAxis width={nW(narrow)} tick={axis(narrow)} />
                <Tooltip />
                <Bar dataKey="cancel" fill={chart.rose} name="Cancelled" />
                <Bar dataKey="ret" fill={chart.amber} name="Returned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H title="Reason analysis" hint="Combined cancelled and returned value." />
          <div className="h-44 w-full min-w-0 overflow-hidden sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnReasons} layout="vertical" margin={vPad(narrow, 140)}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={axis(narrow)} />
                <YAxis type="category" dataKey="name" width={vW(narrow, 140)} tick={axis(narrow)} tickFormatter={narrow ? shortTick(12) : undefined} />
                <Tooltip />
                <Bar dataKey="v" fill={chart.amber} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <H title="By warehouse" hint="Where cancellations and returns concentrate." />
        <div className="h-44 w-full min-w-0 overflow-hidden sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shownWh} layout="vertical" margin={vPad(narrow, 200)}>
              <CartesianGrid stroke={chart.grid} horizontal={false} />
              <XAxis type="number" tick={axis(narrow)} />
              <YAxis type="category" dataKey="name" width={vW(narrow, 200)} tick={axis(narrow)} tickFormatter={narrow ? shortTick(12) : undefined} />
              <Tooltip />
              <Bar dataKey="cVal" fill={chart.rose} name="Cancelled" barSize={8} />
              <Bar dataKey="rVal" fill={chart.amber} name="Returned" barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="mt-4">
        <Table
          cols={['Warehouse', 'Cancel lines', 'Cancel qty', 'Cancel value', 'Return lines', 'Return qty', 'Return value']}
          rows={shownWh.map((w) => [w.name, String(w.cLines), String(w.cQty), moneyLakh(w.cVal), String(w.rLines), String(w.rQty), moneyLakh(w.rVal)])}
        />
      </Card>
      <Card className="mt-4">
        <H title="Line detail" hint="Vena reference retained for verification." />
        <Table
          cols={['Date', 'Document', 'Type', 'Customer', 'Warehouse', 'Qty', 'Value', 'Reason', 'Vena ref']}
          rows={lines.map((r) => [r.date, r.doc, r.type, r.cust, r.wh, String(r.qty), moneyLakh(r.val), r.reason, r.vena])}
        />
      </Card>
    </>
  )
}
