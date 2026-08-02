import { useEffect, useState } from 'react'
import { historicoCategoria } from '../services/orcamentoService'
import ProgressBar from '../components/ProgressBar'

const fmt = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CategoriaFicha({ linha, referencia, onVoltar, onSalvarPlanejado }) {
  const [historico, setHistorico] = useState([])
  const [valorPlanejado, setValorPlanejado] = useState(String(linha.valorPlanejado))

  useEffect(() => {
    historicoCategoria(linha, referencia).then(setHistorico)
  }, [linha])

  return (
    <div className="min-h-screen bg-soft px-4 pt-6 pb-24">
      <button onClick={onVoltar} className="text-sm text-petroleo font-body mb-3">← Voltar</button>

      <h1 className="font-display text-xl font-semibold text-ink">{linha.nome}</h1>
      <p className="text-muted text-sm font-body mb-4">
        {linha.tipo === 'gasto' ? 'Categoria de gasto' : 'Alocação para meta'}
      </p>

      <div className="bg-base border border-line rounded-2xl p-4 mb-4">
        <span className="text-xs text-muted font-body uppercase tracking-wide">Valor planejado este mês</span>
        <div className="flex gap-2 mt-1">
          <input
            type="number" step="0.01" value={valorPlanejado}
            onChange={(e) => setValorPlanejado(e.target.value)}
            className="flex-1 border border-line rounded-lg px-3 py-2 text-sm font-mono"
          />
          <button
            onClick={() => onSalvarPlanejado(linha.id, valorPlanejado)}
            className="bg-verde text-white rounded-lg px-4 text-sm font-body"
          >
            Salvar
          </button>
        </div>

        <div className="mt-4">
          <ProgressBar percentual={linha.percentualUsado} cor={linha.cor} height={10} />
          <div className="flex justify-between mt-2 text-xs font-body text-muted">
            <span>Gasto: <span className="font-mono">{fmt(linha.valorGasto)}</span></span>
            <span>Restante: <span className="font-mono">{fmt(linha.saldoRestante)}</span></span>
          </div>
        </div>
      </div>

      <span className="text-xs text-muted font-body uppercase tracking-wide">Lançamentos do mês</span>
      <div className="flex flex-col gap-2 mt-2">
        {historico.length === 0 && (
          <p className="text-sm text-muted font-body text-center py-8">Nenhum lançamento nesta categoria ainda.</p>
        )}
        {historico.map((item) => (
          <div key={item.id} className="bg-base border border-line rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-body text-ink">{item.nome || 'Contribuição'}</p>
              <p className="text-xs text-muted font-body">{new Date(item.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <span className="text-sm font-mono font-nums text-ink">{fmt(item.valor)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
