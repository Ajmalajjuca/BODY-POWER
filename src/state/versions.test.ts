import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.hoisted(() => {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
    configurable: true,
  })
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: globalThis.localStorage },
    configurable: true,
  })
})
import { applyVersionParam, pageForPath, pageKeys, parseVersion, useVersions } from './versions'

beforeEach(() => {
  useVersions.setState({
    versions: Object.fromEntries(pageKeys.map((k) => [k, 1])) as never,
  })
})

describe('page versions', () => {
  it('defaults every page to V1', () => {
    expect(Object.values(useVersions.getState().versions).every((v) => v === 1)).toBe(true)
    expect(Object.keys(useVersions.getState().versions)).toEqual([...pageKeys])
  })
  it('remembers each page independently', () => {
    useVersions.getState().choose('shop', 2)
    useVersions.getState().choose('cart', 3)
    const { versions } = useVersions.getState()
    expect(versions.shop).toBe(2)
    expect(versions.cart).toBe(3)
    expect(versions.home).toBe(1)
  })
  it('parses only 1–3', () => {
    expect(parseVersion('2')).toBe(2)
    expect(parseVersion(3)).toBe(3)
    for (const bad of [0, 4, '7', 'abc', '', null, 2.5, undefined])
      expect(parseVersion(bad)).toBeNull()
  })
  it('maps routes to pages', () => {
    expect(pageForPath('/')).toBe('home')
    expect(pageForPath('/shop')).toBe('shop')
    expect(pageForPath('/brands')).toBe('brands')
    expect(pageForPath('/brands/gnc')).toBe('shop')
    expect(pageForPath('/collections/creatine')).toBe('shop')
    expect(pageForPath('/products/x')).toBe('product')
    expect(pageForPath('/build-your-combo')).toBe('build')
    expect(pageForPath('/faq')).toBe('faq')
    expect(pageForPath('/nope')).toBeNull()
  })
  it('repairs stale storage per page', () => {
    const merge = useVersions.persist.getOptions().merge!
    const restored = merge(
      { versions: { home: 4, shop: '2', cart: null, extra: 3 } },
      useVersions.getState(),
    )
    expect(restored.versions).toEqual({
      home: 1,
      shop: 2,
      product: 1,
      brands: 1,
      combos: 1,
      build: 1,
      cart: 1,
      about: 1,
      contact: 1,
      faq: 1,
    })
    expect(merge(undefined, useVersions.getState()).versions.home).toBe(1)
  })
  it('applies a ?v= link before render and strips only v', () => {
    expect(applyVersionParam('/shop', '?q=whey&v=3')).toBe('?q=whey')
    expect(useVersions.getState().versions.shop).toBe(3)
    expect(applyVersionParam('/about', '?v=2')).toBe('')
    expect(useVersions.getState().versions.about).toBe(2)
  })
  it('ignores invalid ?v= values and unknown pages but still strips v', () => {
    for (const bad of ['?v=7', '?v=abc', '?v=']) expect(applyVersionParam('/cart', bad)).toBe('')
    expect(applyVersionParam('/nope', '?v=2')).toBe('')
    expect(useVersions.getState().versions.cart).toBe(1)
    expect(applyVersionParam('/shop', '?q=whey')).toBeNull()
  })
})
