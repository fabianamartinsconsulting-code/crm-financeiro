import { useEffect, useState } from 'react'
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'

const fmt = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nome: '', categoria_id: '', valor: '', data: new Date().toISOString().slice(0, 10),
    pago_por_id: '', forma_pagamento: '', recorrente: false, observacoes: '',
  })

  const load = async () => {
    try {
      const despesasSnap = await getDocs(
        query(collection(db, 'despesas'), orderBy('data', 'desc'), limit(50))
      )
      const categoriasSnap = await getDocs(
        query(collection(db, 'categorias_despesa'), orderBy('ordem'))
      )
      const usuariosSnap = await getDocs(collection(db, 'usuarios'))

      setDespesas(despesasSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCategorias(categoriasSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setUsuarios(usuariosSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) {
      alert('ERRO AO CARREGAR: ' + err.code + ' | ' + err.message)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'despesas'), { ...form, valor: Number(form.valor) })
      setShowForm(false)
      setForm({ nome: '', categoria_id: '', valor: '', data: new Date().toISOString().slice(0, 10), pago_por_id: '', forma_pagamento: '', recorrente: false, observacoes: '' })
      load()
    } catch (err) {
      alert('ERRO AO SALVAR DESPESA: ' + err.message)
    }
  }

  const nomeCategoria = (id) => categorias.find((c) => c.id === id)?.nome || ''

  return (
    <div className="min-h-screen bg-soft px-4 pt-6 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-display text-xl font-semibold text-ink">Despesas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-verde text-white text-sm font-body rounded-full px-4 py-2"
        >
          {showForm ? 'Cancelar' : '+ Nova'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-base border border-line rounded-2xl p-4 mb-4 flex flex-col gap-2">
          <input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" required />
          <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" required>
            <option value="">Categoria</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Valor" value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-mono" required />
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" required />
          <select value={form.pago_por_id} onChange={(e) => setForm({ ...form, pago_por_id: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" required>
            <option value="">Quem pagou</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
          <input placeholder="Forma de pagamento" value={form.forma_pagamento}
            onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
            className="border border-line rounded-lg px-3 py-2 text-sm font-body" />
          <label className="flex items-center gap-2 text-sm font-body text-muted">
            <input type="checkbox" checked={form.recorrente}
              onChange={(e) => setForm({ ...form, recorrente: e.target.checked })} />
            Despesa recorrente
          </label>
          <button type="submit" className="bg-petroleo text-white rounded-lg py-2.5 text-sm font-body mt-1">
            Salvar despesa
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {despesas.map((d) => (
          <div key={d.id} className="bg-base border border-line rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-body text-ink">{d.nome}</p>
              <p className="text-xs text-muted font-body">{nomeCategoria(d.categoria_id)} · {new Date(d.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <span className="text-sm font-mono font-nums text-petroleo">{fmt(d.valor)}</span>
          </div>
        ))}
        {despesas.length === 0 && <p className="text-sm text-muted font-body text-center py-8">Nenhuma despesa lançada ainda.</p>}
      </div>
    </div>
  )
}
