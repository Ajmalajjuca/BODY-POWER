import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// Each nav-level page remembers which of its three versions (layout + colours) the visitor chose.
export const pageKeys = [
  'home',
  'shop',
  'product',
  'brands',
  'combos',
  'build',
  'cart',
  'about',
  'contact',
  'faq',
] as const
export type PageKey = (typeof pageKeys)[number]
export type Version = 1 | 2 | 3
type Versions = Record<PageKey, Version>
const defaults = () => Object.fromEntries(pageKeys.map((k) => [k, 1])) as Versions
export function parseVersion(value: unknown): Version | null {
  const n = typeof value === 'string' && /^[123]$/.test(value) ? Number(value) : value
  return n === 1 || n === 2 || n === 3 ? n : null
}
const exact: Record<string, PageKey> = {
  '/': 'home',
  '/shop': 'shop',
  '/brands': 'brands',
  '/combos': 'combos',
  '/build-your-combo': 'build',
  '/cart': 'cart',
  '/about': 'about',
  '/contact': 'contact',
  '/faq': 'faq',
}
export function pageForPath(pathname: string): PageKey | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (exact[path]) return exact[path]
  if (/^\/(collections|brands)\/[^/]+$/.test(path)) return 'shop'
  if (/^\/products\/[^/]+$/.test(path)) return 'product'
  return null
}
interface VersionState {
  versions: Versions
  choose: (page: PageKey, version: Version) => void
}
export const useVersions = create<VersionState>()(
  persist(
    (set) => ({
      versions: defaults(),
      choose: (page, version) => set((s) => ({ versions: { ...s.versions, [page]: version } })),
    }),
    {
      name: 'bpn-page-versions-v1',
      partialize: (s) => ({ versions: s.versions }),
      merge: (raw, current) => {
        const stored = (raw as { versions?: Record<string, unknown> } | undefined)?.versions ?? {}
        const versions = defaults()
        for (const k of pageKeys) versions[k] = parseVersion(stored[k]) ?? 1
        return { ...current, versions }
      },
    },
  ),
)
export const usePageVersion = (page: PageKey) => useVersions((s) => s.versions[page])
// Applies a `?v=` link to the store and returns the search string without `v`, or null when the
// URL has no `v`. main.tsx runs this before the first render so shared links paint correctly.
export function applyVersionParam(pathname: string, search: string): string | null {
  const params = new URLSearchParams(search)
  if (!params.has('v')) return null
  const page = pageForPath(pathname),
    version = parseVersion(params.get('v'))
  if (page && version) useVersions.getState().choose(page, version)
  params.delete('v')
  const rest = params.toString()
  return rest ? `?${rest}` : ''
}
