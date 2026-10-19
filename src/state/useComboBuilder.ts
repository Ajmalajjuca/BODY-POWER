import { useState } from 'react'
import { priceSelection, comboRules, type Selection } from '../domain/pricing'
export type ComboBuilderState = ReturnType<typeof useComboBuilder>
// Selection state for building a custom combo, shared by the builder page and Combos V2.
export function useComboBuilder() {
  const [items, setItems] = useState<Selection[]>([])
  const price = priceSelection(items, true),
    count = items.reduce((n, i) => n + i.quantity, 0)
  const add = (productId: string, variantId: string) =>
    setItems((current) => {
      if (count >= comboRules.max) return current
      const existing = current.find((i) => i.variantId === variantId)
      return existing
        ? current.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i))
        : [...current, { productId, variantId, quantity: 1 }]
    })
  const setQuantity = (item: Selection, quantity: number) =>
    setItems((current) => current.map((j) => (j === item ? { ...j, quantity } : j)))
  const remove = (item: Selection) => setItems((current) => current.filter((j) => j !== item))
  const reset = () => setItems([])
  return { items, add, setQuantity, remove, price, count, reset }
}
