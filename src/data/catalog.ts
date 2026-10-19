import suppxCatalog from './suppx-catalog.json'
export interface Variant {
  id: string
  SKU: string
  size: string
  flavor?: string
  price: number
  compareAtPrice?: number
  available: boolean
}
export interface ProductSource {
  name: string
  url: string
  collection: string
  capturedAt: string
  imageUrls: string[]
  reviewCount: number | null
}
export interface Product {
  id: string
  handle: string
  title: string
  brandId: string
  categoryId: string
  description: string
  images: string[]
  tags: string[]
  basePrice: number
  compareAtPrice?: number
  currency: 'INR'
  featured: boolean
  bestseller: boolean
  variants: Variant[]
  source?: ProductSource
  rating?: { value: number; count: number; scale: number } | null
}
export const brands = [
  { id: 'on', name: 'Optimum Nutrition', short: 'ON', color: '#242526' },
  { id: 'mb', name: 'MuscleBlaze', short: 'MB', color: '#e6b026' },
  { id: 'mt', name: 'MuscleTech', short: 'MT', color: '#b82830' },
  { id: 'gnc', name: 'GNC', short: 'GNC', color: '#b72132' },
  { id: 'dym', name: 'Dymatize', short: 'DYM', color: '#285c89' },
  { id: 'av', name: 'Avvatar', short: 'AV', color: '#d77528' },
]
export const categories = [
  'Whey Protein',
  'Creatine',
  'Pre-Workout',
  'Mass Gainer',
  'BCAA / EAA',
  'Protein Bars',
  'Multivitamins',
  'Omega-3',
  'Wellness',
  'Workout Accessories',
].map((name, i) => ({
  id: `c${i + 1}`,
  name,
  handle: [
    'whey-protein',
    'creatine',
    'pre-workout',
    'mass-gainer',
    'amino-acids',
    'protein-bars',
    'multivitamins',
    'omega-3',
    'wellness',
    'accessories',
  ][i],
}))
const titles = [
  [
    'Gold Standard 100% Whey',
    'Biozyme Performance Whey',
    'Nitro-Tech Whey Protein',
    'ISO100 Hydrolyzed Whey',
  ],
  ['Micronized Creatine', 'Creatine Monohydrate', 'Platinum Creatine', 'Creatine Essentials'],
  ['Gold Standard Pre-Workout', 'WrathX Pre-Workout', 'Vapor Pre-Workout', 'AMP Pre-Workout'],
  ['Serious Mass', 'Super Gainer XXL', 'Mass-Tech Gainer', 'Pro Performance Gainer'],
  ['Essential Amino Energy', 'BCAA Pro', 'Amino Build', 'EAA Essentials'],
  ['Protein Crisp Bar', 'Protein Bar Variety Pack', 'Protein Cookie Bar', 'Protein Snack Bar'],
  ['Opti-Men Multivitamin', 'Daily Multivitamin', 'Platinum Multivitamin', 'Mega Men Multivitamin'],
  ['Fish Oil Softgels', 'Omega-3 Fish Oil', 'Platinum Fish Oil', 'Triple Strength Fish Oil'],
  ['Daily Magnesium', 'Daily Electrolytes', 'Vitamin D3', 'Daily Wellness Essentials'],
  ['Classic Shaker', 'Steel Shaker', 'Training Straps', 'Gym Bottle'],
]
const prices = [
  6999, 3299, 4299, 7999, 1499, 799, 1299, 999, 1999, 1499, 2499, 1799, 3799, 2699, 3999, 2999,
  1599, 999, 1699, 1199, 299, 899, 349, 249, 1499, 799, 1299, 999, 999, 699, 1199, 899, 799, 499,
  699, 999, 499, 999, 699, 599,
]
export const products: Product[] = titles.flatMap((group, ci) =>
  group.map((title, n) => {
    const index = ci * 4 + n,
      id = `p${index + 1}`,
      price = prices[index] * 100
    const size = [
      '2 lb / 907 g',
      '250 g',
      '30 servings',
      '3 kg',
      '250 g',
      '6 bars',
      '60 tablets',
      '60 softgels',
      '30 servings',
      '1 unit',
    ][ci]
    return {
      id,
      handle: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      brandId: ci === 0 && n === 3 ? 'dym' : ci === 8 && n === 3 ? 'av' : brands[n].id,
      categoryId: categories[ci].id,
      description: `${title} is a representative ${categories[ci].name.toLowerCase()} listing for exploring this storefront. Check the actual manufacturer’s label for ingredients, allergens, serving guidance and suitability. Packaging, availability and prices shown here are illustrative.`,
      images: [`/products/${id}.svg`, `/products/${id}-back.svg`],
      tags: [categories[ci].name, n === 0 ? 'essentials' : 'training'],
      basePrice: price,
      compareAtPrice: price + 100000,
      currency: 'INR',
      featured: n < 2,
      bestseller: index < 4 || index === 5,
      variants: [0, 1, 2].map((v) => ({
        id: `${id}-v${v + 1}`,
        SKU: `BPN-${index + 1}-${v + 1}`,
        size: v === 2 && ci < 5 ? 'Large pack' : size,
        flavor: ci < 6 ? ['Chocolate', 'Vanilla', 'Unflavoured'][v] : undefined,
        price: price + (v === 2 ? 50000 : 0),
        compareAtPrice: price + 100000 + (v === 2 ? 50000 : 0),
        available: !(index % 4 === 3 && v === 2),
      })),
    }
  }),
)
brands.push(
  ...suppxCatalog.brands.filter((brand) => !brands.some((existing) => existing.id === brand.id)),
)
categories.push(
  { id: 'c11', name: 'Supplement Stacks', handle: 'supplement-stacks' },
  { id: 'c12', name: 'Weight Management', handle: 'weight-management' },
  { id: 'c13', name: 'Performance Supplements', handle: 'performance-supplements' },
  { id: 'c14', name: 'Collagen', handle: 'collagen' },
)
export const importedProducts = suppxCatalog.products as Product[]
products.push(...importedProducts)
export const findProduct = (id: string) => products.find((p) => p.id === id)
export const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100)
export const combos = [
  {
    id: 'starter',
    name: 'The daily essentials',
    note: 'Your everyday training companions.',
    items: ['p2', 'p6'],
    color: 'rose',
  },
  {
    id: 'performance',
    name: 'The performance stack',
    note: 'Three favourites. One considered combo.',
    items: ['p1', 'p5', 'p9'],
    color: 'dark',
  },
  {
    id: 'wellness',
    name: 'The wellness edit',
    note: 'A simple collection for your daily routine.',
    items: ['p25', 'p29', 'p33'],
    color: 'cream',
  },
]
