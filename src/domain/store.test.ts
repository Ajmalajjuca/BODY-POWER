import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.hoisted(() => {
  const values = new Map<string,string>()
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key:string) => values.get(key) ?? null, setItem: (key:string,value:string) => values.set(key,value), removeItem: (key:string) => values.delete(key) }, configurable:true })
  Object.defineProperty(globalThis, 'window', { value: { localStorage: globalThis.localStorage }, configurable: true })
})
import { useCart, useDesign } from '../state/store'
import { presets } from '../design/config'
import { priceCart } from './pricing'
beforeEach(() => { useCart.setState({ lines: [] }); useDesign.setState({ config: structuredClone(presets.marketplace), past: [], future: [], versions: [] }) })
describe('cart grouping and mutation', () => {
  it('rejects additions beyond the persisted line limit atomically', () => {
    const item = { productId:'p1', variantId:'p1-v1', quantity:2 }
    for(let i=0;i<100;i++) expect(useCart.getState().add([item], 'Combo')).toBe(true)
    expect(useCart.getState().add([item], 'Overflow')).toBe(false)
    expect(useCart.getState().lines).toHaveLength(100)
  })
  it('keeps standalone items separate from combo discounts and recalculates after removal', () => {
    const a = { productId:'p1', variantId:'p1-v1', quantity:1 }, b = { productId:'p5',variantId:'p5-v1',quantity:1 }
    expect(useCart.getState().add([a,b], 'Training combo')).toBe(true)
    expect(useCart.getState().add([a])).toBe(true)
    expect(useCart.getState().lines).toHaveLength(3)
    expect(priceCart(useCart.getState().lines).discount).toBe(42490)
    useCart.getState().remove(useCart.getState().lines[1].id)
    expect(priceCart(useCart.getState().lines).discount).toBe(0)
  })
  it('rejects overflow atomically and cannot exceed combo quantity limit', () => {
    const a = { productId:'p1',variantId:'p1-v1',quantity:20 }
    useCart.getState().add([a])
    expect(useCart.getState().add([{...a, quantity:1}])).toBe(false)
    expect(useCart.getState().lines[0].quantity).toBe(20)
    useCart.getState().add([{...a,quantity:8}], 'Full combo')
    const line = useCart.getState().lines[1]
    useCart.getState().change(line.id, 9)
    expect(useCart.getState().lines[1].quantity).toBe(8)
  })
})
describe('design history and snapshots', () => {
  it('undoes, redoes and keeps named versions isolated', () => {
    useDesign.getState().save('Original')
    useDesign.getState().update({...useDesign.getState().config,accent:'#C41E3A'})
    expect(useDesign.getState().versions[0].config.accent).toBe('#800020')
    useDesign.getState().undo();expect(useDesign.getState().config.accent).toBe('#800020')
    useDesign.getState().redo();expect(useDesign.getState().config.accent).toBe('#C41E3A')
    useDesign.getState().undo();useDesign.getState().update({...useDesign.getState().config,radius:15})
    expect(useDesign.getState().future).toHaveLength(0)
  })
  it('discards null persisted entries without losing valid configuration', () => {
    const merge=useDesign.persist.getOptions().merge!
    const restored=merge({config:presets.minimal, versions:[null,{}]},useDesign.getState())
    expect(restored.config.layout).toBe('minimal');expect(restored.versions).toEqual([])
    expect(useCart.persist.getOptions().merge!({lines:[null,{}]},useCart.getState()).lines).toEqual([])
  })
})
