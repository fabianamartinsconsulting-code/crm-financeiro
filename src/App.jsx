import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Receitas from './pages/Receitas'
import Despesas from './pages/Despesas'
import Orcamento from './pages/Orcamento'

function Private({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted font-body">Carregando…</div>
  if (!session) return <Navigate to="/login" replace />
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

function Shell() {
  const { session } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/orcamento" element={<Private><Orcamento /></Private>} />
      <Route path="/receitas" element={<Private><Receitas /></Private>} />
      <Route path="/despesas" element={<Private><Despesas /></Private>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/crm-financeiro">
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  )
}
