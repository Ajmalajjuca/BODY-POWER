import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { MotionConfig, motion } from 'motion/react'
import { X } from 'lucide-react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './sections/Home'
import { Catalog, Brands } from './pages/Catalog'
import { Product } from './pages/Product'
import { Cart, CartDrawer } from './pages/Cart'
import { Combos, ComboBuilder } from './pages/Combos'
import { Information } from './pages/Information'
import { Empty, IconButton } from './components/ui'
const Studio = lazy(() => import('./studio/Studio').then((module) => ({ default: module.Studio })))
import { useDesign, useUI } from './state/store'
import { ThemeFrame } from './design/ThemeFrame'
import { decodeConfig } from './design/config'
function Storefront() {
  const config = useDesign((s) => s.config),
    ui = useUI(),
    location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = `${location.pathname === '/' ? 'Find your everyday power' : location.pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ')} · Body Power Nutrition`
  }, [location.pathname])
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const value = hash.get('design')
    if (value) {
      try {
        useDesign.getState().update(decodeConfig(value))
        useUI.getState().set({ toast: 'Shared design loaded. Save a named version to keep it.' })
      } catch {
        useUI
          .getState()
          .set({ toast: 'This design link is invalid. Your saved design is unchanged.' })
      }
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])
  useEffect(() => {
    if (!ui.toast) return
    const timeout = setTimeout(() => useUI.getState().set({ toast: '' }), 6500)
    return () => clearTimeout(timeout)
  }, [ui.toast])
  return (
    <div className={`app-shell ${ui.studio ? 'with-studio' : ''} preview-${ui.viewport}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {ui.viewport !== 'desktop' && (
        <div className="viewport-label">
          {ui.viewport === 'mobile' ? 'MOBILE · 390 PX' : 'TABLET · 820 PX'}
          <button onClick={() => ui.set({ viewport: 'desktop' })}>
            Exit preview <X size={13} />
          </button>
        </div>
      )}
      <div className="storefront-viewport">
        <ThemeFrame config={config}>
          <Header centered={config.header === 'centered'} />
          <motion.div
            id="main-content"
            tabIndex={-1}
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
          >
            <Routes>
              <Route path="/" element={<Home config={config} />} />
              <Route path="/shop" element={<Catalog />} />
              <Route path="/collections/:handle" element={<Catalog />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/brands/:handle" element={<Catalog brandPage />} />
              <Route path="/products/:handle" element={<Product />} />
              <Route path="/combos" element={<Combos />} />
              <Route path="/build-your-combo" element={<ComboBuilder />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<Information page="about" />} />
              <Route path="/contact" element={<Information page="contact" />} />
              <Route path="/faq" element={<Information page="faq" />} />
              <Route
                path="*"
                element={
                  <Empty
                    title="A little off the beaten path."
                    message="We couldn’t find that page. Your next everyday essential is just a click away."
                  />
                }
              />
            </Routes>
          </motion.div>
          <Footer />
        </ThemeFrame>
      </div>
      <ThemeFrame config={config}>
        <CartDrawer />
      </ThemeFrame>
      <Suspense fallback={null}>
        <Studio />
      </Suspense>
      {ui.toast && (
        <div className="toast" role="status">
          {ui.toast}
          <IconButton label="Dismiss notification" onClick={() => ui.set({ toast: '' })}>
            <X size={15} />
          </IconButton>
        </div>
      )}
    </div>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <Storefront />
      </MotionConfig>
    </BrowserRouter>
  )
}
