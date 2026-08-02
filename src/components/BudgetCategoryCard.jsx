import ProgressBar from './ProgressBar'

const fmt = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const RÓTULO_COR = {
  verde: 'Dentro do planejado',
  amarelo: 'Atenção',
  vermelho: 'Acima do planejado',
  sem_planejamento: 'Sem valor definido',
}

export default function BudgetCategoryCard({ linha, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-base border border-line rounded-2xl p-4 flex flex-col gap-2"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-body font-medium text-ink">{linha.nome}</p>
          <p className="text-xs text-muted font-body">{RÓTULO_COR[linha.cor]}</p>
        </div>
        <span className="text-sm font-mono font-nums text-ink">
          {fmt(linha.valorGasto)} <span className="text-muted">/ {fmt(linha.valorPlanejado)}</span>
        </span>
      </div>
      <ProgressBar percentual={linha.percentualUsado} cor={linha.cor} />
      <div className="flex justify-between">
        <span className="text-xs text-muted font-body">{(linha.percentualUsado * 100).toFixed(0)}% utilizado</span>
        <span className={`text-xs font-mono font-nums ${linha.saldoRestante < 0 ? 'text-alerta' : 'text-muted'}`}>
          {linha.saldoRestante < 0 ? '−' : ''}{fmt(Math.abs(linha.saldoRestante))} {linha.saldoRestante < 0 ? 'acima' : 'restante'}
        </span>
      </div>
    </button>
  )
}
