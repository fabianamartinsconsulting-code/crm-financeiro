import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function showError(err) {
  const el = document.getElementById('root')
  el.innerHTML =
    '<pre style="white-space:pre-wrap;padding:16px;color:#900;font-size:14px;">' +
    'ERRO: ' + (err && (err.message || err)) +
    '\n\n' + (err && err.stack ? err.stack : '') +
    '</pre>'
}

window.addEventListener('error', (e) => showError(e.error || e.message))
window.addEventListener('unhandledrejection', (e) => showError(e.reason))

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  showError(err)
}
