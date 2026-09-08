import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
import './mobile-performance.js'
import './reels-video-budget.js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
