import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) { navigate('/'); return; }
    try {
      const adminRes = await api.post('/admin/auth/login', { email, password });
      if (adminRes.data.success) {
        localStorage.setItem('token', adminRes.data.token);
        localStorage.setItem('admin', JSON.stringify(adminRes.data.admin));
        navigate('/admin');
        return;
      }
    } catch (err) { /* ignore */ }
    setError('Invalid email or password.');
  };

  return (
    <>
      <section className="auth-page">
        <div className="container">
          <div className="auth-card">
            <div className="auth-brand">
              <div className="brand-icon"><i className="bi bi-person-circle"></i></div>
              <h3>Welcome Back</h3>
              <small>Login to B.unique</small>
            </div>
            {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
            <form onSubmit={submit} noValidate>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="mb-1">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input type={show ? 'text' : 'password'} className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                  <button type="button" className="btn btn-eye" onClick={() => setShow(!show)}><i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`}></i></button>
                </div>
              </div>
              <div className="auth-footer-links mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} id="remember" />
                  <label className="form-check-label" htmlFor="remember">Remember me</label>
                </div>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <button type="submit" className="btn btn-gold mb-3">Login to My Account</button>
            </form>
            <div className="auth-alt">New to B.unique? <Link to="/register">Create an account</Link></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
