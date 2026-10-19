import type { Version } from '../state/versions'
import { foreground } from './config'
// Colours and spacing for each page version. They set the CSS variables every component already
// reads, so a page recolours by wrapping it in a VersionFrame.
type Var =
  | '--bg'
  | '--surface'
  | '--text'
  | '--surface-text'
  | '--muted'
  | '--surface-muted'
  | '--border'
  | '--accent'
  | '--on-accent'
  | '--radius'
  | '--section-gap'
export interface VersionTheme {
  name: 'Classic' | 'Editorial' | 'Performance Dark'
  swatches: [string, string]
  vars: Record<Var, string>
}
export const versionThemes: Record<Version, VersionTheme> = {
  1: {
    name: 'Classic',
    swatches: ['#800020', '#FAF7F5'],
    vars: {
      '--bg': '#FAF7F5',
      '--surface': '#FFFFFF',
      '--text': '#242024',
      '--surface-text': '#242024',
      '--muted': '#71676B',
      '--surface-muted': '#71676B',
      '--border': '#E9E2E5',
      '--accent': '#800020',
      '--on-accent': foreground('#800020'),
      '--radius': '6px',
      '--section-gap': '66px',
    },
  },
  2: {
    name: 'Editorial',
    swatches: ['#58181F', '#C9A96E'],
    vars: {
      '--bg': '#F5F0E6',
      '--surface': '#FFFCF6',
      '--text': '#2B2220',
      '--surface-text': '#2B2220',
      '--muted': '#6E5F57',
      '--surface-muted': '#6E5F57',
      '--border': '#E1D8CB',
      '--accent': '#58181F',
      '--on-accent': foreground('#58181F'),
      '--radius': '2px',
      '--section-gap': '92px',
    },
  },
  3: {
    name: 'Performance Dark',
    swatches: ['#141014', '#FF4D5E'],
    vars: {
      '--bg': '#141014',
      '--surface': '#251D22',
      '--text': '#FFF9FB',
      '--surface-text': '#FFF9FB',
      '--muted': '#C6B7BF',
      '--surface-muted': '#C6B7BF',
      '--border': '#49353E',
      '--accent': '#FF4D5E',
      '--on-accent': '#242024',
      '--radius': '4px',
      '--section-gap': '42px',
    },
  },
}
const luminance = (hex: string) => {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((h) => {
      const v = parseInt(h, 16) / 255
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
// WCAG 2 contrast ratio between two #RRGGBB colours.
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
