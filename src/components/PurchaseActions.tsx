import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Check } from 'lucide-react'
import { money, type Product } from '../data/catalog'
import { addToCart } from '../state/store'
import { purchaseUrl } from '../domain/purchase'
import { Modal } from './ui'

export function PurchaseActions({ product }: { product: Product }) {
  const variant = product.variants.find((v) => v.available) ?? product.variants[0]
  const [choosing, setChoosing] = useState(false)
  const [variantId, setVariantId] = useState(variant.id)
  const selected = product.variants.find((v) => v.id === variantId)!
  const [added, setAdded] = useState(false)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(feedbackTimer.current), [])
  const navigate = useNavigate()
  const buy = () => navigate(purchaseUrl({ productId: product.id, variantId, quantity: 1 }))
  const add = () => {
    const success = addToCart(
      [{ productId: product.id, variantId: variant.id, quantity: 1 }],
      undefined,
      false,
    )
    clearTimeout(feedbackTimer.current)
    setAdded(success)
    if (success) feedbackTimer.current = setTimeout(() => setAdded(false), 1800)
  }
  return (
    <>
      <div className="purchase-actions">
        <button
          className="button card-buy"
          aria-label={`Buy ${product.title} now`}
          disabled={!variant.available}
          onClick={() => (product.variants.length > 1 ? setChoosing(true) : buy())}
        >
          Buy now <ArrowRight size={15} aria-hidden="true" />
        </button>
        <button
          className="button button-outline card-add"
          data-added={added}
          aria-label={`Add ${product.title} to cart`}
          disabled={!variant.available}
          onClick={add}
        >
          {added ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <ShoppingBag size={16} aria-hidden="true" />
          )}
          <span className="card-add-label">
            <span aria-hidden={added}>Add to cart</span>
            <span aria-hidden={!added}>{added ? 'Added' : ''}</span>
          </span>
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
