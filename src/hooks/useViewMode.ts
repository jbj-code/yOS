import { useCallback, useState } from 'react'

export type ViewMode = 'mobile' | 'desktop'

const STORAGE_KEY = 'yos:viewMode'

function getStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'mobile'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'desktop' || stored === 'mobile') return stored
  return 'mobile'
}

function setStoredViewMode(mode: ViewMode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // ignore
  }
}

export function useViewMode(): {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
} {
  const [viewMode, setViewModeState] = useState<ViewMode>(getStoredViewMode)

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    setStoredViewMode(mode)
  }, [])

  const toggleViewMode = useCallback(() => {
    setViewModeState((prev) => {
      const next = prev === 'mobile' ? 'desktop' : 'mobile'
      setStoredViewMode(next)
      return next
    })
  }, [])

  return { viewMode, setViewMode, toggleViewMode }
}
