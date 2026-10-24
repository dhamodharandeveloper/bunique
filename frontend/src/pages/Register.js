import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const score = () => {
    const v = form.password; let s = 0;
    if (v.length >= 6) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^a-zA-Z0-9]/.test(v) && v.length >= 8) s++;
    return s;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = [];
    if (form.name.length < 3) errs.push('Please enter your full name (min 3 characters).');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.push('Please enter a valid email address.');
    if (form.password.length < 6) errs.push('Password must be at least 6 characters.');
    if (form.password !== form.confirm_password) errs.push('Passwords do not match.');
    setErrors(errs);
    if (errs.length) return;
    const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (res.success) {
      navigate('/verify-email');
    } else {
      setErrors([res.message]);
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon"><i className="bi bi-person-plus"></i></div>
            <h3>Create Account</h3>
            <small>Join B.unique</small>
          </div>
          {errors.length > 0 && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <ul className="mb-0 ps-3">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input type={show ? 'text' : 'password'} className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" required />
                <button type="button" className="btn btn-eye" onClick={() => setShow(!show)}><i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`}></i></button>
              </div>
              <div className="pw-meter">{[0,1,2,3].map(i => <span key={i} className={i < score() ? `on-${score()}` : ''}></span>)}</div>
              <div className="pw-hint">{score() < 1 ? 'Weak password.' : score() < 3 ? 'Getting better...' : 'Strong password!'}</div>
            </div>
            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <input type={show ? 'text' : 'password'} className="form-control" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} placeholder="Repeat password" required />
              </div>
            </div>
            <button type="submit" className="btn btn-gold mb-3">Create My Account</button>
          </form>
          <div className="auth-alt">Already have an account? <Link to="/login">Login here</Link></div>
        </div>
      </div>
    </section>
  );
};

export default Register;
