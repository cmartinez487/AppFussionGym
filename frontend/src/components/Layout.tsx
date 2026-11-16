import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/usuarios', label: 'Usuarios', icon: '👥', end: false },
  { to: '/planes', label: 'Planes', icon: '📋', end: false },
  { to: '/entrenadores', label: 'Entrenadores', icon: '🏋️', end: false },
  { to: '/rutinas', label: 'Rutinas', icon: '📝', end: false },
  { to: '/pagos', label: 'Pagos', icon: '💳', end: false },
];

export default function Layout() {
  const { nombre, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-brand-dark border-r border-white/10 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <img src="/logo.jpeg" alt="Fussion Gym" className="h-12 w-12 rounded-lg object-cover" />
          <div>
            <h1 className="text-brand-yellow font-bold leading-tight">FUSSION GYM</h1>
            <p className="text-xs text-brand-gray">Panel de gestión</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-yellow text-brand-black'
                    : 'text-brand-silver hover:bg-white/5 hover:text-brand-yellow'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-brand-dark border-b border-white/10 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-brand-gray">
            Bienvenido, <span className="text-brand-yellow font-semibold">{nombre ?? 'Admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-lg border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan hover:text-brand-black transition"
          >
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
