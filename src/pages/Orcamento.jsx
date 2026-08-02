import { useEffect, useState } from 'react'
import { carregarOrcamentoDoMes, definirValorPlanejado, definirReceitaPlanejada } from '../services/orcamentoService'
import BudgetCategoryCard from '../components/BudgetCategoryCard'
import Card from '../components/Card'
import CategoriaFicha from './CategoriaFicha'

const fmt = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const mesLabel = (d) => d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

export default function Orcamento() {
  const [referencia] = useState(new Date())
  const [dados, setDados] = useState(null)
  const [categoriaAberta, setCategoriaAberta] = useState(null)
  const [editandoReceita, setEditandoReceita] = useState(false)
  const [receitaInput, setReceitaInput] = useState('')

  const carregar = async () => {
    const d = await carregarOrcamentoDoMes(referencia)
    setDados(d)
    setReceitaInput(String(d.resumo.receitaPlanejada))
  }

  useEffect(() => { carregar() }, [])

  const salvarValorPlanejado = async (categoriaOrcamentoId, valor) => {
    await definirValorPlanejado(dados.orcamento.id, categoriaOrcamentoId, Number(valor) || 0)
    carregar()
  }

  const salvarReceita = async () => {
    await definirReceitaPlanejada(dados.orcamento.id, Number(receitaInput) || 0)
    setEditandoReceita(false)
    carregar()
  }

  if (!dados) {
    return <div className="min-h-screen flex items-center justify-center text-muted font-body">Carregando…</div>
  }

  if (categoriaAberta) {
    return (
      <CategoriaFicha
        linha={categoriaAberta}
        referencia={referencia}
        onVoltar={() => { setCategoriaAberta(null); carregar() }}
        onSalvarPlanejado={salvarValorPlanejado}
      />
    )
  }

  const { resumo, linhas } = dados

  return (
    <div className="min-h-screen bg-soft px-4 pt-6 pb-24">
      <h1 className="font-display text-xl font-semibold text-ink capitalize">{mesLabel(referencia)}</h1>
      <p className="text-muted text-sm font-body mb-4">Orçamento Base Zero</p>

      <div className="bg-base border border-line rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted font-body uppercase tracking-wide">Receita planejada do mês</span>
          {!editandoReceita && (
            <button onClick={() => setEditandoReceita(true)} className="text-xs text-petroleo font-body">Editar</button>
          )}
        </div>
        {editandoReceita ? (
          <div className="flex gap-2 mt-1">
            <input
              type="number" step="0.01" value={receitaInput}
              onChange={(e) => setReceitaInput(e.target.value)}
              className="flex-1 border border-line rounded-lg px-3 py-2 text-sm font-mono"
              autoFocus
            />
            <button onClick={salvarReceita} className="bg-verde text-white rounded-lg px-4 text-sm font-body">Salvar</button>
          </div>
        ) : (
          <span className="text-2xl font-mono font-nums text-ink">{fmt(resumo.receitaPlanejada)}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card label="Ainda não alocado" value={fmt(resumo.naoAlocado)} accent={resumo.naoAlocado < 0 ? 'alerta' : 'verde'} />
        <Card label="Saldo do orçamento" value={fmt(resumo.saldoRestante)} accent={resumo.saldoRestante < 0 ? 'alerta' : 'petroleo'} />
        <Card label="Economizado" value={fmt(resumo.economizado)} accent="verde" />
        <Card label="Acima do planejado" value={fmt(resumo.gastoAcimaDoPlanejado)} accent={resumo.gastoAcimaDoPlanejado > 0 ? 'alerta' : 'petroleo'} />
      </div>

      <span className="text-xs text-muted font-body uppercase tracking-wide">Categorias</span>
      <div className="flex flex-col gap-2 mt-2">
        {linhas.length === 0 && (
          <p className="text-sm text-muted font-body text-center py-8">
            Nenhuma categoria de orçamento configurada ainda. Rode o seed_orcamento.sql no Supabase.
          </p>
        )}
        {linhas.map((linha) => (
          <BudgetCategoryCard key={linha.id} linha={linha} onClick={() => setCategoriaAberta(linha)} />
        ))}
      </div>
    </div>
  )
}
