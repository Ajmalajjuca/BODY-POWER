import { describe, expect, it } from 'vitest'
import { products, brands, categories } from '../data/catalog'
import { selectProducts } from '../data/selection'
import { priceSelection } from './pricing'

describe('SuppX collection import', () => {
  it('includes the complete collection with exact source prices and usable images', () => {
    const imported = products.filter((p) => p.id.startsWith('suppx-'))
    expect(imported).toHaveLength(58)
    const gainer = imported.find((p) => p.handle === 'belive-mass-gainer-3kg')!
    expect(gainer.basePrice).toBe(449900)
    expect(gainer.compareAtPrice).toBe(799900)
    expect(gainer.images.length).toBe(4)
    expect(gainer.description).toContain('368 kcal')
    expect(
      priceSelection([{ productId: gainer.id, variantId: gainer.variants[0].id, quantity: 1 }])
        .total,
    ).toBe(449900)
    for (const p of imported) {
      expect(brands.some((b) => b.id === p.brandId)).toBe(true)
      expect(categories.some((c) => c.id === p.categoryId)).toBe(true)
      expect(p.images.every((image) => image.startsWith('/products/suppx/'))).toBe(true)
      expect(p.variants.length).toBeGreaterThan(0)
      expect(p.variants.every((v) => Number.isInteger(v.price) && v.price > 0)).toBe(true)
    }
    expect(new Set(products.map((p) => p.handle)).size).toBe(products.length)
  })
  it('prioritizes imported bestsellers in homepage selections', () => {
    expect(selectProducts('bestsellers', 'bestsellers')[0].id).toMatch(/^suppx-/)
    expect(selectProducts('featured', 'featured')[0].id).toMatch(/^suppx-/)
  })
  it('keeps missing product reviews separate from the shop rating', () => {
    const imported = products.filter((p) => p.source)
    expect(imported.filter((p) => p.rating)).toHaveLength(4)
    expect(imported.filter((p) => p.source?.reviewCount === 0)).toHaveLength(54)
    expect(imported.find((p) => p.handle === 'belive-mass-gainer-3kg')?.rating).toBeNull()
    expect(
      imported.find((p) => p.handle === 'belive-pure-micronized-creatine-monohydrate')?.rating,
    ).toEqual({ value: 5, count: 1, scale: 5 })
  })
})
