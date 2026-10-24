import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import { formatPrice, toDateInput } from './utils';

const emptyForm = {
  code: '', discountType: 'percent', discountValue: 10, minOrder: 0, maxDiscount: '',
  usageLimit: 0, perUserLimit: 1, startDate: '', endDate: '', status: 1,
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/coupons')
      .then((res) => { setCoupons(res.data || []); setError(''); })
      .catch(() => setError('Unable to load coupons.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => [...coupons].sort((a, b) => (b.id || 0) - (a.id || 0)), [coupons]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm, startDate: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      code: c.code || '',
      discountType: c.discountType || 'percent',
      discountValue: c.discountValue ?? 0,
      minOrder: c.minOrder ?? 0,
      maxDiscount: c.maxDiscount ?? '',
      usageLimit: c.usageLimit ?? 0,
      perUserLimit: c.perUserLimit ?? 1,
      startDate: toDateInput(c.startDate),
      endDate: toDateInput(c.endDate),
      status: c.status === 0 ? 0 : 1,
    });
    setShowForm(true);
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    const code = form.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length < 3) { setError('Coupon code must be at least 3 characters.'); return; }
    if (!(Number(form.discountValue) > 0)) { setError('Discount value must be greater than 0.'); return; }
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) { setError('Percentage discount cannot exceed 100%.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: form.maxDiscount === '' ? '' : Number(form.maxDiscount),
        usageLimit: Number(form.usageLimit) || 0,
        perUserLimit: Number(form.perUserLimit) || 1,
        startDate: form.startDate || '',
        endDate: form.endDate || '',
        status: Number(form.status),
      };
      if (editId) await api.put(`/admin/coupons/${editId}`, payload);
      else await api.post('/admin/coupons', payload);
      setShowForm(false);
      setNotice(`Coupon "${code}" ${editId ? 'updated' : 'created'}.`);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the coupon.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c) => {
    try {
      await api.put(`/admin/coupons/${c.id}`, { status: c.status === 1 ? 0 : 1 });
      load();
    } catch (err) { setError('Could not update coupon status.'); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/coupons/${deleteTarget.id}`);
      setDeleteTarget(null);
      setNotice('Coupon deleted successfully.');
      load();
    } catch (err) {
      setDeleteTarget(null);
      setError('Could not delete this coupon.');
    }
  };

  const usesLeft = (c) => {
    if (!c.usageLimit || Number(c.usageLimit) === 0) return 'Unlimited';
    return Math.max(Number(c.usageLimit) - Number(c.usedCount || 0), 0);
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Coupons</h4>
          <small className="text-muted">{coupons.length} total</small>
        </div>
        <button type="button" className="btn-gold" onClick={openAdd}><i className="bi bi-plus me-1"></i>Add Coupon</button>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="ad-table-wrap">
        <table className="table ad-table">
          <thead>
            <tr><th>Code</th><th>Discount</th><th>Type</th><th>Min Order</th><th>Max Discount</th><th>Uses (left)</th><th>Valid Until</th><th>Status</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="text-center text-muted py-4">Loading…</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan="9" className="text-center text-muted py-4">No coupons yet.</td></tr>
            ) : sorted.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong></td>
                <td>{c.discountType === 'percent' ? `${Number(c.discountValue)}%` : formatPrice(c.discountValue)}</td>
                <td>{c.discountType === 'percent' ? 'Percentage' : 'Fixed'}</td>
                <td>{formatPrice(c.minOrder || 0)}</td>
                <td>{c.maxDiscount ? formatPrice(c.maxDiscount) : '—'}</td>
                <td>{c.usedCount || 0} ({usesLeft(c)})</td>
                <td>{c.endDate || '—'}</td>
                <td>
                  <button type="button" className={`status-pill border-0 ${c.status === 1 ? 'status-active' : 'status-inactive'}`} onClick={() => toggleStatus(c)}>
                    {c.status === 1 ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="text-end">
                  <button type="button" className="btn-outline-gold btn-sm me-1" title="Edit" onClick={() => openEdit(c)}><i className="bi bi-pencil"></i></button>
                  <button type="button" className="btn-danger-ghost btn-sm" title="Delete" onClick={() => setDeleteTarget(c)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(33,24,17,.45)' }} onClick={() => setShowForm(false)}>
            <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content ad-confirm-modal">
                <div className="modal-body">
                  <h5 className="mb-3">{editId ? 'Edit Coupon' : 'Add Coupon'}</h5>
                  <form className="ad-form" onSubmit={save}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Coupon Code *</label>
                        <input type="text" className="form-control text-uppercase" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="WELCOME10" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Discount Type</label>
                        <select className="form-select" value={form.discountType} onChange={(e) => set('discountType', e.target.value)}>
                          <option value="percent">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Discount Value *</label>
                        <input type="number" step="0.01" className="form-control" value={form.discountValue} onChange={(e) => set('discountValue', e.target.value)} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Min Order Amount</label>
                        <input type="number" step="0.01" className="form-control" value={form.minOrder} onChange={(e) => set('minOrder', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Max Discount (for %)</label>
                        <input type="number" step="0.01" className="form-control" value={form.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} placeholder="Leave empty for no cap" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Total Usage Limit</label>
                        <input type="number" className="form-control" value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} placeholder="0 = unlimited" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Per-User Limit</label>
                        <input type="number" className="form-control" value={form.perUserLimit} onChange={(e) => set('perUserLimit', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Valid Until</label>
                        <input type="date" className="form-control" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Starts On</label>
                        <input type="date" className="form-control" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                      </div>
                      <div className="col-md-6 d-flex align-items-end">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" id="couponStatus" checked={Number(form.status) === 1} onChange={(e) => set('status', e.target.checked ? 1 : 0)} />
                          <label className="form-check-label" htmlFor="couponStatus">Active</label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Saving…' : (editId ? 'Update Coupon' : 'Create Coupon')}</button>
                      <button type="button" className="btn-outline-gold ms-2" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      <ConfirmModal
        show={!!deleteTarget}
        message={`Remove coupon "${deleteTarget?.code || ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </>
  );
};

export default Coupons;
