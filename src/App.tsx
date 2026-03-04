import { useState } from 'react'
import { ArrowLeftIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid'
import { useTheme } from './hooks/useTheme'
import Home from './pages/Home'
import Budget from './pages/Budget'
import './style.css'
import type { View } from './nav'
import { NavBar } from './components/NavBar'

export default function App() {
  const { theme, setTheme } = useTheme()
  const [view, setView] = useState<View>('home')
  const [budgetAddOpen, setBudgetAddOpen] = useState(false)

  return (
    <div
      className="min-h-screen flex justify-center px-4 py-6"
      style={{ background: 'var(--orb-bg)' }}
    >
      <div className="w-full max-w-xl pb-20">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-[var(--orb-text)]">
                {view === 'home'
                  ? 'yOS'
                  : view === 'budget'
                    ? 'Budget'
                    : view === 'meal'
                      ? 'Meal plan'
                      : 'Dream journal'}
              </h1>
              <p className="text-xs text-[var(--orb-text-muted)]">
                {view === 'home'
                  ? 'Your personal hub'
                  : view === 'meal'
                    ? 'Plan meals and track cost (coming soon)'
                    : view === 'journal'
                      ? 'Log dreams and reflections (coming soon)'
                      : ''}
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

        {view === 'home' && <Home onOpenBudget={() => setView('budget')} />}
        {view === 'budget' && (
          <Budget
            isAddOpen={budgetAddOpen}
            onCloseAdd={() => setBudgetAddOpen(false)}
          />
        )}
        {view === 'meal' && (
          <div className="rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 text-sm text-[var(--orb-text-muted)]">
            Meal planning is coming soon.
          </div>
        )}
        {view === 'journal' && (
          <div className="rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 text-sm text-[var(--orb-text-muted)]">
            Dream journaling is coming soon.
          </div>
        )}
      </div>

      <NavBar
        view={view}
        onChangeView={(next) => {
          setView(next)
          if (next !== 'budget') {
            setBudgetAddOpen(false)
          }
        }}
        onAdd={() => {
          setView('budget')
          setBudgetAddOpen(true)
        }}
      />
    </div>
  )
}
