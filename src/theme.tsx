import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const Ctx = createContext({ dark: false, toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('mein-theme') === 'dark'
    } catch {
      return false
    }
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mein-theme', dark ? 'dark' : 'light')
  }, [dark])
  return <Ctx.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>{children}</Ctx.Provider>
}

export function useTheme() {
  return useContext(Ctx)
}
