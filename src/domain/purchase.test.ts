import { describe, expect, it } from 'vitest'
import { products } from '../data/catalog'
import { purchaseUrl, resolvePurchase } from './purchase'

describe('direct purchase', () => {
  const product = products.find((p) => p.variants.some((v) => v.available))!
  const variant = product.variants.find((v) => v.available)!
  const selection = { productId: product.id, variantId: variant.id, quantity: 2 }
  it('round trips the exact variant and quantity without a cart dependency', () => {
    expect(
      resolvePurchase(new URL(purchaseUrl(selection), 'https://demo.local').searchParams),
    ).toEqual(selection)
  })
  it('rejects unknown, mismatched and unavailable variants', () => {
    expect(
      resolvePurchase(
        new URLSearchParams({ product: product.id, variant: 'missing', quantity: '1' }),
      ),
    ).toBeNull()
    const unavailable = products.flatMap((p) =>
      p.variants.filter((v) => !v.available).map((v) => ({ p, v })),
    )[0]
    if (unavailable)
      expect(
        resolvePurchase(
          new URLSearchParams({
            product: unavailable.p.id,
            variant: unavailable.v.id,
            quantity: '1',
          }),
        ),
      ).toBeNull()
  })
  it('rejects incomplete and invalid quantity parameters', () => {
    for (const quantity of ['0', '-1', '1.5', '21', 'NaN', ''])
      expect(
        resolvePurchase(
          new URLSearchParams({ product: product.id, variant: variant.id, quantity }),
        ),
      ).toBeNull()
    expect(resolvePurchase(new URLSearchParams())).toBeNull()
  })
})
