// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth }       from '../context/AuthContext';
import { useToast }      from '../context/ToastContext';

// ── Countdown ring component ────────────────────────────────
function CountdownRing({ days, totalDays }) {
  const pct    = totalDays > 0 ? Math.max(0, Math.min(1, days / totalDays)) : 0;
  const r      = 54;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset .8s ease' }}
      />
    </svg>
  );
}

export default function Dashboard() {
  const { user }  = useAuth();
  const toast = useToast();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardAPI.get();
        setData(res.dashboard);
      } catch (err) {
        toast.error('Failed to load dashboard: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading dashboard…</span>
    </div>
  );

  if (!data) return null;

  const { exam, today_tasks, all_tasks, streak, study } = data;
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const examDateFmt = new Date(exam.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Estimate total days for ring (from exam.days_remaining to 365 as a max reference)
  const totalRef = Math.max(exam.days_remaining, 365);

  return (
    <div className="fade-in-up">
      {/* Welcome */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Top row */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Countdown Card */}
        <div className="card" style={{
          background:    'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color:         '#fff',
          border:        'none',
          position:      'relative',
          overflow:      'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: .1, fontSize: 120 }}>🎯</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, opacity: .8, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>
              Your Exam
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
              {exam.name}
            </div>
            <div style={{ fontSize: '13px', opacity: .8, marginBottom: '20px' }}>{examDateFmt}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <CountdownRing days={exam.days_remaining} totalDays={totalRef} />
                <div style={{
                  position:   'absolute',
                  inset:       0,
                  display:     'flex',
                  flexDirection: 'column',
                  alignItems:  'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', lineHeight: 1 }}>
                    {exam.days_remaining}
                  </div>
                  <div style={{ fontSize: '11px', opacity: .8, marginTop: '2px' }}>days left</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', opacity: .8, marginBottom: '4px' }}>Study prediction</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800' }}>
                  {exam.predicted_hours.toLocaleString()}h
                </div>
                <div style={{ fontSize: '12px', opacity: .7 }}>at 3hrs/day</div>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="icon-box" style={{ background: 'var(--warning-bg)', fontSize: '24px' }}>🔥</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>Study Streak</div>
                <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>Keep the fire burning!</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <div className="stat-label">Current</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: '800', color: '#f59e0b', lineHeight: 1 }}>
                  {streak.current}
                </div>
                <div className="stat-sub">days</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                <div className="stat-label">Longest</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: '800', color: 'var(--text)', lineHeight: 1 }}>
                  {streak.longest}
                </div>
                <div className="stat-sub">days</div>
              </div>
            </div>
            {streak.current === 0 && (
              <div style={{ background: 'var(--warning-bg)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '13px', color: '#92400e' }}>
                💡 Log a study session today to start your streak!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        {[
          { label: "Today's Tasks", value: today_tasks.total,     icon: '📋', color: 'var(--primary-bg)',  accent: 'var(--primary)'  },
          { label: 'Completed',     value: today_tasks.completed,  icon: '✅', color: 'var(--success-bg)',  accent: 'var(--success)'  },
          { label: 'Remaining',     value: today_tasks.remaining,  icon: '⏳', color: 'var(--warning-bg)',  accent: 'var(--warning)'  },
          { label: 'Study Hours',   value: study.total_hours,      icon: '📚', color: 'var(--surface-2)',   accent: 'var(--secondary)'},
        ].map(({ label, value, icon, color, accent }) => (
          <div key={label} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="icon-box" style={{ background: color, marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>{icon}</span>
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color: accent }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Prediction banner */}
      <div className="card" style={{
        background:   'var(--primary-bg)',
        border:       '1px solid rgba(37,99,235,.15)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '36px' }}>💡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>
              Study Time Forecast
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: '1.6' }}>
              If you study <strong>3 hours daily</strong>, you still have{' '}
              <strong style={{ color: 'var(--primary)' }}>
                {exam.predicted_hours.toLocaleString()} study hours
              </strong>{' '}
              available before <strong>{exam.name}</strong>.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/tasks" className="btn btn-primary btn-sm">Add Task</Link>
            <Link to="/study-tracker" className="btn btn-outline btn-sm">Log Study</Link>
          </div>
        </div>
      </div>

      {/* All-time tasks */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '16px' }}>All-time Task Progress</div>
          <Link to="/tasks" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
            View all →
          </Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-2)' }}>{all_tasks.completed} completed</span>
          <span style={{ color: 'var(--text-3)' }}>{all_tasks.total} total</span>
        </div>
        <div style={{ height: '10px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height:     '100%',
            width:      all_tasks.total > 0 ? `${(all_tasks.completed / all_tasks.total) * 100}%` : '0%',
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            borderRadius: '99px',
            transition: 'width .6s ease',
            minWidth:   all_tasks.completed > 0 ? '4px' : 0,
          }} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-3)', textAlign: 'right' }}>
          {all_tasks.total > 0 ? Math.round((all_tasks.completed / all_tasks.total) * 100) : 0}% completion rate
        </div>
      </div>
    </div>
  );
}
