import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail } from 'lucide-react'
import { FAQSection } from '../sections/renderers'
import { faqs } from '../data/faqs'
import { brands, categories, products } from '../data/catalog'
import { usePageVersion } from '../state/versions'
const titles = {
  about: 'Good nutrition.\nGreat possibilities.',
  contact: 'Let’s talk good things.',
  faq: 'A little clarity.',
}
const story = [
  'Body Power Nutrition is a multi-brand nutrition store. From whey protein and creatine to pre-workouts, mass gainers and daily vitamins, we bring the brands you trust into one simple place.',
  'Shop by goal, compare sizes and flavours, and build your own combo to save up to 10% on the products you use every day.',
]
export function Information({ page }: { page: 'about' | 'contact' | 'faq' }) {
  const [done, setDone] = useState(false),
    version = usePageVersion(page)
  const contactForm = (
    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault()
        setDone(true)
      }}
    >
      <label>
        Your name
        <input required maxLength={80} placeholder="Alex Morgan" />
      </label>
      <label>
        Email address
        <input required type="email" placeholder="you@example.com" />
      </label>
      <label>
        What’s on your mind?
        <textarea required maxLength={2000} rows={5} placeholder="Tell us a little more…" />
      </label>
      <button className="button">
        Send message <ArrowUpRight size={17} />
      </button>
      <p role="status">{done ? 'Thanks for reaching out. We’ll be in touch soon.' : ''}</p>
    </form>
  )
  const contactCopy = (
    <>
      <Mail size={30} />
      <h2>A conversation starts here.</h2>
      <p>
        Questions about a product, a combo or your order? Send us a note and we’ll get back to you.
      </p>
      <Link className="text-link" to="/faq">
        You might find your answer here <ArrowUpRight size={17} />
      </Link>
    </>
  )
  const layout = `${page}-v${version}`
  if (version === 2)
    return (
      <main className="container information-page info-v2" data-layout={layout}>
        {page === 'contact' ? (
          <div className="contact-card">
            <span className="eyebrow">BODY POWER NUTRITION</span>
            <h1>{titles.contact}</h1>
            <p>
              Questions about a product, a combo or your order? Send us a note and we’ll get back to
              you.
            </p>
            {contactForm}
          </div>
        ) : (
          <div className="info-column">
            <span className="eyebrow">BODY POWER NUTRITION</span>
            <h1>{titles[page]}</h1>
            {page === 'about' ? (
              <>
                <p className="large-copy">{story[0]}</p>
                <blockquote>
                  “Good nutrition should feel simple: trusted brands, honest prices and a combo that
                  fits your routine.”
                </blockquote>
                <p>{story[1]}</p>
                <Link className="button" to="/shop">
                  Explore the collection <ArrowUpRight size={17} />
                </Link>
              </>
            ) : (
              <div className="faq-large">
                <FAQSection />
              </div>
            )}
          </div>
        )}
      </main>
    )
  if (version === 3)
    return (
      <main className="container information-page info-v3" data-layout={layout}>
        <span className="eyebrow">BODY POWER NUTRITION</span>
        <h1>{titles[page]}</h1>
        {page === 'about' ? (
          <>
            <div className="info-stats">
              {[
                [brands.length, 'trusted brands'],
                [products.length, 'everyday essentials'],
                [categories.length, 'categories'],
                ['10%', 'off every combo of 3+'],
              ].map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="story-grid">
              {story.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
            <Link className="button" to="/shop">
              Explore the collection <ArrowUpRight size={17} />
            </Link>
          </>
        ) : page === 'faq' ? (
          <div className="faq-cards">
            {faqs.map(([q, a]) => (
              <article key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="contact-split">
            <div className="contact-panel">{contactCopy}</div>
            {contactForm}
          </div>
        )}
      </main>
    )
  return (
    <main className="container information-page" data-layout={layout}>
      <span className="eyebrow">BODY POWER NUTRITION</span>
      <h1>{titles[page]}</h1>
      {page === 'about' ? (
        <>
          <p className="large-copy">
            A considered destination for the brands you know, the essentials you need, and the
            routine you’re making your own.
          </p>
          <div className="story-grid">
            <div>
              <h2>
                Many brands.
                <br />
                One everyday mission.
              </h2>
              <p>{story[0]}</p>
            </div>
            <div>
              <h2>Built around you.</h2>
              <p>{story[1]}</p>
              <Link className="button" to="/shop">
                Explore the collection <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </>
      ) : page === 'faq' ? (
        <FAQSection />
      ) : (
        <div className="contact-layout">
          <div>{contactCopy}</div>
          {contactForm}
        </div>
      )}
    </main>
  )
}
