import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { configSchema, presets, type DesignConfig } from '../design/config'
import { priceSelection, type CartLine, type Selection } from '../domain/pricing'
export interface SavedVersion {
  id: string
  name: string
  date: string
  config: DesignConfig
}
interface DesignState {
  config: DesignConfig
  versions: SavedVersion[]
  past: DesignConfig[]
  future: DesignConfig[]
  update: (config: DesignConfig) => void
  undo: () => void
  redo: () => void
  save: (name: string) => void
  deleteVersion: (id: string) => void
}
export const useDesign = create<DesignState>()(
  persist(
    (set, get) => ({
      config: structuredClone(presets.marketplace),
      versions: [],
      past: [],
      future: [],
      update: (config) => {
        const valid = configSchema.parse(config)
        set((s) => ({ config: valid, past: [...s.past, s.config].slice(-40), future: [] }))
      },
      undo: () =>
        set((s) =>
          s.past.length
            ? { config: s.past.at(-1)!, past: s.past.slice(0, -1), future: [s.config, ...s.future] }
            : {},
        ),
      redo: () =>
        set((s) =>
          s.future.length
            ? { config: s.future[0], past: [...s.past, s.config], future: s.future.slice(1) }
            : {},
        ),
      save: (name) => {
        if (!name.trim()) return
        set((s) => ({
          versions: [
            ...s.versions,
            {
              id: crypto.randomUUID(),
              name: name.trim().slice(0, 60),
              date: new Date().toISOString(),
              config: structuredClone(get().config),
            },
          ].slice(-12),
        }))
      },
      deleteVersion: (id) => set((s) => ({ versions: s.versions.filter((v) => v.id !== id) })),
    }),
    {
      name: 'bpn-design-v1',
      partialize: (s) => ({ config: s.config, versions: s.versions }),
      merge: (raw, current) => {
        const stored = raw as Partial<DesignState> | undefined
        return {
          ...current,
          config: configSchema.safeParse(stored?.config).success
            ? configSchema.parse(stored?.config)
            : current.config,
          versions: Array.isArray(stored?.versions)
            ? stored.versions
                .filter(
                  (v) =>
                    v &&
                    typeof v === 'object' &&
                    typeof v.id === 'string' &&
                    typeof v.name === 'string' &&
                    typeof v.date === 'string' &&
                    configSchema.safeParse(v.config).success,
                )
                .slice(-12)
            : [],
        }
      },
    },
  ),
)
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
  studio: boolean
  cart: boolean
  presentation: boolean
  viewport: 'desktop' | 'tablet' | 'mobile'
  toast: string
  set: (values: Partial<Omit<UIState, 'set'>>) => void
}
export const useUI = create<UIState>((set) => ({
  studio: false,
  cart: false,
  presentation: false,
  viewport: 'desktop',
  toast: '',
  set: (values) => set(values),
}))
export function addToCart(items: Selection[], groupName?: string, openDrawer = true) {
  const success = useCart.getState().add(items, groupName)
  useUI.getState().set(
    success
      ? {
          cart: openDrawer,
          toast: openDrawer ? '' : 'Added to cart. Keep browsing or open your bag to review.',
        }
      : {
          toast:
            'Please select available items. Limits: 20 per variant, 8 units per combo and 100 bag lines.',
        },
  )
  return success
}
