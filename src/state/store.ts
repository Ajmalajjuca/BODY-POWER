import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { priceSelection, type CartLine, type Selection } from '../domain/pricing'
interface CartState {
  lines: CartLine[]
  add: (items: Selection[], groupName?: string) => boolean
  change: (id: string, quantity: number) => void
  remove: (id: string) => void
}
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (items, groupName) => {
        if (!priceSelection(items, !!groupName).valid) return false
        const next = [...get().lines],
          groupId = groupName ? crypto.randomUUID() : undefined
        for (const item of items) {
          const existing =
            !groupId && next.find((l) => !l.groupId && l.variantId === item.variantId)
          if (existing) {
            if (existing.quantity + item.quantity > 20) return false
            next[next.indexOf(existing)] = {
              ...existing,
              quantity: existing.quantity + item.quantity,
            }
          } else next.push({ ...item, id: crypto.randomUUID(), groupId, groupName })
        }
        if (next.length > 100) return false
        set({ lines: next })
        return true
      },
      change: (id, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return
        set((s) => {
          const next = s.lines.map((l) => (l.id === id ? { ...l, quantity } : l))
          const item = next.find((l) => l.id === id)
          if (
            item?.groupId &&
            next.filter((l) => l.groupId === item.groupId).reduce((n, l) => n + l.quantity, 0) > 8
          )
            return {}
          return { lines: next }
        })
      },
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
    }),
    {
      name: 'bpn-cart-v1',
      partialize: (s) => ({ lines: s.lines }),
      merge: (raw, current) => {
        const stored = raw as { lines?: CartLine[] } | undefined
        return {
          ...current,
          lines: Array.isArray(stored?.lines)
            ? stored.lines
                .filter(
                  (l) =>
                    l &&
                    typeof l === 'object' &&
                    typeof l.id === 'string' &&
                    (!l.groupId || typeof l.groupId === 'string') &&
                    (!l.groupName || typeof l.groupName === 'string') &&
                    priceSelection([l]).valid,
                )
                .slice(0, 100)
            : [],
        }
      },
    },
  ),
)
interface UIState {
  cart: boolean
  toast: string
  set: (values: Partial<Omit<UIState, 'set'>>) => void
}
export const useUI = create<UIState>((set) => ({
  cart: false,
  toast: '',
  set: (values) => set(values),
}))
export function addToCart(items: Selection[], groupName?: string) {
  const success = useCart.getState().add(items, groupName)
  useUI.getState().set(
    success
      ? { cart: true, toast: '' }
      : {
          toast:
            'Please select available items. Limits: 20 per variant, 8 units per combo and 100 bag lines.',
        },
  )
  return success
}
