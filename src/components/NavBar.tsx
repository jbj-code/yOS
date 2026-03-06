import {
  HomeIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  BeakerIcon,
} from '@heroicons/react/24/solid'
import type { View } from '../nav'

type Props = {
  view: View
  onChangeView: (view: View) => void
}

export function NavBar({ view, onChangeView }: Props) {
  return (
    <nav className="pointer-events-none fixed inset-x-0 orb-nav-safe flex justify-center">
      <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between rounded-3xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)]/95 px-4 py-2 text-xs shadow-[var(--orb-shadow-lg)] backdrop-blur">
        <button
          type="button"
          onClick={() => onChangeView('home')}
          className="flex flex-1 flex-col items-center gap-0.5 min-h-[44px] min-w-[44px] justify-center py-2"
        >
          <HomeIcon
            className={`h-5 w-5 ${
              view === 'home'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }`}
          />
          <span
            className={
              view === 'home'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }
          >
            Home
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('budget')}
          className="flex flex-1 flex-col items-center gap-0.5 min-h-[44px] min-w-[44px] justify-center py-2"
        >
          <BanknotesIcon
            className={`h-5 w-5 ${
              view === 'budget'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }`}
          />
          <span
            className={
              view === 'budget'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }
          >
            Budget
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('meal')}
          className="flex flex-1 flex-col items-center gap-0.5 min-h-[44px] min-w-[44px] justify-center py-2"
        >
          <CalendarDaysIcon
            className={`h-5 w-5 ${
              view === 'meal'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }`}
          />
          <span
            className={
              view === 'meal'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }
          >
            Meals
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('supplements')}
          className="flex flex-1 flex-col items-center gap-0.5 min-h-[44px] min-w-[44px] justify-center py-2"
        >
          <BeakerIcon
            className={`h-5 w-5 ${
              view === 'supplements'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }`}
          />
          <span
            className={
              view === 'supplements'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }
          >
            Stack
          </span>
        </button>
      </div>
    </nav>
  )
}

