import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', zip: '', country: 'India' });
  const [stats, setStats] = useState({ orders: 0, spent: 0, wishlist: 0 });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({
      name: user.name || '', phone: user.phone || '', address: user.address || '',
      city: user.city || '', state: user.state || '', zip: user.zip || '', country: user.country || 'India'
    });
    Promise.all([api.get('/orders'), api.get('/wishlist')]).then(([o, w]) => {
      const orders = o.data.orders || [];
      const spent = orders.filter(x => x.orderStatus !== 'cancelled').reduce((s, x) => s + Number(x.total), 0);
      setStats({ orders: orders.length, spent, wishlist: (w.data.items || []).length });
    }).catch(() => {});
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.put('/auth/profile', form);
    setMsg(res.data.message);
    if (res.data.success) {
      const updated = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const fmt = (v) => `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <PageBanner title="My Profile" items={[{ label: 'Home', to: '/' }, { label: 'My Profile' }]} />
      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-3"><ProfileSidebar /></div>
            <div className="col-lg-9">
              <div className="row g-3 mb-4">
                <div className="col-md-4"><div className="stat-card"><i className="bi bi-receipt"></i><div><h4>{stats.orders}</h4><small>Total Orders</small></div></div></div>
                <div className="col-md-4"><div className="stat-card"><i className="bi bi-cash-stack"></i><div><h4>{fmt(stats.spent)}</h4><small>Total Spent</small></div></div></div>
                <div className="col-md-4"><div className="stat-card"><i className="bi bi-heart"></i><div><h4>{stats.wishlist}</h4><small>Wishlist Items</small></div></div></div>
              </div>

              <div className="profile-card">
                <h5 className="mb-4"><i className="bi bi-person-circle me-2 text-gold"></i>Profile Information</h5>
                {msg && <div className="alert alert-success">{msg}</div>}
                <form onSubmit={submit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email (cannot be changed)</label>
                      <input type="email" className="form-control" value={user?.email || ''} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <input type="text" className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">State</label>
                      <input type="text" className="form-control" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">PIN Code</label>
                      <input type="text" className="form-control" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn-gold">Save Changes</button>
                      <Link to="/change-password" className="btn-outline-gold ms-2">Change Password</Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
