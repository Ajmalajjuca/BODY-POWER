import { describe, expect, it } from 'vitest'
import { contrast, versionThemes } from './versions'

describe('version themes', () => {
  for (const v of [1, 2, 3] as const)
    it(`V${v} meets WCAG AA`, () => {
      const t = versionThemes[v].vars
      expect(contrast(t['--text'], t['--bg'])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['--surface-text'], t['--surface'])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['--muted'], t['--bg'])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['--on-accent'], t['--accent'])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['--accent'], t['--bg'])).toBeGreaterThanOrEqual(4.5)
    })
  it('names the versions for the nav menus', () => {
    expect([1, 2, 3].map((v) => versionThemes[v as 1 | 2 | 3].name)).toEqual([
      'Classic',
      'Editorial',
      'Performance Dark',
    ])
  })
})
