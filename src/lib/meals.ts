const STORAGE_KEY = 'yOS_meals'

export type MealIngredient = {
  id: string
  name: string
  price: number
  servingSize: string
}

export type Meal = {
  id: string
  name: string
  ingredients: MealIngredient[]
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function loadFromStorage(): Meal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Meal[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToStorage(meals: Meal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals))
}

export function totalMealCost(meal: Meal): number {
  return meal.ingredients.reduce((sum, i) => sum + i.price, 0)
}

export async function loadMeals(): Promise<Meal[]> {
  return loadFromStorage()
}

export function createMeal(input: {
  name: string
  ingredients: Omit<MealIngredient, 'id'>[]
}): Meal {
  const meals = loadFromStorage()
  const meal: Meal = {
    id: genId(),
    name: input.name.trim(),
    ingredients: input.ingredients.map((i) => ({
      id: genId(),
      name: i.name.trim(),
      price: Number(i.price) || 0,
      servingSize: (i.servingSize ?? '').trim(),
    })),
  }
  meals.push(meal)
  saveToStorage(meals)
  return meal
}

export function deleteMeal(id: string): boolean {
  const current = loadFromStorage()
  const meals = current.filter((m) => m.id !== id)
  if (meals.length === current.length) return false
  saveToStorage(meals)
  return true
}
