import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  type Theme,
} from '../theme'

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    setStoredTheme(t)
  }, [])

  return { theme, setTheme }
}
