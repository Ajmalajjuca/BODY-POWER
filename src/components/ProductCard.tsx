import { Link } from 'react-router-dom'
import { Plus, ArrowUpRight } from 'lucide-react'
import { brands, money, type Product } from '../data/catalog'
import { Pack } from './Pack'
import { ProductRating } from './ProductRating'
import { addToCart } from '../state/store'
export function ProductCard({ product, style = 'detailed' }: { product: Product; style?: string }) {
  const variant = product.variants[0], brand = brands.find(b => b.id === product.brandId)!
  return <article className={`product-card card-${style}`}><Link className="product-image" to={`/products/${product.handle}`} aria-label={`View ${product.title}`}><Pack product={product}/>{product.bestseller && <span className="product-badge">{product.source ? 'SUPPX BESTSELLER' : 'THE ESSENTIALS'}</span>}<span className="image-arrow"><ArrowUpRight size={18}/></span></Link><div className="product-info"><span className="product-brand">{brand.name}</span><Link to={`/products/${product.handle}`}><h3>{product.title}</h3></Link><p className="variant-note">{variant.size} <span>•</span> {variant.flavor ?? 'Everyday essentials'}</p><ProductRating product={product}/><div className="product-bottom"><div><strong>{money(variant.price)}</strong> {variant.compareAtPrice && <del>{money(variant.compareAtPrice)}</del>}<small>{product.source ? 'SuppX price snapshot' : 'Demo price'}</small></div><button className="quick-add" aria-label={`Add ${product.title} to cart`} onClick={() => addToCart([{ productId: product.id, variantId: variant.id, quantity: 1 }])} disabled={!variant.available}><Plus size={19}/></button></div></div></article>
}
