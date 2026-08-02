export default function Card({ label, value, sub, accent = 'verde' }) {
  const accentColor = accent === 'verde' ? 'text-verde' : accent === 'petroleo' ? 'text-petroleo' : 'text-alerta'
  return (
    <div className="bg-base border border-line rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-xs text-muted font-body uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-mono font-nums ${accentColor}`}>{value}</span>
      {sub && <span className="text-xs text-muted font-body">{sub}</span>}
    </div>
  )
}
