import React, { useEffect, useState } from 'react';
import api from '../services/api';

const tabs = [
  { id: 'general', label: 'General', icon: 'bi-sliders' },
  { id: 'website', label: 'Website', icon: 'bi-globe' },
  { id: 'payment', label: 'Payment', icon: 'bi-credit-card' },
  { id: 'smtp', label: 'SMTP', icon: 'bi-envelope' },
];

const fieldsByTab = {
  general: ['site_name', 'site_tagline', 'site_email', 'site_phone', 'site_whatsapp', 'currency', 'site_address'],
  website: ['facebook', 'instagram', 'twitter', 'youtube', 'about_us', 'returns_policy'],
  payment: ['currency', 'currency_code', 'tax_percent', 'returns_days'],
  smtp: ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_secure', 'smtp_from_email', 'smtp_from_name'],
};

const Settings = () => {
  const [active, setActive] = useState('general');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => setForm(res.data || {}))
      .catch(() => setError('Unable to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {};
      fieldsByTab[active].forEach((k) => { payload[k] = form[k] ?? ''; });
      await api.put('/admin/settings', payload);
      if (active === 'general') {
        const wa = String(form.site_whatsapp || '').replace(/\D/g, '');
        if (wa) {
          await api.put('/admin/settings', { whatsapp: `https://wa.me/${wa}` });
        }
      }
      setNotice('Settings saved successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Settings</h4>
          <small className="text-muted">Manage store configuration</small>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <ul className="nav nav-tabs mb-3">
        {tabs.map((t) => (
          <li className="nav-item" key={t.id}>
            <button type="button" className={`nav-link ${active === t.id ? 'active' : ''}`} onClick={() => { setActive(t.id); setNotice(''); setError(''); }}>
              <i className={`bi ${t.icon} me-1`}></i>{t.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="ad-card" style={{ maxWidth: 860 }}>
        <form className="ad-form" onSubmit={save}>
          {active === 'general' && (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Site Name</label>
                <input type="text" className="form-control" value={form.site_name || ''} onChange={(e) => set('site_name', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tagline</label>
                <input type="text" className="form-control" value={form.site_tagline || ''} onChange={(e) => set('site_tagline', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Email</label>
                <input type="email" className="form-control" value={form.site_email || ''} onChange={(e) => set('site_email', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input type="text" className="form-control" value={form.site_phone || ''} onChange={(e) => set('site_phone', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">WhatsApp Number</label>
                <input type="text" className="form-control" value={form.site_whatsapp || ''} onChange={(e) => set('site_whatsapp', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Currency Symbol</label>
                <input type="text" className="form-control" value={form.currency || ''} onChange={(e) => set('currency', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <input type="text" className="form-control" value={form.site_address || ''} onChange={(e) => set('site_address', e.target.value)} />
              </div>
            </div>
          )}

          {active === 'website' && (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Facebook</label>
                <input type="url" className="form-control" value={form.facebook || ''} onChange={(e) => set('facebook', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Instagram</label>
                <input type="url" className="form-control" value={form.instagram || ''} onChange={(e) => set('instagram', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Twitter / X</label>
                <input type="url" className="form-control" value={form.twitter || ''} onChange={(e) => set('twitter', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">YouTube</label>
                <input type="url" className="form-control" value={form.youtube || ''} onChange={(e) => set('youtube', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">About Us</label>
                <textarea className="form-control" rows="5" value={form.about_us || ''} onChange={(e) => set('about_us', e.target.value)}></textarea>
              </div>
              <div className="col-12">
                <label className="form-label">Returns Policy</label>
                <textarea className="form-control" rows="6" value={form.returns_policy || ''} onChange={(e) => set('returns_policy', e.target.value)}></textarea>
              </div>
            </div>
          )}

          {active === 'payment' && (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Currency Symbol</label>
                <input type="text" className="form-control" value={form.currency || ''} onChange={(e) => set('currency', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Currency Code</label>
                <input type="text" className="form-control" value={form.currency_code || ''} onChange={(e) => set('currency_code', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tax Percentage</label>
                <input type="number" step="0.01" className="form-control" value={form.tax_percent || ''} onChange={(e) => set('tax_percent', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Return Days</label>
                <input type="number" className="form-control" value={form.returns_days || ''} onChange={(e) => set('returns_days', e.target.value)} />
              </div>
            </div>
          )}

          {active === 'smtp' && (
            <div className="row g-3">
              <div className="col-12">
                <p className="text-muted small mb-0">
                  Configure your SMTP server to send transactional emails (order confirmations, password resets, email verification).
                  If left empty, emails are logged to the server console.
                </p>
              </div>
              <div className="col-md-8">
                <label className="form-label">SMTP Host</label>
                <input type="text" className="form-control" value={form.smtp_host || ''} onChange={(e) => set('smtp_host', e.target.value)} placeholder="smtp.gmail.com" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Port</label>
                <input type="number" className="form-control" value={form.smtp_port || ''} onChange={(e) => set('smtp_port', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" autoComplete="off" value={form.smtp_username || ''} onChange={(e) => set('smtp_username', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" autoComplete="new-password" value={form.smtp_password || ''} onChange={(e) => set('smtp_password', e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Encryption</label>
                <select className="form-select" value={form.smtp_secure || 'tls'} onChange={(e) => set('smtp_secure', e.target.value)}>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">From Email</label>
                <input type="email" className="form-control" value={form.smtp_from_email || ''} onChange={(e) => set('smtp_from_email', e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">From Name</label>
                <input type="text" className="form-control" value={form.smtp_from_name || ''} onChange={(e) => set('smtp_from_name', e.target.value)} />
              </div>
            </div>
          )}

          <div className="mt-3">
            <button type="submit" className="btn-gold" disabled={saving}>
              {saving ? 'Saving…' : (active === 'smtp' ? 'Save SMTP Settings' : 'Save Settings')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Settings;
