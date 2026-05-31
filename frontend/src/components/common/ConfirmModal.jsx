// components/common/ConfirmModal.jsx
export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position:   'fixed',
      inset:       0,
      background:  'rgba(0,0,0,.45)',
      zIndex:      1000,
      display:     'flex',
      alignItems:  'center',
      justifyContent: 'center',
      padding:     '16px',
      animation:   'fadeInUp .2s ease',
    }}>
      <div style={{
        background:    'var(--surface)',
        borderRadius:  'var(--radius-xl)',
        padding:       '32px',
        width:         '100%',
        maxWidth:      '400px',
        boxShadow:     'var(--shadow-lg)',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '28px', lineHeight: '1.6' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-danger"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
