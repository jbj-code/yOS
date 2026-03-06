import { useState } from 'react'
import { SunIcon, MoonIcon, PlusCircleIcon } from '@heroicons/react/24/solid'
import { useTheme } from './hooks/useTheme'
import Home from './pages/Home'
import Budget from './pages/Budget'
import Supplements from './pages/Supplements'
import './style.css'
import type { View } from './nav'
import { NavBar } from './components/NavBar'

const PAGE_CONFIG: Record<View, { title: string; subtitle: string }> = {
  home: {
    title: 'yOS',
    subtitle: 'Your personal hub',
  },
  budget: {
    title: 'Budget',
    subtitle: '',
  },
  meal: {
    title: 'Meal plan',
    subtitle: 'Plan meals and track cost (coming soon)',
  },
  supplements: {
    title: 'Supplements',
    subtitle: 'Spend per month',
  },
}

export default function App() {
  const { theme, setTheme } = useTheme()
  const [view, setView] = useState<View>('home')
  const [budgetAddOpen, setBudgetAddOpen] = useState(false)
  const [supplementAddOpen, setSupplementAddOpen] = useState(false)

  const config = PAGE_CONFIG[view]
  const right =
    view === 'home'
      ? (
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="orb-page-header-action"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <MoonIcon className="orb-icon" />
            ) : (
              <SunIcon className="orb-icon" />
            )}
          </button>
        )
      : view === 'budget'
        ? (
            <button
              type="button"
              onClick={() => setBudgetAddOpen(true)}
              className="orb-page-header-action"
              aria-label="Add entry"
            >
              <PlusCircleIcon className="orb-icon" />
            </button>
          )
        : view === 'supplements'
          ? (
              <button
                type="button"
                onClick={() => setSupplementAddOpen(true)}
                className="orb-page-header-action"
                aria-label="Add supplement"
              >
                <PlusCircleIcon className="orb-icon" />
              </button>
            )
          : undefined

  return (
    <div
      className="min-h-screen flex justify-center px-4 py-6"
      style={{ background: 'var(--orb-bg)' }}
    >
      <div className="w-full max-w-xl pb-20">
        <header className="orb-page-header">
          <div className="orb-page-header-inner">
            <h1 className="orb-page-header-title">{config.title}</h1>
            {config.subtitle ? (
              <p className="orb-page-header-subtitle">{config.subtitle}</p>
            ) : null}
          </div>
          {right != null && <div className="orb-page-header-right">{right}</div>}
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
        {view === 'supplements' && (
          <Supplements
            isAddOpen={supplementAddOpen}
            onCloseAdd={() => setSupplementAddOpen(false)}
          />
        )}
      </div>

      <NavBar
        view={view}
        onChangeView={(next) => {
          setView(next)
          if (next !== 'budget') setBudgetAddOpen(false)
          if (next !== 'supplements') setSupplementAddOpen(false)
        }}
      />
    </div>
  )
}
