import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, addDoc, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'

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

export async function carregarOrcamentoDoMes(referencia = new Date()) {
  const mesRef = primeiroDiaMes(referencia)
  const fimMes = ultimoDiaMes(referencia)

  const orcamentosSnap = await getDocs(
    query(collection(db, 'orcamentos_mensais'), where('mes_referencia', '==', mesRef))
  )

  let orcamento
  if (!orcamentosSnap.empty) {
    const docSnap = orcamentosSnap.docs[0]
    orcamento = { id: docSnap.id, ...docSnap.data() }
  } else {
    const novoRef = await addDoc(collection(db, 'orcamentos_mensais'), {
      mes_referencia: mesRef,
      receita_planejada_total: 0,
    })
    orcamento = { id: novoRef.id, mes_referencia: mesRef, receita_planejada_total: 0 }
  }

  const categoriasSnap = await getDocs(
    query(collection(db, 'categorias_orcamento'), orderBy('ordem'))
  )
  const categorias = categoriasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const valoresSnap = await getDocs(
    query(collection(db, 'orcamento_categoria_valores'), where('orcamento_mensal_id', '==', orcamento.id))
  )
  const valores = valoresSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const despesasSnap = await getDocs(
    query(collection(db, 'despesas'), where('data', '>=', mesRef), where('data', '<=', fimMes))
  )
  const despesasMes = despesasSnap.docs.map((d) => d.data())

  const contribuicoesSnap = await getDocs(
    query(collection(db, 'metas_contribuicoes'), where('data', '>=', mesRef), where('data', '<=', fimMes))
  )
  const contribuicoesMes = contribuicoesSnap.docs.map((d) => d.data())

  const linhas = categorias.map((cat) => {
    const valorPlanejado = valores.find((v) => v.categoria_orcamento_id === cat.id)?.valor_planejado || 0

    const valorGasto = cat.tipo === 'gasto'
      ? despesasMes.filter((d) => d.categoria_id === cat.categoria_despesa_id)
          .reduce((s, d) => s + Number(d.valor), 0)
      : contribuicoesMes.filter((c) => c.meta_id === cat.meta_id)
          .reduce((s, c) => s + Number(c.valor), 0)

    return {
      id: cat.id,
      nome: cat.nome,
      tipo: cat.tipo,
      referenciaNome: cat.referencia_nome || '',
      categoria_despesa_id: cat.categoria_despesa_id,
      meta_id: cat.meta_id,
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
  const valoresSnap = await getDocs(
    query(
      collection(db, 'orcamento_categoria_valores'),
      where('orcamento_mensal_id', '==', orcamentoMensalId),
      where('categoria_orcamento_id', '==', categoriaOrcamentoId)
    )
  )
  if (!valoresSnap.empty) {
    await updateDoc(doc(db, 'orcamento_categoria_valores', valoresSnap.docs[0].id), { valor_planejado: valor })
  } else {
    await addDoc(collection(db, 'orcamento_categoria_valores'), {
      orcamento_mensal_id: orcamentoMensalId,
      categoria_orcamento_id: categoriaOrcamentoId,
      valor_planejado: valor,
    })
  }
}

export async function definirReceitaPlanejada(orcamentoMensalId, valor) {
  await updateDoc(doc(db, 'orcamentos_mensais', orcamentoMensalId), { receita_planejada_total: valor })
}

export async function historicoCategoria(categoria, referencia = new Date()) {
  const mesRef = primeiroDiaMes(referencia)
  const fimMes = ultimoDiaMes(referencia)

  if (categoria.tipo === 'gasto') {
    const snap = await getDocs(
      query(
        collection(db, 'despesas'),
        where('categoria_id', '==', categoria.categoria_despesa_id),
        where('data', '>=', mesRef),
        where('data', '<=', fimMes)
      )
    )
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.data < b.data ? 1 : -1))
  }

  const snap = await getDocs(
    query(
      collection(db, 'metas_contribuicoes'),
      where('meta_id', '==', categoria.meta_id),
      where('data', '>=', mesRef),
      where('data', '<=', fimMes)
    )
  )
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.data < b.data ? 1 : -1))
}
