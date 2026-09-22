import type { ReactNode } from 'react'

const wrap = (d: ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)

export const ic = {
  overview: wrap(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>,
  ),
  budget: wrap(
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15v-5" />
      <path d="M12 15V8" />
      <path d="M16 15v-3" />
    </>,
  ),
  orders: wrap(
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h10" />
    </>,
  ),
  receivables: wrap(
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8" />
      <path d="M9.5 10.5c.4-1 1.4-1.5 2.5-1.5s2 .6 2 1.7c0 2.3-4 1.4-4 3.6 0 1.1 1 1.7 2 1.7s2-.5 2.4-1.4" />
    </>,
  ),
  stock: wrap(
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </>,
  ),
  contracts: wrap(
    <>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>,
  ),
  engineer: wrap(
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c.8-3 3.2-4.5 7-4.5s6.2 1.5 7 4.5" />
    </>,
  ),
  variance: wrap(
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 14h.01" />
      <path d="M12 10h.01" />
      <path d="M16 8h.01" />
    </>,
  ),
  ledger: wrap(
    <>
      <path d="M12 3v18" />
      <path d="M5 8h14" />
      <path d="M5 13h14" />
      <path d="M5 18h14" />
    </>,
  ),
  search: wrap(
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" />
    </>,
  ),
  bell: wrap(
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9" />
      <path d="M10 21h4" />
    </>,
  ),
  sliders: wrap(
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <circle cx="8" cy="7" r="1.6" fill="currentColor" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" />
      <circle cx="10" cy="17" r="1.6" fill="currentColor" />
    </>,
  ),
  export: wrap(
    <>
      <path d="M12 4v10" />
      <path d="M8 8l4-4 4 4" />
      <path d="M5 16v3h14v-3" />
    </>,
  ),
  sun: wrap(
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>,
  ),
  moon: wrap(
    <>
      <path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z" />
    </>,
  ),
  chev: wrap(<path d="M6 9l6 6 6-6" />),
}
