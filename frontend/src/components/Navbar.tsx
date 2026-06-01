import { NavLink } from 'react-router-dom';
import { Shirt, Sparkles, CalendarDays } from 'lucide-react';

const links = [
  { to: '/', label: 'Armario', icon: Shirt },
  { to: '/outfits', label: 'Outfits', icon: Sparkles },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <Shirt size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Armario Virtual</span>
        </div>

        <nav className="flex gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
