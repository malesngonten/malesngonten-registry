import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remotion's staticFile() defaults to origin-root absolute paths (e.g.
// "/3d/phone.glb"), which only works when the site is served from the domain
// root. On project sites like GitHub Pages it is served from
// "/<repo>/", so every static asset would 404. Registering the page path as
// Remotion's static base makes staticFile() emit "/<repo>/...". Skipped when
// hosted at "/" (local dev / vite preview) so the default is preserved.
const staticBase = window.location.pathname.replace(/\/+$/, '')
if (staticBase) {
  ;(window as unknown as Record<string, unknown>).remotion_staticBase = staticBase
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
