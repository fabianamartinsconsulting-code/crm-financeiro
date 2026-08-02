// Mesma linguagem visual do SplitBar (barra arredondada, cor por segmento),
// mas aqui é progresso único: planejado x gasto, com cor por status.
const CORES = {
  verde: '#1B4332',
  amarelo: '#B08900',
  vermelho: '#B3261E',
  sem_planejamento: '#D1D5D0',
}

export default function ProgressBar({ percentual, cor, height = 8 }) {
  const largura = Math.min(percentual, 1) * 100
  return (
    <div className="w-full bg-line rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${largura}%`, backgroundColor: CORES[cor] || CORES.sem_planejamento }}
      />
    </div>
  )
}
