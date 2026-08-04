import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-soft">
      <div className="mb-10">
        <h1 className="font-display text-2xl font-semibold text-ink">Financeiro Familiar</h1>
        <p className="text-muted text-sm mt-1 font-body">Dados, não percepção.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-base border border-line rounded-xl px-4 py-3 text-sm font-body outline-none focus:border-verde"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-base border border-line rounded-xl px-4 py-3 text-sm font-body outline-none focus:border-verde"
          required
        />
        {error && <p className="text-alerta text-xs font-body">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-verde text-white rounded-xl py-3 text-sm font-body font-medium mt-2 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
