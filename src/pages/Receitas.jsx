import { useEffect, useState } from 'react'
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'

const fmt = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const categoriasReceita = [
  { v: 'salario', l: 'Salário' }, { v: 'autonomo', l: 'Trabalho autônomo' },
  { v: 'comissao', l: 'Comissões' }, { v: 'rendimento', l: 'Rendimentos' }, { v: 'extra', l: 'Receita extra' },
]

export default function Receitas() {
  const [receitas, setReceitas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    valor: '', data: new Date().toISOString().slice(0, 10), responsavel_id: '', categoria: '', observacoes: '',
  })

  const load = async () => {
      try {
        const receitasSnap = await getDocs(
          query(collection(db, 'receitas'), orderBy('data', 'desc'), limit(50))
        )
        const usuariosSnap = await getDocs(collection(db, 'usuarios'))
        alert('Usuários encontrados: ' + usuariosSnap.size)

        setReceitas(receitasSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setUsuarios(usuariosSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        alert('ERRO AO CARREGAR: ' + err.code + ' | ' + err.message)
      }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'receitas'), { ...form, valor: Number(form.valor) })
      setShowForm(false)
      setForm({ valor: '', data: new Date().toISOString().slice(0, 10), responsavel_id: '', categoria: '', observacoes: '' })
      load()
    } catch (err) {
      alert('ERRO AO SALVAR RECEITA: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-soft px-4 pt-6 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-display text-xl font-semibold text-ink">Receitas</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-verde text-white text-sm font-body rounded-full px-4 py-2">
          {showForm ? 'Cancelar' : '+ Nova'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-base border border-line rounded-2xl p-4 mb-4 flex flex-col gap-2">
          <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" required>
            <option value="">Origem</option>
            {categoriasReceita.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Valor" value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-mono" required />
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" required />
          <select value={form.responsavel_id} onChange={(e) => setForm({ ...form, responsavel_id: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" required>
            <option value="">Responsável</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
          <input placeholder="Observações" value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" />
          <button type="submit" className="bg-verde text-white rounded-lg py-2.5 text-sm font-body mt-1">
            Salvar receita
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {receitas.map((r) => (
          <div key={r.id} className="bg-base border border-line rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-body text-ink capitalize">{categoriasReceita.find((c) => c.v === r.categoria)?.l || r.categoria}</p>
              <p className="text-xs text-muted font-body">{new Date(r.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <span className="text-sm font-mono font-nums text-verde">{fmt(r.valor)}</span>
          </div>
        ))}
        {receitas.length === 0 && <p className="text-sm text-muted font-body text-center py-8">Nenhuma receita lançada ainda.</p>}
      </div>
    </div>
  )
}
