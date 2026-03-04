import React from 'react'
import ReactDOM from 'react-dom/client'
import { applyTheme, getStoredTheme } from './theme'
import App from './App'

applyTheme(getStoredTheme())

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
