import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [valid, setValid] = useState(true);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) { setValid(false); setChecked(true); return; }
    api.get('/auth/reset-password/validate', { params: { token, email } })
      .then(res => { setValid(res.data.success); setMsg(res.data.success ? '' : res.data.message); })
      .catch(() => setValid(false))
      .finally(() => setChecked(true));
  }, [token, email]);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setMsg('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setMsg('Passwords do not match.'); return; }
    const res = await api.post('/auth/reset-password', { token, email, password });
    setMsg(res.data.message);
    if (res.data.success) setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon"><i className="bi bi-shield-lock"></i></div>
            <h3>Reset Password</h3>
            <small>Choose a new password</small>
          </div>
          {msg && <div className={`alert ${valid ? 'alert-info' : 'alert-warning'}`}>{msg}</div>}
          {!checked ? (
            <p className="text-center text-muted mb-0">Checking reset link...</p>
          ) : !valid ? (
            <>
              <Link to="/forgot-password" className="btn btn-gold w-100">Request New Link</Link>
            </>
          ) : (
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
              </div>
              <div className="mb-4">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
              </div>
              <button type="submit" className="btn btn-gold mb-3">Update Password</button>
            </form>
          )}
          <div className="auth-alt"><Link to="/login">Back to login</Link></div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
