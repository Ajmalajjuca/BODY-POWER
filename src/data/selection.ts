import { categories, products } from './catalog'
import type { Section } from '../design/config'
export function selectProducts(selection: Section['selection'], type: Section['type']) {
  const ordered = [...products].sort((a, b) => Number(!!b.source) - Number(!!a.source))
  if (selection === 'featured') return ordered.filter(p => p.featured)
  if (selection === 'bestsellers') return ordered.filter(p => p.bestseller)
  if (selection !== 'all') return products.filter(p => categories.find(c => c.id === p.categoryId)?.handle === selection)
  if (type === 'bestsellers') return ordered.filter(p => p.bestseller)
  if (type === 'featured') return ordered.filter(p => p.featured)
  return ordered
}
