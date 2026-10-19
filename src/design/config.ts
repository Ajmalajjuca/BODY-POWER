import { z } from 'zod'
import LZString from 'lz-string'
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
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/)
export const sectionSchema = z.object({
  id: z.string().min(1).max(80),
  type: z.enum(sectionTypes),
  enabled: z.boolean(),
  heading: z.string().max(100),
  subheading: z.string().max(250),
  scheme: z.enum(['default', 'ivory', 'dark', 'accent', 'custom']),
  background: hex,
  width: z.enum(['wide', 'narrow']),
  spacing: z.enum(['compact', 'normal', 'airy']),
  columns: z.number().int().min(2).max(6),
  card: z.enum(['inherit', 'detailed', 'minimal', 'compact']),
  align: z.enum(['left', 'center']),
  mobile: z.enum(['grid', 'scroll', 'hidden']),
  selection: z.enum(['all', 'featured', 'bestsellers', 'whey-protein', 'creatine', 'wellness']),
})
export type Section = z.infer<typeof sectionSchema>
export const configSchema = z
  .object({
    version: z.literal(1),
    layout: z.enum(['marketplace', 'performance', 'minimal']),
    theme: z.enum(['luxe', 'midnight', 'ivory']),
    accent: hex,
    background: hex,
    font: z.enum(['modern', 'editorial', 'humanist']),
    density: z.enum(['compact', 'normal', 'airy']),
    radius: z.number().int().min(0).max(24),
    header: z.enum(['search', 'centered']),
    hero: z.enum(['campaign', 'editorial', 'bold']),
    card: z.enum(['detailed', 'minimal', 'compact']),
    columns: z.number().int().min(2).max(5),
    sections: z.array(sectionSchema).min(1).max(30),
  })
  .refine(
    (c) => new Set(c.sections.map((s) => s.id)).size === c.sections.length,
    'Section IDs must be unique',
  )
export type DesignConfig = z.infer<typeof configSchema>
export const themes = {
  luxe: {
    name: 'Burgundy Luxe',
    background: '#FAF7F5',
    accent: '#800020',
    surface: '#FFFFFF',
    text: '#242024',
    muted: '#71676B',
    border: '#E9E2E5',
  },
  midnight: {
    name: 'Midnight Burgundy',
    background: '#191317',
    accent: '#C73A52',
    surface: '#251D22',
    text: '#FFF9FB',
    muted: '#C6B7BF',
    border: '#49353E',
  },
  ivory: {
    name: 'Burgundy & Ivory',
    background: '#F5F0E6',
    accent: '#58181F',
    surface: '#FFFCF6',
    text: '#332B29',
    muted: '#73635D',
    border: '#E1D8CB',
  },
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
    version: 1,
    layout,
    theme: 'luxe',
    accent: '#800020',
    background: '#FAF7F5',
    font: layout === 'minimal' ? 'editorial' : 'modern',
    density: 'normal',
    radius: 6,
    header: 'search',
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
export function parseConfig(value: unknown) {
  return configSchema.parse(value)
}
export function encodeConfig(config: DesignConfig) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(parseConfig(config)))
}
export function decodeConfig(value: string) {
  if (value.length > 18000) throw new Error('Configuration link is too large. Use file import.')
  const raw = LZString.decompressFromEncodedURIComponent(value)
  if (!raw || raw.length > 80000) throw new Error('Invalid configuration link')
  return parseConfig(JSON.parse(raw))
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
