import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { closeMonthNames, closeMonths, nextClose, packId, packLabel, useLive } from '../live'
import { buildTemplate, downloadBuf, parseWorkbook } from '../workbook'
import type { AppData } from '../data'

const PIN = 'MAKEEN26'

export function Upload() {
  const { data, meta, packs, active, apply, select, step, remove, reset } = useLive()
  const [ok, setOk] = useState(() => sessionStorage.getItem('mein-upload-ok') === '1')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [found, setFound] = useState<string[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const [parsed, setParsed] = useState<AppData | null>(null)
  const [note, setNote] = useState('')
  const upcoming = nextClose(packs)
  const [year, setYear] = useState(upcoming.year)
  const [month, setMonth] = useState(upcoming.month)

  useEffect(() => {
    const next = nextClose(packs)
    setYear(next.year)
    setMonth(next.month)
  }, [packs])

  const counts = useMemo(
    () => [
      ['Monthly P&L', data.monthly.length],
      ['Orders', data.orders.length],
      ['Receivables', data.invoices.length],
      ['Warehouses', data.warehouses.length],
      ['Contracts', data.contracts.length],
      ['Variance plants', data.varianceGrid.length],
      ['Ledger', data.ledger.length],
    ],
    [data],
  )

  const years = useMemo(
    () => Array.from(new Set(['2025', '2026', '2027', ...packs.map((p) => p.year), year])).sort(),
    [packs, year],
  )

  const replacing = packs.some((p) => p.year === year && p.month === month)

  const unlock = () => {
    if (pin.trim() !== PIN) {
      setErr('PIN does not match.')
      return
    }
    sessionStorage.setItem('mein-upload-ok', '1')
    setOk(true)
    setErr('')
  }

  const onFile = async (f: File | null) => {
    setFile(f)
    setParsed(null)
    setFound([])
    setMissing([])
    setNote('')
    if (!f) return
    const buf = await f.arrayBuffer()
    try {
      const out = parseWorkbook(buf, data)
      setParsed(out.data)
      setFound(out.found)
      setMissing(out.missing)
      if (!out.found.length) setErr('No matching sheets. Download the template, paste next month’s figures, then upload that file.')
      else setErr('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not read that workbook.')
    }
  }

  const publish = () => {
    if (!parsed || !file) return
    apply(parsed, file.name, { year, month })
    const id = packId(year, month)
    const nextPacks = [
      ...packs.filter((p) => p.id !== id),
      { id, year, month, file: file.name, at: new Date().toISOString(), source: 'upload' as const, data: parsed },
    ]
    const pack = {
      version: 2,
      active: id,
      packs: nextPacks,
      file: file.name,
      uploadedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(pack)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'live-data.json'
    a.click()
    URL.revokeObjectURL(a.href)
    setNote(`${packLabel(year, month)} is stored. Use Prev / Next on the dashboard to walk months one by one. live-data.json also downloaded if every browser should see the same archive.`)
    setParsed(null)
    setFile(null)
  }

  if (!ok) {
    return (
      <div className="min-h-screen bg-paper px-4 py-16 text-ink">
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-6">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-mute">MAKEEN Energy India</div>
          <h1 className="mt-2 text-[28px] font-semibold">Excel upload</h1>
          <p className="mt-2 text-[13px] text-mute">Separate from the finance pages. Enter the ops PIN to store next month’s workbook without wiping earlier closes.</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && unlock()}
            placeholder="PIN"
            className="mt-5 h-10 w-full rounded-lg border border-line bg-paper px-3 text-[16px] text-ink outline-none sm:text-[13px]"
          />
          {err && <p className="mt-2 text-[12px] text-rose">{err}</p>}
          <button type="button" onClick={unlock} className="mt-4 h-10 w-full rounded-lg bg-[#1b8a43] text-[13px] font-medium text-white">
            Open upload
          </button>
          <Link to="/" className="mt-4 block text-center text-[12px] text-mute underline">
            Back to the dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-card px-4 py-4 sm:px-6">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-mute">Control · Data</div>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-semibold">Upload next month’s Excel</h1>
            <p className="mt-1 max-w-2xl text-[13px] text-mute">
              Each close is stored on its own. July stays when August is added. Open any stored month and the standalone shows that pack.
            </p>
          </div>
          <Link to="/" className="h-8 rounded-lg border border-line px-3 text-[12px] font-medium leading-8">
            Open dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[13px] font-semibold">Stored months</div>
            <div className="flex gap-2">
              <button type="button" className="h-8 rounded-lg border border-line px-3 text-[12px] disabled:opacity-40" disabled={packs[0]?.id === active.id} onClick={() => step(-1)}>
                Prev
              </button>
              <button type="button" className="h-8 rounded-lg border border-line px-3 text-[12px] disabled:opacity-40" disabled={packs.at(-1)?.id === active.id} onClick={() => step(1)}>
                Next
              </button>
            </div>
          </div>
          <p className="mt-1 text-[12px] text-mute">
            Showing {packLabel(active.year, active.month)}
            {meta.file ? ` · ${meta.file}` : ''}
            {meta.at ? ` · ${new Date(meta.at).toLocaleString('en-IN')}` : ''}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-[12px]">
              <thead className="text-mute">
                <tr>
                  <th className="py-1 font-medium">Close</th>
                  <th className="py-1 font-medium">File</th>
                  <th className="py-1 font-medium">Stored</th>
                  <th className="py-1 font-medium" />
                </tr>
              </thead>
              <tbody>
                {packs.map((p) => (
                  <tr key={p.id} className={p.id === active.id ? 'font-semibold text-ink' : 'text-ink'}>
                    <td className="py-1.5">{packLabel(p.year, p.month)}</td>
                    <td className="py-1.5 text-mute">{p.file}</td>
                    <td className="py-1.5 text-mute">{p.at ? new Date(p.at).toLocaleDateString('en-IN') : 'Built-in'}</td>
                    <td className="py-1.5 text-right">
                      <button type="button" className="mr-2 underline" onClick={() => select(p.id)}>
                        {p.id === active.id ? 'Showing' : 'View'}
                      </button>
                      {packs.length > 1 && (
                        <button type="button" className="text-rose underline" onClick={() => remove(p.id)}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
            {counts.map(([k, v]) => (
              <span key={k} className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">
                {k} · {v}
              </span>
            ))}
          </div>
          {packs.some((p) => p.source !== 'sample') && (
            <button
              type="button"
              onClick={() => {
                reset()
                setParsed(null)
                setFile(null)
                setFound([])
                setMissing([])
                setNote('Archive cleared. Only the original July sample remains.')
              }}
              className="mt-4 h-9 rounded-lg border border-line px-3 text-[12px] font-medium"
            >
              Reset archive to sample
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card p-5">
            <div className="text-[13px] font-semibold">1. Template</div>
            <p className="mt-1 text-[12px] text-mute">Same sheets and headers the site already displays. Paste next month’s figures into this file — do not invent new column names.</p>
            <button
              type="button"
              onClick={() => downloadBuf(buildTemplate(), 'MAKEEN-finance-template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
              className="mt-4 h-9 rounded-lg bg-[#1b8a43] px-3 text-[12px] font-medium text-white"
            >
              Download template
            </button>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5">
            <div className="text-[13px] font-semibold">2. Upload the formatted file</div>
            <p className="mt-1 text-[12px] text-mute">.xlsx only. Sheets that are present replace that block. Sheets you leave out keep the figures from the month you are viewing.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-[12px] text-mute">
                Year
                <select value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-line bg-paper px-2 text-[13px] text-ink">
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
              <label className="text-[12px] text-mute">
                Close month
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-line bg-paper px-2 text-[13px] text-ink">
                  {closeMonths.map((m) => (
                    <option key={m} value={m}>{closeMonthNames[m]}</option>
                  ))}
                </select>
              </label>
            </div>
            <label
              className="mt-4 flex h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-line bg-paper text-[12px] text-mute"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                void onFile(e.dataTransfer.files?.[0] ?? null)
              }}
            >
              {file ? file.name : 'Drop Excel here or browse'}
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => void onFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>

        {err && <div className="rounded-2xl border border-rose/30 bg-card p-4 text-[13px] text-rose">{err}</div>}

        {parsed && (
          <div className="rounded-2xl border border-line bg-card p-5">
            <div className="text-[13px] font-semibold">3. Store as {packLabel(year, month)}</div>
            <p className="mt-1 text-[12px] text-mute">
              Found {found.length} sheet{found.length === 1 ? '' : 's'}. Missing sheets stay on the month you are viewing.
              {replacing ? ' This close already exists and will be replaced.' : ' Earlier months stay in the archive.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
              {found.map((s) => (
                <span key={s} className="rounded-full bg-green/10 px-2 py-1 font-medium text-green">
                  {s}
                </span>
              ))}
              {missing.map((s) => (
                <span key={s} className="rounded-full bg-black/5 px-2 py-1 text-mute dark:bg-white/10">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={publish} className="h-9 rounded-lg bg-[#1b8a43] px-3 text-[12px] font-medium text-white">
                Store {packLabel(year, month)}
              </button>
            </div>
            {note && <p className="mt-3 text-[12px] text-mute">{note}</p>}
          </div>
        )}
        {note && !parsed && <p className="text-[12px] text-mute">{note}</p>}
      </main>
    </div>
  )
}
