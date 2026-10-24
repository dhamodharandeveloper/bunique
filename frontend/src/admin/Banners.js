import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import { imageUrl } from './utils';

const emptyForm = { title: '', subtitle: '', link: '', position: 'home_slider', sortOrder: 0, status: 1, image: '' };

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/banners')
      .then((res) => { setBanners(res.data || []); setError(''); })
      .catch(() => setError('Unable to load banners.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => {
    return [...banners].sort((a, b) => {
      const pos = String(a.position || '').localeCompare(String(b.position || ''));
      if (pos !== 0) return pos;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [banners]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setFile(null); setShowForm(true); };
  const openEdit = (b) => {
    setEditId(b.id);
    setForm({
      title: b.title || '', subtitle: b.subtitle || '', link: b.link || '',
      position: b.position || 'home_slider', sortOrder: b.sortOrder ?? 0,
      status: b.status === 0 ? 0 : 1, image: b.image || '',
    });
    setFile(null);
    setShowForm(true);
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 2) { setError('Banner title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let image = form.image;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await api.post('/admin/upload?type=banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        image = up.data.filename || up.data.image;
      }
      const payload = { ...form, image, sortOrder: Number(form.sortOrder) || 0, status: Number(form.status) };
      if (editId) await api.put(`/admin/banners/${editId}`, payload);
      else await api.post('/admin/banners', payload);
      setShowForm(false);
      setNotice(editId ? 'Banner updated successfully.' : 'Banner added successfully.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the banner.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (b) => {
    try {
      await api.put(`/admin/banners/${b.id}`, { status: b.status === 1 ? 0 : 1 });
      load();
    } catch (err) { setError('Could not update banner status.'); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/banners/${deleteTarget.id}`);
      setDeleteTarget(null);
      setNotice('Banner deleted successfully.');
      load();
    } catch (err) {
      setDeleteTarget(null);
      setError('Could not delete this banner.');
    }
  };

  const positionLabel = (p) => (p === 'promo_banner' ? 'Promo Banner' : 'Home Slider');

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Banners</h4>
          <small className="text-muted">{banners.length} total</small>
        </div>
        <button type="button" className="btn-gold" onClick={openAdd}><i className="bi bi-plus me-1"></i>Add Banner</button>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="ad-table-wrap">
        <table className="table ad-table">
          <thead>
            <tr><th>Preview</th><th>Title</th><th>Subtitle</th><th>Position</th><th>Link</th><th>Order</th><th>Status</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">Loading…</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">No banners yet.</td></tr>
            ) : sorted.map((b) => (
              <tr key={b.id}>
                <td><img src={imageUrl(b.image, 'banners')} className="table-avatar" style={{ width: 88 }} alt={b.title} /></td>
                <td><strong>{b.title}</strong></td>
                <td>{b.subtitle || '—'}</td>
                <td>{positionLabel(b.position)}</td>
                <td>{b.link ? <span className="text-muted small">{b.link}</span> : '—'}</td>
                <td>{b.sortOrder || 0}</td>
                <td>
                  <button type="button" className={`status-pill border-0 ${b.status === 1 ? 'status-active' : 'status-inactive'}`} onClick={() => toggleStatus(b)}>
                    {b.status === 1 ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="text-end">
                  <button type="button" className="btn-outline-gold btn-sm me-1" title="Edit" onClick={() => openEdit(b)}><i className="bi bi-pencil"></i></button>
                  <button type="button" className="btn-danger-ghost btn-sm" title="Delete" onClick={() => setDeleteTarget(b)}><i className="bi bi-trash"></i></button>
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
                  <h5 className="mb-3">{editId ? 'Edit Banner' : 'Add Banner'}</h5>
                  <form className="ad-form" onSubmit={save}>
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label">Title *</label>
                        <input type="text" className="form-control" value={form.title} onChange={(e) => set('title', e.target.value)} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Sort Order</label>
                        <input type="number" className="form-control" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Subtitle</label>
                        <input type="text" className="form-control" value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Link</label>
                        <input type="text" className="form-control" value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="/shop" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Position</label>
                        <select className="form-select" value={form.position} onChange={(e) => set('position', e.target.value)}>
                          <option value="home_slider">Home Slider</option>
                          <option value="promo_banner">Promo Banner</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Image</label>
                        <div className="d-flex align-items-center gap-3">
                          <img src={imageUrl(form.image, 'banners')} className="gallery-thumb" style={{ width: 110 }} alt="" />
                          <input type="file" className="form-control" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" id="bannerStatus" checked={Number(form.status) === 1} onChange={(e) => set('status', e.target.checked ? 1 : 0)} />
                          <label className="form-check-label" htmlFor="bannerStatus">Active</label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Saving…' : (editId ? 'Update Banner' : 'Create Banner')}</button>
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
        message={`Remove banner "${deleteTarget?.title || ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </>
  );
};

export default Banners;
