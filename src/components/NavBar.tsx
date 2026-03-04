import {
  HomeIcon,
  BanknotesIcon,
  PlusCircleIcon,
  CalendarDaysIcon,
  BookOpenIcon,
} from '@heroicons/react/24/solid'
import type { View } from '../nav'

type Props = {
  view: View
  onChangeView: (view: View) => void
  onAdd: () => void
}

export function NavBar({ view, onChangeView, onAdd }: Props) {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between rounded-3xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)]/95 px-4 py-2 text-xs shadow-[var(--orb-shadow-lg)] backdrop-blur">
        <button
          type="button"
          onClick={() => onChangeView('home')}
          className="flex flex-1 flex-col items-center gap-0.5"
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
          className="flex flex-1 flex-col items-center gap-0.5"
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
          onClick={onAdd}
          className="flex flex-1 flex-col items-center gap-0.5"
        >
          <div className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-[var(--orb-accent)] text-[var(--orb-accent-contrast)] shadow-lg">
            <PlusCircleIcon className="h-6 w-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('meal')}
          className="flex flex-1 flex-col items-center gap-0.5"
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
          onClick={() => onChangeView('journal')}
          className="flex flex-1 flex-col items-center gap-0.5"
        >
          <BookOpenIcon
            className={`h-5 w-5 ${
              view === 'journal'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }`}
          />
          <span
            className={
              view === 'journal'
                ? 'text-[var(--orb-accent)]'
                : 'text-[var(--orb-text-muted)]'
            }
          >
            Dreams
          </span>
        </button>
      </div>
    </nav>
  )
}

