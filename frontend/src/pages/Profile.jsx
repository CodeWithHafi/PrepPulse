// pages/Profile.jsx
import { useEffect, useState } from 'react';
import { profileAPI } from '../services/api';
import { useAuth }    from '../context/AuthContext';
import { useToast }   from '../context/ToastContext';

const today = new Date().toISOString().split('T')[0];

export default function Profile() {
  const { updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ name: '', exam_name: '', exam_date: '' });
  const [saving, setSaving] = useState(false);

  // Password change
  const [pwForm,  setPwForm]  = useState({ current_password: '', new_password: '', confirm_new: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await profileAPI.get();
        setProfile(res.user);
        setForm({ name: res.user.name, exam_name: res.user.exam_name, exam_date: res.user.exam_date });
      } catch (err) {
        toast.error('Failed to load profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await profileAPI.update({
        name:      form.name.trim(),
        exam_name: form.exam_name.trim(),
        exam_date: form.exam_date,
      });
      setProfile(res.user);
      updateUser({ name: res.user.name, exam_name: res.user.exam_name, exam_date: res.user.exam_date });
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = () => {
    const e = {};
    if (!pwForm.current_password) e.current_password = 'Current password is required';
    if (!pwForm.new_password)     e.new_password = 'New password is required';
    else if (pwForm.new_password.length < 8) e.new_password = 'Minimum 8 characters';
    if (pwForm.new_password !== pwForm.confirm_new) e.confirm_new = 'Passwords do not match';
    return e;
  };

  const handlePasswordChange = async () => {
    const errs = validatePassword();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwSaving(true);
    try {
      await profileAPI.update({
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      });
      setPwForm({ current_password: '', new_password: '', confirm_new: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading profile…</span>
    </div>
  );

  if (!profile) return null;

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const examDate = new Date(profile.exam_date + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="fade-in-up">
      <h1 className="page-title">Profile</h1>

      {/* Avatar + overview */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width:          72,
            height:         72,
            borderRadius:   '50%',
            background:     'linear-gradient(135deg, var(--primary), var(--secondary))',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontFamily:     'var(--font-display)',
            fontSize:       '28px',
            fontWeight:     '800',
            color:          '#fff',
            flexShrink:     0,
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800' }}>
              {profile.name}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '2px' }}>
              {profile.email}
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{profile.exam_name}</span>
              <span className="badge badge-neutral">Member since {memberSince}</span>
            </div>
          </div>
          {!editing && (
            <button className="btn btn-outline" onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* View / Edit */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: '700', marginBottom: '20px', fontSize: '16px' }}>
          {editing ? '✏️ Edit Profile' : '📋 Profile Details'}
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Exam Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.exam_name}
                  onChange={(e) => setForm((p) => ({ ...p, exam_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Exam Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.exam_date}
                  min={today}
                  onChange={(e) => setForm((p) => ({ ...p, exam_date: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? '⏳ Saving…' : '💾 Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setForm({ name: profile.name, exam_name: profile.exam_name, exam_date: profile.exam_date }); }} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Full Name',  value: profile.name      },
              { label: 'Email',      value: profile.email     },
              { label: 'Exam Name',  value: profile.exam_name },
              { label: 'Exam Date',  value: examDate          },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{value}</div>
                <div style={{ height: '1px', background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card">
        <div style={{ fontWeight: '700', marginBottom: '20px', fontSize: '16px' }}>🔒 Change Password</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'current_password', label: 'Current Password', placeholder: 'Your current password' },
            { key: 'new_password',     label: 'New Password',     placeholder: 'Min. 8 characters'     },
            { key: 'confirm_new',      label: 'Confirm New',      placeholder: 'Repeat new password'   },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input
                type="password"
                className={`form-input${pwErrors[key] ? ' error' : ''}`}
                placeholder={placeholder}
                value={pwForm[key]}
                onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
              />
              {pwErrors[key] && <span className="form-error">{pwErrors[key]}</span>}
            </div>
          ))}
          <button
            onClick={handlePasswordChange}
            disabled={pwSaving}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {pwSaving ? '⏳ Changing…' : '🔒 Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
