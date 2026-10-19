import { findProduct } from '../data/catalog'
export interface Selection {
  productId: string
  variantId: string
  quantity: number
}
export interface CartLine extends Selection {
  id: string
  groupId?: string
  groupName?: string
}
export const comboRules = {
  min: 2,
  max: 8,
  tiers: [
    { count: 3, percent: 10 },
    { count: 2, percent: 5 },
  ],
}
export function priceSelection(items: Selection[], combo = false) {
  let subtotal = 0,
    compareTotal = 0,
    count = 0
  for (const item of items) {
    const variant = findProduct(item.productId)?.variants.find((v) => v.id === item.variantId)
    if (
      !variant?.available ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    )
      return {
        valid: false,
        subtotal: 0,
        compareTotal: 0,
        discount: 0,
        total: 0,
        count: 0,
        percent: 0,
        error: 'Choose available variants and quantities from 1 to 20.',
      }
    subtotal += variant.price * item.quantity
    compareTotal += (variant.compareAtPrice ?? variant.price) * item.quantity
    count += item.quantity
  }
  const valid = items.length > 0 && (!combo || (count >= comboRules.min && count <= comboRules.max))
  const percent =
    combo && valid ? (comboRules.tiers.find((t) => count >= t.count)?.percent ?? 0) : 0
  const discount = Math.round((subtotal * percent) / 100)
  return {
    valid,
    subtotal,
    compareTotal,
    discount,
    total: subtotal - discount,
    count,
    percent,
    error: valid ? '' : `Choose ${comboRules.min}–${comboRules.max} items for a combo.`,
  }
}
export function priceCart(lines: CartLine[]) {
  const groups = new Map<string, CartLine[]>()
  for (const line of lines) {
    const key = line.groupId ?? line.id
    groups.set(key, [...(groups.get(key) ?? []), line])
  }
  return [...groups.values()].reduce(
    (sum, group) => {
      const p = priceSelection(group, !!group[0].groupId)
      return {
        subtotal: sum.subtotal + p.subtotal,
        discount: sum.discount + p.discount,
        total: sum.total + p.total,
        savings: sum.savings + p.compareTotal - p.total,
      }
    },
    { subtotal: 0, discount: 0, total: 0, savings: 0 },
  )
}
