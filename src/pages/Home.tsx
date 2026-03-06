import { useEffect, useMemo, useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import {
  loadExpenses,
  computeBudgetTotals,
  computeIncomeTotals,
  type Expense,
} from '../lib/budget'

type Props = {
  onOpenBudget: () => void
}

export default function Home({ onOpenBudget }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    let ignore = false
    async function load() {
      const data = await loadExpenses()
      if (!ignore) setExpenses(data)
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  const totals = useMemo(() => computeBudgetTotals(expenses), [expenses])
  const incomeTotals = useMemo(
    () => computeIncomeTotals(expenses),
    [expenses],
  )
  const net = incomeTotals.total - totals.total

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--orb-text-muted)]">
        Your hub. Tap a card to open it.
      </p>

      <button
        type="button"
        onClick={onOpenBudget}
        className="w-full rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 text-left shadow-[var(--orb-shadow)] transition hover:border-[var(--orb-border-muted)] active:opacity-95"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-[var(--orb-text)]">Budget</h2>
            <p className="mt-1 text-xs text-[var(--orb-text-muted)]">
              Track spending and expenses
            </p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              <span
                className={`font-semibold tabular-nums ${
                  net > 0
                    ? 'text-emerald-500'
                    : net < 0
                      ? 'text-red-500'
                      : 'text-[var(--orb-text)]'
                }`}
              >
                {net > 0 ? '+$' : net < 0 ? '-$' : '$'}
                {Math.abs(net).toFixed(2)}
              </span>
              <span className="text-[var(--orb-text-muted)]">
                {totals.count} expense{totals.count !== 1 ? 's' : ''}
                {incomeTotals.count > 0 &&
                  ` · ${incomeTotals.count} income`}
              </span>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-[var(--orb-text-muted)]" />
        </div>
      </button>

      <div className="rounded-2xl border border-[var(--orb-border)] border-dashed bg-[var(--orb-bg-muted)]/50 p-4 opacity-80">
        <h2 className="font-semibold text-[var(--orb-text)]">Meal plan</h2>
        <p className="mt-1 text-xs text-[var(--orb-text-muted)]">
          Plan meals and track cost
        </p>
        <p className="mt-2 text-xs text-[var(--orb-text-muted)]">Coming soon</p>
      </div>

      <div className="rounded-2xl border border-[var(--orb-border)] border-dashed bg-[var(--orb-bg-muted)]/50 p-4 opacity-80">
        <h2 className="font-semibold text-[var(--orb-text)]">Supplements</h2>
        <p className="mt-1 text-xs text-[var(--orb-text-muted)]">
          Track your supplement stack
        </p>
        <p className="mt-2 text-xs text-[var(--orb-text-muted)]">Coming soon</p>
      </div>
    </div>
  )
}
