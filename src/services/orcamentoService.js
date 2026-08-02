import { supabase } from '../lib/supabaseClient'

// Limites do indicador visual — únicos, para não divergir entre telas
export const LIMITES = { verde: 0.8, amarelo: 1.0 }

export function statusCor(valorPlanejado, valorGasto) {
  if (!valorPlanejado || valorPlanejado <= 0) return 'sem_planejamento'
  const pct = valorGasto / valorPlanejado
  if (pct > LIMITES.amarelo) return 'vermelho'
  if (pct >= LIMITES.verde) return 'amarelo'
  return 'verde'
}

function primeiroDiaMes(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10)
}

function ultimoDiaMes(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10)
}

// Busca (ou cria) o orçamento do mês, as categorias configuradas, os valores
// planejados e calcula a execução real lendo direto de `despesas` e
// `metas_contribuicoes` — nunca duplicando dado em nova tabela.
export async function carregarOrcamentoDoMes(referencia = new Date()) {
  const mesRef = primeiroDiaMes(referencia)
  const fimMes = ultimoDiaMes(referencia)

  let { data: orcamento } = await supabase
    .from('orcamentos_mensais')
    .select('*')
    .eq('mes_referencia', mesRef)
    .maybeSingle()

  if (!orcamento) {
    const { data: novo } = await supabase
      .from('orcamentos_mensais')
      .insert([{ mes_referencia: mesRef, receita_planejada_total: 0 }])
      .select()
      .single()
    orcamento = novo
  }

  const { data: categorias } = await supabase
    .from('categorias_orcamento')
    .select('*, categorias_despesa(nome), metas(nome, valor_atual, valor_alvo)')
    .order('ordem')

  const { data: valores } = await supabase
    .from('orcamento_categoria_valores')
    .select('*')
    .eq('orcamento_mensal_id', orcamento.id)

  const { data: despesasMes } = await supabase
    .from('despesas')
    .select('categoria_id, valor')
    .gte('data', mesRef)
    .lte('data', fimMes)

  const { data: contribuicoesMes } = await supabase
    .from('metas_contribuicoes')
    .select('meta_id, valor')
    .gte('data', mesRef)
    .lte('data', fimMes)

  const linhas = (categorias || []).map((cat) => {
    const valorPlanejado = valores?.find((v) => v.categoria_orcamento_id === cat.id)?.valor_planejado || 0

    const valorGasto = cat.tipo === 'gasto'
      ? (despesasMes || []).filter((d) => d.categoria_id === cat.categoria_despesa_id)
          .reduce((s, d) => s + Number(d.valor), 0)
      : (contribuicoesMes || []).filter((c) => c.meta_id === cat.meta_id)
          .reduce((s, c) => s + Number(c.valor), 0)

    return {
      id: cat.id,
      nome: cat.nome,
      tipo: cat.tipo,
      referenciaNome: cat.categorias_despesa?.nome || cat.metas?.nome,
      valorPlanejado,
      valorGasto,
      saldoRestante: valorPlanejado - valorGasto,
      percentualUsado: valorPlanejado > 0 ? valorGasto / valorPlanejado : 0,
      cor: statusCor(valorPlanejado, valorGasto),
    }
  })

  const totalPlanejado = linhas.reduce((s, l) => s + l.valorPlanejado, 0)
  const totalGasto = linhas.reduce((s, l) => s + l.valorGasto, 0)

  return {
    orcamento,
    linhas,
    resumo: {
      receitaPlanejada: Number(orcamento.receita_planejada_total),
      totalPlanejado,
      totalGasto,
      saldoRestante: totalPlanejado - totalGasto,
      naoAlocado: Number(orcamento.receita_planejada_total) - totalPlanejado,
      economizado: Math.max(0, totalPlanejado - totalGasto),
      gastoAcimaDoPlanejado: Math.max(0, totalGasto - totalPlanejado),
    },
  }
}

export async function definirValorPlanejado(orcamentoMensalId, categoriaOrcamentoId, valor) {
  return supabase
    .from('orcamento_categoria_valores')
    .upsert(
      { orcamento_mensal_id: orcamentoMensalId, categoria_orcamento_id: categoriaOrcamentoId, valor_planejado: valor },
      { onConflict: 'orcamento_mensal_id,categoria_orcamento_id' }
    )
}

export async function definirReceitaPlanejada(orcamentoMensalId, valor) {
  return supabase
    .from('orcamentos_mensais')
    .update({ receita_planejada_total: valor })
    .eq('id', orcamentoMensalId)
}

// Histórico de lançamentos de uma categoria específica (ficha da categoria)
export async function historicoCategoria(categoria, referencia = new Date()) {
  const mesRef = primeiroDiaMes(referencia)
  const fimMes = ultimoDiaMes(referencia)

  if (categoria.tipo === 'gasto') {
    const { data } = await supabase
      .from('despesas')
      .select('*')
      .eq('categoria_id', categoria.categoria_despesa_id)
      .gte('data', mesRef).lte('data', fimMes)
      .order('data', { ascending: false })
    return data || []
  }
  const { data } = await supabase
    .from('metas_contribuicoes')
    .select('*')
    .eq('meta_id', categoria.meta_id)
    .gte('data', mesRef).lte('data', fimMes)
    .order('data', { ascending: false })
  return data || []
}
