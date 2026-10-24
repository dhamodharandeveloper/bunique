import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import { imageUrl } from './utils';

const emptyForm = { name: '', slug: '', description: '', sortOrder: 0, status: 1, image: '' };

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
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
    Promise.all([api.get('/admin/categories'), api.get('/admin/products')])
      .then(([c, p]) => { setCategories(c.data || []); setProducts(p.data || []); })
      .catch(() => setError('Unable to load categories.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cid = p.category?.id;
      if (cid) map[cid] = (map[cid] || 0) + 1;
    });
    return map;
  }, [products]);

  const sorted = useMemo(() => {
    return [...categories].sort((a, b) => {
      const so = (a.sortOrder || 0) - (b.sortOrder || 0);
      return so !== 0 ? so : String(a.name).localeCompare(String(b.name));
    });
  }, [categories]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFile(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      name: c.name || '', slug: c.slug || '', description: c.description || '',
      sortOrder: c.sortOrder ?? 0, status: c.status === 0 ? 0 : 1, image: c.image || '',
    });
    setFile(null);
    setShowForm(true);
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) { setError('Category name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let image = form.image;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await api.post('/admin/upload?type=categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        image = up.data.filename || up.data.image;
      }
      const payload = { ...form, image, sortOrder: Number(form.sortOrder) || 0, status: Number(form.status) };
      if (editId) await api.put(`/admin/categories/${editId}`, payload);
      else await api.post('/admin/categories', payload);
      setShowForm(false);
      setNotice(editId ? 'Category updated successfully.' : 'Category created successfully.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the category.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c) => {
    try {
      await api.put(`/admin/categories/${c.id}`, { status: c.status === 1 ? 0 : 1 });
      load();
    } catch (err) { setError('Could not update category status.'); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      setNotice('Category deleted successfully.');
      load();
    } catch (err) {
      setDeleteTarget(null);
      setError('Could not delete this category. Remove its products first.');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Categories</h4>
          <small className="text-muted">{categories.length} total</small>
        </div>
        <button type="button" className="btn-gold" onClick={openAdd}><i className="bi bi-plus me-1"></i>Add Category</button>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="ad-table-wrap">
        <table className="table ad-table">
          <thead>
            <tr><th>#</th><th>Image</th><th>Name</th><th>Slug</th><th>Products</th><th>Order</th><th>Status</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">Loading…</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">No categories yet.</td></tr>
            ) : sorted.map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td><img src={imageUrl(c.image, 'categories')} className="table-avatar" alt={c.name} /></td>
                <td><strong>{c.name}</strong></td>
                <td><code>{c.slug}</code></td>
                <td>{counts[c.id] || 0}</td>
                <td>{c.sortOrder || 0}</td>
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
                  <h5 className="mb-3">{editId ? 'Edit Category' : 'Add Category'}</h5>
                  <form className="ad-form" onSubmit={save}>
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label">Category Name *</label>
                        <input type="text" className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Sort Order</label>
                        <input type="number" className="form-control" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Slug</label>
                        <input type="text" className="form-control" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generated from name" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Status</label>
                        <div className="form-check form-switch mt-2">
                          <input className="form-check-input" type="checkbox" id="catStatus" checked={Number(form.status) === 1} onChange={(e) => set('status', e.target.checked ? 1 : 0)} />
                          <label className="form-check-label" htmlFor="catStatus">Active</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows="3" value={form.description} onChange={(e) => set('description', e.target.value)}></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Image</label>
                        <div className="d-flex align-items-center gap-3">
                          <img src={imageUrl(form.image, 'categories')} className="gallery-thumb" alt="" />
                          <input type="file" className="form-control" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Saving…' : (editId ? 'Update Category' : 'Create Category')}</button>
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
        message={`Remove category "${deleteTarget?.name || ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </>
  );
};

export default Categories;
