import { useState } from 'react'
import { ArrowLeftIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid'
import { useTheme } from './hooks/useTheme'
import Home from './pages/Home'
import Budget from './pages/Budget'
import './style.css'

type View = 'home' | 'budget'

export default function App() {
  const { theme, setTheme } = useTheme()
  const [view, setView] = useState<View>('home')

  return (
    <div
      className="min-h-screen flex justify-center px-4 py-6"
      style={{ background: 'var(--orb-bg)' }}
    >
      <div className="w-full max-w-xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {view === 'budget' && (
              <button
                type="button"
                onClick={() => setView('home')}
                className="shrink-0 rounded-full p-1.5 text-[var(--orb-text-muted)] hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-text)]"
                aria-label="Back to home"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-[var(--orb-text)]">
                {view === 'home' ? 'yOS' : 'Budget'}
              </h1>
              <p className="text-xs text-[var(--orb-text-muted)]">
                {view === 'home'
                  ? 'Your personal hub'
                  : 'Tap + to log anything you spend'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="shrink-0 rounded-full p-2 text-[var(--orb-text-muted)] hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-text)]"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
        </header>

        {view === 'home' ? (
          <Home onOpenBudget={() => setView('budget')} />
        ) : (
          <Budget />
        )}
      </div>
    </div>
  )
}
