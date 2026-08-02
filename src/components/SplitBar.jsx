// Elemento assinatura do app: barra de participação financeira.
// Mostra visualmente, sem ambiguidade, quanto cada pessoa contribuiu —
// o núcleo do propósito do CRM Financeiro Familiar: dados, não percepção.
export default function SplitBar({ segments, height = 10 }) {
  // segments: [{ label, value, color }]
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1

  return (
    <div className="w-full">
      <div
        className="w-full flex rounded-full overflow-hidden"
        style={{ height }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              width: `${(seg.value / total) * 100}%`,
              backgroundColor: seg.color,
            }}
            className="transition-all duration-500 first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-muted font-body">
              {seg.label} · {((seg.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
