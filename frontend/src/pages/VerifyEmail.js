import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuth();
  const [status, setStatus] = useState(token ? 'loading' : 'pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    api.get('/auth/verify-email', { params: { token } })
      .then(res => {
        setStatus(res.data.success ? 'verified' : 'error');
        setMessage(res.data.message || '');
      })
      .catch(() => {
        setStatus('error');
        setMessage('This verification link is invalid or has expired.');
      });
  }, [token]);

  const verified = status === 'verified';

  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card text-center">
          <div className="auth-brand">
            <div className="brand-icon"><i className={`bi ${verified ? 'bi-check-circle' : 'bi-envelope-check'}`}></i></div>
            <h3>{verified ? 'Email Verified' : status === 'loading' ? 'Verifying...' : 'Verify Your Email'}</h3>
            <small>{verified ? 'Your account is now active.' : `We sent a verification link to ${user?.email || 'your email'}.`}</small>
          </div>
          {status === 'error' && <div className="alert alert-danger">{message}</div>}
          <p className="text-muted">
            {verified ? 'Thank you for verifying your email address. You can now enjoy all features of your account.' : 'Please check your inbox and click the verification link to activate your account.'}
          </p>
          <Link to="/" className="btn btn-gold mb-3">Go to Homepage</Link>
          {!verified && <div className="auth-alt"><Link to="/profile">Go to my profile</Link></div>}
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
