import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configure Remotion's staticFile() for GitHub Pages.
// Without @remotion/vite (not installed to avoid extra deps), staticFile()
// relies on window.remotion_staticBase to prefix asset URLs. On GitHub Pages
// the site is served from /malesngonten-registry/, so asset URLs need that
// prefix. On localhost (Vite dev server) the public/ dir is served from root,
// so no prefix is needed (empty string = falsy, inner() returns /{path}).
if (typeof window !== 'undefined') {
  const w = window as Window & { remotion_staticBase?: string | null }
  if (!w.remotion_staticBase) {
    w.remotion_staticBase = window.location.hostname.includes('github.io')
      ? '/malesngonten-registry'
      : ''
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
