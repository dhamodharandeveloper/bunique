import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { imageUrl } from './utils';

const Profile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', avatar: '' });
  const [file, setFile] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.get('/admin/profile')
      .then((res) => setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        avatar: res.data.avatar || '',
        role: res.data.role,
      }))
      .catch(() => setError('Unable to load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  const setP = (key, value) => setProfile((p) => ({ ...p, [key]: value }));
  const setPw = (key, value) => setPasswords((p) => ({ ...p, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (profile.name.trim().length < 2) { setError('Name is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) { setError('A valid email is required.'); return; }
    if (passwords.newPassword || passwords.confirmPassword) {
      if (passwords.newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
      if (passwords.newPassword !== passwords.confirmPassword) { setError('Passwords do not match.'); return; }
      if (!passwords.currentPassword) { setError('Current password is required to change password.'); return; }
    }

    setSaving(true);
    try {
      let avatar = profile.avatar;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await api.post('/admin/upload?type=users', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        avatar = up.data.filename || up.data.image;
      }
      const payload = { name: profile.name, email: profile.email, avatar };
      if (passwords.newPassword) {
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
        payload.confirmPassword = passwords.confirmPassword;
      }
      await api.put('/admin/profile', payload);
      const fresh = await api.get('/admin/profile');
      localStorage.setItem('admin', JSON.stringify(fresh.data));
      setProfile((p) => ({ ...p, avatar, name: fresh.data.name, email: fresh.data.email }));
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setFile(null);
      setNotice('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">My Profile</h4>
          <small className="text-muted">{profile.role === 'super_admin' ? 'Super Admin account' : 'Admin account'}</small>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="ad-card" style={{ maxWidth: 760 }}>
        <form className="ad-form" onSubmit={submit}>
          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex align-items-center gap-3">
                <img src={imageUrl(profile.avatar, 'users')} className="table-avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" />
                <div>
                  <label className="form-label mb-1">Profile Picture</label>
                  <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={profile.name} onChange={(e) => setP('name', e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={profile.email} onChange={(e) => setP('email', e.target.value)} required />
            </div>
            <div className="col-12"><hr /></div>
            <div className="col-12">
              <h6 className="mb-0">Change Password <small className="text-muted fw-normal">(leave blank to keep current)</small></h6>
            </div>
            <div className="col-12">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" autoComplete="current-password" value={passwords.currentPassword} onChange={(e) => setPw('currentPassword', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" autoComplete="new-password" value={passwords.newPassword} onChange={(e) => setPw('newPassword', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-control" autoComplete="new-password" value={passwords.confirmPassword} onChange={(e) => setPw('confirmPassword', e.target.value)} />
            </div>
            <div className="col-12">
              <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;
