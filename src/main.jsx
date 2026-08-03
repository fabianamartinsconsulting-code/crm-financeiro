import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

async function start() {
  try {
    const { default: App } = await import('./App.jsx')
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (err) {
    document.getElementById('root').innerHTML =
      '<pre style="white-space:pre-wrap;padding:16px;color:#900;font-size:14px;">' +
      'ERRO AO CARREGAR APP: ' + (err && err.message) +
      '\n\n' + (err && err.stack ? err.stack : '') +
      '</pre>'
  }
}

start()
