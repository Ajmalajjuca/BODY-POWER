import { useId, useState } from 'react'
import { brands, categories, type Product } from '../data/catalog'
export function Pack({
  product,
  back = false,
  imageIndex,
  className = '',
}: {
  product: Product
  back?: boolean
  imageIndex?: number
  className?: string
}) {
  const [failed, setFailed] = useState<string | null>(null)
  const id = useId().replace(/:/g, ''),
    brand = brands.find((b) => b.id === product.brandId)!,
    category = categories.find((c) => c.id === product.categoryId)!
  const gold = product.brandId === 'on',
    yellow = product.brandId === 'mb',
    light = product.brandId === 'dym'
  const color = gold ? '#a78a46' : brand.color,
    body = light ? '#eceeee' : '#222428'
  if (product.source) {
    const src = product.images[imageIndex ?? (back ? 1 : 0)] ?? product.images[0]
    return failed === src ? (
      <span
        className={`pack product-photo photo-unavailable ${className}`}
        role="img"
        aria-label={`${product.title}: image unavailable`}
      >
        Image unavailable
      </span>
    ) : (
      <img
        className={`pack product-photo ${className}`}
        src={src}
        alt={`${product.title} — product image ${(imageIndex ?? (back ? 1 : 0)) + 1}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(src)}
      />
    )
  }
  return (
    <svg
      viewBox="0 0 240 300"
      className={`pack ${className}`}
      role="img"
      aria-label={`${product.title} — illustrative ${back ? 'back' : 'front'} packaging`}
    >
      <defs>
        <linearGradient id={`${id}body`}>
          <stop stopColor={body} />
          <stop offset=".3" stopColor={light ? '#fff' : '#45464a'} />
          <stop offset=".7" stopColor={body} />
          <stop offset="1" stopColor={light ? '#c0c5c5' : '#101113'} />
        </linearGradient>
        <linearGradient id={`${id}lid`} x2="0" y2="1">
          <stop stopColor="#404145" />
          <stop offset=".4" stopColor="#18191c" />
          <stop offset="1" stopColor="#363639" />
        </linearGradient>
        <linearGradient id={`${id}label`}>
          <stop stopColor={color} />
          <stop offset=".45" stopColor={gold ? '#d1b574' : color} />
          <stop offset="1" stopColor={gold ? '#876c34' : color} />
        </linearGradient>
        <filter id={`${id}shadow`}>
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <ellipse
        cx="121"
        cy="282"
        rx="77"
        ry="8"
        fill="#000"
        opacity=".16"
        filter={`url(#${id}shadow)`}
      />
      <path
        d="M57 53 Q49 70 43 83 L40 254 Q41 273 67 277 L177 277 Q199 272 200 253 L197 83 Q193 69 184 53Z"
        fill={`url(#${id}body)`}
      />
      <rect x="52" y="28" width="136" height="36" rx="9" fill={`url(#${id}lid)`} />
      {Array.from({ length: 27 }, (_, i) => (
        <path key={i} d={`M${56 + i * 4.8} 33v25`} stroke="#777" strokeWidth="1" opacity=".27" />
      ))}
      <path d="M43 117 Q120 130 197 117 L199 245 Q120 258 41 245Z" fill={`url(#${id}label)`} />
      {back ? (
        <g fill={yellow || gold ? '#232323' : '#fff'}>
          <text x="120" y="146" textAnchor="middle" fontSize="12" fontWeight="800">
            DEMO PACKAGING
          </text>
          <text x="120" y="167" textAnchor="middle" fontSize="8">
            Illustration only · not a product label
          </text>
          {[0, 1, 2, 3, 4].map((n) => (
            <path key={n} d={`M62 ${184 + n * 10}h115`} stroke="currentColor" opacity=".3" />
          ))}
          <text x="120" y="241" textAnchor="middle" fontSize="9">
            Refer to manufacturer information
          </text>
        </g>
      ) : (
        <>
          <text
            x="120"
            y="92"
            fill={light ? '#222' : '#fff'}
            fontSize={gold ? '32' : '24'}
            textAnchor="middle"
            fontWeight="900"
            fontStyle="italic"
          >
            {brand.short}
          </text>
          <text
            x="120"
            y="108"
            fill={light ? '#444' : '#ddd'}
            fontSize="7"
            textAnchor="middle"
            letterSpacing="1.2"
          >
            {brand.name.toUpperCase()}
          </text>
          <g fill={yellow || gold ? '#201d18' : '#fff'} textAnchor="middle">
            <text x="120" y="153" fontSize="11" letterSpacing="1" fontWeight="800">
              {gold ? 'GOLD STANDARD' : yellow ? 'PERFORMANCE' : 'PREMIUM SERIES'}
            </text>
            <text
              x="120"
              y="184"
              fontSize={category.name.length > 13 ? '18' : '24'}
              fontWeight="900"
            >
              {category.name === 'Whey Protein' ? '100% WHEY' : category.name.toUpperCase()}
            </text>
            <text x="120" y="204" fontSize="8" letterSpacing="1">
              {gold ? 'THE EVERYDAY STANDARD' : 'BUILT FOR YOUR ROUTINE'}
            </text>
            <path d="M70 218h100" stroke="currentColor" opacity=".5" />
            <text x="120" y="235" fontSize="9" fontWeight="700">
              {product.variants[0].size.toUpperCase()}
            </text>
          </g>
          <text
            x="120"
            y="266"
            fill={light ? '#555' : '#ddd'}
            fontSize="6"
            textAnchor="middle"
            letterSpacing="1"
          >
            REPRESENTATIVE DEMO PACKAGING
          </text>
        </>
      )}
      <path d="M48 90v155" stroke="#fff" strokeWidth="3" opacity=".07" />
    </svg>
  )
}
