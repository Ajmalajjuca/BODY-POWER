import { categories, products } from './catalog'
import type { Section } from '../design/config'
export function selectProducts(selection: Section['selection'], type: Section['type']) {
  if (selection === 'featured') return products.filter((p) => p.featured)
  if (selection === 'bestsellers') return products.filter((p) => p.bestseller)
  if (selection !== 'all')
    return products.filter(
      (p) => categories.find((c) => c.id === p.categoryId)?.handle === selection,
    )
  if (type === 'bestsellers') return products.filter((p) => p.bestseller)
  if (type === 'featured') return products.filter((p) => p.featured)
  return products
}
