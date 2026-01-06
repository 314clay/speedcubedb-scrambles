import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { to: '/', label: 'Train' },
    { to: '/srs', label: 'SRS' },
    { to: '/stats', label: 'Stats' },
  ];

  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Cross Planning Trainer</h1>
      <nav className="flex gap-2">
        {navItems.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 rounded-lg transition-colors ${
              path === to
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
