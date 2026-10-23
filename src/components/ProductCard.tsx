import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { brands, money, type Product } from '../data/catalog'
import { Pack } from './Pack'
import { ProductRating } from './ProductRating'
import { PurchaseActions } from './PurchaseActions'
export function ProductCard({ product, style = 'detailed' }: { product: Product; style?: string }) {
  const variant = product.variants.find((v) => v.available) ?? product.variants[0],
    brand = brands.find((b) => b.id === product.brandId)!
  return (
    <article className={`product-card card-${style}`}>
      <Link
        className="product-image"
        to={`/products/${product.handle}`}
        aria-label={`View ${product.title}`}
      >
        <Pack product={product} />
        {product.bestseller && <span className="product-badge">BESTSELLER</span>}
        <span className="image-arrow">
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="product-info">
        <span className="product-brand">{brand.name}</span>
        <Link className="product-title" title={product.title} to={`/products/${product.handle}`}>
          <h3>{product.title}</h3>
        </Link>
        <p className="variant-note">
          {variant.size}
          {variant.flavor && (
            <>
              {' '}
              <span>•</span> {variant.flavor}
            </>
          )}
        </p>
        <div className="product-rating-slot">
          <ProductRating product={product} />
        </div>
        <div className="product-bottom">
          <div>
            <strong>{money(variant.price)}</strong>{' '}
            {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
              <del>{money(variant.compareAtPrice)}</del>
            )}
          </div>
          {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
            <span className="card-saving">
              {Math.round((1 - variant.price / variant.compareAtPrice) * 100)}% off
            </span>
          )}
        </div>
        <PurchaseActions product={product} />
      </div>
    </article>
  )
}
