// components/layout/BottomNav.jsx
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: '🏠', label: 'Home'      },
  { to: '/tasks',         icon: '✅', label: 'Tasks'      },
  { to: '/study-tracker', icon: '📚', label: 'Study'      },
  { to: '/analytics',     icon: '📊', label: 'Analytics'  },
  { to: '/profile',       icon: '👤', label: 'Profile'    },
];

export default function BottomNav() {
  return (
    <nav style={{
      position:   'fixed',
      bottom:     0,
      left:       0,
      right:      0,
      height:     'var(--bottom-nav-h)',
      background: 'var(--surface)',
      borderTop:  '1px solid var(--border)',
      display:    'flex',
      alignItems: 'stretch',
      zIndex:     100,
      boxShadow:  '0 -4px 16px rgba(0,0,0,.06)',
    }}>
      {NAV_ITEMS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            flex:           1,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '3px',
            fontSize:       '10px',
            fontWeight:     isActive ? '700' : '500',
            color:          isActive ? 'var(--primary)' : 'var(--text-3)',
            textDecoration: 'none',
            transition:     'var(--transition)',
          })}
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
