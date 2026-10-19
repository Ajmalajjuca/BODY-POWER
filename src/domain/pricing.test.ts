import { describe, expect, it } from 'vitest'
import { priceSelection } from './pricing'
import { products } from '../data/catalog'
import { configSchema, presets, encodeConfig, decodeConfig } from '../design/config'
import { selectProducts } from '../data/selection'

describe('demo commerce boundaries', () => {
  const item = { productId: 'p1', variantId: 'p1-v1', quantity: 2 }
  it('applies a 5% group discount at two units and 10% at three', () => {
    expect(priceSelection([item], true).total).toBe(1329810)
    expect(priceSelection([{ ...item, quantity: 3 }], true).total).toBe(1889730)
    expect(priceSelection([item], false).discount).toBe(0)
  })
  it('rejects invalid quantities and unknown or unavailable variants', () => {
    for (const quantity of [0, -1, 1.5, 100, NaN]) expect(priceSelection([{ ...item, quantity }], true).valid).toBe(false)
    expect(priceSelection([{ ...item, variantId: 'missing' }], true).valid).toBe(false)
    expect(priceSelection([{ productId: 'p4', variantId: 'p4-v3', quantity: 2 }], true).valid).toBe(false)
  })
  it('recalculates from current catalog prices', () => {
    const original = products[0].variants[0].price
    products[0].variants[0].price = 101
    expect(priceSelection([item], true).total).toBe(192)
    products[0].variants[0].price = original
  })
  it('limits combos and preserves standalone availability', () => {
    expect(priceSelection([{ ...item, quantity: 9 }], true).valid).toBe(false)
    expect(priceSelection([{ ...item, quantity: 1 }], true).valid).toBe(false)
    expect(priceSelection([{ ...item, quantity: 1 }], false).valid).toBe(true)
  })
})
describe('configuration trust boundary', () => {
  it('honours explicit section content selection over section type', () => {
    expect(selectProducts('creatine', 'bestsellers').every(p => p.categoryId === 'c2')).toBe(true)
    expect(selectProducts('wellness', 'featured').map(p => p.id)).toEqual(['p33', 'p34', 'p35', 'p36'])
  })
  it('round trips Unicode and rejects malformed payloads', () => {
    const config = structuredClone(presets.marketplace)
    config.sections[0].heading = 'Énergie • शक्ति'
    expect(decodeConfig(encodeConfig(config))).toEqual(config)
    expect(() => decodeConfig('not-valid')).toThrow()
    expect(configSchema.safeParse({ ...config, columns: 99 }).success).toBe(false)
    expect(configSchema.safeParse({ ...config, accent: 'url(javascript:alert(1))' }).success).toBe(false)
    expect(configSchema.safeParse({ ...config, sections: [config.sections[0], config.sections[0]] }).success).toBe(false)
  })
})
