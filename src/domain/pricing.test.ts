import { describe, expect, it } from 'vitest'
import { priceSelection } from './pricing'
import { products } from '../data/catalog'
import { selectProducts } from '../data/selection'

const whey = products.find((p) => p.id === 'optimum-nutrition-gold-standard-100-whey')!
const soldOut = products.flatMap((p) =>
  p.variants.filter((v) => !v.available).map((v) => ({ productId: p.id, variantId: v.id })),
)[0]
describe('commerce boundaries', () => {
  const item = { productId: whey.id, variantId: whey.variants[0].id, quantity: 2 }
  it('applies a 5% group discount at two units and 10% at three', () => {
    const price = whey.variants[0].price
    expect(priceSelection([item], true).total).toBe(2 * price - Math.round((2 * price * 5) / 100))
    expect(priceSelection([{ ...item, quantity: 3 }], true).total).toBe(
      3 * price - Math.round((3 * price * 10) / 100),
    )
    expect(priceSelection([item], false).discount).toBe(0)
  })
  it('rejects invalid quantities and unknown or unavailable variants', () => {
    for (const quantity of [0, -1, 1.5, 100, NaN])
      expect(priceSelection([{ ...item, quantity }], true).valid).toBe(false)
    expect(priceSelection([{ ...item, variantId: 'missing' }], true).valid).toBe(false)
    expect(soldOut).toBeDefined()
    expect(priceSelection([{ ...soldOut, quantity: 2 }], true).valid).toBe(false)
  })
  it('recalculates from current catalog prices', () => {
    const original = whey.variants[0].price
    whey.variants[0].price = 101
    expect(priceSelection([item], true).total).toBe(192)
    whey.variants[0].price = original
  })
  it('limits combos and preserves standalone availability', () => {
    expect(priceSelection([{ ...item, quantity: 9 }], true).valid).toBe(false)
    expect(priceSelection([{ ...item, quantity: 1 }], true).valid).toBe(false)
    expect(priceSelection([{ ...item, quantity: 1 }], false).valid).toBe(true)
  })
})
describe('section product selection', () => {
  it('honours explicit section content selection over section type', () => {
    expect(selectProducts('creatine', 'bestsellers').every((p) => p.categoryId === 'c2')).toBe(true)
    expect(selectProducts('wellness', 'featured')).toHaveLength(4)
    expect(selectProducts('wellness', 'featured').every((p) => p.categoryId === 'c5')).toBe(true)
  })
})
