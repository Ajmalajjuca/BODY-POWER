export const sectionTypes = [
  'hero',
  'announcement',
  'categories',
  'brands',
  'featured',
  'bestsellers',
  'deals',
  'spotlight',
  'combo-promo',
  'combos',
  'goals',
  'trust',
  'faq',
  'newsletter',
  'banner',
] as const
export const sectionNames: Record<(typeof sectionTypes)[number], string> = {
  hero: 'Campaign hero',
  announcement: 'Announcement',
  categories: 'Shop by category',
  brands: 'Featured brands',
  featured: 'Featured products',
  bestsellers: 'Bestsellers',
  deals: 'Offers & promotions',
  spotlight: 'Product spotlight',
  'combo-promo': 'Build your combo',
  combos: 'Featured combos',
  goals: 'Fitness goals',
  trust: 'Store information',
  faq: 'Frequently asked questions',
  newsletter: 'Newsletter',
  banner: 'Promotional banner',
}
// Homepage section content. Each Home version renders one fixed preset (see presets below).
export interface Section {
  id: string
  type: (typeof sectionTypes)[number]
  enabled: boolean
  heading: string
  subheading: string
  scheme: 'default' | 'ivory' | 'dark' | 'accent' | 'custom'
  background: string
  width: 'wide' | 'narrow'
  spacing: 'compact' | 'normal' | 'airy'
  columns: number
  card: 'inherit' | 'detailed' | 'minimal' | 'compact'
  align: 'left' | 'center'
  mobile: 'grid' | 'scroll' | 'hidden'
  selection: 'all' | 'featured' | 'bestsellers' | 'whey-protein' | 'creatine' | 'wellness'
}
export interface DesignConfig {
  layout: 'marketplace' | 'performance' | 'minimal'
  hero: 'campaign' | 'editorial' | 'bold'
  card: 'detailed' | 'minimal' | 'compact'
  columns: number
  sections: Section[]
}
const copy: Partial<Record<Section['type'], [string, string]>> = {
  hero: [
    'Your goals.\nOur obsession.',
    'Premium nutrition. Trusted brands.\nEverything you need to go a little further.',
  ],
  categories: ['Find your fuel.', 'Whatever your routine, we’ve got your essentials.'],
  brands: [
    'Great brands. Greater possibilities.',
    'Discover the names you know. Find your next favourite.',
  ],
  bestsellers: ['The favourites, for a reason.', 'A curated selection to get you started.'],
  'combo-promo': [
    'Better together.\nBuilt by you.',
    'Your brands. Your goals. Your perfect combination.',
  ],
  goals: ['A little closer to your goals.', 'Find the right place to start.'],
  deals: ['More for your everyday.', 'Ready-made combos. Up to 10% off.'],
  newsletter: ['A stronger inbox.', 'New arrivals, thoughtful picks and a little inspiration.'],
  featured: ['The edit, this season.', 'Our pick of the essentials, chosen for quality and taste.'],
  banner: ['Everyday power, elevated.', 'Seven trusted brands. One considered collection.'],
}
export function makeSection(type: Section['type'], id: string = crypto.randomUUID()): Section {
  return {
    id,
    type,
    enabled: true,
    heading: copy[type]?.[0] ?? sectionNames[type],
    subheading: copy[type]?.[1] ?? '',
    scheme: 'default',
    background: '#F3E8E8',
    width: 'wide',
    spacing: 'normal',
    columns: type === 'categories' ? 6 : 4,
    card: 'inherit',
    align: 'left',
    mobile: 'grid',
    selection: 'all',
  }
}
function preset(layout: DesignConfig['layout'], types: Section['type'][]): DesignConfig {
  return {
    layout,
    hero: layout === 'minimal' ? 'editorial' : layout === 'performance' ? 'bold' : 'campaign',
    card: layout === 'minimal' ? 'minimal' : 'detailed',
    columns: 4,
    sections: types.map((t, i) => ({
      ...makeSection(t, `${layout}-${i}`),
      ...(t === 'categories' && layout === 'performance' ? { columns: 4 } : {}),
    })),
  }
}
export const presets = {
  marketplace: preset('marketplace', [
    'hero',
    'trust',
    'categories',
    'brands',
    'bestsellers',
    'combo-promo',
    'deals',
    'goals',
    'newsletter',
  ]),
  performance: preset('performance', [
    'hero',
    'categories',
    'spotlight',
    'combo-promo',
    'bestsellers',
    'brands',
    'trust',
  ]),
  minimal: preset('minimal', [
    'hero',
    'featured',
    'brands',
    'banner',
    'categories',
    'newsletter',
    'trust',
  ]),
}
export function foreground(hexColor: string) {
  const channels = hexColor
    .slice(1)
    .match(/../g)!
    .map((h) => {
      const v = parseInt(h, 16) / 255
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.179
    ? '#242024'
    : '#FFFFFF'
}
