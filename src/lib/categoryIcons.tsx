import type { IconType } from 'react-icons'
import {
  MdShoppingBasket,
  MdDirectionsCar,
  MdRestaurant,
  MdHome,
  MdSubscriptions,
  MdLocalHospital,
  MdLocalBar,
  MdCategory,
  MdPayments,
  MdSell,
  MdSmartphone,
  MdReply,
  MdSavings,
} from 'react-icons/md'

const CATEGORY_CONFIG: Record<
  string,
  { icon: IconType; color: string }
> = {
  /* Expense categories */
  Groceries: { icon: MdShoppingBasket, color: '#059669' },
  Transport: { icon: MdDirectionsCar, color: '#2563eb' },
  'Food & Dining': { icon: MdRestaurant, color: '#ea580c' },
  Housing: { icon: MdHome, color: '#7c3aed' },
  Subscriptions: { icon: MdSubscriptions, color: '#db2777' },
  Health: { icon: MdLocalHospital, color: '#dc2626' },
  Fun: { icon: MdLocalBar, color: '#ca8a04' },
  Other: { icon: MdCategory, color: '#64748b' },
  /* Income categories */
  Salary: { icon: MdPayments, color: '#059669' },
  'Item Sale': { icon: MdSell, color: '#2563eb' },
  'Digital Sale': { icon: MdSmartphone, color: '#7c3aed' },
  Refund: { icon: MdReply, color: '#0891b2' },
  Investment: { icon: MdSavings, color: '#ca8a04' },
}

/** Default icon/color for unknown categories (e.g. custom legacy data). */
const FALLBACK = { icon: MdCategory, color: '#64748b' }

export function getCategoryIcon(category: string): IconType {
  const key = (category || 'Other').trim()
  return CATEGORY_CONFIG[key]?.icon ?? FALLBACK.icon
}

export function getCategoryColor(category: string): string {
  const key = (category || 'Other').trim()
  return CATEGORY_CONFIG[key]?.color ?? FALLBACK.color
}

/** Income categories (required when adding income); shown with icons in Recent Activity. */
export const INCOME_CATEGORIES: string[] = [
  'Salary',
  'Item Sale',
  'Digital Sale',
  'Refund',
  'Investment',
  'Other',
]
