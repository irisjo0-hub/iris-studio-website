import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import heroMediaImg from './assets/hero.png'
import './index.css'
import App from './App.tsx'
import './styles/iris-brand-overrides.css'
import './styles/iris-brand-polish.css'
import './styles/iris-calendar-popover.css'
import './styles/iris-calendar-popup.css'
import './styles/iris-calendar-final.css'
import './styles/iris-booking-compact.css'
import './styles/iris-responsive-system.css'
import './styles/iris-hero-responsive-polish.css'
import './lib/irisCalendarPicker'

// Start downloading the first hero/reel image before React mounts.
// This does not change the existing animation or reveal behavior.
if (typeof document !== 'undefined') {
  const heroPreload = document.createElement('link')
  heroPreload.rel = 'preload'
  heroPreload.as = 'image'
  heroPreload.href = heroMediaImg
  document.head.appendChild(heroPreload)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
