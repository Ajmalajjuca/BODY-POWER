import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search, Grid2X2, List, X, ArrowUpRight } from 'lucide-react'
import { brands, categories, categoryProduct, hero, products, money } from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import { BrandLogo } from '../components/BrandLogo'
import { Empty, IconButton, Modal } from '../components/ui'
import { usePageVersion } from '../state/versions'
export function Catalog({ brandPage = false }: { brandPage?: boolean }) {
  const { handle } = useParams(),
    [params, setParams] = useSearchParams(),
    [filters, setFilters] = useState(false),
    [list, setList] = useState(false),
    version = usePageVersion('shop')
  const config = { card: 'detailed' }
  const catalogMax = Math.ceil(Math.max(...products.map((p) => p.basePrice)) / 10000) * 100
  const category = !brandPage && handle ? categories.find((c) => c.handle === handle) : undefined
  const brand = brandPage && handle ? brands.find((b) => b.id === handle) : undefined
  const query = params.get('q') ?? '',
    selectedBrand = params.get('brand') ?? brand?.id ?? '',
    selectedCategory = params.get('category') ?? category?.id ?? '',
    max = Number(params.get('max') ?? catalogMax),
    sort = params.get('sort') ?? 'featured'
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }
  if (handle && !category && !brand)
    return (
      <Empty title="Collection not found" message="Try one of our curated collections instead." />
    )
  const filtered = products
    .filter(
      (p) =>
        (!selectedBrand || p.brandId === selectedBrand) &&
        (!selectedCategory || p.categoryId === selectedCategory) &&
        `${p.title} ${brands.find((b) => b.id === p.brandId)?.name} ${p.tags.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        p.basePrice <= max * 100,
    )
    .sort((a, b) =>
      sort === 'price-low'
        ? a.basePrice - b.basePrice
        : sort === 'price-high'
          ? b.basePrice - a.basePrice
          : sort === 'name'
            ? a.title.localeCompare(b.title)
            : sort === 'bestsellers'
              ? Number(b.bestseller) - Number(a.bestseller)
              : Number(b.featured) - Number(a.featured),
    )
  const filterContent = (
    <>
      <div className="filter-title">
        <h3>Find your fit</h3>
        <button className="text-button" onClick={() => setParams({})}>
          Clear all
        </button>
      </div>
      <fieldset>
        <legend>Category</legend>
        <label>
          <input
            type="radio"
            name="category"
            checked={!selectedCategory}
            onChange={() => change('category', '')}
          />
          All categories
        </label>
        {categories.map((c) => (
          <label key={c.id}>
            <input
              type="radio"
              name="category"
              checked={selectedCategory === c.id}
              disabled={!!category && category.id !== c.id}
              onChange={() => change('category', c.id)}
            />
            {c.name}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Brand</legend>
        <label>
          <input
            type="radio"
            name="brand"
            checked={!selectedBrand}
            onChange={() => change('brand', '')}
          />
          All brands
        </label>
        {brands.map((b) => (
          <label key={b.id}>
            <input
              type="radio"
              name="brand"
              checked={selectedBrand === b.id}
              disabled={!!brand && brand.id !== b.id}
              onChange={() => change('brand', b.id)}
            />
            {b.name}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Price</legend>
        <label htmlFor="price-range">Up to {money(max * 100)}</label>
        <input
          id="price-range"
          type="range"
          min="300"
          max={catalogMax}
          step="100"
          value={max}
          onChange={(e) => change('max', e.target.value)}
        />
        <div className="range-labels">
          <span>₹300</span>
          <span>{money(catalogMax * 100)}</span>
        </div>
      </fieldset>
    </>
  )
  const title = category?.name ?? brand?.name
  const intro = category
    ? `${category.tagline}. Every ${category.name.toLowerCase()} we stock, from the brands you know.`
    : 'Supplements from the brands you know. Find what fits your routine.'
  const searchBox = (
    <div className="catalog-search">
      <Search size={16} />
      <input
        aria-label="Search collection"
        placeholder="Search the collection"
        value={query}
        onChange={(e) => change('q', e.target.value)}
      />
      {query && (
        <IconButton label="Clear search" onClick={() => change('q', '')}>
          <X size={14} />
        </IconButton>
      )}
    </div>
  )
  const sortSelect = (
    <label className="sort-label">
      Sort by{' '}
      <select
        aria-label="Sort products"
        value={sort}
        onChange={(e) => change('sort', e.target.value)}
      >
        <option value="featured">Featured</option>
        <option value="bestsellers">Bestsellers</option>
        <option value="price-low">Price: low to high</option>
        <option value="price-high">Price: high to low</option>
        <option value="name">Name: A–Z</option>
      </select>
    </label>
  )
  const count = (
    <p className="result-count">
      {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
    </p>
  )
  const results = (gridClass: string, card: string) =>
    filtered.length ? (
      <div className={`product-grid catalog-grid ${gridClass}`}>
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} style={card} />
        ))}
      </div>
    ) : (
      <div className="empty">
        <h2>No matches, just yet.</h2>
        <p>Try another search or adjust your filters.</p>
        <button className="button" onClick={() => setParams({})}>
          Reset filters
        </button>
      </div>
    )
  const brandChips = !brand && (
    <div className="shop-chips" role="group" aria-label="Filter by brand">
      <button aria-pressed={!selectedBrand} onClick={() => change('brand', '')}>
        All brands
      </button>
      {brands.map((b) => (
        <button
          key={b.id}
          aria-pressed={selectedBrand === b.id}
          onClick={() => change('brand', b.id)}
        >
          {b.name}
        </button>
      ))}
    </div>
  )
  const categoryLinks = (className: string, label: string) => (
    <nav className={className} aria-label={label}>
      <Link to="/shop" aria-current={!category ? 'page' : undefined}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to={`/collections/${c.handle}`}
          aria-current={category?.id === c.id ? 'page' : undefined}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  )
  if (version === 2) {
    const banner = category
      ? categoryProduct(category.id).images[0]
      : brand
        ? products.find((p) => p.brandId === brand.id)!.images[0]
        : hero[0].src
    return (
      <main className="container catalog-page shop-v2" data-layout="shop-v2">
        <section className="shop-banner">
          <div>
            <span className="eyebrow">THE COLLECTION</span>
            <h1>{title ?? 'Good fuel. Great possibilities.'}</h1>
            <p>{intro}</p>
          </div>
          {brand ? (
            <span className="shop-banner-logo">
              <BrandLogo brand={brand} />
            </span>
          ) : (
            <img src={banner} alt="" />
          )}
        </section>
        {categoryLinks('shop-chips', 'Categories')}
        {brandChips}
        <div className="catalog-toolbar shop-toolbar">
          {searchBox}
          <label className="shop-price">
            Up to {money(max * 100)}
            <input
              type="range"
              aria-label="Maximum price"
              min="300"
              max={catalogMax}
              step="100"
              value={max}
              onChange={(e) => change('max', e.target.value)}
            />
          </label>
          {sortSelect}
        </div>
        {count}
        {results('shop-grid-2', 'minimal')}
      </main>
    )
  }
  if (version === 3) {
    return (
      <main className="catalog-page shop-v3" data-layout="shop-v3">
        <div className="container shop-v3-head">
          <span className="eyebrow">SHOP · {filtered.length} PRODUCTS</span>
          <h1>{title ?? 'All products'}</h1>
        </div>
        {categoryLinks('shop-tabs', 'Categories')}
        <div className="container">
          <div className="catalog-toolbar shop-toolbar">
            {searchBox}
            <label className="sort-label">
              Brand{' '}
              <select
                aria-label="Filter by brand"
                value={selectedBrand}
                disabled={!!brand}
                onChange={(e) => change('brand', e.target.value)}
              >
                <option value="">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            {sortSelect}
          </div>
          {results('shop-grid-4', 'compact')}
        </div>
      </main>
    )
  }
  return (
    <main className="container catalog-page" data-layout="shop-v1">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        {category?.name ?? brand?.name ?? 'Shop all'}
      </div>
      <div className="page-intro">
        <span className="eyebrow">FIND YOUR EVERYDAY POWER</span>
        <h1>{category?.name ?? brand?.name ?? 'Good fuel. Great possibilities.'}</h1>
        <p>
          {category
            ? `${category.tagline}. Every ${category.name.toLowerCase()} we stock, from the brands you know.`
            : 'Supplements from the brands you know. Find what fits your routine.'}
        </p>
      </div>
      <div className="catalog-layout">
        <aside className="filters-desktop">{filterContent}</aside>
        <div>
          <div className="catalog-toolbar">
            <button
              className="button button-outline mobile-filter"
              onClick={() => setFilters(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            {searchBox}
            {sortSelect}
            <div className="view-switch">
              <IconButton label="Grid view" onClick={() => setList(false)} disabled={!list}>
                <Grid2X2 size={17} />
              </IconButton>
              <IconButton label="List view" onClick={() => setList(true)} disabled={list}>
                <List size={18} />
              </IconButton>
            </div>
          </div>
          {count}
          {results(list ? 'list-view' : '', list ? 'compact' : config.card)}
        </div>
      </div>
      {filters && (
        <Modal title="Find your fit" close={() => setFilters(false)}>
          {filterContent}
          <button className="button full" onClick={() => setFilters(false)}>
            Show {filtered.length} products
          </button>
        </Modal>
      )}
    </main>
  )
}
const brandProducts = (id: string) => products.filter((p) => p.brandId === id)
const productCount = (id: string) => {
  const n = brandProducts(id).length
  return `${n} ${n === 1 ? 'product' : 'products'}`
}
export function Brands() {
  const version = usePageVersion('brands')
  const intro = (
    <div className="page-intro">
      <span className="eyebrow">MANY BRANDS. ONE DESTINATION.</span>
      <h1>
        Good company.
        <br />
        Great nutrition.
      </h1>
      <p>The names athletes trust, from everyday essentials to imported favourites.</p>
    </div>
  )
  if (version === 2)
    return (
      <main className="container standard-page brands-v2" data-layout="brands-v2">
        {intro}
        <div className="brand-rows">
          {brands.map((b) => (
            <Link key={b.id} to={`/brands/${b.id}`} className="brand-row">
              <span className="brand-monogram">
                <BrandLogo brand={b} />
              </span>
              <span className="brand-row-copy">
                <h2>{b.name}</h2>
                <p>{productCount(b.id)}</p>
                <span className="text-link">
                  Explore the brand <ArrowUpRight size={16} />
                </span>
              </span>
              <span className="brand-row-products">
                {brandProducts(b.id)
                  .slice(0, 3)
                  .map((p) => (
                    <img key={p.id} src={p.images[0]} alt={p.title} loading="lazy" />
                  ))}
              </span>
            </Link>
          ))}
        </div>
      </main>
    )
  if (version === 3)
    return (
      <main className="container standard-page brands-v3" data-layout="brands-v3">
        <div className="page-intro">
          <span className="eyebrow">{brands.length} BRANDS</span>
          <h1>The brand wall.</h1>
          <p>Seven names athletes trust. Pick one to see everything we stock.</p>
        </div>
        <div className="brand-wall">
          {brands.map((b) => (
            <Link key={b.id} to={`/brands/${b.id}`}>
              <BrandLogo brand={b} />
              <span>{productCount(b.id)}</span>
            </Link>
          ))}
        </div>
      </main>
    )
  return (
    <main className="container standard-page" data-layout="brands-v1">
      {intro}
      <div className="brands-page-grid">
        {brands.map((b) => (
          <Link key={b.id} to={`/brands/${b.id}`}>
            <span className="brand-monogram">
              <BrandLogo brand={b} />
            </span>
            <h2>{b.name}</h2>
            <p>{productCount(b.id)}</p>
            <span>
              Explore the brand <ArrowUpRight size={18} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
