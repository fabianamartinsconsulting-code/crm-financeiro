import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Card from '../components/Card'
import SplitBar from '../components/SplitBar'

const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard() {
  const [receitas, setReceitas] = useState([])
  const [despesas, setDespesas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const inicioMes = new Date()
      inicioMes.setDate(1)
      const dataInicio = inicioMes.toISOString().slice(0, 10)

      const receitasQuery = query(collection(db, 'receitas'), where('data', '>=', dataInicio))
      const despesasQuery = query(collection(db, 'despesas'), where('data', '>=', dataInicio))
      const usuariosQuery = collection(db, 'usuarios')

      const [receitasSnap, despesasSnap, usuariosSnap] = await Promise.all([
        getDocs(receitasQuery),
        getDocs(despesasQuery),
        getDocs(usuariosQuery),
      ])

      setReceitas(receitasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setDespesas(despesasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setUsuarios(usuariosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }
    load()
  }, [])

  const totalReceitas = receitas.reduce((s, r) => s + Number(r.valor), 0)
  const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0)
  const saldo = totalReceitas - totalDespesas

  const porCategoria = despesas.reduce((acc, d) => {
    const nome = d.categoria_nome || 'Outros'
    acc[nome] = (acc[nome] || 0) + Number(d.valor)
    return acc
  }, {})
  const topCategorias = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const cores = ['#1B4332', '#145263']
  const participacao = usuarios.map((u, i) => ({
    label: u.nome,
    value: despesas.filter((d) => d.pago_por_id === u.id).reduce((s, d) => s + Number(d.valor), 0),
    color: u.cor_identificacao || cores[i % cores.length],
  }))

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted font-body">Carregando…</div>
  }

  return (
    <div className="min-h-screen bg-soft px-4 pt-6 pb-24">
      <h1 className="font-display text-xl font-semibold text-ink mb-4">Este mês</h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card label="Saldo" value={fmt(saldo)} accent={saldo >= 0 ? 'verde' : 'alerta'} />
        <Card label="Receitas" value={fmt(totalReceitas)} accent="verde" />
        <Card label="Despesas" value={fmt(totalDespesas)} accent="petroleo" />
        <Card label="Economia" value={totalReceitas ? `${(((totalReceitas - totalDespesas) / totalReceitas) * 100).toFixed(0)}%` : '—'} />
      </div>

      {participacao.length > 0 && (
        <div className="bg-base border border-line rounded-2xl p-4 mb-4">
          <span className="text-xs text-muted font-body uppercase tracking-wide">Participação nas despesas</span>
          <div className="mt-3">
            <SplitBar segments={participacao} />
          </div>
        </div>
      )}

      <div className="bg-base border border-line rounded-2xl p-4">
        <span className="text-xs text-muted font-body uppercase tracking-wide">Gastos por categoria</span>
        <div className="mt-3 flex flex-col gap-2">
          {topCategorias.length === 0 && (
            <p className="text-sm text-muted font-body">Nenhuma despesa lançada ainda.</p>
          )}
          {topCategorias.map(([nome, valor]) => (
            <div key={nome} className="flex justify-between items-center">
              <span className="text-sm font-body text-ink">{nome}</span>
              <span className="text-sm font-mono font-nums text-muted">{fmt(valor)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
