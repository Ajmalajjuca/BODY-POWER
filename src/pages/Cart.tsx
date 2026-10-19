import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart, useUI } from '../state/store'
import { findProduct, money } from '../data/catalog'
import { priceCart } from '../domain/pricing'
import { Pack } from '../components/Pack'
import { Empty, IconButton, Modal, Quantity } from '../components/ui'
export function CartContents({ drawer = false }: { drawer?: boolean }) {
  const { lines, change, remove } = useCart(),
    setUI = useUI((s) => s.set),
    totals = priceCart(lines)
  if (!lines.length)
    return (
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setUI({ cart: false })
        }}
      >
        <Empty
          title="Room for good things."
          message="Your demo bag is empty. Find a little fuel for your everyday."
        />
      </div>
    )
  return (
    <div className={`cart-layout ${drawer ? 'cart-in-drawer' : ''}`}>
      <div className="cart-lines">
        {lines.map((line) => {
          const p = findProduct(line.productId)!,
            v = p.variants.find((v) => v.id === line.variantId)!
          const groupCount = lines
            .filter((l) => l.groupId === line.groupId)
            .reduce((n, l) => n + l.quantity, 0)
          return (
            <div className="cart-line" key={line.id}>
              <Link to={`/products/${p.handle}`} onClick={() => setUI({ cart: false })}>
                <Pack product={p} />
              </Link>
              <div>
                <Link to={`/products/${p.handle}`} onClick={() => setUI({ cart: false })}>
                  <h3>{p.title}</h3>
                </Link>
                <p>
                  {v.size}
                  {v.flavor && ` · ${v.flavor}`}
                </p>
                {line.groupName && (
                  <span className="group-label">
                    {line.groupName} · {line.groupId?.slice(0, 4)}
                  </span>
                )}
                <Quantity
                  value={line.quantity}
                  change={(q) => change(line.id, q)}
                  max={line.groupId ? 8 - groupCount + line.quantity : 20}
                />
              </div>
              <div className="cart-line-price">
                <strong>{money(v.price * line.quantity)}</strong>
                <IconButton label={`Remove ${p.title}`} onClick={() => remove(line.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          )
        })}
      </div>
      <aside className="cart-summary">
        <span className="eyebrow">YOUR DEMO BAG</span>
        <h2>A little more power.</h2>
        <div>
          <span>Subtotal</span>
          <strong>{money(totals.subtotal)}</strong>
        </div>
        <div>
          <span>Demo combo savings</span>
          <strong>−{money(totals.discount)}</strong>
        </div>
        <div className="cart-total">
          <span>Demo total</span>
          <strong>{money(totals.total)}</strong>
        </div>
        {totals.savings > 0 && (
          <p className="savings-note">{money(totals.savings)} below example compare-at pricing</p>
        )}
        <div className="checkout-notice">
          <ShoppingBag size={20} />
          <p>
            This is a design preview.
            <br />
            Checkout and payments are intentionally unavailable.
          </p>
        </div>
        <Link
          className="button full"
          to={drawer ? '/cart' : '/shop'}
          onClick={() => setUI({ cart: false })}
        >
          {drawer ? 'View your bag' : 'Continue exploring'}
          <ArrowRight size={16} />
        </Link>
        <small>
          Removing items may change combo eligibility and savings. Prices are illustrative.
        </small>
      </aside>
    </div>
  )
}
export function Cart() {
  return (
    <main className="container standard-page">
      <div className="page-intro">
        <span className="eyebrow">YOUR EVERYDAY ESSENTIALS</span>
        <h1>Your bag.</h1>
        <p>A good routine starts with a little good fuel.</p>
      </div>
      <CartContents />
    </main>
  )
}
export function CartDrawer() {
  const open = useUI((s) => s.cart),
    setUI = useUI((s) => s.set)
  return open ? (
    <Modal title="Your demo bag" close={() => setUI({ cart: false })}>
      <CartContents drawer />
    </Modal>
  ) : null
}
