// pages/Tasks.jsx
import { useEffect, useState } from 'react';
import { tasksAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';

const FILTERS = ['All', 'Pending', 'Completed'];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function Tasks() {
  const toast = useToast();

  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');
  const [newTask, setNewTask]  = useState('');
  const [adding,  setAdding]  = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load tasks
  useEffect(() => {
    (async () => {
      try {
        const res = await tasksAPI.list();
        setTasks(res.tasks);
      } catch (err) {
        toast.error('Failed to load tasks: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Add task
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      const res = await tasksAPI.create({ task_title: newTask.trim() });
      setTasks((p) => [res.task, ...p]);
      setNewTask('');
      toast.success('Task added!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  // Toggle complete
  const toggleComplete = async (task) => {
    const optimistic = tasks.map((t) =>
      t.id === task.id ? { ...t, is_completed: task.is_completed ? 0 : 1 } : t
    );
    setTasks(optimistic);
    try {
      await tasksAPI.update(task.id, { is_completed: !task.is_completed });
    } catch (err) {
      setTasks(tasks); // rollback
      toast.error(err.message);
    }
  };

  // Delete task
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await tasksAPI.remove(deleteId);
      setTasks((p) => p.filter((t) => t.id !== deleteId));
      toast.success('Task deleted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Filtered tasks
  const filtered = tasks.filter((t) => {
    if (filter === 'Completed') return t.is_completed;
    if (filter === 'Pending')   return !t.is_completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const pendingCount   = tasks.length - completedCount;

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading tasks…</span>
    </div>
  );

  return (
    <div className="fade-in-up">
      <h1 className="page-title">Task Manager</h1>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total',     value: tasks.length,  color: 'var(--text)',    bg: 'var(--surface-2)'  },
          { label: 'Pending',   value: pendingCount,   color: '#b45309',        bg: 'var(--warning-bg)' },
          { label: 'Completed', value: completedCount, color: '#15803d',        bg: 'var(--success-bg)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: bg, borderRadius: 'var(--radius)', padding: '12px 20px',
            display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid transparent',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color, lineHeight: 1 }}>
              {value}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: '500' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Add task */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: '700', marginBottom: '14px', fontSize: '15px' }}>➕ Add New Task</div>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Complete Kinematics Notes"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={{ flex: 1 }}
            maxLength={255}
          />
          <button type="submit" disabled={adding || !newTask.trim()} className="btn btn-primary">
            {adding ? '…' : 'Add'}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">📋</div>
          <h3>No {filter !== 'All' ? filter.toLowerCase() : ''} tasks yet</h3>
          <p>
            {filter === 'All'
              ? 'Add your first task to get started!'
              : `No ${filter.toLowerCase()} tasks to show.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((task) => (
            <div
              key={task.id}
              className="card"
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '14px',
                padding:     '16px 20px',
                opacity:     task.is_completed ? .7 : 1,
                transition:  'var(--transition)',
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(task)}
                style={{
                  width:        '22px',
                  height:       '22px',
                  borderRadius: '6px',
                  border:       `2px solid ${task.is_completed ? 'var(--success)' : 'var(--border)'}`,
                  background:   task.is_completed ? 'var(--success)' : 'transparent',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  flexShrink:   0,
                  transition:   'var(--transition)',
                  color:        '#fff',
                  fontSize:     '13px',
                }}
                title={task.is_completed ? 'Mark as pending' : 'Mark as complete'}
              >
                {task.is_completed ? '✓' : ''}
              </button>

              {/* Title */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight:      '600',
                  fontSize:        '15px',
                  textDecoration:  task.is_completed ? 'line-through' : 'none',
                  color:           task.is_completed ? 'var(--text-3)' : 'var(--text)',
                }}>
                  {task.task_title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
                  Added {formatDate(task.created_at)}
                </div>
              </div>

              {/* Badge + Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span className={`badge ${task.is_completed ? 'badge-success' : 'badge-warning'}`}>
                  {task.is_completed ? 'Done' : 'Pending'}
                </span>
                <button
                  onClick={() => setDeleteId(task.id)}
                  className="btn btn-danger btn-sm"
                  title="Delete task"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <ConfirmModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
