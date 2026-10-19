import type { Product } from '../data/catalog'

export function ProductRating({ product }: { product: Product }) {
  if (!product.rating) return null
  return (
    <p
      className="product-rating"
      aria-label={`${product.rating.value} out of ${product.rating.scale}, ${product.rating.count} reviews`}
    >
      <span aria-hidden="true">★</span> {product.rating.value.toFixed(1)} / {product.rating.scale}{' '}
      <small>
        ({product.rating.count} {product.rating.count === 1 ? 'review' : 'reviews'})
      </small>
    </p>
  )
}
