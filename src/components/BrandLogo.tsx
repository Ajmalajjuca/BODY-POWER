import type { Brand } from '../data/catalog'
// Logos render as single-colour masks in the current text colour, so they suit every theme.
// Width and height scale with the square root of the aspect ratio: wide and tall marks get a
// similar visual weight at the same --logo-size.
export function BrandLogo({ brand }: { brand: Brand }) {
  const root = Math.sqrt(brand.logoAspect)
  return (
    <span
      className="brand-logo"
      role="img"
      aria-label={brand.name}
      style={
        {
          '--logo': `url("${brand.logo}")`,
          '--logo-w': root,
          '--logo-h': 1 / root,
        } as React.CSSProperties
      }
    />
  )
}
