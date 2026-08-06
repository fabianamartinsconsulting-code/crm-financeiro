import { useEffect, useState } from 'react'
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'

const fmt = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Soma "n" meses a uma data no formato 'YYYY-MM-DD', preservando o dia quando possível
const addMonths = (dateStr, n) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1 + n, d)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nome: '', categoria_id: '', valor: '', data: new Date().toISOString().slice(0, 10),
    pago_por_id: '', forma_pagamento: '', recorrente: false, observacoes: '',
    parcelado: false, parcelas: '2',
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
      const { parcelado, parcelas, ...base } = form
      const totalParcelas = parcelado ? Math.max(2, parseInt(parcelas, 10) || 2) : 1
      const grupoParcela = totalParcelas > 1 ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : null

      const inserts = []
      for (let i = 0; i < totalParcelas; i++) {
        inserts.push(addDoc(collection(db, 'despesas'), {
          ...base,
          valor: Number(base.valor),
          data: addMonths(base.data, i),
          ...(totalParcelas > 1 ? {
            parcela_atual: i + 1,
            parcela_total: totalParcelas,
            grupo_parcela: grupoParcela,
          } : {}),
        }))
      }
      await Promise.all(inserts)

      setShowForm(false)
      setForm({
        nome: '', categoria_id: '', valor: '', data: new Date().toISOString().slice(0, 10),
        pago_por_id: '', forma_pagamento: '', recorrente: false, observacoes: '',
        parcelado: false, parcelas: '2',
      })
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
          <input type="number" step="0.01" placeholder={form.parcelado ? 'Valor de cada parcela' : 'Valor'} value={form.valor}
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

          <label className="flex items-center gap-2 text-sm font-body text-muted">
            <input type="checkbox" checked={form.parcelado}
              onChange={(e) => setForm({ ...form, parcelado: e.target.checked })} />
            Parcelado
          </label>

          {form.parcelado && (
            <input type="number" min="2" placeholder="Número de parcelas" value={form.parcelas}
              onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
              className="border border-line rounded-lg px-3 py-2 text-sm font-body" required />
          )}

          <button type="submit" className="bg-petroleo text-white rounded-lg py-2.5 text-sm font-body mt-1">
            {form.parcelado ? 'Salvar despesa parcelada' : 'Salvar despesa'}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {despesas.map((d) => (
          <div key={d.id} className="bg-base border border-line rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-body text-ink">
                {d.nome}
                {d.parcela_total > 1 && (
                  <span className="ml-2 text-xs text-muted font-body">({d.parcela_atual}/{d.parcela_total})</span>
                )}
              </p>
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
