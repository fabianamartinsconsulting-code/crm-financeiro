import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

alert('JS carregou! Vou tentar renderizar o app agora.')

window.addEventListener('error', (e) => {
  alert('ERRO: ' + (e.error ? (e.error.message + '\n' + e.error.stack) : e.message))
})
window.addEventListener('unhandledrejection', (e) => {
  alert('ERRO (promise): ' + (e.reason && e.reason.message ? e.reason.message : e.reason))
})

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  alert('Render chamado sem erro.')
} catch (err) {
  alert('ERRO NO RENDER: ' + err.message + '\n' + err.stack)
}
