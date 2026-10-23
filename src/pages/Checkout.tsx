import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { resolvePurchase, purchaseUrl } from '../domain/purchase'
import { priceSelection } from '../domain/pricing'
import { findProduct, money } from '../data/catalog'
import { useCart, useUI } from '../state/store'
import { Pack } from '../components/Pack'
import { Empty, Quantity } from '../components/ui'
import { CartContents } from './Cart'

export function Checkout() {
  const [params] = useSearchParams(),
    navigate = useNavigate()
  const direct = ['product', 'variant', 'quantity'].some((key) => params.has(key))
  const selection = resolvePurchase(params)
  const add = useCart((s) => s.add),
    setUI = useUI((s) => s.set)
  if (direct && !selection)
    return (
      <Empty
        title="This selection is unavailable."
        message="Please choose an available product and a quantity from 1 to 20."
      />
    )
  const product = selection ? findProduct(selection.productId)! : null
  const variant = product?.variants.find((v) => v.id === selection?.variantId)
  const totals = selection ? priceSelection([selection]) : null
  const addMore = () => {
    if (selection && !add([selection])) {
      setUI({
        toast: 'Your cart could not accept this quantity. Adjust the quantity or review your cart.',
      })
      return
    }
    navigate('/shop')
    setUI({ toast: 'Your selection is saved in your cart. Keep exploring.' })
  }
  return (
    <main className="container standard-page purchase-summary-page">
      <div className="page-intro">
        <span className="eyebrow">YOUR PURCHASE SUMMARY</span>
        <h1>One step closer.</h1>
        <p>Review your items, variants and quantities.</p>
      </div>
      <div className="purchase-disclosure">
        <strong>Checkout preview</strong>
        <p>
          All prices are demo pricing. This prototype stops at your purchase summary: no payment is
          collected and no order is placed.
        </p>
      </div>
      {selection && product && variant && totals ? (
        <div className="cart-layout direct-purchase">
          <div>
            <div className="cart-line">
              <Link to={`/products/${product.handle}`}>
                <Pack product={product} />
              </Link>
              <div>
                <h2>{product.title}</h2>
                <p>
                  {variant.size}
                  {variant.flavor && ` · ${variant.flavor}`}
                </p>
                <strong>{money(variant.price)} each</strong>
                <div>
                  <Quantity
                    value={selection.quantity}
                    change={(quantity) =>
                      navigate(purchaseUrl({ ...selection, quantity }), { replace: true })
                    }
                  />
                </div>
              </div>
            </div>
            <Link className="text-link" to={`/products/${product.handle}`}>
              <ArrowLeft size={16} />
              Change product options
            </Link>
          </div>
          <aside className="cart-summary">
            <span className="eyebrow">THIS PRODUCT ONLY</span>
            <h2>Purchase summary</h2>
            <div>
              <span>Quantity</span>
              <strong>{selection.quantity}</strong>
            </div>
            <div className="cart-total">
              <span>Demo total</span>
              <strong>{money(totals.total)}</strong>
            </div>
            <p className="purchase-note">
              Your existing cart is kept separate. Add more items to combine this selection with
              your cart.
            </p>
            <button className="button full" onClick={addMore}>
              <Plus size={16} />
              Add more items
            </button>
            <Link to="/cart" className="text-link">
              View existing cart
            </Link>
          </aside>
        </div>
      ) : (
        <CartContents checkout />
      )}
    </main>
  )
}
