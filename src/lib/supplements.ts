import { supabase } from '../supabaseClient'

export type Supplement = {
  id: string
  name: string
  price: number
  servingsPerContainer: number
  servingsPerDay: number
}

type SupplementRow = {
  id: string
  name: string | null
  price: number
  servings_per_container: number
  servings_per_day: number
}

function mapRowToSupplement(row: SupplementRow): Supplement {
  return {
    id: row.id,
    name: row.name ?? '',
    price: Number(row.price) || 0,
    servingsPerContainer: Number(row.servings_per_container) || 1,
    servingsPerDay: Number(row.servings_per_day) || 1,
  }
}

export function costPerServing(s: Supplement): number {
  if (s.servingsPerContainer <= 0) return 0
  return s.price / s.servingsPerContainer
}

export function monthlyCost(s: Supplement): number {
  return costPerServing(s) * s.servingsPerDay * 30
}

let supplementsCache: Supplement[] | null = null

export async function loadSupplements(): Promise<Supplement[]> {
  if (supplementsCache !== null) return supplementsCache

  const { data, error } = await supabase
    .from('supplements')
    .select('id, name, price, servings_per_container, servings_per_day')
    .order('name', { ascending: true })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load supplements from Supabase', error)
    return []
  }

  const list = (data ?? []).map((row: SupplementRow) => mapRowToSupplement(row))
  supplementsCache = list
  return list
}

export function invalidateSupplementsCache(): void {
  supplementsCache = null
}

export async function createSupplement(input: Omit<Supplement, 'id'>): Promise<Supplement | null> {
  const { data, error } = await supabase
    .from('supplements')
    .insert({
      name: input.name.trim(),
      price: input.price,
      servings_per_container: input.servingsPerContainer,
      servings_per_day: input.servingsPerDay,
    })
    .select('id, name, price, servings_per_container, servings_per_day')
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create supplement', error)
    return null
  }

  const supplement = mapRowToSupplement(data as SupplementRow)
  if (supplementsCache !== null) {
    supplementsCache = [...supplementsCache, supplement].sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }
  return supplement
}

export async function deleteSupplement(id: string): Promise<boolean> {
  const { error } = await supabase.from('supplements').delete().eq('id', id)
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to delete supplement', error)
    return false
  }
  if (supplementsCache !== null) {
    supplementsCache = supplementsCache.filter((s) => s.id !== id)
  }
  return true
}
