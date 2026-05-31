// pages/StudyTracker.jsx
import { useEffect, useState } from 'react';
import { sessionsAPI } from '../services/api';
import { useToast }    from '../context/ToastContext';
import ConfirmModal    from '../components/common/ConfirmModal';

const today = new Date().toISOString().split('T')[0];

function duration(h, m) {
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '0m';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// Group sessions by date
function groupByDate(sessions) {
  const groups = {};
  for (const s of sessions) {
    const d = s.session_date || s.created_at?.split('T')[0];
    if (!groups[d]) groups[d] = [];
    groups[d].push(s);
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function StudyTracker() {
  const toast = useToast();

  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form, setForm] = useState({
    subject_name: '', study_hours: '0', study_minutes: '30', session_date: today,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await sessionsAPI.list();
        setSessions(res.sessions);
      } catch (err) {
        toast.error('Failed to load sessions: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject_name.trim()) { toast.error('Subject name is required'); return; }
    if (Number(form.study_hours) === 0 && Number(form.study_minutes) === 0) {
      toast.error('Study duration must be at least 1 minute'); return;
    }
    setSubmitting(true);
    try {
      const res = await sessionsAPI.create({
        subject_name:  form.subject_name.trim(),
        study_hours:   Number(form.study_hours),
        study_minutes: Number(form.study_minutes),
        session_date:  form.session_date,
      });
      setSessions((p) => [res.session, ...p]);
      setForm((p) => ({ ...p, subject_name: '', study_hours: '0', study_minutes: '30' }));
      toast.success('Study session logged! 📚');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await sessionsAPI.remove(deleteId);
      setSessions((p) => p.filter((s) => s.id !== deleteId));
      toast.success('Session deleted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Total stats
  const totalMinAll = sessions.reduce(
    (acc, s) => acc + Number(s.study_hours) * 60 + Number(s.study_minutes), 0
  );
  const totalH = Math.floor(totalMinAll / 60);
  const totalM = totalMinAll % 60;

  const grouped = groupByDate(sessions);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading sessions…</span>
    </div>
  );

  return (
    <div className="fade-in-up">
      <h1 className="page-title">Study Tracker</h1>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Hours',    value: `${totalH}h ${totalM}m`, icon: '⏱' },
          { label: 'Total Sessions', value: sessions.length,          icon: '📅' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '16px 24px',
            border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <span style={{ fontSize: '28px' }}>{icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '3px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.3px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Log form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>
          📝 Log Study Session
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Physics"
                value={form.subject_name}
                onChange={(e) => setForm((p) => ({ ...p, subject_name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={form.session_date}
                max={today}
                onChange={(e) => setForm((p) => ({ ...p, session_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Hours (0–24)</label>
              <input
                type="number"
                className="form-input"
                min="0" max="24"
                value={form.study_hours}
                onChange={(e) => setForm((p) => ({ ...p, study_hours: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Minutes (0–59)</label>
              <input
                type="number"
                className="form-input"
                min="0" max="59"
                value={form.study_minutes}
                onChange={(e) => setForm((p) => ({ ...p, study_minutes: e.target.value }))}
              />
            </div>
          </div>

          {/* Duration preview */}
          <div style={{
            background: 'var(--primary-bg)',
            borderRadius: 'var(--radius)',
            padding: '10px 16px',
            fontSize: '14px',
            color: 'var(--primary)',
            fontWeight: '600',
          }}>
            Duration: {duration(Number(form.study_hours), Number(form.study_minutes))} of {form.subject_name || '…'}
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {submitting ? '⏳ Logging…' : '📚 Log Session'}
          </button>
        </form>
      </div>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">📚</div>
          <h3>No sessions logged yet</h3>
          <p>Log your first study session above to start tracking your progress!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {grouped.map(([date, items]) => {
            const dayMins = items.reduce(
              (a, s) => a + Number(s.study_hours) * 60 + Number(s.study_minutes), 0
            );
            return (
              <div key={date}>
                <div style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  marginBottom:   '10px',
                }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-2)' }}>
                    {formatDate(date + 'T00:00:00')}
                  </div>
                  <span className="badge badge-primary">
                    {duration(Math.floor(dayMins / 60), dayMins % 60)} total
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((s) => (
                    <div key={s.id} className="card" style={{
                      display:    'flex',
                      alignItems: 'center',
                      gap:        '14px',
                      padding:    '14px 20px',
                    }}>
                      <div className="icon-box" style={{ background: 'var(--primary-bg)' }}>
                        📖
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{s.subject_name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>
                          {duration(s.study_hours, s.study_minutes)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-primary">
                          {duration(s.study_hours, s.study_minutes)}
                        </span>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="btn btn-danger btn-sm"
                        >🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="Delete Session"
          message="Delete this study session? This may affect your streak data."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
