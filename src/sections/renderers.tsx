import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowRight,
  Layers3,
  PackageCheck,
  SlidersHorizontal,
  Sparkles,
  Dumbbell,
  Heart,
  Zap,
  MoveUpRight,
} from 'lucide-react'
import { useState } from 'react'
import { brands, categories, combos, categoryProduct, findProduct, hero } from '../data/catalog'
import { selectProducts } from '../data/selection'
import type { DesignConfig, Section } from '../design/config'
import { Pack } from '../components/Pack'
import { BrandLogo } from '../components/BrandLogo'
import { ProductCard } from '../components/ProductCard'
import { ComboCard } from '../pages/Combos'
export interface SectionProps {
  section: Section
  config: DesignConfig
}
export function Hero({ section, config }: SectionProps) {
  return (
    <div className={`hero-layout hero-${config.hero}`}>
      <div className="campaign">
        <div className="campaign-grain" />
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span /> FUEL YOUR EVERYDAY EXTRAORDINARY
          </span>
          <h1>
            {section.heading.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h1>
          <p>{section.subheading}</p>
          <Link className="button button-light" to="/shop">
            Find your fuel <ArrowUpRight size={18} />
          </Link>
          <div className="hero-footnote">
            <span className="little-line" /> Great brands. One destination.
          </div>
        </div>
        <div className="hero-stage">
          <div className="stage-ring ring-one" />
          <div className="stage-ring ring-two" />
          <span className="stage-word">POWER</span>
          <div className="stage-pedestal" />
          <img
            className="hero-pack hero-pack-back"
            src={hero[1].src}
            alt={hero[1].alt}
            decoding="async"
          />
          <img
            className="hero-pack hero-pack-main"
            src={hero[0].src}
            alt={hero[0].alt}
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-stamp">
            <span>YOUR NEXT</span>
            <strong>LEVEL</strong>
            <span>STARTS HERE ↗</span>
          </div>
        </div>
        <div className="hero-pagination">
          <span />
          <i />
          <i />
          <small>01 — THE EVERYDAY EDIT</small>
        </div>
      </div>
      <div className="hero-side">
        <Link to="/build-your-combo" className="side-offer">
          <span className="eyebrow">YOUR STACK. YOUR RULES.</span>
          <h2>
            Better as
            <br />a combo.
          </h2>
          <p>
            Mix brands.
            <br />
            Make it yours.
          </p>
          <span className="circle-arrow">
            <ArrowUpRight size={23} />
          </span>
          <Pack product={categoryProduct('c2')} className="side-pack" />
          <span className="offer-label">
            UP TO 10%<small>OFF EVERY COMBO</small>
          </span>
        </Link>
        <Link to="/collections/creatine" className="side-discover">
          <span className="eyebrow">SMALL SCOOP. BIG ROUTINE.</span>
          <h3>
            Meet your
            <br />
            daily essentials.
          </h3>
          <span>
            Explore creatine <ArrowUpRight size={16} />
          </span>
          <div className="discovery-orbit" />
        </Link>
      </div>
    </div>
  )
}
export function Trust() {
  return (
    <div className="trust-row">
      {[
        [PackageCheck, 'Thoughtfully curated', 'Recognizable nutrition brands'],
        [Layers3, 'Made to work together', 'Mix brands in your own combo'],
        [SlidersHorizontal, 'Find your fit', 'Sizes and flavours for your routine'],
        [Sparkles, 'Clear, honest pricing', 'Savings shown on every product'],
      ].map(([Icon, title, detail]) => {
        const I = Icon as typeof PackageCheck
        return (
          <div key={String(title)}>
            <I size={25} />
            <span>
              <strong>{String(title)}</strong>
              <small>{String(detail)}</small>
            </span>
          </div>
        )
      })}
    </div>
  )
}
export function CategoryGrid({ config, section }: SectionProps) {
  const shown = config.layout === 'performance' ? categories.slice(0, 4) : categories.slice(0, 6)
  return (
    <div
      className={`category-grid ${config.layout === 'performance' ? 'category-large' : ''}`}
      style={{ '--section-columns': section.columns } as React.CSSProperties}
    >
      {shown.map((c, i) => (
        <Link className="category-card" to={`/collections/${c.handle}`} key={c.id}>
          <div className={`category-art cat-${i}`}>
            <Pack product={categoryProduct(c.id)} />
            <span className="category-number">0{i + 1}</span>
          </div>
          <div>
            <h3>{c.name}</h3>
            <ArrowUpRight size={17} />
          </div>
          <small>{c.tagline}</small>
        </Link>
      ))}
    </div>
  )
}
export function BrandGrid() {
  return (
    <div className="brand-grid">
      {brands.map((b) => (
        <Link className="brand-wordmark" to={`/brands/${b.id}`} key={b.id}>
          <BrandLogo brand={b} />
          <span className="brand-explore">
            Explore brand <ArrowUpRight size={12} />
          </span>
        </Link>
      ))}
    </div>
  )
}
export function ProductSection({ section, config }: SectionProps) {
  const list = selectProducts(section.selection, section.type)
  return (
    <div
      className="product-grid"
      style={
        {
          '--columns': section.columns || config.columns,
        } as React.CSSProperties
      }
    >
      {list.slice(0, section.columns || config.columns).map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          style={section.card === 'inherit' ? config.card : section.card}
        />
      ))}
    </div>
  )
}
export function ComboPromo({ section }: SectionProps) {
  return (
    <div className="combo-promotion">
      <div className="combo-art">
        <div className="combo-disc" />
        <Pack product={findProduct(combos[0].items[0])!} />
        <span className="combo-plus">+</span>
        <Pack product={findProduct(combos[0].items[1])!} />
        <span className="combo-floating">A little more, together. ↗</span>
      </div>
      <div>
        <span className="eyebrow">THE PERFECT PAIRING IS PERSONAL</span>
        <h2>{section.heading}</h2>
        <p>{section.subheading}</p>
        <div className="combo-steps">
          <span>
            01 <b>Pick your favourites</b>
          </span>
          <span>
            02 <b>Make your mix</b>
          </span>
          <span>
            03 <b>Save up to 10%</b>
          </span>
        </div>
        <Link className="button" to="/build-your-combo">
          Build your combo <ArrowUpRight size={18} />
        </Link>
        <small>2 items: 5% off · 3–8 items: 10% off</small>
      </div>
    </div>
  )
}
export function Deals() {
  return (
    <div className="deals-grid">
      <Link to="/collections/whey-protein" className="deal-card">
        <div>
          <span className="eyebrow">THE PROTEIN EDIT</span>
          <h2>
            Good days start
            <br />
            with good fuel.
          </h2>
          <span>
            Discover whey protein <ArrowRight size={16} />
          </span>
        </div>
        <Pack product={categoryProduct('c1')} />
      </Link>
      <Link to="/combos" className="deal-card dark-deal">
        <div>
          <span className="eyebrow">LESS GUESSWORK. MORE POSSIBILITY.</span>
          <h2>
            Your routine.
            <br />
            Ready to go.
          </h2>
          <span>
            Shop curated combos <ArrowRight size={16} />
          </span>
        </div>
        <Layers3 className="deal-icon" strokeWidth={0.6} />
      </Link>
    </div>
  )
}
export function Goals() {
  return (
    <div className="goals-grid">
      {[
        [Dumbbell, 'Build your routine', 'whey-protein'],
        [Zap, 'Find your focus', 'pre-workout'],
        [Heart, 'Everyday wellness', 'wellness'],
        [Layers3, 'Gain with purpose', 'mass-gainer'],
      ].map(([Icon, title, handle]) => {
        const I = Icon as typeof Dumbbell
        return (
          <Link to={`/collections/${handle}`} key={String(title)}>
            <I size={30} strokeWidth={1.2} />
            <h3>{String(title)}</h3>
            <MoveUpRight size={19} />
          </Link>
        )
      })}
    </div>
  )
}
const faqs = [
  [
    'How do combo savings work?',
    'Add any 2 products to a combo to save 5%, or 3 to 8 products to save 10%. Mix brands and flavours freely. Your saving updates in the bag as you change quantities.',
  ],
  [
    'Which brands do you stock?',
    'Optimum Nutrition, MuscleTech, Dymatize, GNC, Rule 1, Applied Nutrition and GHOST, across whey protein, creatine, pre-workout, mass gainers, vitamins and omega-3.',
  ],
  [
    'Where can I find ingredients and nutrition information?',
    'Each product page includes photos of the label with full nutrition, ingredient and allergen details. Always read the label before use.',
  ],
  [
    'How should I store my supplements?',
    'Keep containers tightly closed in a cool, dry place away from direct sunlight, and use them before the best-before date printed on the pack.',
  ],
  [
    'How do I choose a supplement?',
    'Start with your goal: whey protein for recovery, creatine for strength, a mass gainer for extra calories. For specific dietary or health needs, speak to a qualified professional.',
  ],
]
export function FAQSection() {
  return (
    <div className="faq-list">
      {faqs.map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <span>+</span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  )
}
export function Newsletter({ section }: SectionProps) {
  const [done, setDone] = useState(false)
  return (
    <div className="newsletter">
      <div>
        <span className="eyebrow">A LITTLE GOOD IN YOUR INBOX</span>
        <h2>{section.heading}</h2>
        <p>{section.subheading}</p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setDone(true)
        }}
      >
        <label htmlFor={`email-${section.id}`}>Your email address</label>
        <div>
          <input id={`email-${section.id}`} type="email" placeholder="you@example.com" required />
          <button aria-label="Subscribe to the newsletter">
            <ArrowRight />
          </button>
        </div>
        <small role="status">
          {done ? 'Thanks for signing up. Watch your inbox.' : 'No spam. Unsubscribe anytime.'}
        </small>
      </form>
    </div>
  )
}
export function Spotlight({ section }: SectionProps) {
  const p = selectProducts(section.selection, section.type)[0]
  return (
    <div className="spotlight">
      <div>
        <span className="eyebrow">IN THE SPOTLIGHT</span>
        <h2>{section.heading === 'Product spotlight' ? p.title : section.heading}</h2>
        <p>{section.subheading || p.description}</p>
        <Link className="button" to={`/products/${p.handle}`}>
          Discover the details <ArrowUpRight size={18} />
        </Link>
      </div>
      <Pack product={p} />
    </div>
  )
}
export function FeaturedCombos() {
  return (
    <div className="combo-grid">
      {combos.map((combo) => (
        <ComboCard key={combo.id} combo={combo} />
      ))}
    </div>
  )
}
export function Banner({ section }: SectionProps) {
  return (
    <div className="promo-banner">
      <span className="eyebrow">YOUR EVERYDAY, ELEVATED</span>
      <h2>{section.heading}</h2>
      <p>{section.subheading || 'A considered collection. A world of possibilities.'}</p>
      <Link className="button" to="/shop">
        Explore the collection <ArrowUpRight size={18} />
      </Link>
    </div>
  )
}
export function Announcement({ section }: SectionProps) {
  return (
    <div className="inline-announcement">
      <strong>{section.heading}</strong>
      <span>{section.subheading}</span>
      <Link to="/combos">
        Explore <ArrowUpRight size={14} />
      </Link>
    </div>
  )
}
