import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Menu, X, ArrowUpRight, Layers3 } from 'lucide-react'
import { products, brands } from '../data/catalog'
import { useCart, useUI } from '../state/store'
import { LogoMark } from './LogoMark'
import { VersionMenu } from './VersionMenu'
// The Product menu opens the product being viewed, or the featured whey everywhere else.
const featuredProduct = '/products/optimum-nutrition-gold-standard-100-whey'
export function Header() {
  const [query, setQuery] = useState(''),
    [menu, setMenu] = useState(false)
  const navigate = useNavigate(),
    { pathname } = useLocation(),
    lines = useCart((s) => s.lines),
    setUI = useUI((s) => s.set)
  const results = query.trim()
    ? products
        .filter((p) =>
          `${p.title} ${brands.find((b) => b.id === p.brandId)?.name}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 4)
    : []
  const navItems = [
    { label: 'Home', to: '/', page: 'home' },
    { label: 'Shop', to: '/shop', page: 'shop' },
    {
      label: 'Product',
      to: pathname.startsWith('/products/') ? pathname : featuredProduct,
      page: 'product',
    },
    { label: 'Brands', to: '/brands', page: 'brands' },
    { label: 'Combos', to: '/combos', page: 'combos' },
    { label: 'Build', to: '/build-your-combo', page: 'build' },
    { label: 'Cart', to: '/cart', page: 'cart' },
    {
      label: 'Pages',
      group: [
        { label: 'About', to: '/about', page: 'about' },
        { label: 'Contact', to: '/contact', page: 'contact' },
        { label: 'FAQ', to: '/faq', page: 'faq' },
      ],
    },
  ] as const
  return (
    <>
      <div className="announcement">
        <span>A little more power. A little more possibility.</span>
        <Link to="/combos">
          Shop combos <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="header">
        <div className="header-main container">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <Link className="logo" to="/" aria-label="Body Power Nutrition home">
            <LogoMark />
            <span className="logo-words">
              BODY POWER<small>N U T R I T I O N</small>
            </span>
          </Link>
          <div className="search-wrap">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                navigate(`/shop?q=${encodeURIComponent(query)}`)
                setQuery('')
              }}
            >
              <Search size={18} />
              <input
                aria-label="Search products"
                placeholder="Find your next everyday essential…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setQuery('')
                }}
              />
              <kbd>↵</kbd>
            </form>
            {query && (
              <div className="search-results">
                <strong>Discover your fuel</strong>
                {results.map((p) => (
                  <Link key={p.id} onClick={() => setQuery('')} to={`/products/${p.handle}`}>
                    {p.title}
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
                {!results.length && <p>No matching products.</p>}
                <Link to={`/shop?q=${encodeURIComponent(query)}`} onClick={() => setQuery('')}>
                  View all results
                </Link>
              </div>
            )}
          </div>
          <div className="header-actions">
            <Link className="header-combo" to="/build-your-combo">
              <Layers3 size={19} />
              <span>Build a combo</span>
            </Link>
            <button
              className="cart-trigger"
              onClick={() => setUI({ cart: true })}
              aria-label={`Open cart, ${lines.reduce((n, l) => n + l.quantity, 0)} items`}
            >
              <ShoppingBag size={21} />
              <span>My bag</span>
              <b>{lines.reduce((n, l) => n + l.quantity, 0)}</b>
            </button>
          </div>
        </div>
        <nav className={`nav container ${menu ? 'nav-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <VersionMenu key={item.label} {...item} onNavigate={() => setMenu(false)} />
          ))}
        </nav>
      </header>
    </>
  )
}
