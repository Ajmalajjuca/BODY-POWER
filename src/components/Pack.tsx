import { useState } from 'react'
import type { Product } from '../data/catalog'
export function Pack({
  product,
  imageIndex = 0,
  className = '',
}: {
  product: Product
  imageIndex?: number
  className?: string
}) {
  const [failed, setFailed] = useState<string | null>(null)
  const src = product.images[imageIndex] ?? product.images[0]
  return failed === src ? (
    <span
      className={`pack product-photo photo-unavailable ${className}`}
      role="img"
      aria-label={`${product.title}: image unavailable`}
    >
      Image unavailable
    </span>
  ) : (
    <img
      className={`pack product-photo ${className}`}
      src={src}
      alt={`${product.title}, image ${imageIndex + 1}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(src)}
    />
  )
}
