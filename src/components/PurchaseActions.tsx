import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { money, type Product } from '../data/catalog'
import { addToCart } from '../state/store'
import { purchaseUrl } from '../domain/purchase'
import { Modal } from './ui'

export function PurchaseActions({ product }: { product: Product }) {
  const variant = product.variants.find((v) => v.available) ?? product.variants[0]
  const [choosing, setChoosing] = useState(false)
  const [variantId, setVariantId] = useState(variant.id)
  const selected = product.variants.find((v) => v.id === variantId)!
  const navigate = useNavigate()
  const buy = () => navigate(purchaseUrl({ productId: product.id, variantId, quantity: 1 }))
  return (
    <>
      <div className="purchase-actions">
        <button
          className="button"
          aria-label={`Buy ${product.title} now`}
          disabled={!variant.available}
          onClick={() => (product.variants.length > 1 ? setChoosing(true) : buy())}
        >
          Buy Now
        </button>
        <button
          className="button button-outline"
          aria-label={`Add ${product.title} to cart`}
          disabled={!variant.available}
          onClick={() =>
            addToCart(
              [{ productId: product.id, variantId: variant.id, quantity: 1 }],
              undefined,
              false,
            )
          }
        >
          <Plus size={16} />
          Add to Cart
        </button>
      </div>
      {choosing && (
        <Modal title="Choose your size & flavour" close={() => setChoosing(false)}>
          <div className="purchase-picker">
            <h3>{product.title}</h3>
            <label>
              Size & flavour
              <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.available}>
                    {v.size}
                    {v.flavor ? ` · ${v.flavor}` : ''}
                    {!v.available ? ' · Sold out' : ''}
                  </option>
                ))}
              </select>
            </label>
            <strong>{money(selected.price)}</strong>
            <p>
              Demo price · Review this item before payment. No payment is collected in this
              prototype.
            </p>
            <button
              className="button full"
              disabled={!selected.available}
              onClick={() => {
                setChoosing(false)
                buy()
              }}
            >
              Continue to summary <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
