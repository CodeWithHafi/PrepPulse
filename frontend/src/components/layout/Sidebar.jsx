// components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: '🏠', label: 'Dashboard'     },
  { to: '/tasks',         icon: '✅', label: 'Tasks'          },
  { to: '/study-tracker', icon: '📚', label: 'Study Tracker'  },
  { to: '/analytics',     icon: '📊', label: 'Analytics'      },
  { to: '/profile',       icon: '👤', label: 'Profile'        },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      position:   'fixed',
      top:        0,
      left:       0,
      width:      'var(--sidebar-w)',
      height:     '100dvh',
      background: 'var(--surface)',
      borderRight:'1px solid var(--border)',
      display:    'flex',
      flexDirection: 'column',
      padding:    '28px 16px 24px',
      zIndex:     100,
      boxShadow:  'var(--shadow-sm)',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', padding: '0 8px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize:   '22px',
          fontWeight: '800',
          color:      'var(--primary)',
          letterSpacing: '-0.5px',
        }}>
          PrepPulse
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px', fontWeight: 500 }}>
          Every Day Counts.
        </div>
      </div>

      {/* User mini card */}
      {user && (
        <div style={{
          background:    'var(--primary-bg)',
          borderRadius:  'var(--radius)',
          padding:       '12px 14px',
          marginBottom:  '20px',
          border:        '1px solid rgba(37,99,235,.1)',
        }}>
          <div style={{
            fontSize:   '13px',
            fontWeight: '700',
            color:      'var(--text)',
            whiteSpace: 'nowrap',
            overflow:   'hidden',
            textOverflow: 'ellipsis',
          }}>{user.name}</div>
          <div style={{
            fontSize:    '12px',
            color:       'var(--primary)',
            fontWeight:  '600',
            marginTop:   '2px',
            whiteSpace:  'nowrap',
            overflow:    'hidden',
            textOverflow:'ellipsis',
          }}>{user.exam_name}</div>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display:       'flex',
              alignItems:    'center',
              gap:           '12px',
              padding:       '10px 14px',
              borderRadius:  'var(--radius)',
              fontSize:      '14px',
              fontWeight:    isActive ? '700' : '500',
              color:         isActive ? 'var(--primary)' : 'var(--text-2)',
              background:    isActive ? 'var(--primary-bg)' : 'transparent',
              transition:    'var(--transition)',
              textDecoration: 'none',
            })}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '12px',
          padding:      '10px 14px',
          borderRadius: 'var(--radius)',
          fontSize:     '14px',
          fontWeight:   '500',
          color:        'var(--danger)',
          background:   'transparent',
          transition:   'var(--transition)',
          width:        '100%',
          textAlign:    'left',
          marginTop:    '8px',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: '18px', lineHeight: 1 }}>🚪</span>
        Logout
      </button>
    </aside>
  );
}
