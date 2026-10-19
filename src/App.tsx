import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
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
import { useUI } from './state/store'
import { VersionFrame } from './design/VersionFrame'
import { pageForPath, parseVersion, usePageVersion, useVersions } from './state/versions'
function Storefront() {
  const ui = useUI(),
    location = useLocation(),
    navigate = useNavigate(),
    page = pageForPath(location.pathname),
    version = usePageVersion(page ?? 'home'),
    cartVersion = usePageVersion('cart')
  // `?v=2` on any page selects and remembers that page's version, then drops out of the URL.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (!params.has('v')) return
    const chosen = parseVersion(params.get('v'))
    if (chosen && page) useVersions.getState().choose(page, chosen)
    params.delete('v')
    const rest = params.toString()
    navigate(location.pathname + (rest ? `?${rest}` : '') + location.hash, { replace: true })
  }, [location.search, location.pathname, location.hash, page, navigate])
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = `${location.pathname === '/' ? 'Find your everyday power' : location.pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ')} · Body Power Nutrition`
  }, [location.pathname])
  useEffect(() => {
    if (!ui.toast) return
    const timeout = setTimeout(() => useUI.getState().set({ toast: '' }), 6500)
    return () => clearTimeout(timeout)
  }, [ui.toast])
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <VersionFrame version={version} className="page-frame">
        <Header />
        <motion.div
          id="main-content"
          tabIndex={-1}
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
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
      </VersionFrame>
      <VersionFrame version={cartVersion}>
        <CartDrawer />
      </VersionFrame>
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
