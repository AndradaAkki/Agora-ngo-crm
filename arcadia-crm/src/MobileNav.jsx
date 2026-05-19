import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Calendar, Building2, Settings } from 'lucide-react';

function MobileNav({ currentUser }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { icon: Home, path: '/', title: 'Home' },
    { icon: LayoutDashboard, path: '/dashboard', title: 'Dashboard' },
    { icon: Calendar, path: '/stats', title: 'Events & Stats' },
    ...(currentUser?.role !== 'General CD'
      ? [{ icon: Building2, path: '/firms', title: 'My Firms' }]
      : []),
    { icon: Settings, path: '/profile', title: 'Profile' },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map(({ icon: Icon, path, title }) => {
        const isActive =
          path === '/' ? pathname === '/' : pathname.startsWith(path);
        return (
          <button
            key={path}
            className={`mobile-nav-item${isActive ? ' active' : ''}`}
            onClick={() => navigate(path)}
            title={title}
          >
            <Icon size={22} />
          </button>
        );
      })}
    </nav>
  );
}

export default MobileNav;
