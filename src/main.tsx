import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './styles/iris-brand-overrides.css'
import './styles/iris-brand-polish.css'
import './styles/iris-calendar-popover.css'
import './lib/irisCalendarPicker'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
