import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail } from 'lucide-react'
import { FAQSection } from '../sections/renderers'
export function Information({ page }: { page: 'about' | 'contact' | 'faq' }) {
  const [done, setDone] = useState(false)
  return (
    <main className="container information-page">
      <span className="eyebrow">BODY POWER NUTRITION</span>
      <h1>
        {page === 'about'
          ? 'Good nutrition.\nGreat possibilities.'
          : page === 'contact'
            ? 'Let’s talk good things.'
            : 'A little clarity.'}
      </h1>
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
              <p>
                Body Power Nutrition is a multi-brand nutrition store. From whey protein and
                creatine to pre-workouts, mass gainers and daily vitamins, we bring the brands you
                trust into one simple place.
              </p>
            </div>
            <div>
              <h2>Built around you.</h2>
              <p>
                Shop by goal, compare sizes and flavours, and build your own combo to save up to 10%
                on the products you use every day.
              </p>
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
          <div>
            <Mail size={30} />
            <h2>A conversation starts here.</h2>
            <p>
              Questions about a product, a combo or your order? Send us a note and we’ll get back to
              you.
            </p>
            <Link className="text-link" to="/faq">
              You might find your answer here <ArrowUpRight size={17} />
            </Link>
          </div>
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
        </div>
      )}
    </main>
  )
}
