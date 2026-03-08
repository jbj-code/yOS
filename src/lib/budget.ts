import { supabase } from '../supabaseClient'

export type ExpenseKind = 'expense' | 'income'

export type Expense = {
  id: string
  label: string
  category: string
  amount: number
  date: string
  kind: ExpenseKind
}

/** Raw row from Supabase entries table. Single place to map row → Expense (DRY). */
type EntryRow = {
  id: string
  label: string | null
  category: string | null
  amount: number
  date: string | null
  kind: string
}

function mapRowToExpense(row: EntryRow): Expense {
  return {
    id: row.id,
    label: row.label ?? '',
    category: row.category ?? '',
    amount: Number(row.amount) || 0,
    date: row.date ?? getTodayLocalISO(),
    kind: row.kind === 'income' ? 'income' : 'expense',
  }
}

/** In-memory cache to avoid repeated Supabase reads (rate limits). Invalidated on write/delete. */
let entriesCache: Expense[] | null = null

export const DEFAULT_BUDGET_CATEGORIES: string[] = [
  'Groceries',
  'Transport',
  'Food & Dining',
  'Housing',
  'Subscriptions',
  'Health',
  'Fun',
  'Other',
]

export function getTodayLocalISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatBudgetDate(date: string): string {
  const parts = date.split('-')
  if (parts.length !== 3) return date
  const [year, month, day] = parts
  const m = Number(month)
  const d = Number(day)
  if (!m || !d) return date
  return `${m}/${d}/${year}`
}

export function getCurrentMonthKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-')
  const monthNum = parseInt(m, 10) || 1
  const date = new Date(Number(y), monthNum - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getPrevMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1, 0)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getNextMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function filterByMonth(expenses: Expense[], monthKey: string): Expense[] {
  return expenses.filter((e) => e.date.startsWith(monthKey))
}

export async function loadExpenses(): Promise<Expense[]> {
  if (entriesCache !== null) return entriesCache

  const { data, error } = await supabase
    .from('entries')
    .select('id, label, category, amount, date, kind')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load entries from Supabase', error)
    return []
  }

  const entries = (data ?? []).map((row: EntryRow) => mapRowToExpense(row))
  entriesCache = entries
  return entries
}

export async function createEntry(
  input: Omit<Expense, 'id'>,
): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('entries')
    .insert({
      label: input.label,
      category: input.category || null,
      amount: input.amount,
      date: input.date,
      kind: input.kind,
    })
    .select('id, label, category, amount, date, kind')
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create entry', error)
    return null
  }

  const entry = mapRowToExpense(data as EntryRow)
  if (entriesCache !== null) entriesCache = [entry, ...entriesCache]
  return entry
}

export async function deleteEntry(id: string): Promise<boolean> {
  const { error } = await supabase.from('entries').delete().eq('id', id)
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to delete entry', error)
    return false
  }
  if (entriesCache !== null) entriesCache = entriesCache.filter((e) => e.id !== id)
  return true
}

export type BudgetTotals = {
  total: number
  count: number
  categoryTotals: [string, number][]
  uniqueCategories: number
  topCategoryName: string | null
  topCategoryValue: number | null
}

export function computeBudgetTotals(expenses: Expense[]): BudgetTotals {
  const spending = expenses.filter((e) => e.kind !== 'income')
  const total = spending.reduce((sum, e) => sum + e.amount, 0)
  const count = spending.length
  const categoryMap = new Map<string, number>()
  for (const e of spending) {
    const key = e.category || 'Uncategorized'
    categoryMap.set(key, (categoryMap.get(key) ?? 0) + e.amount)
  }
  const categoryTotals = Array.from(categoryMap.entries()).sort(
    (a, b) => b[1] - a[1],
  ) as [string, number][]
  const topCategory = categoryTotals[0] ?? null

  return {
    total,
    count,
    categoryTotals,
    uniqueCategories: categoryTotals.length,
    topCategoryName: topCategory?.[0] ?? null,
    topCategoryValue: topCategory?.[1] ?? null,
  }
}

export type IncomeTotals = {
  total: number
  count: number
}

export function computeIncomeTotals(expenses: Expense[]): IncomeTotals {
  const income = expenses.filter((e) => e.kind === 'income')
  const total = income.reduce((sum, e) => sum + e.amount, 0)
  const count = income.length
  return { total, count }
}
