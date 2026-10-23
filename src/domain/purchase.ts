import { priceSelection, type Selection } from './pricing'

export function purchaseUrl(selection: Selection) {
  return `/checkout?${new URLSearchParams({ product: selection.productId, variant: selection.variantId, quantity: String(selection.quantity) })}`
}

export function resolvePurchase(params: URLSearchParams): Selection | null {
  const selection = {
    productId: params.get('product') ?? '',
    variantId: params.get('variant') ?? '',
    quantity: Number(params.get('quantity')),
  }
  return priceSelection([selection]).valid ? selection : null
}
