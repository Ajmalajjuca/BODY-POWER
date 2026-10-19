import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyVersionParam } from './state/versions'

// A shared `?v=` link selects its page version before the first paint.
const search = applyVersionParam(location.pathname, location.search)
if (search !== null) history.replaceState(null, '', location.pathname + search + location.hash)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
