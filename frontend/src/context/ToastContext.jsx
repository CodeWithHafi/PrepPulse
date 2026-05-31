// context/ToastContext.jsx
// Global toast notification system

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Convenience helpers
  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error',   dur),
    info:    (msg, dur) => addToast(msg, 'info',     dur),
    warning: (msg, dur) => addToast(msg, 'warning',  dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

/* ── Toast Container ───────────────────────────────────────── */
const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
const COLORS = {
  success: { bg: 'var(--success-bg)',  border: 'var(--success)', color: '#15803d' },
  error:   { bg: 'var(--danger-bg)',   border: 'var(--danger)',  color: '#dc2626' },
  info:    { bg: 'var(--primary-bg)',  border: 'var(--primary)', color: 'var(--primary)' },
  warning: { bg: 'var(--warning-bg)',  border: 'var(--warning)', color: '#b45309' },
};

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position:  'fixed',
      top:       '20px',
      right:     '20px',
      zIndex:    9999,
      display:   'flex',
      flexDirection: 'column',
      gap:       '10px',
      maxWidth:  '360px',
      width:     'calc(100vw - 40px)',
    }}>
      {toasts.map((t) => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div
            key={t.id}
            onClick={() => onRemove(t.id)}
            style={{
              display:      'flex',
              alignItems:   'flex-start',
              gap:          '10px',
              background:   c.bg,
              border:       `1.5px solid ${c.border}`,
              borderRadius: 'var(--radius)',
              padding:      '12px 16px',
              color:        c.color,
              fontSize:     '14px',
              fontWeight:   '500',
              boxShadow:    'var(--shadow)',
              cursor:       'pointer',
              animation:    'fadeInUp .25s ease',
              lineHeight:   '1.5',
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>
              {ICONS[t.type]}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
