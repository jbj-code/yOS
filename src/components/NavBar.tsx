import { MdHome, MdLunchDining, MdScience } from 'react-icons/md'
import type { View } from '../nav'
import type { ViewMode } from '../hooks/useViewMode'

type Props = {
  viewMode: ViewMode
  view: View
  onChangeView: (view: View) => void
}

const ITEMS: { view: View; label: string; Icon: typeof MdHome }[] = [
  { view: 'home', label: 'Home', Icon: MdHome },
  { view: 'meal', label: 'Meals', Icon: MdLunchDining },
  { view: 'supplements', label: 'Stack', Icon: MdScience },
]

function NavItem({
  view,
  currentView,
  onChangeView,
  variant,
}: {
  view: View
  currentView: View
  onChangeView: (view: View) => void
  variant: ViewMode
}) {
  const entry = ITEMS.find((i) => i.view === view)
  if (!entry) return null
  const { label, Icon } = entry
  const active = currentView === view
  const activeClass = 'text-[var(--orb-accent)]'
  const inactiveClass = 'text-[var(--orb-text-muted)]'

  if (variant === 'desktop') {
    return (
      <button
        type="button"
        onClick={() => onChangeView(view)}
        className="orb-clickable orb-sidebar-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm"
      >
        <Icon className={`shrink-0 ${active ? activeClass : inactiveClass}`} size={20} />
        <span className={active ? activeClass : inactiveClass}>{label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onChangeView(view)}
      className="orb-clickable flex flex-1 flex-col items-center gap-0.5 min-h-[44px] min-w-[44px] justify-center py-2"
    >
      <Icon className={active ? activeClass : inactiveClass} size={20} />
      <span className={active ? activeClass : inactiveClass}>{label}</span>
    </button>
  )
}

export function NavBar({ viewMode, view, onChangeView }: Props) {
  if (viewMode === 'desktop') {
    return (
      <aside className="orb-sidebar">
        <nav className="orb-sidebar-nav flex flex-col gap-0.5 p-3">
          {ITEMS.map(({ view: v }) => (
            <NavItem
              key={v}
              view={v}
              currentView={view}
              onChangeView={onChangeView}
              variant="desktop"
            />
          ))}
        </nav>
      </aside>
    )
  }

  return (
    <nav className="orb-nav-bar pointer-events-none flex justify-center">
      <div className="orb-nav-bar-inner pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between border border-b-0 border-[var(--orb-border)] bg-[var(--orb-bg-elevated)]/95 px-3 py-2 text-xs shadow-[var(--orb-shadow-lg)] backdrop-blur sm:px-4">
        {ITEMS.map(({ view: v }) => (
          <NavItem
            key={v}
            view={v}
            currentView={view}
            onChangeView={onChangeView}
            variant="mobile"
          />
        ))}
      </div>
    </nav>
  )
}

