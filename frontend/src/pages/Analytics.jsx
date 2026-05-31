// pages/Analytics.jsx
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { analyticsAPI } from '../services/api';
import { useToast }      from '../context/ToastContext';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const chartOptions = (title) => ({
  responsive:          true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor:      '#fff',
      bodyColor:       '#94a3b8',
      borderRadius:    8,
      padding:         10,
      callbacks: {
        label: (ctx) => ` ${ctx.raw} hrs`,
      },
    },
  },
  scales: {
    x: {
      grid:  { display: false },
      ticks: { color: '#94a3b8', font: { size: 12 } },
    },
    y: {
      grid:  { color: '#f1f5f9' },
      ticks: { color: '#94a3b8', font: { size: 12 }, callback: (v) => v + 'h' },
      beginAtZero: true,
    },
  },
});

export default function Analytics() {
  const toast = useToast();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await analyticsAPI.get();
        setData(res.analytics);
      } catch (err) {
        toast.error('Failed to load analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading analytics…</span>
    </div>
  );

  if (!data) return null;

  const {
    total_hours, total_sessions, completed_tasks, total_tasks,
    completion_rate, current_streak, longest_streak, weekly, monthly,
  } = data;

  // Weekly chart data
  const weeklyChart = {
    labels:   weekly.map((w) => w.label),
    datasets: [{
      label:           'Hours',
      data:            weekly.map((w) => w.hours),
      backgroundColor: weekly.map((w) => w.hours > 0 ? 'rgba(37,99,235,.85)' : 'rgba(37,99,235,.15)'),
      borderRadius:    8,
      borderSkipped:   false,
    }],
  };

  // Monthly chart data
  const monthlyChart = {
    labels:   monthly.map((m) => `${m.day}`),
    datasets: [{
      label:           'Hours',
      data:            monthly.map((m) => m.hours),
      fill:            true,
      borderColor:     '#6366f1',
      backgroundColor: 'rgba(99,102,241,.1)',
      tension:         0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius:     4,
    }],
  };

  const stats = [
    { label: 'Total Study Hours',  value: `${total_hours}h`,        icon: '⏱', color: 'var(--primary)',   bg: 'var(--primary-bg)'  },
    { label: 'Total Sessions',     value: total_sessions,             icon: '📅', color: '#6366f1',         bg: '#eef2ff'            },
    { label: 'Completed Tasks',    value: completed_tasks,            icon: '✅', color: 'var(--success)',   bg: 'var(--success-bg)'  },
    { label: 'Completion Rate',    value: `${completion_rate}%`,     icon: '🎯', color: '#f59e0b',          bg: 'var(--warning-bg)'  },
    { label: 'Current Streak',     value: `${current_streak} days`,  icon: '🔥', color: '#ea580c',          bg: '#fff7ed'            },
    { label: 'Longest Streak',     value: `${longest_streak} days`,  icon: '🏆', color: '#0d9488',          bg: '#f0fdfa'            },
  ];

  return (
    <div className="fade-in-up">
      <h1 className="page-title">Analytics</h1>

      {/* Stat cards */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        {stats.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: .08 }}>{icon}</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="stat-label" style={{ marginBottom: '8px' }}>{label}</div>
              <div style={{
                fontFamily:   'var(--font-display)',
                fontSize:     '32px',
                fontWeight:   '800',
                color,
                lineHeight:   1,
                letterSpacing:'-1px',
              }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion progress */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: '700', marginBottom: '16px' }}>Task Completion</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-2)' }}>{completed_tasks} of {total_tasks} tasks completed</span>
          <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{completion_rate}%</span>
        </div>
        <div style={{ height: '12px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height:       '100%',
            width:        `${completion_rate}%`,
            background:   'linear-gradient(90deg, var(--primary), var(--secondary))',
            borderRadius: '99px',
            transition:   'width .8s ease',
          }} />
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Weekly Study Hours</div>
            <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>Last 7 days</div>
          </div>
          <span className="badge badge-primary">
            {weekly.reduce((a, w) => a + w.hours, 0).toFixed(1)}h this week
          </span>
        </div>
        <div style={{ height: '220px' }}>
          <Bar data={weeklyChart} options={chartOptions('Weekly')} />
        </div>
      </div>

      {/* Monthly chart */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Monthly Study Hours</div>
            <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          <span className="badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            {monthly.reduce((a, m) => a + m.hours, 0).toFixed(1)}h this month
          </span>
        </div>
        {monthly.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="icon">📊</div>
            <h3>No data for this month</h3>
            <p>Log study sessions to see your monthly chart.</p>
          </div>
        ) : (
          <div style={{ height: '220px' }}>
            <Line data={monthlyChart} options={chartOptions('Monthly')} />
          </div>
        )}
      </div>
    </div>
  );
}
