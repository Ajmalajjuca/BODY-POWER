import type { ComponentType } from 'react'
import { sectionNames, sectionTypes, type Section } from '../design/config'
import {
  Hero,
  Trust,
  CategoryGrid,
  BrandGrid,
  ProductSection,
  ComboPromo,
  Deals,
  Goals,
  FAQSection,
  Newsletter,
  Spotlight,
  FeaturedCombos,
  Banner,
  Announcement,
  type SectionProps,
} from './renderers'
const renderers: Record<Section['type'], ComponentType<SectionProps>> = {
  hero: Hero,
  announcement: Announcement,
  categories: CategoryGrid,
  brands: BrandGrid,
  featured: ProductSection,
  bestsellers: ProductSection,
  deals: Deals,
  spotlight: Spotlight,
  'combo-promo': ComboPromo,
  combos: FeaturedCombos,
  goals: Goals,
  trust: Trust,
  faq: FAQSection,
  newsletter: Newsletter,
  banner: Banner,
}
export const registry = Object.fromEntries(
  sectionTypes.map((type) => [type, { name: sectionNames[type], renderer: renderers[type] }]),
) as Record<Section['type'], { name: string; renderer: ComponentType<SectionProps> }>
