import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShoppingBag, Check, ArrowRight } from 'lucide-react'
import { products, brands, categories, money } from '../data/catalog'
import { Pack } from '../components/Pack'
import { ProductRating } from '../components/ProductRating'
import { Empty, Quantity } from '../components/ui'
import { ProductCard } from '../components/ProductCard'
import { addToCart } from '../state/store'
import { usePageVersion } from '../state/versions'
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
    [image, setImage] = useState(0),
    version = usePageVersion('product')
  const variant = product.variants.find((v) => v.id === variantId)!,
    brand = brands.find((b) => b.id === product.brandId)!,
    category = categories.find((c) => c.id === product.categoryId)!,
    related = products.filter((p) => p.id !== product.id && p.categoryId === product.categoryId),
    add = () => addToCart([{ productId: product.id, variantId, quantity }])
  const breadcrumb = (
    <div className="breadcrumb">
      <Link to="/">Home</Link>
      <span>/</span>
      <Link to={`/collections/${category.handle}`}>{category.name}</Link>
      <span>/</span>
      {product.title}
    </div>
  )
  const thumbnails = (
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
  )
  const price = (
    <div className="detail-price">
      <strong>{money(variant.price)}</strong>
      {variant.compareAtPrice && <del>{money(variant.compareAtPrice)}</del>}
      {variant.compareAtPrice && (
        <span>Save {Math.round((1 - variant.price / variant.compareAtPrice) * 100)}%</span>
      )}
    </div>
  )
  const purchase = (
    <>
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
        <button className="button" disabled={!variant.available} onClick={add}>
          <ShoppingBag size={18} />
          Add to bag
        </button>
      </div>
      <Link className="pairing-link" to="/build-your-combo">
        Better together. Build a combo <ArrowRight size={17} />
      </Link>
    </>
  )
  const details = (
    <>
      <details open className="product-accordion">
        <summary>The details</summary>
        <p className="product-description">{product.description}</p>
        {variant.SKU && <p>SKU: {variant.SKU}</p>}
      </details>
      <details className="product-accordion">
        <summary>Ingredients & suitability</summary>
        <p>
          Full ingredient, nutrition and allergen information is printed on the pack. Read the label
          before use, and speak to your doctor if you are pregnant, nursing or managing a medical
          condition.
        </p>
      </details>
    </>
  )
  const more = (count: number, className = '') => (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">KEEP EXPLORING</span>
          <h2>More good things.</h2>
        </div>
      </div>
      <div className={`product-grid ${className}`}>
        {related.slice(0, count).map((p) => (
          <ProductCard key={p.id} product={p} style={version === 2 ? 'minimal' : 'detailed'} />
        ))}
      </div>
    </>
  )
  if (version === 2)
    return (
      <main className="container standard-page product-v2" data-layout="product-v2">
        {breadcrumb}
        <div className="product-v2-layout">
          <div className="product-v2-gallery">
            {product.images.map((_, i) => (
              <div className="detail-image" key={i}>
                {i === 0 && product.bestseller && <span className="product-badge">BESTSELLER</span>}
                <Pack product={product} imageIndex={i} />
              </div>
            ))}
          </div>
          <div className="detail-copy product-v2-copy">
            <Link className="eyebrow" to={`/brands/${brand.id}`}>
              {brand.name}
            </Link>
            <h1>{product.title}</h1>
            <p className="detail-subtitle">{category.tagline}.</p>
            <ProductRating product={product} />
            {price}
            {purchase}
            {details}
          </div>
        </div>
        {more(3, 'related-3')}
      </main>
    )
  if (version === 3) {
    const flavours = new Set(product.variants.map((v) => v.flavor).filter(Boolean)).size,
      sizes = new Set(product.variants.map((v) => v.size)).size
    return (
      <main className="product-v3" data-layout="product-v3">
        <section className="product-hero">
          <div className="container product-hero-inner">
            <div>
              {breadcrumb}
              <Link className="eyebrow" to={`/brands/${brand.id}`}>
                {brand.name}
              </Link>
              <h1>{product.title}</h1>
              <ProductRating product={product} />
              {price}
            </div>
            <div className="product-hero-image">
              {product.bestseller && <span className="product-badge">BESTSELLER</span>}
              <Pack product={product} imageIndex={image} />
            </div>
          </div>
        </section>
        <div className="container">
          <dl className="product-specs">
            <div>
              <dt>Sizes</dt>
              <dd>{sizes}</dd>
            </div>
            <div>
              <dt>Flavours</dt>
              <dd>{flavours || '—'}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{category.name}</dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd>{variant.available ? 'In stock' : 'Sold out'}</dd>
            </div>
          </dl>
          <div className="product-v3-body">
            <div>
              {thumbnails}
              {details}
            </div>
            <div className="detail-copy">{purchase}</div>
          </div>
          {more(4)}
        </div>
        <div className="product-sticky-bar">
          <span>
            <small>{product.title}</small>
            <strong>{money(variant.price * quantity)}</strong>
          </span>
          <button className="button" disabled={!variant.available} onClick={add}>
            <ShoppingBag size={18} />
            Add to bag
          </button>
        </div>
      </main>
    )
  }
  return (
    <main className="container standard-page" data-layout="product-v1">
      {breadcrumb}
      <div className="product-detail">
        <div>
          <div className="detail-image">
            {product.bestseller && <span className="product-badge">BESTSELLER</span>}
            <Pack product={product} imageIndex={image} />
          </div>
          {thumbnails}
        </div>
        <div className="detail-copy">
          <Link className="eyebrow" to={`/brands/${brand.id}`}>
            {brand.name}
          </Link>
          <h1>{product.title}</h1>
          <p className="detail-subtitle">{category.tagline}.</p>
          <ProductRating product={product} />
          {price}
          {purchase}
          {details}
        </div>
      </div>
      {more(4)}
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
