import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.hoisted(() => {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
    configurable: true,
  })
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: globalThis.localStorage },
    configurable: true,
  })
})
import { useCart } from '../state/store'
import { priceCart } from './pricing'
import { findProduct } from '../data/catalog'
const whey = findProduct('optimum-nutrition-gold-standard-100-whey')!,
  creatine = findProduct('optimum-nutrition-micronised-creatine-monohydrate')!
beforeEach(() => {
  useCart.setState({ lines: [] })
})
describe('cart grouping and mutation', () => {
  it('rejects additions beyond the persisted line limit atomically', () => {
    const item = { productId: whey.id, variantId: whey.variants[0].id, quantity: 2 }
    for (let i = 0; i < 100; i++) expect(useCart.getState().add([item], 'Combo')).toBe(true)
    expect(useCart.getState().add([item], 'Overflow')).toBe(false)
    expect(useCart.getState().lines).toHaveLength(100)
  })
  it('keeps standalone items separate from combo discounts and recalculates after removal', () => {
    const a = { productId: whey.id, variantId: whey.variants[0].id, quantity: 1 },
      b = { productId: creatine.id, variantId: creatine.variants[0].id, quantity: 1 }
    expect(useCart.getState().add([a, b], 'Training combo')).toBe(true)
    expect(useCart.getState().add([a])).toBe(true)
    expect(useCart.getState().lines).toHaveLength(3)
    expect(priceCart(useCart.getState().lines).discount).toBe(
      Math.round(((whey.variants[0].price + creatine.variants[0].price) * 5) / 100),
    )
    useCart.getState().remove(useCart.getState().lines[1].id)
    expect(priceCart(useCart.getState().lines).discount).toBe(0)
  })
  it('rejects overflow atomically and cannot exceed combo quantity limit', () => {
    const a = { productId: whey.id, variantId: whey.variants[0].id, quantity: 20 }
    useCart.getState().add([a])
    expect(useCart.getState().add([{ ...a, quantity: 1 }])).toBe(false)
    expect(useCart.getState().lines[0].quantity).toBe(20)
    useCart.getState().add([{ ...a, quantity: 8 }], 'Full combo')
    const line = useCart.getState().lines[1]
    useCart.getState().change(line.id, 9)
    expect(useCart.getState().lines[1].quantity).toBe(8)
  })
})
describe('persisted cart repair', () => {
  it('discards null and malformed persisted lines', () => {
    expect(
      useCart.persist.getOptions().merge!({ lines: [null, {}] }, useCart.getState()).lines,
    ).toEqual([])
  })
})
