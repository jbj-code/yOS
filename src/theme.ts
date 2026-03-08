/**
 * yOS app theme: light (default) and dark (charcoal).
 * CSS variables are applied to document.documentElement; use them in classes like bg-[var(--orb-bg)].
 */

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'orbit:theme'

export const themes: Record<Theme, Record<string, string>> = {
  light: {
    '--orb-bg': '#f8fafc',
    '--orb-bg-muted': '#f1f5f9',
    '--orb-bg-elevated': '#ffffff',
    '--orb-text': '#0f172a',
    '--orb-text-muted': '#64748b',
    '--orb-accent': '#037a68',
    '--orb-accent-hover': '#026b5b',
    '--orb-accent-contrast': '#ffffff',
    '--orb-accent-card': '#00665c',
    '--orb-income-bg': '#ccfbf1',
    '--orb-spent-bg': '#fee2e2',
    '--orb-spent-icon': '#dc2626',
    '--orb-border': '#e2e8f0',
    '--orb-border-muted': '#cbd5e1',
    '--orb-danger': '#dc2626',
    '--orb-danger-hover': '#b91c1c',
    '--orb-shadow': '0 1px 3px rgba(0,0,0,0.08)',
    '--orb-shadow-lg': '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)',
  },
  dark: {
    '--orb-bg': '#1c1c1c',
    '--orb-bg-muted': '#2d2d2d',
    '--orb-bg-elevated': '#252525',
    '--orb-text': '#f1f5f9',
    '--orb-text-muted': '#94a3b8',
    '--orb-accent': '#2dd4bf',
    '--orb-accent-hover': '#5eead4',
    '--orb-accent-contrast': '#0f172a',
    '--orb-accent-card': '#0d9488',
    '--orb-income-bg': '#134e4a',
    '--orb-spent-bg': '#7f1d1d',
    '--orb-spent-icon': '#f87171',
    '--orb-border': '#404040',
    '--orb-border-muted': '#525252',
    '--orb-danger': '#f87171',
    '--orb-danger-hover': '#ef4444',
    '--orb-shadow': '0 1px 3px rgba(0,0,0,0.3)',
    '--orb-shadow-lg': '0 10px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.3)',
  },
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'light'
}

export function setStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  const vars = themes[theme]
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}
