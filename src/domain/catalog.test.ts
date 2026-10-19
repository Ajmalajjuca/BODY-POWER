import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { products, brands, categories, combos, findProduct, hero } from '../data/catalog'
import { selectProducts } from '../data/selection'
import { priceSelection } from './pricing'

const publicFile = (path: string) => new URL(`../../public${path}`, import.meta.url)

describe('curated catalog', () => {
  it('holds 25 products across 6 categories and 7 brands', () => {
    expect(products).toHaveLength(25)
    expect(categories).toHaveLength(6)
    expect(brands).toHaveLength(7)
    for (const c of categories) expect(products.some((p) => p.categoryId === c.id)).toBe(true)
    for (const b of brands) {
      expect(products.some((p) => p.brandId === b.id)).toBe(true)
      expect(existsSync(publicFile(b.logo))).toBe(true)
      expect(b.logoAspect).toBeGreaterThan(0)
    }
    expect(new Set(products.map((p) => p.handle)).size).toBe(products.length)
  })
  it('uses real prices, local images and only published ratings', () => {
    for (const p of products) {
      expect(brands.some((b) => b.id === p.brandId)).toBe(true)
      expect(categories.some((c) => c.id === p.categoryId)).toBe(true)
      expect(p.images.length).toBeGreaterThan(0)
      for (const image of p.images) expect(existsSync(publicFile(image))).toBe(true)
      expect(p.variants.every((v) => Number.isInteger(v.price) && v.price > 0)).toBe(true)
      expect(p.variants.every((v) => !v.compareAtPrice || v.compareAtPrice > v.price)).toBe(true)
      expect(p.basePrice).toBe(p.variants[0].price)
      if (p.rating) expect(p.rating.count).toBeGreaterThan(0)
    }
    const iso = findProduct('dymatize-iso-100-hydrolyzed-whey-protein')!
    expect(iso.rating).toEqual({ value: 5, count: 13, scale: 5 })
    expect(
      priceSelection([{ productId: iso.id, variantId: iso.variants[0].id, quantity: 1 }]).total,
    ).toBe(iso.variants[0].price)
  })
  it('never shows the source retailers to shoppers', () => {
    const retailer = /kapoor|guardian|suppx|imported by|marketed by/i
    for (const p of products) {
      expect(p.title).not.toMatch(retailer)
      expect(p.description).not.toMatch(retailer)
      expect(p.description.length).toBeGreaterThan(200)
      for (const v of p.variants) {
        expect(`${v.size} ${v.flavor ?? ''}`).not.toMatch(/&[a-z#0-9]+;/i)
        expect(v.size).not.toBe('Standard pack')
      }
    }
  })
  it('builds combos and homepage art from catalog products', () => {
    for (const combo of combos) {
      const items = combo.items.map((id) => ({
        productId: id,
        variantId: findProduct(id)!.variants[0].id,
        quantity: 1,
      }))
      expect(priceSelection(items, true).valid).toBe(true)
    }
    for (const h of hero) {
      expect(findProduct(h.productId)).toBeDefined()
      expect(existsSync(publicFile(h.src))).toBe(true)
    }
    expect(selectProducts('bestsellers', 'bestsellers').length).toBeGreaterThanOrEqual(4)
    expect(selectProducts('featured', 'featured').length).toBeGreaterThanOrEqual(4)
  })
})
