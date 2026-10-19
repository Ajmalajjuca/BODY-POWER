import type { Product } from '../data/catalog'

export function ProductRating({ product }: { product: Product }) {
  if (!product.source) return null
  if (!product.rating)
    return (
      <p className="product-rating rating-unavailable">
        {product.source.reviewCount === 0 ? 'No reviews on SuppX' : 'Rating not published on SuppX'}
      </p>
    )
  return (
    <p
      className="product-rating"
      aria-label={`${product.rating.value} out of ${product.rating.scale}, ${product.rating.count} reviews on SuppX`}
    >
      <span aria-hidden="true">★</span> {product.rating.value.toFixed(1)} / {product.rating.scale}{' '}
      <small>
        ({product.rating.count} {product.rating.count === 1 ? 'review' : 'reviews'} on SuppX)
      </small>
    </p>
  )
}
