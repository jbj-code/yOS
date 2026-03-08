import { useCallback, useState } from 'react'

const STORAGE_KEY = 'yos:spendingBudgetPct'
const DEFAULT_PCT = 75
const MIN = 25
const MAX = 100

function getStored(): number {
  if (typeof window === 'undefined') return DEFAULT_PCT
  const raw = window.localStorage.getItem(STORAGE_KEY)
  const n = Number(raw)
  if (Number.isFinite(n) && n >= MIN && n <= MAX) return Math.round(n)
  return DEFAULT_PCT
}

function setStored(value: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // ignore
  }
}

export function useSpendingBudgetPct(): {
  spendingBudgetPct: number
  setSpendingBudgetPct: (value: number) => void
} {
  const [spendingBudgetPct, setSpendingBudgetPctState] = useState<number>(getStored)

  const setSpendingBudgetPct = useCallback((value: number) => {
    const clamped = Math.round(Math.max(MIN, Math.min(MAX, value)))
    setSpendingBudgetPctState(clamped)
    setStored(clamped)
  }, [])

  return { spendingBudgetPct, setSpendingBudgetPct }
}

export { MIN as SPENDING_BUDGET_PCT_MIN, MAX as SPENDING_BUDGET_PCT_MAX }
