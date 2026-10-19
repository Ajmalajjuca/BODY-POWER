import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShoppingBag, Check, ArrowRight } from 'lucide-react'
import { products, brands, categories, money } from '../data/catalog'
import { Pack } from '../components/Pack'
import { ProductRating } from '../components/ProductRating'
import { Empty, Quantity } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { addToCart, useDesign } from '../state/store'
export function Product() {
  const { handle } = useParams()
  const product = products.find((p) => p.handle === handle)
  if (!product)
    return (
      <Empty
        title="Product not found"
        message="This product may have moved. Explore the collection to find your fuel."
      />
    )
  return <ProductDetail key={product.id} product={product} />
}
function ProductDetail({ product }: { product: (typeof products)[number] }) {
  const [variantId, setVariantId] = useState(product.variants[0].id),
    [quantity, setQuantity] = useState(1),
    [image, setImage] = useState(0)
  const variant = product.variants.find((v) => v.id === variantId)!,
    brand = brands.find((b) => b.id === product.brandId)!,
    category = categories.find((c) => c.id === product.categoryId)!,
    card = useDesign((s) => s.config.card)
  return (
    <main className="container standard-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/collections/${category.handle}`}>{category.name}</Link>
        <span>/</span>
        {product.title}
      </div>
      <div className="product-detail">
        <div>
          <div className="detail-image">
            {product.bestseller && <span className="product-badge">BESTSELLER</span>}
            <Pack product={product} imageIndex={image} />
          </div>
          <div className="thumbnails">
            {product.images.map((_, i) => (
              <button
                key={i}
                aria-label={`View product image ${i + 1}`}
                aria-pressed={image === i}
                onClick={() => setImage(i)}
              >
                <Pack product={product} imageIndex={i} />
              </button>
            ))}
          </div>
        </div>
        <div className="detail-copy">
          <Link className="eyebrow" to={`/brands/${brand.id}`}>
            {brand.name}
          </Link>
          <h1>{product.title}</h1>
          <p className="detail-subtitle">{category.tagline}.</p>
          <ProductRating product={product} />
          <div className="detail-price">
            <strong>{money(variant.price)}</strong>
            {variant.compareAtPrice && <del>{money(variant.compareAtPrice)}</del>}
            {variant.compareAtPrice && (
              <span>Save {Math.round((1 - variant.price / variant.compareAtPrice) * 100)}%</span>
            )}
          </div>
          <p className="demo-label">Inclusive of all taxes.</p>
          <fieldset className="variant-picker">
            <legend>Select size & flavour</legend>
            {product.variants.map((v) => (
              <button
                key={v.id}
                className={variantId === v.id ? 'selected' : ''}
                onClick={() => setVariantId(v.id)}
                disabled={!v.available}
              >
                {v.size}
                {v.flavor && ` · ${v.flavor}`}
                {!v.available && ' · Sold out'}
              </button>
            ))}
          </fieldset>
          <span className="availability">
            <Check size={15} />
            {variant.available ? 'In stock' : 'Sold out'}
          </span>
          <div className="detail-add">
            <Quantity value={quantity} change={setQuantity} />
            <button
              className="button"
              disabled={!variant.available}
              onClick={() => addToCart([{ productId: product.id, variantId, quantity }])}
            >
              <ShoppingBag size={18} />
              Add to bag
            </button>
          </div>
          <Link className="pairing-link" to="/build-your-combo">
            Better together. Build a combo <ArrowRight size={17} />
          </Link>
          <details open className="product-accordion">
            <summary>The details</summary>
            <p className="product-description">{product.description}</p>
            {variant.SKU && <p>SKU: {variant.SKU}</p>}
          </details>
          <details className="product-accordion">
            <summary>Ingredients & suitability</summary>
            <p>
              Full ingredient, nutrition and allergen information is printed on the pack. Read the
              label before use, and speak to your doctor if you are pregnant, nursing or managing a
              medical condition.
            </p>
          </details>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">KEEP EXPLORING</span>
          <h2>More good things.</h2>
        </div>
      </div>
      <div className="product-grid">
        {products
          .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
          .slice(0, 4)
          .map((p) => (
            <ProductCard key={p.id} product={p} style={card} />
          ))}
      </div>
      <div className="recommendation-strip">
        <h3>Complete your routine.</h3>
        <p>Save up to 10% when you pair it in a combo.</p>
        <Link to="/combos" className="text-link">
          Shop combos <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  )
}
