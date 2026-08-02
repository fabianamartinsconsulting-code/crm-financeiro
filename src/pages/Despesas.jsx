import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

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
    const [d, c, u] = await Promise.all([
      supabase.from('despesas').select('*, categorias_despesa(nome)').order('data', { ascending: false }).limit(50),
      supabase.from('categorias_despesa').select('*').order('ordem'),
      supabase.from('usuarios').select('*'),
    ])
    setDespesas(d.data || [])
    setCategorias(c.data || [])
    setUsuarios(u.data || [])
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('despesas').insert([{ ...form, valor: Number(form.valor) }])
    if (!error) {
      setShowForm(false)
      setForm({ nome: '', categoria_id: '', valor: '', data: new Date().toISOString().slice(0, 10), pago_por_id: '', forma_pagamento: '', recorrente: false, observacoes: '' })
      load()
    }
  }

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
              <p className="text-xs text-muted font-body">{d.categorias_despesa?.nome} · {new Date(d.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <span className="text-sm font-mono font-nums text-petroleo">{fmt(d.valor)}</span>
          </div>
        ))}
        {despesas.length === 0 && <p className="text-sm text-muted font-body text-center py-8">Nenhuma despesa lançada ainda.</p>}
      </div>
    </div>
  )
}
