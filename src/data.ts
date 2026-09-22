export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
export const yearMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const monthly = [
  { m: 'Jan', rev: 23.1, gp: 17.1, ebitda: 1.8, ebitdaPct: 7.8, np: 0.15, rate: 90.2 },
  { m: 'Feb', rev: 24.3, gp: 15.2, ebitda: 0.9, ebitdaPct: 3.7, np: 0.12, rate: 91.1 },
  { m: 'Mar', rev: 27.1, gp: 12.7, ebitda: 2.6, ebitdaPct: 9.6, np: 0.26, rate: 92.4 },
  { m: 'Apr', rev: 18.2, gp: 1.2, ebitda: -2.7, ebitdaPct: -14.8, np: -3.1, rate: 93.8 },
  { m: 'May', rev: 21.8, gp: 3.8, ebitda: -1.4, ebitdaPct: -6.4, np: -1.7, rate: 95.1 },
  { m: 'Jun', rev: 20.4, gp: 17.2, ebitda: 1.4, ebitdaPct: 6.9, np: 0.11, rate: 96.4 },
  { m: 'Jul', rev: 21.4, gp: 11.2, ebitda: 1.3, ebitdaPct: 6.1, np: -0.21, rate: 97.2 },
]

export const mix = [
  { name: 'Service', value: 89.5, fill: '#16a34a' },
  { name: 'Projects', value: 36.5, fill: '#0f766e' },
  { name: 'Parts & Components', value: 22.7, fill: '#65a30d' },
  { name: 'FM', value: 17.3, fill: '#a16207' },
  { name: 'Gas equipment', value: 3.6, fill: '#64748b' },
]

export const plants = [
  { name: 'IOCL Trombay', v: 4.2 },
  { name: 'HPCL Ennore', v: 3.1 },
  { name: 'IOCL Mannarode', v: 2.4 },
  { name: 'IOCL Haldia', v: 1.8 },
  { name: 'BPCL Cherlapalli', v: 1.1 },
  { name: 'BPCL Sanand', v: 0.4 },
  { name: 'IOCL Piyala', v: -1.2 },
  { name: 'IOCL Jaipur', v: -2.4 },
  { name: 'HPCL Lucknow', v: -4.8 },
]

export const bridge = [
  { name: 'Budget EBITDA', v: 71.44 },
  { name: 'Higher revenue', v: 7.17 },
  { name: 'Lower GP ratio', v: -13.33 },
  { name: 'Sales expense saved', v: 2.15 },
  { name: 'Higher G&A', v: -13.91 },
  { name: 'Higher staff', v: -19.87 },
  { name: 'Overheads saved', v: 0.97 },
  { name: 'FC / allocations', v: 30.4 },
  { name: 'Actual EBITDA', v: 57.14 },
]

export const costLines = [
  { name: 'Allocations', actual: 1420, plan: 1100 },
  { name: 'G&A', actual: 980, plan: 820 },
  { name: 'Cost of goods sold', actual: 860, plan: 900 },
  { name: 'Sales expense', actual: 210, plan: 340 },
  { name: 'Staff costs', actual: 830, plan: 810 },
  { name: 'Overheads', actual: 590, plan: 600 },
]

export const orders = [
  { name: 'Service (SER)', intake: 119.4, budget: 120.9, billed: 89.5, backlog: 28.9, b2b: 1.33, cover: 2.3, reserved: false },
  { name: 'Projects (PRJ)', intake: 52.2, budget: 35.9, billed: 36.5, backlog: 15.7, b2b: 1.43, cover: 3.0, reserved: false },
  { name: 'Parts & Components', intake: 26.1, budget: 26.2, billed: 22.7, backlog: 3.4, b2b: 1.15, cover: 1.0, reserved: false },
  { name: 'FM', intake: 19.8, budget: 19.0, billed: 17.3, backlog: 2.5, b2b: 1.14, cover: 1.0, reserved: false },
  { name: 'Gas equipment', intake: 4.3, budget: 3.9, billed: 3.6, backlog: 0.7, b2b: 1.19, cover: 1.4, reserved: false },
  { name: 'Open slot 1', intake: 0, budget: 0, billed: 0, backlog: 0, b2b: 0, cover: 0, reserved: true },
  { name: 'Open slot 2', intake: 0, budget: 0, billed: 0, backlog: 0, b2b: 0, cover: 0, reserved: true },
]

export const intakeTrend = months.map((m, i) => ({
  m,
  intake: [28, 31, 34, 22, 29, 27, 30][i],
  billed: [22, 24, 26, 18, 21, 20, 21][i],
  backlog: [38, 45, 53, 57, 65, 72, 81][i],
}))

export const ageing = [
  { name: 'Not due', v: 18.4 },
  { name: '0–30 days', v: 8.2 },
  { name: '31–60 days', v: 6.1 },
  { name: '61–90 days', v: 4.9 },
  { name: '91–180 days', v: 9.8 },
  { name: 'Older than 180', v: 8.1 },
]

export const ageTrend = months.map((m, i) => ({
  m,
  current: [22, 21, 20, 19, 18, 18, 18.4][i],
  mid: [12, 13, 14, 15, 16, 16, 15][i],
  old: [6, 7, 8, 9, 9.5, 8.8, 8.1][i],
}))

export const customers = [
  { name: 'IOCL', overdue: 7.8, share: 44, dso: 71, notDue: 3.6, mid: 4.4, old: 3.8, gross: 18.4 },
  { name: 'BPCL', overdue: 6.2, share: 35, dso: 66, notDue: 3.1, mid: 3.2, old: 2.8, gross: 14.9 },
  { name: 'HPCL', overdue: 3.9, share: 21, dso: 62, notDue: 2.1, mid: 2.2, old: 1.7, gross: 11.4 },
]

export const invoices = [
  { id: 'IN-770144', cust: 'IOCL', plant: 'IOCL Jaipur', amt: 2.4, days: 214, owner: 'S. Ban', next: 'Escalated to OMC finance' },
  { id: 'IN-776850', cust: 'BPCL', plant: 'BPCL Piyala', amt: 1.9, days: 196, owner: 'P. Desai', next: 'Reconciliation 24 Sep' },
  { id: 'IN-770215', cust: 'HPCL', plant: 'HPCL Lucknow', amt: 1.8, days: 188, owner: 'S. Rao', next: 'Awaiting project certificate' },
  { id: 'IN-770962', cust: 'IOCL', plant: 'IOCL Sanand', amt: 1.2, days: 231, owner: 'Unassigned', next: '—' },
  { id: 'IN-776640', cust: 'BPCL', plant: 'BPCL Haldia', amt: 1.0, days: 183, owner: 'A. Menon', next: 'Promise to pay 30 Sep' },
]

export const cycle = [
  { name: 'DSO', days: 67, target: 55, note: 'Customers still owe us' },
  { name: 'DIO', days: 42, target: 38, note: 'Stock sitting on the shelf' },
  { name: 'DPO', days: 38, target: 40, note: 'We still owe vendors' },
  { name: 'CCC', days: 71, target: 60, note: 'DSO + DIO − DPO' },
]

export const cccTrend = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, i) => ({
  m,
  ccc: [78, 76, 74, 73, 72, 71, 70, 69, 72, 71, 70, 71][i],
}))

export const twc = months.map((m, i) => ({
  m,
  ar: [38.8, 40.1, 41.3, 42.8, 40.9, 40.9, 41.6][i],
  inv: [23.1, 25.7, 26.4, 24.2, 24.8, 27.7, 24.5][i],
  ap: [17.3, 17.5, 18.0, 17.8, 18.1, 18.1, 18.2][i],
  twc: [44.6, 48.3, 49.7, 49.2, 47.6, 50.5, 47.9][i],
  pct: [34.2, 33.8, 33.1, 32.6, 31.9, 31.4, 30.8][i],
}))

export const warehouses = [
  { name: 'WH Service — spare parts sale', region: 'West', origin: 'Domestic', qty: 322, val: 9.8, turns: 9.4, dio: 39, slow: 14, ret: 2.1, inScope: true },
  { name: 'WH Service — spare parts (import)', region: 'West', origin: 'International', qty: 196, val: 4.2, turns: 7.1, dio: 51, slow: 22, ret: 1.5, inScope: true },
  { name: 'Trombay plant store', region: 'West', origin: 'Domestic', qty: 148, val: 2.9, turns: null, dio: null, slow: 21, ret: 0.6, inScope: false },
  { name: 'Ennore plant store', region: 'South', origin: 'Domestic', qty: 88, val: 2.0, turns: null, dio: null, slow: 27, ret: 0.4, inScope: false },
  { name: 'Cherlapalli plant store', region: 'South', origin: 'International', qty: 71, val: 1.7, turns: null, dio: null, slow: 31, ret: 0.4, inScope: false },
  { name: 'Piyala plant store', region: 'North', origin: 'Domestic', qty: 77, val: 1.5, turns: null, dio: null, slow: 19, ret: 2.1, inScope: false },
  { name: 'Haldia plant store', region: 'East', origin: 'Domestic', qty: 64, val: 1.4, turns: null, dio: null, slow: 31, ret: 0.7, inScope: false },
  { name: 'Jaipur plant store', region: 'North', origin: 'International', qty: 52, val: 1.0, turns: null, dio: null, slow: 37, ret: 6.4, inScope: false },
]

export const originShare = months.map((m, i) => ({
  m,
  domestic: [79, 78, 76, 75, 74, 73, 72][i],
  intl: [21, 22, 24, 25, 26, 27, 28][i],
}))

export const returnsMonth = months.map((m, i) => ({
  m,
  cancel: [4.2, 5.1, 6.8, 8.4, 4.1, 3.6, 3.2][i],
  ret: [2.1, 2.4, 3.1, 4.8, 2.8, 2.2, 2.15][i],
}))

export const returnReasons = [
  { name: 'Damaged in transit', v: 18.2 },
  { name: 'Wrong part supplied', v: 12.4 },
  { name: 'Late delivery', v: 9.1 },
  { name: 'Customer changed order', v: 7.6 },
  { name: 'Quality rejection', v: 4.8 },
  { name: 'Duplicate order', v: 1.4 },
]

export const returnWh = [
  { name: 'WH Service — spare parts sale', cLines: 11, cQty: 165, cVal: 12.4, rLines: 6, rQty: 72, rVal: 8.1 },
  { name: 'WH Service — spare parts (import)', cLines: 8, cQty: 96, cVal: 8.2, rLines: 4, rQty: 31, rVal: 5.1 },
  { name: 'Jaipur plant store', cLines: 3, cQty: 41, cVal: 3.1, rLines: 2, rQty: 22, rVal: 6.4 },
  { name: 'Piyala plant store', cLines: 2, cQty: 18, cVal: 1.4, rLines: 2, rQty: 14, rVal: 2.1 },
  { name: 'Cherlapalli plant store', cLines: 1, cQty: 12, cVal: 1.1, rLines: 1, rQty: 8, rVal: 0.9 },
  { name: 'Ennore plant store', cLines: 1, cQty: 9, cVal: 0.8, rLines: 1, rQty: 6, rVal: 0.6 },
  { name: 'Trombay plant store', cLines: 1, cQty: 7, cVal: 0.5, rLines: 1, rQty: 5, rVal: 0.4 },
  { name: 'Haldia plant store', cLines: 1, cQty: 5, cVal: 0.4, rLines: 0, rQty: 0, rVal: 0 },
]

export const returnLines = [
  { date: '28 Jul 2026', doc: 'CN-44980', type: 'Return', cust: 'IOCL', wh: 'WH Service — spare parts (import)', qty: 18, val: 6.4, reason: 'Damaged in transit', vena: 'VN-000-881' },
  { date: '24 Jul 2026', doc: 'CN-39204', type: 'Cancellation', cust: 'BPCL', wh: 'WH Service — spare parts sale', qty: 64, val: 4.2, reason: 'Customer changed order', vena: 'VN-000-870' },
  { date: '18 Jul 2026', doc: 'CN-38112', type: 'Return', cust: 'HPCL', wh: 'WH Service — spare parts sale', qty: 22, val: 5.1, reason: 'Wrong part supplied', vena: 'VN-000-794' },
  { date: '14 Jul 2026', doc: 'SO-39588', type: 'Return', cust: 'IOCL', wh: 'Jaipur plant store', qty: 41, val: 6.4, reason: 'Late delivery', vena: 'VN-000-712' },
  { date: '07 Jul 2026', doc: 'CN-43564', type: 'Return', cust: 'BPCL', wh: 'Cherlapalli plant store', qty: 12, val: 1.6, reason: 'Quality rejection', vena: 'VN-000-648' },
]

export const contracts = [
  { plant: 'IOCL Jaipur', omc: 'IOCL', region: 'North', reported: 'Service', amc: 'Non-comprehensive', end: '31 Mar 2026', days: -172, rev: 1.0, eng: 2.1, cm: -3.4, status: 'Renewal' },
  { plant: 'HPCL Lucknow', omc: 'HPCL', region: 'North', reported: 'FM', amc: 'Labour only', end: '31 Mar 2026', days: -172, rev: 0.6, eng: 1.9, cm: -5.8, status: 'Active' },
  { plant: 'BPCL Sanand', omc: 'BPCL', region: 'West', reported: 'Service', amc: 'Non-comprehensive', end: '31 Mar 2026', days: -172, rev: 0.9, eng: 1.5, cm: 1.2, status: 'Renewal' },
  { plant: 'BPCL Piyala', omc: 'BPCL', region: 'North', reported: 'FM', amc: 'Labour only', end: '30 Jun 2027', days: 266, rev: 1.4, eng: 2.4, cm: 2.1, status: 'Active' },
  { plant: 'IOCL Haldia', omc: 'IOCL', region: 'East', reported: 'Service', amc: 'Comprehensive', end: '31 Jul 2027', days: 313, rev: 1.2, eng: 1.6, cm: 6.4, status: 'Active' },
  { plant: 'IOCL Trombay', omc: 'IOCL', region: 'West', reported: 'FM', amc: 'Comprehensive', end: '31 Mar 2028', days: 559, rev: 1.8, eng: 1.9, cm: 14.2, status: 'Active' },
  { plant: 'BPCL Cherlapalli', omc: 'BPCL', region: 'South', reported: 'FM', amc: 'Spares included', end: '30 Sep 2028', days: 742, rev: 1.3, eng: 1.8, cm: 9.1, status: 'Active' },
  { plant: 'HPCL Ennore', omc: 'HPCL', region: 'South', reported: 'Provisional', amc: 'Comprehensive', end: '14 Jan 2029', days: 848, rev: 1.5, eng: 1.9, cm: 12.8, status: 'Active' },
]

export const engineers = [
  { id: 'E-12514', name: 'M. Yadav', amc: 'AMC-NORTH-11', plants: 'HPCL Lucknow, IOCL Jaipur', calls: 31, cost: 2.68, per: 8645, util: 81, first: 91 },
  { id: 'E-13388', name: 'S. Nair', amc: 'AMC-SOUTH-07', plants: 'HPCL Ennore, BPCL Cherlapalli', calls: 19, cost: 2.14, per: 11263, util: 68, first: 81 },
  { id: 'E-09642', name: 'R. Kulkarni', amc: 'AMC-WEST-14', plants: 'IOCL Trombay, BPCL Sanand', calls: 22, cost: 1.86, per: 8455, util: 76, first: 94 },
  { id: 'E-15022', name: 'N. Joshi', amc: 'AMC-WEST-12', plants: 'BPCL Sanand, IOCL Trombay', calls: 16, cost: 1.7, per: 10625, util: 61, first: 76 },
  { id: 'E-09161', name: 'A. Banerjee', amc: 'AMC-EAST-08', plants: 'IOCL Haldia', calls: 14, cost: 1.42, per: 10143, util: 74, first: 89 },
  { id: 'E-13330', name: 'K. Reddy', amc: 'AMC-HYD-09', plants: 'BPCL Cherlapalli', calls: 17, cost: 1.28, per: 7529, util: 74, first: 90 },
  { id: 'E-11156', name: 'V. Iyer', amc: 'AMC-SOUTH-07', plants: 'HPCL Ennore', calls: 12, cost: 1.04, per: 8667, util: 62, first: 83 },
  { id: 'E-08760', name: 'P. Fernandes', amc: 'AMC-TRO-02', plants: 'IOCL Trombay', calls: 9, cost: 0.98, per: 10889, util: 58, first: 77 },
]

const plantNames = [
  'HPCL Lucknow',
  'IOCL Jaipur',
  'IOCL Piyala',
  'BPCL Sanand',
  'IOCL Barauni',
  'IOCL Panipat',
  'HPCL Mangalore',
  'HPCL Kochi',
  'BPCL Cherlapalli',
  'IOCL Haldia',
  'IOCL Mumbai',
  'IOCL Mannarode',
  'HPCL Vizag',
  'HPCL Ennore',
  'IOCL Trombay',
  'All plants',
]

function row(vals: number[]) {
  return vals
}

export const varianceGrid = [
  { plant: 'HPCL Lucknow', region: 'North', months: row([-5.1, -6.4, -12.2, -14.8, -6.9, -4.8, -5.1, 0, 0, 0, 0, 0]) },
  { plant: 'IOCL Jaipur', region: 'North', months: row([-3.4, -4.1, -5.8, -12.2, -7.6, -4.8, -3.8, 0, 0, 0, 0, 0]) },
  { plant: 'IOCL Piyala', region: 'North', months: row([-2.4, -3.1, -4.2, -6.6, -5.1, -2.4, -1.8, 0, 0, 0, 0, 0]) },
  { plant: 'BPCL Sanand', region: 'West', months: row([-0.8, -1.4, -2.2, -8.9, -3.2, -1.1, -0.6, 0, 0, 0, 0, 0]) },
  { plant: 'IOCL Barauni', region: 'East', months: row([-0.4, -0.8, -1.6, -4.8, -2.1, -0.8, -0.4, 0, 0, 0, 0, 0]) },
  { plant: 'IOCL Panipat', region: 'North', months: row([-0.6, -0.9, -1.8, -6.1, -2.4, -0.6, -0.3, 0, 0, 0, 0, 0]) },
  { plant: 'HPCL Mangalore', region: 'South', months: row([1.4, 0.8, 1.1, -2.8, 0.6, 0.4, 0.2, 0, 0, 0, 0, 0]) },
  { plant: 'HPCL Kochi', region: 'South', months: row([1.2, 0.6, 0.8, -1.4, 0.9, 0.7, 0.5, 0, 0, 0, 0, 0]) },
  { plant: 'BPCL Cherlapalli', region: 'South', months: row([1.8, 1.2, 0.6, -3.8, 0.4, 0.8, 0.9, 0, 0, 0, 0, 0]) },
  { plant: 'IOCL Haldia', region: 'East', months: row([2.1, 1.4, 0.8, -2.6, 1.1, 1.6, 1.2, 0, 0, 0, 0, 0]) },
  { plant: 'IOCL Mumbai', region: 'West', months: row([2.4, 1.8, 2.1, -1.2, 1.6, 2.2, 1.9, 0, 0, 0, 0, 0]) },
  { plant: 'IOCL Mannarode', region: 'South', months: row([2.8, 2.1, 1.9, -0.8, 2.4, 2.8, 2.2, 0, 0, 0, 0, 0]) },
  { plant: 'HPCL Vizag', region: 'South', months: row([1.6, 1.1, 0.9, -1.8, 1.2, 1.4, 1.1, 0, 0, 0, 0, 0]) },
  { plant: 'HPCL Ennore', region: 'South', months: row([3.1, 2.4, 1.8, -0.6, 2.1, 2.6, 2.4, 0, 0, 0, 0, 0]) },
  { plant: 'IOCL Trombay', region: 'West', months: row([4.2, 3.1, 2.8, -2.4, 1.8, 2.4, 2.8, 0, 0, 0, 0, 0]) },
]

export const varianceExceptions = [
  { plant: 'HPCL Lucknow', region: 'North', month: 'Apr 2026', v: -14.8, pct: -148, driver: 'Gross profit ratio', owner: 'R. Sharma' },
  { plant: 'IOCL Jaipur', region: 'North', month: 'Apr 2026', v: -12.2, pct: -153, driver: 'Gross profit ratio', owner: 'R. Sharma' },
  { plant: 'HPCL Lucknow', region: 'North', month: 'Mar 2026', v: -12.2, pct: -111, driver: 'Gross profit ratio', owner: 'R. Sharma' },
  { plant: 'BPCL Sanand', region: 'West', month: 'Apr 2026', v: -8.9, pct: -105, driver: 'Gross profit ratio', owner: 'M. Patel' },
  { plant: 'IOCL Jaipur', region: 'North', month: 'May 2026', v: -7.6, pct: -95, driver: 'Staff and overhead', owner: 'R. Sharma' },
  { plant: 'HPCL Lucknow', region: 'North', month: 'May 2026', v: -6.9, pct: -85, driver: 'Staff and overhead', owner: 'R. Sharma' },
  { plant: 'IOCL Panipat', region: 'North', month: 'Apr 2026', v: -6.1, pct: -76, driver: 'Staff and overhead', owner: 'R. Sharma' },
  { plant: 'HPCL Lucknow', region: 'North', month: 'Feb 2026', v: -6.4, pct: -80, driver: 'Staff and overhead', owner: 'R. Sharma' },
]

export const ledger = [
  { sev: 'High', date: '14 Jun 2026', age: 97, doc: 'IN-768851', type: '> ₹10 L', account: '4000-210 Sales — FM', plant: 'IOCL Trombay', amt: 30.2, note: 'Quarterly FM invoice', owner: 'P. Desai' },
  { sev: 'High', date: '04 Jul 2026', age: 77, doc: 'IN-770888', type: '> ₹10 L', account: '4000-110 Sales — Systems', plant: 'BPCL Cherlapalli', amt: 18.0, note: 'Single invoice above watch limit', owner: 'P. Desai' },
  { sev: 'Medium', date: '12 Jul 2026', age: 69, doc: 'CN-228154', type: 'Reversal', account: '4000-110 AR', plant: 'IOCL Trombay', amt: -12.1, note: 'Duplicate billing reversed', owner: 'S. Rao' },
  { sev: 'Medium', date: '08 Jul 2026', age: 73, doc: 'IN-771239', type: 'DO NOT USE', account: '22-90-NOT-USE', plant: 'BPCL Piyala', amt: 12.8, note: 'Posted to retired account', owner: 'Unassigned' },
  { sev: 'Medium', date: '22 Jun 2026', age: 89, doc: 'JV-960144', type: 'Neg. COGS', account: '5000-090 COGS — Service', plant: 'IOCL Haldia', amt: -2.3, note: 'Stock write-back against billed job', owner: 'Unassigned' },
  { sev: 'Low', date: '19 Jul 2026', age: 62, doc: 'JV-960204', type: 'Neg. COGS', account: '5000-040 COGS — Systems', plant: 'IOCL Jaipur', amt: -0.94, note: 'Positive revenue, negative COGS on same job', owner: 'A. Menon' },
  { sev: 'Low', date: '30 Jun 2026', age: 81, doc: 'CN-228661', type: 'Credit note', account: '4000-210 Sales — Spares', plant: 'HPCL Ennore', amt: -6.1, note: 'Warranty return', owner: 'Unassigned' },
  { sev: 'Low', date: '28 Jun 2026', age: 83, doc: 'IN-770640', type: 'Credit note', account: '4000-110 Sales — FM', plant: 'HPCL Lucknow', amt: -18.6, note: 'Rate correction on June invoice', owner: 'S. Rao' },
]

export const ledgerTrend = months.map((m, i) => ({
  m,
  raised: [6, 9, 14, 11, 8, 7, 8][i],
  resolved: [4, 6, 8, 10, 11, 9, 8][i],
}))

void plantNames
