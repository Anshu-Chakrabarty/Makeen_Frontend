import { Navigate, Route, Routes } from 'react-router-dom'
import { Budget } from './pages/Budget'
import { Contracts } from './pages/Contracts'
import { Engineer } from './pages/Engineer'
import { Ledger } from './pages/Ledger'
import { Orders } from './pages/Orders'
import { Overview } from './pages/Overview'
import { Receivables } from './pages/Receivables'
import { Variance } from './pages/Variance'
import { WorkingCapital } from './pages/WorkingCapital'
import { Shell } from './shell'
import { FilterProvider } from './filters'
import { ThemeProvider } from './theme'

export default function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/receivables" element={<Receivables />} />
          <Route path="/working-capital" element={<WorkingCapital />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/engineer" element={<Engineer />} />
          <Route path="/variance" element={<Variance />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </FilterProvider>
    </ThemeProvider>
  )
}
