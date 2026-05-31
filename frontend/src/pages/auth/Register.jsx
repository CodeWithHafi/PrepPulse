// pages/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth }  from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const today = new Date().toISOString().split('T')[0];

export default function Register() {
  const navigate = useNavigate();
  const { login }  = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    exam_name: '', exam_date: '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())             e.name = 'Name is required';
    if (!form.email)                   e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password)                e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.exam_name.trim())        e.exam_name = 'Exam name is required';
    if (!form.exam_date)               e.exam_date = 'Exam date is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await authAPI.register(form);
      login(data.user, data.token);
      toast.success('Account created! Welcome to PrepPulse 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-input${errors[key] ? ' error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        min={type === 'date' ? today : undefined}
      />
      {errors[key] && <span className="form-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">PrepPulse</div>
        <div className="auth-tagline">Every Day Counts.</div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start tracking your exam preparation today</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {field('name',            'Full Name',       'text',     'Your name')}
          {field('email',           'Email',           'email',    'you@example.com')}
          {field('password',        'Password',        'password', 'Min. 8 characters')}
          {field('confirmPassword', 'Confirm Password','password', 'Repeat password')}

          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Exam Name</label>
              <input
                type="text"
                className={`form-input${errors.exam_name ? ' error' : ''}`}
                placeholder="e.g. JEE Main"
                value={form.exam_name}
                onChange={(e) => set('exam_name', e.target.value)}
              />
              {errors.exam_name && <span className="form-error">{errors.exam_name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Exam Date</label>
              <input
                type="date"
                className={`form-input${errors.exam_date ? ' error' : ''}`}
                value={form.exam_date}
                onChange={(e) => set('exam_date', e.target.value)}
                min={today}
              />
              {errors.exam_date && <span className="form-error">{errors.exam_date}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '4px' }}
          >
            {loading ? '⏳ Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
