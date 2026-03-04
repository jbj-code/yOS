import { useEffect, useMemo, useState } from 'react'
import { MinusIcon } from '@heroicons/react/24/solid'
import {
  loadExpenses,
  computeBudgetTotals,
  computeIncomeTotals,
  createEntry,
  deleteEntry,
  type Expense,
  DEFAULT_BUDGET_CATEGORIES,
  getTodayLocalISO,
  formatBudgetDate,
} from '../lib/budget'

type Props = {
  isAddOpen: boolean
  onCloseAdd: () => void
}

export default function Budget({ isAddOpen, onCloseAdd }: Props) {
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState(
    () => DEFAULT_BUDGET_CATEGORIES[0] ?? '',
  )
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => getTodayLocalISO())
  const [entryKind, setEntryKind] = useState<'expense' | 'income'>('expense')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categoryMode, setCategoryMode] = useState<'select' | 'custom'>(
    'select',
  )
  const [listKind, setListKind] = useState<'all' | 'expense' | 'income'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function load() {
      setIsLoading(true)
      const data = await loadExpenses()
      if (!ignore) {
        setExpenses(data)
        setIsLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (isAddOpen) {
      setDate(getTodayLocalISO())
    }
  }, [isAddOpen])

  const totals = useMemo(() => computeBudgetTotals(expenses), [expenses])
  const incomeTotals = useMemo(
    () => computeIncomeTotals(expenses),
    [expenses],
  )

  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_BUDGET_CATEGORIES)
    for (const e of expenses) {
      if (e.kind !== 'expense') continue
      const c = e.category.trim()
      if (c) set.add(c)
    }
    return Array.from(set)
  }, [expenses])

  const visibleEntries = useMemo(
    () =>
      listKind === 'all'
        ? expenses
        : expenses.filter((e) => e.kind === listKind),
    [expenses, listKind],
  )

  const groupedEntries = useMemo(
    () => {
      const map = new Map<string, Expense[]>()
      for (const e of visibleEntries) {
        const list = map.get(e.date)
        if (list) {
          list.push(e)
        } else {
          map.set(e.date, [e])
        }
      }
      return Array.from(map.entries()).sort((a, b) =>
        b[0].localeCompare(a[0]),
      )
    },
    [visibleEntries],
  )

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(amount)
    if (!label.trim() || Number.isNaN(amt) || amt <= 0) return

    const base: Omit<Expense, 'id'> = {
      label: label.trim(),
      category:
        entryKind === 'expense'
          ? category.trim() || (DEFAULT_BUDGET_CATEGORIES[0] ?? 'Uncategorized')
          : category.trim(),
      amount: amt,
      date,
      kind: entryKind,
    }

    const created = await createEntry(base)
    if (!created) return

    setExpenses((prev) => [created, ...prev])
    setLabel('')
    setCategory('')
    setAmount('')
    onCloseAdd()
  }

  async function handleDelete(id: string) {
    const ok = await deleteEntry(id)
    if (!ok) return
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const net = incomeTotals.total - totals.total

  return (
    <div className="relative w-full max-w-xl">
      <section className="mb-6 grid grid-cols-3 gap-3 text-sm">
        <button
          type="button"
          onClick={() => setListKind('all')}
          className={`rounded-2xl border p-3 text-left shadow-[var(--orb-shadow)] transition ${
            listKind === 'all'
              ? 'border-[var(--orb-accent)] bg-[var(--orb-bg-muted)]'
              : 'border-[var(--orb-border)] bg-[var(--orb-bg-elevated)]'
          }`}
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--orb-text-muted)]">
            Budget
          </p>
          <p
            className={`mt-1 text-lg font-semibold ${
              net > 0
                ? 'text-emerald-500'
                : net < 0
                  ? 'text-red-500'
                  : 'text-[var(--orb-text)]'
            }`}
          >
            {net > 0 ? '+$' : net < 0 ? '-$' : '$'}
            {Math.abs(net).toFixed(2)}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setListKind('expense')}
          className={`rounded-2xl border p-3 text-left shadow-[var(--orb-shadow)] transition ${
            listKind === 'expense'
              ? 'border-red-300 bg-red-50 dark:bg-red-500/15'
              : 'border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] text-[var(--orb-text)] hover:border-[var(--orb-border-muted)]'
          }`}
        >
          <p className="text-[11px] font-medium uppercase tracking-wide">
            Expenses
          </p>
          <p className="mt-1 text-lg font-semibold text-red-500">
            -${totals.total.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[11px] text-[color:var(--orb-text-muted)]">
            {totals.count} item{totals.count === 1 ? '' : 's'}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setListKind('income')}
          className={`rounded-2xl border p-3 text-left shadow-[var(--orb-shadow)] transition ${
            listKind === 'income'
              ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-500/15'
              : 'border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] text-[var(--orb-text)] hover:border-[var(--orb-border-muted)]'
          }`}
        >
          <p className="text-[11px] font-medium uppercase tracking-wide">
            Income
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-500">
            +${incomeTotals.total.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[11px] text-[color:var(--orb-text-muted)]">
            {incomeTotals.count} item{incomeTotals.count === 1 ? '' : 's'}
          </p>
        </button>
      </section>

      <section className="space-y-2 pb-20">
        {isLoading ? (
          <p className="text-sm text-[var(--orb-text-muted)]">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-[var(--orb-text-muted)]">
            Nothing logged yet. Tap the + button to add your first entry.
          </p>
        ) : visibleEntries.length === 0 ? (
          <p className="text-sm text-[var(--orb-text-muted)]">
            No {listKind === 'expense' ? 'expenses' : 'income'} yet.
          </p>
        ) : (
          <div className="space-y-4">
            {groupedEntries.map(([groupDate, items]) => (
              <div key={groupDate} className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--orb-text-muted)]">
                  {formatBudgetDate(groupDate)}
                </p>
                <ul className="space-y-2">
                  {items.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] px-3 py-2 text-sm shadow-[var(--orb-shadow)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--orb-text)]">
                          {entry.label}
                        </p>
                        <p className="text-xs text-[var(--orb-text-muted)]">
                          {entry.kind === 'income'
                            ? entry.category || 'Income'
                            : entry.category}
                        </p>
                      </div>
                      <div
                        className="ml-3 flex items-center gap-2"
                      >
                        <span
                          className={`font-semibold ${
                            entry.kind === 'income'
                              ? 'text-emerald-500'
                              : 'text-red-500'
                          }`}
                        >
                          {entry.kind === 'income' ? '+' : '-'}$
                          {entry.amount.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--orb-danger)] text-white shadow-sm hover:bg-[var(--orb-danger-hover)]"
                          aria-label="Delete entry"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 px-4 pb-6 pt-16 sm:items-center sm:pb-0">
          <div className="w-full max-w-md rounded-3xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 shadow-[var(--orb-shadow-lg)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--orb-text)]">
                Add {entryKind === 'expense' ? 'expense' : 'income'}
              </h2>
              <div className="inline-flex rounded-full bg-[var(--orb-bg-muted)] p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setEntryKind('expense')
                    if (!category.trim()) {
                      setCategory(DEFAULT_BUDGET_CATEGORIES[0] ?? '')
                    }
                    setCategoryMode('select')
                  }}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    entryKind === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'text-[var(--orb-text-muted)]'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryKind('income')
                    setCategory('')
                    setCategoryMode('select')
                  }}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    entryKind === 'income'
                      ? 'bg-emerald-500 text-white'
                      : 'text-[var(--orb-text-muted)]'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--orb-text-muted)]">
                  What is this {entryKind === 'expense' ? 'expense' : 'income'}?
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={
                    entryKind === 'expense'
                      ? 'Groceries, housing, Uber...'
                      : 'Paycheck, refund, sale...'
                  }
                  className="h-10 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-3 text-sm text-[var(--orb-text)] outline-none ring-0 focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--orb-text-muted)]">
                    Category{entryKind === 'income' ? ' (optional)' : ''}
                  </label>
                  {entryKind === 'expense' ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={
                          categoryMode === 'select'
                            ? category || ''
                            : '__custom__'
                        }
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '__custom__') {
                            setCategoryMode('custom')
                            setCategory('')
                          } else {
                            setCategoryMode('select')
                            setCategory(value)
                          }
                        }}
                        className="h-10 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-3 text-sm text-[var(--orb-text)] outline-none ring-0 focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="__custom__">+ Custom</option>
                      </select>
                      {categoryMode === 'custom' && (
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="New category"
                          className="h-10 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-3 text-sm text-[var(--orb-text)] outline-none ring-0 focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Job, freelance, refund..."
                      className="h-10 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-3 text-sm text-[var(--orb-text)] outline-none ring-0 focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
                    />
                  )}
                </div>
                <div className="flex w-[140px] flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--orb-text-muted)]">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-2 text-xs text-[var(--orb-text)] outline-none ring-0 focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--orb-text-muted)]">
                  Amount
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-14 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-4 text-2xl font-semibold tracking-tight text-[var(--orb-text)] outline-none ring-0 focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onCloseAdd()
                    setEntryKind('expense')
                    setLabel('')
                    setCategory(DEFAULT_BUDGET_CATEGORIES[0] ?? '')
                    setAmount('')
                    setDate(getTodayLocalISO())
                    setCategoryMode('select')
                  }}
                  className="h-9 rounded-xl border border-[var(--orb-border)] px-3 text-xs font-medium text-[var(--orb-text)] hover:bg-[var(--orb-bg-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!label.trim() || !amount.trim()}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[var(--orb-accent)] px-4 text-xs font-semibold text-[var(--orb-accent-contrast)] shadow transition hover:opacity-90 active:opacity-95 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
