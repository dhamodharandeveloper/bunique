import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const res = await api.post('/auth/forgot-password', { email });
    setMsg(res.data.message);
  };
  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon"><i className="bi bi-key"></i></div>
            <h3>Forgot Password</h3>
            <small>We'll help you reset it</small>
          </div>
          {msg && <div className="alert alert-success">{msg}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <button type="submit" className="btn btn-gold mb-3">Send Reset Link</button>
          </form>
          <div className="auth-alt"><Link to="/login">Back to login</Link></div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
