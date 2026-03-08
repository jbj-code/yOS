import { getCategoryColor, getCategoryIcon } from '../lib/categoryIcons'

export type CategoryCardProps = {
  title: string
  total: number
  segments: { category: string; amount: number }[]
  kind: 'income' | 'expense'
  emptyLabel: string
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

/** One card with primary header (title + total + percentages) and category grid. */
export function CategoryCard({
  title,
  total,
  segments,
  kind,
  emptyLabel,
  selectedCategory,
  onSelectCategory,
}: CategoryCardProps) {
  const hasData = total > 0 && segments.length > 0

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] shadow-[var(--orb-shadow)]">
      <div className="bg-[var(--orb-accent)] px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <span className="tabular-nums font-semibold text-white">
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
          {segments.length === 0 ? (
            <p className="col-span-full text-xs text-[var(--orb-text-muted)]">
              {emptyLabel}
            </p>
          ) : (
            segments.map(({ category, amount }) => {
              const Icon = getCategoryIcon(category)
              const color = getCategoryColor(category)
              const isSelected = selectedCategory === category
              const pct = hasData ? ((amount / total) * 100).toFixed(0) : null
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelectCategory(isSelected ? null : category)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 text-center transition ${
                    isSelected
                      ? 'border-[var(--orb-accent)] bg-[var(--orb-accent)]/10'
                      : 'border-transparent hover:bg-[var(--orb-bg-muted)]/50'
                  }`}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14"
                    style={{ background: color, color: 'white' }}
                  >
                    <Icon size={24} />
                  </div>
                  <span className="min-w-0 truncate text-xs font-medium text-[var(--orb-text)] sm:text-sm">
                    {category}
                  </span>
                  <span
                    className={`tabular-nums text-xs font-semibold sm:text-sm ${
                      kind === 'income'
                        ? 'text-[var(--orb-accent)]'
                        : 'text-[var(--orb-danger)]'
                    }`}
                  >
                    {kind === 'income' ? '+' : '-'}${amount.toFixed(2)}
                  </span>
                  {pct != null && (
                    <span className="text-[10px] text-[var(--orb-text-muted)] sm:text-xs">
                      {pct}%
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
