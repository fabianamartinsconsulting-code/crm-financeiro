import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Início' },
  { to: '/orcamento', label: 'Orçamento' },
  { to: '/receitas', label: 'Receitas' },
  { to: '/despesas', label: 'Despesas' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base border-t border-line flex justify-around py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `text-xs font-body px-4 py-1.5 rounded-full transition-colors ${
              isActive ? 'bg-verde-soft text-verde font-medium' : 'text-muted'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
