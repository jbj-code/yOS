import { useEffect, useState } from 'react'
import { MdRestaurant, MdAdd, MdDelete } from 'react-icons/md'
import { useLongPressReveal } from '../hooks/useLongPressReveal'
import {
  loadMeals,
  createMeal,
  deleteMeal,
  totalMealCost,
  type Meal,
  type MealIngredient,
} from '../lib/meals'

type Props = {
  isAddOpen: boolean
  onCloseAdd: () => void
}

type IngredientRow = { key: string; name: string; price: string; servingSize: string }

export default function Meals({ isAddOpen, onCloseAdd }: Props) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mealName, setMealName] = useState('')
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { key: '0', name: '', price: '', servingSize: '' },
  ])
  const [addError, setAddError] = useState<string | null>(null)
  const {
    revealId: deleteRevealId,
    startLongPress,
    cancelLongPress,
    onPointerEnd,
    clearLongPressTimer,
  } = useLongPressReveal()

  useEffect(() => {
    let ignore = false
    async function load() {
      const data = await loadMeals()
      if (!ignore) {
        setMeals(data)
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
      setMealName('')
      setIngredients([{ key: '0', name: '', price: '', servingSize: '' }])
      setAddError(null)
    }
  }, [isAddOpen])

  function addIngredientRow() {
    setIngredients((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: '',
        price: '',
        servingSize: '',
      },
    ])
  }

  function removeIngredientRow(key: string) {
    setIngredients((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)))
  }

  function updateRow(key: string, field: keyof IngredientRow, value: string) {
    setIngredients((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    )
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = mealName.trim()
    const list = ingredients
      .map((r) => ({
        name: r.name.trim(),
        price: Number(r.price) || 0,
        servingSize: r.servingSize.trim(),
      }))
      .filter((i) => i.name || i.price > 0)
    if (!name) {
      setAddError('Enter a meal name.')
      return
    }
    if (list.length === 0) {
      setAddError('Add at least one ingredient with a name or price.')
      return
    }
    const meal = createMeal({ name, ingredients: list })
    setMeals((prev) => [...prev, meal].sort((a, b) => a.name.localeCompare(b.name)))
    setMealName('')
    setIngredients([{ key: '0', name: '', price: '', servingSize: '' }])
    setAddError(null)
    onCloseAdd()
  }

  function handleDelete(id: string) {
    if (!deleteMeal(id)) return
    setMeals((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="relative w-full max-w-xl min-w-0">
      <section className="space-y-3 pb-20">
        {isLoading ? (
          <p className="text-sm text-[var(--orb-text-muted)]">Loading...</p>
        ) : meals.length === 0 ? (
          <p className="text-sm text-[var(--orb-text-muted)]">
            No meals yet. Tap + to add one.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {meals.map((meal) => {
              const isRevealed = deleteRevealId === meal.id
              const cost = totalMealCost(meal)
              return (
                <li
                  key={meal.id}
                  className={`orb-clickable-card flex min-w-0 overflow-hidden rounded-2xl border border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] shadow-[var(--orb-shadow)] transition-[border-color] duration-200 ${
                    isRevealed ? 'border-[var(--orb-border-muted)]' : ''
                  }`}
                >
                  <div
                    className="flex min-w-0 flex-1 flex-col p-4 transition-[flex] duration-200"
                    style={{ flex: isRevealed ? '1 1 0%' : undefined }}
                    onTouchStart={(e) =>
                      startLongPress(meal.id, e.touches[0].clientX, e.touches[0].clientY)
                    }
                    onTouchMove={(e) =>
                      cancelLongPress(e.touches[0].clientX, e.touches[0].clientY)
                    }
                    onTouchEnd={() => onPointerEnd(meal.id)}
                    onMouseDown={(e) => startLongPress(meal.id, e.clientX, e.clientY)}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) cancelLongPress(e.clientX, e.clientY)
                    }}
                    onMouseUp={() => onPointerEnd(meal.id)}
                    onMouseLeave={(e) => {
                      if (e.buttons === 1) clearLongPressTimer()
                    }}
                  >
                    <p className="text-base font-semibold text-[var(--orb-text)]">
                      {meal.name}
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--orb-accent)]">
                      ${cost.toFixed(2)}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--orb-text-muted)]">
                      {meal.ingredients.length} ingredient
                      {meal.ingredients.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div
                    className="flex shrink-0 items-center overflow-hidden transition-[width,opacity] duration-200 ease-out"
                    style={{
                      width: isRevealed ? 72 : 0,
                      opacity: isRevealed ? 1 : 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation()
                        handleDelete(meal.id)
                      }}
                      className="flex h-full min-w-[72px] items-center justify-center rounded-r-2xl bg-[var(--orb-danger)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--orb-danger-hover)] active:opacity-90"
                      aria-label="Delete meal"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 px-3 pt-12 pb-0 sm:items-center sm:p-4 sm:pb-0">
          <div className="orb-modal-panel w-full max-w-md rounded-t-3xl border border-b-0 border-[var(--orb-border)] bg-[var(--orb-bg-elevated)] p-3 shadow-[var(--orb-shadow-lg)] sm:rounded-3xl sm:border-b sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--orb-bg-muted)]">
                  <MdRestaurant className="text-[var(--orb-text-muted)]" size={20} />
                </div>
                <h2 className="text-sm font-semibold text-[var(--orb-text)]">
                  Add meal
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  onCloseAdd()
                  setMealName('')
                  setIngredients([{ key: '0', name: '', price: '', servingSize: '' }])
                  setAddError(null)
                }}
                className="text-[var(--orb-text-muted)] hover:text-[var(--orb-text)]"
              >
                Cancel
              </button>
            </div>
            {addError && (
              <p className="mb-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400 sm:mb-3">
                {addError}
              </p>
            )}
            <form onSubmit={handleAdd} className="space-y-2 sm:space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--orb-text-muted)]">
                  Meal name
                </label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Chicken stir fry"
                  className="orb-input h-10 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] px-3 text-[var(--orb-text)] outline-none ring-0 focus:border-[var(--orb-accent)] focus:ring-2 focus:ring-[var(--orb-accent)]/30"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-[var(--orb-text-muted)]">
                  Ingredients
                </label>
                <button
                  type="button"
                  onClick={addIngredientRow}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--orb-accent)] hover:bg-[var(--orb-accent)]/10"
                >
                  <MdAdd size={16} />
                  Add ingredient
                </button>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {ingredients.map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-wrap items-end gap-2 rounded-xl border border-[var(--orb-border)] bg-[var(--orb-bg)] p-2 sm:flex-nowrap"
                  >
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.key, 'name', e.target.value)}
                        placeholder="Name"
                        className="orb-input h-9 w-full rounded-lg border border-[var(--orb-border)] bg-transparent px-2 text-sm text-[var(--orb-text)] outline-none focus:border-[var(--orb-accent)]"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-[var(--orb-text-muted)]">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={row.price}
                        onChange={(e) => updateRow(row.key, 'price', e.target.value)}
                        placeholder="0"
                        className="orb-input w-20 rounded-lg border border-[var(--orb-border)] bg-transparent px-2 py-1.5 text-sm tabular-nums text-[var(--orb-text)] outline-none focus:border-[var(--orb-accent)]"
                      />
                    </div>
                    <div className="min-w-0 flex-1 sm:max-w-[120px]">
                      <input
                        type="text"
                        value={row.servingSize}
                        onChange={(e) =>
                          updateRow(row.key, 'servingSize', e.target.value)
                        }
                        placeholder="e.g. 1 cup"
                        className="orb-input h-9 w-full rounded-lg border border-[var(--orb-border)] bg-transparent px-2 text-sm text-[var(--orb-text)] outline-none focus:border-[var(--orb-accent)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredientRow(row.key)}
                      disabled={ingredients.length <= 1}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--orb-text-muted)] hover:bg-[var(--orb-bg-muted)] hover:text-[var(--orb-danger)] disabled:opacity-40"
                      aria-label="Remove ingredient"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex justify-end gap-2 sm:mt-3">
                <button
                  type="submit"
                  disabled={
                    !mealName.trim() ||
                    ingredients.every(
                      (r) => !r.name.trim() && (Number(r.price) || 0) <= 0,
                    )
                  }
                  className="w-full rounded-xl bg-[var(--orb-accent)] py-3 text-sm font-semibold text-[var(--orb-accent-contrast)] shadow transition hover:opacity-90 active:opacity-95 disabled:opacity-50"
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
