import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MdChevronLeft,
  MdChevronRight,
  MdTrendingDown,
  MdTrendingUp,
  MdCurrencyExchange,
  MdLunchDining,
  MdScience,
  MdDataUsage,
  MdInfo,
  MdExpandMore,
} from 'react-icons/md'
import {
  loadExpenses,
  computeBudgetTotals,
  computeIncomeTotals,
  formatBudgetDate,
  createEntry,
  getTodayLocalISO,
  getCurrentMonthKey,
  formatMonthLabel,
  getPrevMonth,
  getNextMonth,
  filterByMonth,
  DEFAULT_BUDGET_CATEGORIES,
  type Expense,
} from '../lib/budget'
import { getCategoryIcon, getCategoryColor, INCOME_CATEGORIES } from '../lib/categoryIcons'
import { loadSupplements, monthlyCost, type Supplement } from '../lib/supplements'
import { CategoryCard } from '../components/CategoryCard'
import { useSpendingBudgetPct, SPENDING_BUDGET_PCT_MIN, SPENDING_BUDGET_PCT_MAX } from '../hooks/useSpendingBudgetPct'
import type { View } from '../nav'

type Props = {
  onView: (view: View) => void
}

export default function Home({ onView }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey)
  const { spendingBudgetPct, setSpendingBudgetPct } = useSpendingBudgetPct()
  const [spendingBudgetModalOpen, setSpendingBudgetModalOpen] = useState(false)
  const [addIncomeModalOpen, setAddIncomeModalOpen] = useState(false)
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false)
  const [incomeLabel, setIncomeLabel] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDate, setIncomeDate] = useState(getTodayLocalISO)
  const [incomeCategory, setIncomeCategory] = useState(() => INCOME_CATEGORIES[0] ?? '')
  const [expenseLabel, setExpenseLabel] = useState('')
  const [expenseCategory, setExpenseCategory] = useState(() => DEFAULT_BUDGET_CATEGORIES[0] ?? '')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(getTodayLocalISO)
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [recentActivityView, setRecentActivityView] = useState<'transactions' | 'categories'>(
    'transactions',
  )

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

  useEffect(() => {
    let ignore = false
    async function load() {
      const data = await loadSupplements()
      if (!ignore) setSupplements(data)
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  const monthExpenses = useMemo(
    () => filterByMonth(expenses, selectedMonth),
    [expenses, selectedMonth],
  )
  const totals = useMemo(
    () => computeBudgetTotals(monthExpenses),
    [monthExpenses],
  )
  const incomeTotals = useMemo(
    () => computeIncomeTotals(monthExpenses),
    [monthExpenses],
  )
  const net = incomeTotals.total - totals.total
  const spent = totals.total
  const income = incomeTotals.total
  const spendingBudget = income * (spendingBudgetPct / 100)
  const safeToSpend = Math.max(0, spendingBudget - spent)
  const progressPct =
    spendingBudget > 0 ? Math.min(100, (spent / spendingBudget) * 100) : 0

  const isCurrentMonth = selectedMonth === getCurrentMonthKey()

  /** Recent activity: all entries for the month, sorted by date desc. */
  const recentEntries = useMemo(() => {
    return [...monthExpenses].sort((a, b) => (b.date > a.date ? 1 : -1))
  }, [monthExpenses])

  /** Expense by category for category cards (same as Transactions page). */
  const expenseByCategory = useMemo(
    () =>
      (totals.categoryTotals ?? []).map(([category, amount]) => ({
        category,
        amount,
      })),
    [totals.categoryTotals],
  )

  /** Income by category for category cards (same as Transactions page). */
  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of monthExpenses) {
      if (e.kind !== 'income') continue
      const c = (e.category || 'Other').trim()
      map.set(c, (map.get(c) ?? 0) + e.amount)
    }
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [monthExpenses])

  const stackMonthlyTotal = useMemo(() => {
    return supplements.reduce((sum, s) => sum + monthlyCost(s), 0)
  }, [supplements])

  const quickActions = useMemo(
    () => [
      {
        label: 'Meals',
        Icon: MdLunchDining,
        onClick: () => onView('meal'),
        amount: '—',
      },
      {
        label: 'Stack',
        Icon: MdScience,
        onClick: () => onView('supplements'),
        amount: `$${stackMonthlyTotal.toFixed(0)}/mo`,
      },
      {
        label: 'Transactions',
        Icon: MdCurrencyExchange,
        onClick: () => setRecentActivityView('transactions'),
        amount: `${monthExpenses.length} ${monthExpenses.length === 1 ? 'entry' : 'entries'}`,
      },
    ],
    [onView, stackMonthlyTotal, monthExpenses.length],
  )

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Month selector */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setSelectedMonth(getPrevMonth(selectedMonth))}
          className="orb-touch-target flex items-center justify-center rounded-full text-[var(--orb-text-muted)] hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-text)]"
          aria-label="Previous month"
        >
          <MdChevronLeft size={24} />
        </button>
        <span className="min-w-0 truncate text-center text-sm font-medium text-[var(--orb-text)]">
          {formatMonthLabel(selectedMonth)}
        </span>
        <button
          type="button"
          onClick={() =>
            isCurrentMonth
              ? undefined
              : setSelectedMonth(getNextMonth(selectedMonth))
          }
          className={`orb-touch-target flex items-center justify-center rounded-full ${
            isCurrentMonth
              ? 'cursor-default opacity-40'
              : 'text-[var(--orb-text-muted)] hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-text)]'
          }`}
          aria-label="Next month"
          disabled={isCurrentMonth}
        >
          <MdChevronRight size={24} />
        </button>
      </div>

      {/* Budget net card - centered */}
      <div
        className="rounded-2xl px-4 py-5 text-center sm:px-5 sm:py-6"
        style={{ background: 'var(--orb-accent-card)' }}
      >
        <p className="text-xs font-medium tracking-wide text-white/80">
          Budget
        </p>
        <p
          className={`mt-1 text-2xl font-bold tabular-nums text-white sm:text-3xl ${
            net >= 0 ? '' : 'opacity-90'
          }`}
        >
          {net > 0 ? '+' : ''}${net.toFixed(2)}
        </p>
      </div>

      {/* Monthly Income & Monthly spend - pressable cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAddIncomeModalOpen(true)}
          className="orb-clickable-card flex flex-col items-center rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 text-center shadow-[var(--orb-shadow)]"
        >
          <div
            className="mb-2 flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'var(--orb-income-bg)' }}
          >
            <MdTrendingDown
              size={20}
              style={{ color: 'var(--orb-accent)' }}
            />
          </div>
          <p className="text-xs font-medium tracking-wide text-[var(--orb-text-muted)]">
            Monthly Income
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--orb-text)]">
            ${income.toFixed(2)}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setAddExpenseModalOpen(true)}
          className="orb-clickable-card flex flex-col items-center rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 text-center shadow-[var(--orb-shadow)]"
        >
          <div
            className="mb-2 flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'var(--orb-spent-bg)' }}
          >
            <MdTrendingUp
              size={20}
              style={{ color: 'var(--orb-spent-icon)' }}
            />
          </div>
          <p className="text-xs font-medium tracking-wide text-[var(--orb-text-muted)]">
            Monthly Spend
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--orb-text)]">
            ${spent.toFixed(2)}
          </p>
        </button>
      </div>

      {/* Spending Budget - pressable to adjust % */}
      <button
        type="button"
        onClick={() => setSpendingBudgetModalOpen(true)}
        className="orb-clickable-card w-full rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 text-left shadow-[var(--orb-shadow)] sm:p-5"
      >
        <div className="flex items-center gap-2">
          <MdDataUsage
            className="shrink-0"
            size={20}
            style={{ color: 'var(--orb-accent)' }}
          />
          <h2 className="font-semibold text-[var(--orb-text)]">
            Spending Budget
          </h2>
        </div>
        <div className="mt-3">
          <span className="text-lg font-semibold tabular-nums text-[var(--orb-text)]">
            ${spent.toFixed(0)}
          </span>
          <span className="text-[var(--orb-text-muted)]"> / </span>
          <span className="text-lg font-semibold tabular-nums text-[var(--orb-text-muted)]">
            ${spendingBudget.toFixed(0)}
          </span>
          <span className="ml-1 text-xs text-[var(--orb-text-muted)]">
            ({spendingBudgetPct}% of income)
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--orb-bg-muted)]">
            <div className="flex h-full w-full">
              {spent > 0 &&
                (totals.categoryTotals ?? []).map(([category, amount]) => {
                  const pctOfBar = (amount / spent) * progressPct
                  if (pctOfBar <= 0) return null
                  return (
                    <div
                      key={category}
                      className="h-full transition-all first:rounded-l-full last:rounded-r-full"
                      style={{
                        width: `${pctOfBar}%`,
                        background: getCategoryColor(category),
                        minWidth: pctOfBar > 0.5 ? undefined : 0,
                      }}
                      title={`${category}: ${((amount / spent) * 100).toFixed(0)}%`}
                    />
                  )
                })}
            </div>
          </div>
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: 'var(--orb-accent)' }}
          >
            {progressPct.toFixed(0)}%
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <MdInfo className="shrink-0" size={18} style={{ color: 'var(--orb-accent)' }} />
          <span style={{ color: 'var(--orb-accent)' }}>
            Safe to spend: ${safeToSpend.toFixed(0)}
          </span>
        </div>
      </button>

      {/* Quick actions: Meals, Stack, Transactions – vertical cards like Monthly income/spend */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map(({ label, Icon, onClick, amount }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="orb-clickable-card flex flex-col items-center rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 text-center shadow-[var(--orb-shadow)]"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--orb-bg-muted)]">
              <Icon className="text-[var(--orb-text-muted)]" size={22} />
            </div>
            <p className="text-xs font-medium tracking-wide text-[var(--orb-text-muted)]">
              {label}
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--orb-accent)]">
              {amount}
            </p>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-[var(--orb-text)]">
            Recent Activity
          </h2>
          <button
            type="button"
            onClick={() =>
              setRecentActivityView((v) =>
                v === 'transactions' ? 'categories' : 'transactions',
              )
            }
            className="orb-clickable text-sm font-medium"
            style={{ color: 'var(--orb-accent)' }}
          >
            {recentActivityView === 'transactions'
              ? 'View categories'
              : 'View transactions'}
          </button>
        </div>
        {recentActivityView === 'categories' ? (
          <div className="space-y-4">
            <CategoryCard
              title="Expenses"
              total={totals.total}
              segments={expenseByCategory}
              kind="expense"
              emptyLabel="No expenses yet"
              selectedCategory={null}
              onSelectCategory={() => {}}
            />
            <CategoryCard
              title="Income"
              total={incomeTotals.total}
              segments={incomeByCategory}
              kind="income"
              emptyLabel="No income yet"
              selectedCategory={null}
              onSelectCategory={() => {}}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.length === 0 ? (
              <p className="rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 text-sm text-[var(--orb-text-muted)]">
                No entries for {formatMonthLabel(selectedMonth)}.
              </p>
            ) : (
              recentEntries.map((entry) => {
                const CategoryIcon = getCategoryIcon(entry.category)
                const categoryColor = getCategoryColor(entry.category)
                const displayCategory = (entry.category || 'Other').trim()
                const isIncome = entry.kind === 'income'
                return (
                  <div
                    key={entry.id}
                    className="orb-clickable-card flex items-center gap-3 rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-3 shadow-[var(--orb-shadow)] sm:p-4"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: categoryColor,
                        color: 'white',
                      }}
                    >
                      <CategoryIcon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[var(--orb-text)] truncate">
                        {entry.label || (isIncome ? 'Income' : 'Expense')}
                      </p>
                      <p className="text-xs text-[var(--orb-text-muted)]">
                        {displayCategory}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`font-semibold tabular-nums ${
                          isIncome
                            ? 'text-[var(--orb-accent)]'
                            : 'text-[var(--orb-danger)]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}${Math.abs(entry.amount).toFixed(2)}
                      </span>
                      <p className="text-xs text-[var(--orb-text-muted)]">
                        {formatBudgetDate(entry.date)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Slide-up modal: Adjust spending budget % */}
      {spendingBudgetModalOpen && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 px-3 pt-12 pb-0 sm:items-center sm:p-4 sm:pb-0"
          role="dialog"
          aria-modal="true"
          aria-label="Adjust spending budget percentage"
          onClick={() => setSpendingBudgetModalOpen(false)}
        >
          <div
            className="orb-modal-panel w-full max-w-md rounded-t-3xl border border-b-0 border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 shadow-[var(--orb-shadow-lg)] sm:rounded-3xl sm:border-b sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--orb-text)]">
              Spending budget %
            </h3>
            <p className="mt-1 text-sm text-[var(--orb-text-muted)]">
              Use this % of monthly income as your spending budget (rest is saved).
            </p>
            <SpendingBudgetPctForm
              value={spendingBudgetPct}
              min={SPENDING_BUDGET_PCT_MIN}
              max={SPENDING_BUDGET_PCT_MAX}
              onChange={setSpendingBudgetPct}
              onSave={() => setSpendingBudgetModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Slide-up modal: Add income */}
      {addIncomeModalOpen && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 px-3 pt-12 pb-0 sm:items-center sm:p-4 sm:pb-0"
          role="dialog"
          aria-modal="true"
          aria-label="Add income"
          onClick={() => setAddIncomeModalOpen(false)}
        >
          <AddIncomeSheet
            label={incomeLabel}
            setLabel={setIncomeLabel}
            amount={incomeAmount}
            setAmount={setIncomeAmount}
            date={incomeDate}
            setDate={setIncomeDate}
            category={incomeCategory}
            setCategory={setIncomeCategory}
            onClose={() => {
              setAddIncomeModalOpen(false)
              setIncomeLabel('')
              setIncomeAmount('')
              setIncomeDate(getTodayLocalISO())
              setIncomeCategory(INCOME_CATEGORIES[0] ?? '')
            }}
            onSubmit={async (payload) => {
              const created = await createEntry(payload)
              if (created) {
                setExpenses((prev) => [created, ...prev])
                setAddIncomeModalOpen(false)
                setIncomeLabel('')
                setIncomeAmount('')
                setIncomeDate(getTodayLocalISO())
                setIncomeCategory(INCOME_CATEGORIES[0] ?? '')
              }
            }}
          />
        </div>
      )}

      {/* Slide-up modal: Add expense (spend) */}
      {addExpenseModalOpen && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 px-3 pt-12 pb-0 sm:items-center sm:p-4 sm:pb-0"
          role="dialog"
          aria-modal="true"
          aria-label="Add expense"
          onClick={() => setAddExpenseModalOpen(false)}
        >
          <AddExpenseSheet
            label={expenseLabel}
            setLabel={setExpenseLabel}
            category={expenseCategory}
            setCategory={setExpenseCategory}
            amount={expenseAmount}
            setAmount={setExpenseAmount}
            date={expenseDate}
            setDate={setExpenseDate}
            onClose={() => {
              setAddExpenseModalOpen(false)
              setExpenseLabel('')
              setExpenseCategory(DEFAULT_BUDGET_CATEGORIES[0] ?? '')
              setExpenseAmount('')
              setExpenseDate(getTodayLocalISO())
            }}
            onSubmit={async (payload) => {
              const created = await createEntry(payload)
              if (created) {
                setExpenses((prev) => [created, ...prev])
                setAddExpenseModalOpen(false)
                setExpenseLabel('')
                setExpenseCategory(DEFAULT_BUDGET_CATEGORIES[0] ?? '')
                setExpenseAmount('')
                setExpenseDate(getTodayLocalISO())
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

/** Dropdown for category with icons (expense or income) */
function CategorySelect({
  categories,
  value,
  onChange,
  label,
}: {
  categories: string[]
  value: string
  onChange: (category: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])
  const displayValue = value || categories[0]
  const Icon = getCategoryIcon(displayValue)
  const color = getCategoryColor(displayValue)
  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-medium text-[var(--orb-text-muted)]">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="orb-clickable mt-1 flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-3 text-left text-[var(--orb-text)] outline-none focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
      >
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ background: color, color: 'white' }}
        >
          <Icon size={16} />
        </div>
        <span className="min-w-0 flex-1 truncate">{displayValue}</span>
        <MdExpandMore size={20} className="shrink-0 text-[var(--orb-text-muted)]" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] py-1 shadow-lg">
          {categories.map((c) => {
            const CIcon = getCategoryIcon(c)
            const cColor = getCategoryColor(c)
            const isSelected = (value || categories[0]) === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
                  isSelected ? 'bg-[var(--orb-bg-muted)]' : 'hover:bg-[var(--orb-bg-muted)]'
                }`}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: cColor, color: 'white' }}
                >
                  <CIcon size={18} />
                </div>
                <span>{c}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Inline form for spending budget %: slider + Save */
function SpendingBudgetPctForm({
  value,
  min,
  max,
  onChange,
  onSave,
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  onSave: () => void
}) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[var(--orb-accent)]"
        />
        <span className="w-12 text-right font-semibold tabular-nums text-[var(--orb-text)]">
          {value}%
        </span>
      </div>
      <button
        type="button"
        onClick={onSave}
        className="w-full rounded-xl bg-[var(--orb-accent)] py-3 text-sm font-semibold text-[var(--orb-accent-contrast)] shadow transition hover:opacity-90 active:opacity-95"
      >
        Done
      </button>
    </div>
  )
}

/** Slide-up sheet: Add income form */
function AddIncomeSheet({
  label,
  setLabel,
  amount,
  setAmount,
  date,
  setDate,
  category,
  setCategory,
  onClose,
  onSubmit,
}: {
  label: string
  setLabel: (s: string) => void
  amount: string
  setAmount: (s: string) => void
  date: string
  setDate: (s: string) => void
  category: string
  setCategory: (s: string) => void
  onClose: () => void
  onSubmit: (payload: Omit<Expense, 'id'>) => Promise<void>
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    const cat = (category || (INCOME_CATEGORIES[0] ?? '')).trim()
    if (!label.trim() || Number.isNaN(amt) || amt <= 0 || !cat) return
    await onSubmit({
      label: label.trim(),
      category: cat,
      amount: amt,
      date,
      kind: 'income',
    })
  }
  return (
    <div
      className="orb-modal-panel w-full max-w-md rounded-t-3xl border border-b-0 border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 shadow-[var(--orb-shadow-lg)] sm:rounded-3xl sm:border-b sm:p-5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'var(--orb-income-bg)' }}
          >
            <MdTrendingDown size={20} style={{ color: 'var(--orb-accent)' }} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--orb-text)]">Add income</h3>
        </div>
        <button type="button" onClick={onClose} className="text-[var(--orb-text-muted)] hover:text-[var(--orb-text)]">
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-[var(--orb-text-muted)]">What is this?</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Paycheck, refund, sale..."
            className="orb-input mt-1 h-10 w-full rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-3 text-[var(--orb-text)] outline-none focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
          />
        </div>
        <div>
          <CategorySelect
            categories={INCOME_CATEGORIES}
            value={category}
            onChange={setCategory}
            label="Category"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--orb-text-muted)]">Amount</label>
          <div className="mt-1 flex items-baseline rounded-xl border border-[var(--orb-border)] bg-white shadow-sm dark:bg-[var(--orb-bg)]">
            <span className="orb-amount-input py-4 pl-4 font-semibold tabular-nums text-[var(--orb-text)]">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="orb-amount-input w-full min-w-0 border-0 bg-transparent py-4 pr-4 pl-1 font-semibold tabular-nums text-[var(--orb-text)] outline-none focus:ring-0"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--orb-text-muted)]">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="orb-input mt-1 h-10 w-full rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-2 text-[var(--orb-text)] outline-none focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
          />
        </div>
        <button
          type="submit"
          disabled={!label.trim() || !amount.trim() || !(category || INCOME_CATEGORIES[0])?.trim()}
          className="mt-6 w-full rounded-xl bg-[var(--orb-accent)] py-3 text-sm font-semibold text-[var(--orb-accent-contrast)] shadow transition hover:opacity-90 active:opacity-95 disabled:opacity-50"
        >
          Save
        </button>
      </form>
    </div>
  )
}

/** Slide-up sheet: Add expense form */
function AddExpenseSheet({
  label,
  setLabel,
  category,
  setCategory,
  amount,
  setAmount,
  date,
  setDate,
  onClose,
  onSubmit,
}: {
  label: string
  setLabel: (s: string) => void
  category: string
  setCategory: (s: string) => void
  amount: string
  setAmount: (s: string) => void
  date: string
  setDate: (s: string) => void
  onClose: () => void
  onSubmit: (payload: Omit<Expense, 'id'>) => Promise<void>
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!label.trim() || Number.isNaN(amt) || amt <= 0) return
    await onSubmit({
      label: label.trim(),
      category: category.trim() || (DEFAULT_BUDGET_CATEGORIES[0] ?? 'Other'),
      amount: amt,
      date,
      kind: 'expense',
    })
  }
  return (
    <div
      className="orb-modal-panel w-full max-w-md rounded-t-3xl border border-b-0 border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-4 shadow-[var(--orb-shadow-lg)] sm:rounded-3xl sm:border-b sm:p-5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'var(--orb-spent-bg)' }}
          >
            <MdTrendingUp size={20} style={{ color: 'var(--orb-spent-icon)' }} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--orb-text)]">Add expense</h3>
        </div>
        <button type="button" onClick={onClose} className="text-[var(--orb-text-muted)] hover:text-[var(--orb-text)]">
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-[var(--orb-text-muted)]">What is this?</label>
          <input
            type="text"
            value={label}
            onChange={(e) => {
              const next = e.target.value
              setLabel(next)
              const normalized = next.trim().toLowerCase()
              if (
                normalized === 'uber' ||
                normalized === 'lyft' ||
                normalized.startsWith('uber ') ||
                normalized.startsWith('lyft ')
              ) {
                setCategory('Transport')
              }
            }}
            placeholder="Groceries, Food & Dining, Uber..."
            className="orb-input mt-1 h-10 w-full rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-3 text-[var(--orb-text)] outline-none focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
          />
        </div>
        <div>
          <CategorySelect
            categories={DEFAULT_BUDGET_CATEGORIES}
            value={category}
            onChange={setCategory}
            label="Category"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--orb-text-muted)]">Amount</label>
          <div className="mt-1 flex items-baseline rounded-xl border border-[var(--orb-border)] bg-white shadow-sm dark:bg-[var(--orb-bg)]">
            <span className="orb-amount-input py-4 pl-4 font-semibold tabular-nums text-[var(--orb-text)]">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="orb-amount-input w-full min-w-0 border-0 bg-transparent py-4 pr-4 pl-1 font-semibold tabular-nums text-[var(--orb-text)] outline-none focus:ring-0"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--orb-text-muted)]">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="orb-input mt-1 h-10 w-full rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-2 text-[var(--orb-text)] outline-none focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
          />
        </div>
        <button
          type="submit"
          disabled={!label.trim() || !amount.trim()}
          className="mt-6 w-full rounded-xl bg-[var(--orb-accent)] py-3 text-sm font-semibold text-[var(--orb-accent-contrast)] shadow transition hover:opacity-90 active:opacity-95 disabled:opacity-50"
        >
          Save
        </button>
      </form>
    </div>
  )
}
