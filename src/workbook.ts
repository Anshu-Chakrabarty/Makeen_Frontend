import * as XLSX from 'xlsx'
import { sampleData, yearMonths, type AppData } from './data'

type Row = Record<string, unknown>

function norm(v: unknown) {
  return String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/[%₹€]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function pick(row: Row, ...aliases: string[]) {
  const keys = Object.keys(row)
  for (const alias of aliases) {
    const hit = keys.find((k) => norm(k) === norm(alias))
    if (hit != null && row[hit] !== undefined && row[hit] !== '') return row[hit]
  }
  return undefined
}

function num(v: unknown, fallback = 0) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = Number(String(v ?? '').replace(/[, ]/g, ''))
  return Number.isFinite(n) ? n : fallback
}

function bool(v: unknown) {
  const s = String(v ?? '').trim().toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'y'
}

function sheetRows(wb: XLSX.WorkBook, names: string[]) {
  const name = wb.SheetNames.find((s) => names.some((n) => norm(s) === norm(n) || norm(s).includes(norm(n))))
  if (!name) return []
  return XLSX.utils.sheet_to_json<Row>(wb.Sheets[name], { defval: '' })
}

const fills: Record<string, string> = {
  Service: '#16a34a',
  Projects: '#0f766e',
  'Parts & Components': '#65a30d',
  FM: '#a16207',
  'Gas equipment': '#64748b',
}

export function parseWorkbook(buf: ArrayBuffer, current?: AppData): { data: AppData; found: string[]; missing: string[] } {
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })
  const base = structuredClone(current ?? sampleData())
  const found: string[] = []
  const take = (label: string, names: string[], map: (rows: Row[]) => void) => {
    const rows = sheetRows(wb, names)
    if (!rows.length) return
    found.push(label)
    map(rows)
  }

  take('Monthly', ['Monthly', 'P&L', 'PnL'], (rows) => {
    base.monthly = rows.map((r) => ({
      m: String(pick(r, 'Month', 'm') ?? ''),
      rev: num(pick(r, 'Revenue', 'rev')),
      gp: num(pick(r, 'GP%', 'GP', 'gp')),
      ebitda: num(pick(r, 'EBITDA', 'ebitda')),
      ebitdaPct: num(pick(r, 'EBITDA%', 'ebitdaPct')),
      np: num(pick(r, 'NetProfit', 'Net profit', 'np')),
      rate: num(pick(r, 'Rate', 'INR per EUR', 'rate'), 97.2),
    })).filter((r) => r.m)
  })

  take('Mix', ['Mix', 'Revenue mix'], (rows) => {
    base.mix = rows.map((r) => {
      const name = String(pick(r, 'Name', 'Segment') ?? '')
      return { name, value: num(pick(r, 'Value', 'Revenue')), fill: fills[name] ?? '#64748b' }
    }).filter((r) => r.name)
  })

  take('Plants', ['Plants', 'Plant contribution'], (rows) => {
    base.plants = rows.map((r) => ({
      name: String(pick(r, 'Name', 'Plant') ?? ''),
      v: num(pick(r, 'Value', 'v', 'Contribution')),
    })).filter((r) => r.name)
  })

  take('Bridge', ['Bridge', 'EBITDA bridge'], (rows) => {
    base.bridge = rows.map((r) => ({
      name: String(pick(r, 'Name', 'Step') ?? ''),
      v: num(pick(r, 'Value', 'v', 'Amount')),
    })).filter((r) => r.name)
  })

  take('CostLines', ['CostLines', 'Cost lines'], (rows) => {
    base.costLines = rows.map((r) => ({
      name: String(pick(r, 'Name') ?? ''),
      actual: num(pick(r, 'Actual')),
      plan: num(pick(r, 'Plan', 'Budget')),
    })).filter((r) => r.name)
  })

  take('Orders', ['Orders', 'Order book'], (rows) => {
    base.orders = rows.map((r) => {
      const intake = num(pick(r, 'Intake'))
      const billed = num(pick(r, 'Billed'))
      return {
        name: String(pick(r, 'Name', 'Segment') ?? ''),
        intake,
        budget: num(pick(r, 'Budget')),
        billed,
        backlog: num(pick(r, 'Backlog')),
        b2b: num(pick(r, 'B2B', 'Book-to-bill'), billed ? intake / billed : 0),
        cover: num(pick(r, 'Cover', 'Coverage')),
        reserved: bool(pick(r, 'Reserved')),
      }
    }).filter((r) => r.name)
  })

  take('IntakeTrend', ['IntakeTrend', 'Intake trend'], (rows) => {
    base.intakeTrend = rows.map((r) => ({
      m: String(pick(r, 'Month', 'm') ?? ''),
      intake: num(pick(r, 'Intake')),
      billed: num(pick(r, 'Billed')),
      backlog: num(pick(r, 'Backlog')),
    })).filter((r) => r.m)
  })

  take('Ageing', ['Ageing'], (rows) => {
    base.ageing = rows.map((r) => ({
      name: String(pick(r, 'Name', 'Bucket') ?? ''),
      v: num(pick(r, 'Value', 'v')),
    })).filter((r) => r.name)
  })

  take('AgeTrend', ['AgeTrend', 'Ageing trend'], (rows) => {
    base.ageTrend = rows.map((r) => ({
      m: String(pick(r, 'Month', 'm') ?? ''),
      current: num(pick(r, 'Current')),
      mid: num(pick(r, 'Mid', '91-180')),
      old: num(pick(r, 'Old', '180+')),
    })).filter((r) => r.m)
  })

  take('Customers', ['Customers'], (rows) => {
    base.customers = rows.map((r) => ({
      name: String(pick(r, 'Name', 'Customer') ?? ''),
      overdue: num(pick(r, 'Overdue')),
      share: num(pick(r, 'Share')),
      dso: num(pick(r, 'DSO')),
      notDue: num(pick(r, 'NotDue', 'Not due')),
      mid: num(pick(r, 'Mid')),
      old: num(pick(r, 'Old', '180+')),
      gross: num(pick(r, 'Gross')),
    })).filter((r) => r.name)
  })

  take('Invoices', ['Invoices', 'Worklist'], (rows) => {
    base.invoices = rows.map((r) => ({
      id: String(pick(r, 'Id', 'Invoice') ?? ''),
      cust: String(pick(r, 'Customer', 'Cust') ?? ''),
      plant: String(pick(r, 'Plant') ?? ''),
      amt: num(pick(r, 'Amount', 'Amt')),
      days: num(pick(r, 'Days')),
      owner: String(pick(r, 'Owner') ?? 'Unassigned'),
      next: String(pick(r, 'Next') ?? '—'),
    })).filter((r) => r.id)
  })

  take('Cycle', ['Cycle'], (rows) => {
    base.cycle = rows.map((r) => ({
      name: String(pick(r, 'Name') ?? ''),
      days: num(pick(r, 'Days')),
      target: num(pick(r, 'Target')),
      note: String(pick(r, 'Note') ?? ''),
    })).filter((r) => r.name)
  })

  take('CccTrend', ['CccTrend', 'CCC'], (rows) => {
    base.cccTrend = rows.map((r) => ({
      m: String(pick(r, 'Month', 'm') ?? ''),
      ccc: num(pick(r, 'CCC', 'ccc')),
    })).filter((r) => r.m)
  })

  take('Twc', ['Twc', 'TWC'], (rows) => {
    base.twc = rows.map((r) => ({
      m: String(pick(r, 'Month', 'm') ?? ''),
      ar: num(pick(r, 'AR', 'Receivables')),
      inv: num(pick(r, 'Inventory', 'Inv')),
      ap: num(pick(r, 'AP', 'Payables')),
      twc: num(pick(r, 'TWC')),
      pct: num(pick(r, 'Pct', 'TWC%')),
    })).filter((r) => r.m)
  })

  take('Warehouses', ['Warehouses', 'Inventory'], (rows) => {
    base.warehouses = rows.map((r) => ({
      name: String(pick(r, 'Name', 'Warehouse') ?? ''),
      region: String(pick(r, 'Region') ?? ''),
      origin: String(pick(r, 'Origin') ?? 'Domestic'),
      qty: num(pick(r, 'Qty')),
      val: num(pick(r, 'Value', 'Val')),
      turns: pick(r, 'Turns') === '' || pick(r, 'Turns') == null ? null : num(pick(r, 'Turns')),
      dio: pick(r, 'DIO') === '' || pick(r, 'DIO') == null ? null : num(pick(r, 'DIO')),
      slow: num(pick(r, 'Slow')),
      ret: num(pick(r, 'Returns', 'Ret')),
      inScope: bool(pick(r, 'InScope', 'In scope')),
    })).filter((r) => r.name) as AppData['warehouses']
  })

  take('OriginShare', ['OriginShare', 'Origin'], (rows) => {
    base.originShare = rows.map((r) => ({
      m: String(pick(r, 'Month', 'm') ?? ''),
      domestic: num(pick(r, 'Domestic')),
      intl: num(pick(r, 'Intl', 'International')),
    })).filter((r) => r.m)
  })

  take('ReturnsMonth', ['ReturnsMonth', 'Returns trend'], (rows) => {
    base.returnsMonth = rows.map((r) => ({
      m: String(pick(r, 'Month', 'm') ?? ''),
      cancel: num(pick(r, 'Cancel')),
      ret: num(pick(r, 'Return', 'Ret')),
    })).filter((r) => r.m)
  })

  take('ReturnReasons', ['ReturnReasons', 'Reasons'], (rows) => {
    base.returnReasons = rows.map((r) => ({
      name: String(pick(r, 'Name', 'Reason') ?? ''),
      v: num(pick(r, 'Value', 'v')),
    })).filter((r) => r.name)
  })

  take('ReturnWh', ['ReturnWh', 'Returns by warehouse'], (rows) => {
    base.returnWh = rows.map((r) => ({
      name: String(pick(r, 'Name', 'Warehouse') ?? ''),
      cLines: num(pick(r, 'CLines', 'Cancel lines')),
      cQty: num(pick(r, 'CQty', 'Cancel qty')),
      cVal: num(pick(r, 'CVal', 'Cancel value')),
      rLines: num(pick(r, 'RLines', 'Return lines')),
      rQty: num(pick(r, 'RQty', 'Return qty')),
      rVal: num(pick(r, 'RVal', 'Return value')),
    })).filter((r) => r.name)
  })

  take('ReturnLines', ['ReturnLines', 'Return detail'], (rows) => {
    base.returnLines = rows.map((r) => ({
      date: String(pick(r, 'Date') ?? ''),
      doc: String(pick(r, 'Doc', 'Document') ?? ''),
      type: String(pick(r, 'Type') ?? ''),
      cust: String(pick(r, 'Customer', 'Cust') ?? ''),
      wh: String(pick(r, 'Warehouse', 'Wh') ?? ''),
      qty: num(pick(r, 'Qty')),
      val: num(pick(r, 'Value', 'Val')),
      reason: String(pick(r, 'Reason') ?? ''),
      vena: String(pick(r, 'Vena') ?? ''),
    })).filter((r) => r.doc)
  })

  take('Contracts', ['Contracts', 'FM'], (rows) => {
    base.contracts = rows.map((r) => ({
      plant: String(pick(r, 'Plant') ?? ''),
      omc: String(pick(r, 'OMC', 'Customer') ?? ''),
      region: String(pick(r, 'Region') ?? ''),
      reported: String(pick(r, 'Reported', 'Reported as') ?? 'FM'),
      amc: String(pick(r, 'AMC') ?? ''),
      end: String(pick(r, 'End') ?? ''),
      days: num(pick(r, 'Days')),
      rev: num(pick(r, 'Revenue', 'Rev')),
      eng: num(pick(r, 'Engineer', 'Eng')),
      cm: num(pick(r, 'CM')),
      status: String(pick(r, 'Status') ?? 'Active'),
    })).filter((r) => r.plant)
  })

  take('Engineers', ['Engineers', 'Engineer cost'], (rows) => {
    base.engineers = rows.map((r) => ({
      id: String(pick(r, 'Id', 'Employee') ?? ''),
      name: String(pick(r, 'Name') ?? ''),
      amc: String(pick(r, 'AMC') ?? ''),
      plants: String(pick(r, 'Plants') ?? ''),
      calls: num(pick(r, 'Calls')),
      cost: num(pick(r, 'Cost')),
      per: num(pick(r, 'Per', 'Cost per call')),
      util: num(pick(r, 'Util', 'Utilisation')),
      first: num(pick(r, 'First', 'First-time fix')),
    })).filter((r) => r.id || r.name)
  })

  take('VarianceGrid', ['VarianceGrid', 'Variance'], (rows) => {
    base.varianceGrid = rows.map((r) => ({
      plant: String(pick(r, 'Plant') ?? ''),
      region: String(pick(r, 'Region') ?? ''),
      months: yearMonths.map((m) => num(pick(r, m))),
    })).filter((r) => r.plant)
  })

  take('VarianceExceptions', ['VarianceExceptions', 'Exceptions'], (rows) => {
    base.varianceExceptions = rows.map((r) => ({
      plant: String(pick(r, 'Plant') ?? ''),
      region: String(pick(r, 'Region') ?? ''),
      month: String(pick(r, 'Month') ?? ''),
      v: num(pick(r, 'Value', 'v', 'Variance')),
      pct: num(pick(r, 'Pct', 'Variance %')),
      driver: String(pick(r, 'Driver') ?? ''),
      owner: String(pick(r, 'Owner') ?? ''),
    })).filter((r) => r.plant)
  })

  take('Ledger', ['Ledger'], (rows) => {
    base.ledger = rows.map((r) => ({
      sev: String(pick(r, 'Severity', 'Sev') ?? 'Low'),
      date: String(pick(r, 'Date') ?? ''),
      age: num(pick(r, 'Age')),
      doc: String(pick(r, 'Doc') ?? ''),
      type: String(pick(r, 'Type') ?? ''),
      account: String(pick(r, 'Account') ?? ''),
      plant: String(pick(r, 'Plant') ?? ''),
      amt: num(pick(r, 'Amount', 'Amt')),
      note: String(pick(r, 'Note') ?? ''),
      owner: String(pick(r, 'Owner') ?? 'Unassigned'),
    })).filter((r) => r.doc)
  })

  take('LedgerTrend', ['LedgerTrend'], (rows) => {
    base.ledgerTrend = rows.map((r) => ({
      m: String(pick(r, 'Month', 'm') ?? ''),
      raised: num(pick(r, 'Raised')),
      resolved: num(pick(r, 'Resolved')),
    })).filter((r) => r.m)
  })

  const all = [
    'Monthly', 'Mix', 'Plants', 'Bridge', 'CostLines', 'Orders', 'IntakeTrend', 'Ageing', 'AgeTrend',
    'Customers', 'Invoices', 'Cycle', 'CccTrend', 'Twc', 'Warehouses', 'OriginShare', 'ReturnsMonth',
    'ReturnReasons', 'ReturnWh', 'ReturnLines', 'Contracts', 'Engineers', 'VarianceGrid', 'VarianceExceptions',
    'Ledger', 'LedgerTrend',
  ]
  return { data: base, found, missing: all.filter((s) => !found.includes(s)) }
}

export function buildTemplate(): ArrayBuffer {
  const s = sampleData()
  const wb = XLSX.utils.book_new()
  const add = (name: string, rows: Record<string, unknown>[]) => {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name)
  }
  add('Monthly', s.monthly.map((r) => ({ Month: r.m, Revenue: r.rev, 'GP%': r.gp, EBITDA: r.ebitda, 'EBITDA%': r.ebitdaPct, NetProfit: r.np, Rate: r.rate })))
  add('Mix', s.mix.map((r) => ({ Name: r.name, Value: r.value })))
  add('Plants', s.plants.map((r) => ({ Name: r.name, Value: r.v })))
  add('Bridge', s.bridge.map((r) => ({ Name: r.name, Value: r.v })))
  add('CostLines', s.costLines.map((r) => ({ Name: r.name, Actual: r.actual, Plan: r.plan })))
  add('Orders', s.orders.map((r) => ({ Name: r.name, Intake: r.intake, Budget: r.budget, Billed: r.billed, Backlog: r.backlog, B2B: r.b2b, Cover: r.cover, Reserved: r.reserved ? 'yes' : 'no' })))
  add('IntakeTrend', s.intakeTrend.map((r) => ({ Month: r.m, Intake: r.intake, Billed: r.billed, Backlog: r.backlog })))
  add('Ageing', s.ageing.map((r) => ({ Name: r.name, Value: r.v })))
  add('AgeTrend', s.ageTrend.map((r) => ({ Month: r.m, Current: r.current, Mid: r.mid, Old: r.old })))
  add('Customers', s.customers.map((r) => ({ Name: r.name, Overdue: r.overdue, Share: r.share, DSO: r.dso, NotDue: r.notDue, Mid: r.mid, Old: r.old, Gross: r.gross })))
  add('Invoices', s.invoices.map((r) => ({ Id: r.id, Customer: r.cust, Plant: r.plant, Amount: r.amt, Days: r.days, Owner: r.owner, Next: r.next })))
  add('Cycle', s.cycle.map((r) => ({ Name: r.name, Days: r.days, Target: r.target, Note: r.note })))
  add('CccTrend', s.cccTrend.map((r) => ({ Month: r.m, CCC: r.ccc })))
  add('Twc', s.twc.map((r) => ({ Month: r.m, AR: r.ar, Inventory: r.inv, AP: r.ap, TWC: r.twc, Pct: r.pct })))
  add('Warehouses', s.warehouses.map((r) => ({ Name: r.name, Region: r.region, Origin: r.origin, Qty: r.qty, Value: r.val, Turns: r.turns ?? '', DIO: r.dio ?? '', Slow: r.slow, Returns: r.ret, InScope: r.inScope ? 'yes' : 'no' })))
  add('OriginShare', s.originShare.map((r) => ({ Month: r.m, Domestic: r.domestic, Intl: r.intl })))
  add('ReturnsMonth', s.returnsMonth.map((r) => ({ Month: r.m, Cancel: r.cancel, Return: r.ret })))
  add('ReturnReasons', s.returnReasons.map((r) => ({ Name: r.name, Value: r.v })))
  add('ReturnWh', s.returnWh.map((r) => ({ Name: r.name, CLines: r.cLines, CQty: r.cQty, CVal: r.cVal, RLines: r.rLines, RQty: r.rQty, RVal: r.rVal })))
  add('ReturnLines', s.returnLines.map((r) => ({ Date: r.date, Doc: r.doc, Type: r.type, Customer: r.cust, Warehouse: r.wh, Qty: r.qty, Value: r.val, Reason: r.reason, Vena: r.vena })))
  add('Contracts', s.contracts.map((r) => ({ Plant: r.plant, OMC: r.omc, Region: r.region, Reported: r.reported, AMC: r.amc, End: r.end, Days: r.days, Revenue: r.rev, Engineer: r.eng, CM: r.cm, Status: r.status })))
  add('Engineers', s.engineers.map((r) => ({ Id: r.id, Name: r.name, AMC: r.amc, Plants: r.plants, Calls: r.calls, Cost: r.cost, Per: r.per, Util: r.util, First: r.first })))
  add('VarianceGrid', s.varianceGrid.map((r) => {
    const row: Record<string, unknown> = { Plant: r.plant, Region: r.region }
    yearMonths.forEach((m, i) => {
      row[m] = r.months[i]
    })
    return row
  }))
  add('VarianceExceptions', s.varianceExceptions.map((r) => ({ Plant: r.plant, Region: r.region, Month: r.month, Value: r.v, Pct: r.pct, Driver: r.driver, Owner: r.owner })))
  add('Ledger', s.ledger.map((r) => ({ Severity: r.sev, Date: r.date, Age: r.age, Doc: r.doc, Type: r.type, Account: r.account, Plant: r.plant, Amount: r.amt, Note: r.note, Owner: r.owner })))
  add('LedgerTrend', s.ledgerTrend.map((r) => ({ Month: r.m, Raised: r.raised, Resolved: r.resolved })))
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

export function downloadBuf(buf: ArrayBuffer, name: string, mime: string) {
  const blob = new Blob([buf], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
