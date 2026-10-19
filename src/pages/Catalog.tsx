import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search, Grid2X2, List, X, ArrowUpRight } from 'lucide-react'
import { brands, categories, products, money } from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import { BrandLogo } from '../components/BrandLogo'
import { Empty, IconButton, Modal } from '../components/ui'
import { useDesign } from '../state/store'
export function Catalog({ brandPage = false }: { brandPage?: boolean }) {
  const { handle } = useParams(),
    [params, setParams] = useSearchParams(),
    [filters, setFilters] = useState(false),
    [list, setList] = useState(false)
  const config = useDesign((s) => s.config)
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
  return (
    <main className="container catalog-page">
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
            <div className="view-switch">
              <IconButton label="Grid view" onClick={() => setList(false)} disabled={!list}>
                <Grid2X2 size={17} />
              </IconButton>
              <IconButton label="List view" onClick={() => setList(true)} disabled={list}>
                <List size={18} />
              </IconButton>
            </div>
          </div>
          <p className="result-count">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>
          {filtered.length ? (
            <div
              className={`product-grid catalog-grid ${list ? 'list-view' : ''}`}
              style={{ '--columns': config.columns } as React.CSSProperties}
            >
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} style={list ? 'compact' : config.card} />
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
          )}
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
export function Brands() {
  return (
    <main className="container standard-page">
      <div className="page-intro">
        <span className="eyebrow">MANY BRANDS. ONE DESTINATION.</span>
        <h1>
          Good company.
          <br />
          Great nutrition.
        </h1>
        <p>The names athletes trust, from everyday essentials to imported favourites.</p>
      </div>
      <div className="brands-page-grid">
        {brands.map((b) => (
          <Link key={b.id} to={`/brands/${b.id}`}>
            <span className="brand-monogram">
              <BrandLogo brand={b} />
            </span>
            <h2>{b.name}</h2>
            <p>
              {products.filter((p) => p.brandId === b.id).length}{' '}
              {products.filter((p) => p.brandId === b.id).length === 1 ? 'product' : 'products'}
            </p>
            <span>
              Explore the brand <ArrowUpRight size={18} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
