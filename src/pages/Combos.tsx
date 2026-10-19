import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Plus, Trash2, Check, Layers3 } from 'lucide-react'
import { brands, categories, products, combos, findProduct, money } from '../data/catalog'
import { priceSelection, comboRules, type Selection } from '../domain/pricing'
import { Pack } from '../components/Pack'
import { Quantity, IconButton } from '../components/ui'
import { addToCart } from '../state/store'
export function ComboCard({ combo }: { combo: (typeof combos)[number] }) {
  const items = combo.items.map((id) => ({
      productId: id,
      variantId: findProduct(id)!.variants[0].id,
      quantity: 1,
    })),
    price = priceSelection(items, true)
  return (
    <article className={`combo-card combo-${combo.color}`}>
      <div className="combo-card-art">
        {combo.items.map((id) => (
          <Pack key={id} product={findProduct(id)!} />
        ))}
        <span className="combo-discount">
          {price.percent}%<small>COMBO SAVINGS</small>
        </span>
      </div>
      <div className="combo-card-copy">
        <span className="eyebrow">CURATED TO GO TOGETHER</span>
        <h2>{combo.name}</h2>
        <p>{combo.note}</p>
        <ul>
          {items.map((i) => {
            const p = findProduct(i.productId)!,
              v = p.variants[0]
            return (
              <li key={i.productId}>
                <Check size={13} />
                <span>
                  {p.title}
                  <small>
                    1 × {v.size}
                    {v.flavor && ` · ${v.flavor}`}
                  </small>
                </span>
              </li>
            )
          })}
        </ul>
        <div className="combo-card-price">
          <strong>{money(price.total)}</strong>
          <del>{money(price.subtotal)}</del>
          <small>Combo price</small>
        </div>
        <button className="button full" onClick={() => addToCart(items, combo.name)}>
          Add combo to bag <Plus size={16} />
        </button>
      </div>
    </article>
  )
}
export function Combos() {
  return (
    <main className="container standard-page">
      <div className="page-intro">
        <span className="eyebrow">GOOD THINGS COME TOGETHER</span>
        <h1>A little more, together.</h1>
        <p>Thoughtful pairings for your routine. Explore our ready-made edits or make your own.</p>
        <Link className="text-link" to="/build-your-combo">
          Build a combo your way <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="combo-grid">
        {combos.map((c) => (
          <ComboCard key={c.id} combo={c} />
        ))}
      </div>
      <p className="demo-footnote">
        Pair any 2 products to save 5%, or 3 to 8 products to save 10%.
      </p>
    </main>
  )
}
export function ComboBuilder() {
  const [items, setItems] = useState<Selection[]>([]),
    [category, setCategory] = useState(''),
    [brand, setBrand] = useState(''),
    [query, setQuery] = useState('')
  const price = priceSelection(items, true),
    count = items.reduce((n, i) => n + i.quantity, 0)
  const add = (productId: string, variantId: string) =>
    setItems((current) => {
      if (count >= comboRules.max) return current
      const existing = current.find((i) => i.variantId === variantId)
      return existing
        ? current.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i))
        : [...current, { productId, variantId, quantity: 1 }]
    })
  const filtered = products.filter(
    (p) =>
      (!category || p.categoryId === category) &&
      (!brand || p.brandId === brand) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <main className="container standard-page builder-page">
      <div className="page-intro">
        <span className="eyebrow">YOUR BRANDS. YOUR RULES.</span>
        <h1>Build your better together.</h1>
        <p>
          Choose {comboRules.min}–{comboRules.max} items. Mix brands, find your flavours, make your
          own routine.
        </p>
      </div>
      <div className="builder-progress">
        <span className="active">
          01 <b>Pick your favourites</b>
        </span>
        <span className={count >= 2 ? 'active' : ''}>
          02 <b>Find your pairing</b>
        </span>
        <span className={price.valid ? 'active' : ''}>
          03 <b>Add your combo</b>
        </span>
      </div>
      <div className="builder-layout">
        <div>
          <div className="builder-filters">
            <input
              aria-label="Search combo products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a product…"
            />
            <select
              aria-label="Filter combo category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter combo brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="builder-products">
            {filtered.map((p) => (
              <BuilderProduct key={p.id} product={p} add={add} disabled={count >= comboRules.max} />
            ))}
          </div>
          {!filtered.length && (
            <div className="empty">
              <h2>No matches.</h2>
              <button
                className="button"
                onClick={() => {
                  setQuery('')
                  setBrand('')
                  setCategory('')
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
        <aside className="builder-summary">
          <span className="eyebrow">THE PERFECT MIX</span>
          <h2>
            Your combo{' '}
            <span>
              {count}/{comboRules.max}
            </span>
          </h2>
          {!items.length && (
            <div className="builder-empty">
              <Layers3 size={40} strokeWidth={1} />
              <p>
                A little empty.
                <br />A lot of possibility.
              </p>
              <small>Add your first favourite to begin.</small>
            </div>
          )}
          {items.map((i) => {
            const p = findProduct(i.productId)!,
              v = p.variants.find((v) => v.id === i.variantId)!
            return (
              <div className="builder-line" key={i.variantId}>
                <Pack product={p} />
                <div>
                  <strong>{p.title}</strong>
                  <small>
                    {v.size}
                    {v.flavor && ` · ${v.flavor}`}
                  </small>
                  <Quantity
                    value={i.quantity}
                    max={8 - count + i.quantity}
                    change={(q) =>
                      setItems(items.map((j) => (j === i ? { ...j, quantity: q } : j)))
                    }
                  />
                </div>
                <IconButton
                  label={`Remove ${p.title} from combo`}
                  onClick={() => setItems(items.filter((j) => j !== i))}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            )
          })}
          <div className="discount-progress">
            <span className={count >= 2 ? 'achieved' : ''}>2 items · 5% off</span>
            <span className={count >= 3 ? 'achieved' : ''}>3+ items · 10% off</span>
          </div>
          <div className="summary-line">
            <span>Price</span>
            <b>{money(price.subtotal)}</b>
          </div>
          <div className="summary-line">
            <span>Combo discount</span>
            <b>−{money(price.discount)}</b>
          </div>
          <div className="summary-line total">
            <span>Your combo</span>
            <b>{money(price.total)}</b>
          </div>
          <button
            className="button full"
            disabled={!price.valid}
            onClick={() => {
              if (addToCart(items, 'Your custom combo')) setItems([])
            }}
          >
            Add combo to bag <ArrowUpRight size={17} />
          </button>
          <small className="demo-footnote">
            {price.valid ? 'Your saving is applied in the bag.' : price.error}
          </small>
        </aside>
      </div>
      <div className="mobile-combo-bar">
        <span>
          {count} items · <strong>{money(price.total)}</strong>
        </span>
        <button
          className="button"
          disabled={!price.valid}
          onClick={() => {
            if (addToCart(items, 'Your custom combo')) setItems([])
          }}
        >
          Add combo <Plus size={16} />
        </button>
      </div>
    </main>
  )
}
function BuilderProduct({
  product,
  add,
  disabled,
}: {
  product: (typeof products)[number]
  add: (p: string, v: string) => void
  disabled: boolean
}) {
  const [id, setId] = useState(product.variants[0].id),
    v = product.variants.find((v) => v.id === id)!
  return (
    <article className="builder-product">
      <Link to={`/products/${product.handle}`}>
        <Pack product={product} />
      </Link>
      <div>
        <span className="product-brand">{brands.find((b) => b.id === product.brandId)!.name}</span>
        <h3>{product.title}</h3>
        <select
          aria-label={`Variant for ${product.title}`}
          value={id}
          onChange={(e) => setId(e.target.value)}
        >
          {product.variants.map((v) => (
            <option key={v.id} value={v.id} disabled={!v.available}>
              {v.size} {v.flavor} {!v.available ? '(sold out)' : ''}
            </option>
          ))}
        </select>
        <div>
          <strong>{money(v.price)}</strong>
          <button
            disabled={disabled || !v.available}
            className="quick-add"
            aria-label={`Add ${product.title} to combo`}
            onClick={() => add(product.id, id)}
          >
            <Plus size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}
