import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');

  if (!user) { navigate('/login'); }

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) { setMsg('Password must be at least 6 characters.'); return; }
    if (form.newPassword !== form.confirmPassword) { setMsg('Passwords do not match.'); return; }
    const res = await api.post('/auth/change-password', form);
    setMsg(res.data.message);
    if (res.data.success) setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <>
      <PageBanner title="Change Password" items={[{ label: 'Home', to: '/' }, { label: 'My Profile', to: '/profile' }, { label: 'Change Password' }]} />
      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-3"><ProfileSidebar /></div>
            <div className="col-lg-9">
              <div className="profile-card">
                <h5 className="mb-4"><i className="bi bi-lock me-2 text-gold"></i>Change Password</h5>
                {msg && <div className="alert alert-info">{msg}</div>}
                <form onSubmit={submit}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" value={form.currentPassword} onChange={e => setForm({...form, currentPassword: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn-gold">Update Password</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ChangePassword;
