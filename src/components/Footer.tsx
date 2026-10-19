import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
export function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <Link className="footer-logo" to="/">
            BODY POWER<span>NUTRITION</span>
          </Link>
          <p>
            Good nutrition. Great possibilities.
            <br />
            Find your everyday power.
          </p>
          <span className="eyebrow">Many brands. One destination.</span>
        </div>
        <div>
          <h4>Find your fuel</h4>
          <Link to="/shop">Shop all products</Link>
          <Link to="/brands">Explore brands</Link>
          <Link to="/combos">Ready-made combos</Link>
          <Link to="/build-your-combo">
            Build your combo <ArrowUpRight size={12} />
          </Link>
        </div>
        <div>
          <h4>A little guidance</h4>
          <Link to="/about">Our story</Link>
          <Link to="/faq">Frequently asked questions</Link>
          <Link to="/contact">Get in touch</Link>
          <Link to="/cart">Your bag</Link>
        </div>
        <div>
          <h4>Better together.</h4>
          <p>Pair any two products and save 5%. Three or more, save 10%.</p>
          <small>All prices are inclusive of taxes.</small>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Body Power Nutrition. All rights reserved.</span>
        <span>All trademarks belong to their respective owners.</span>
      </div>
    </footer>
  )
}
