import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import { formatPrice, imageUrl } from './utils';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stockTarget, setStockTarget] = useState(null);
  const [stockValue, setStockValue] = useState(0);
  const [galleryTarget, setGalleryTarget] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryBusy, setGalleryBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/admin/products'), api.get('/admin/categories')])
      .then(([p, c]) => { setProducts(p.data || []); setCategories(c.data || []); setError(''); })
      .catch(() => setError('Unable to load products.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const categoryName = (id) => {
    const c = categories.find((x) => String(x.id) === String(id));
    return c ? c.name : '—';
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term);
      const matchesCategory = categoryFilter === '0' || String(p.category?.id) === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const toggleStatus = async (product) => {
    try {
      await api.put(`/admin/products/${product.id}`, { status: product.status === 1 ? 0 : 1 });
      load();
    } catch (e) { setError('Could not update product status.'); }
  };

  const deleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      setNotice('Product deleted successfully.');
      load();
    } catch (e) {
      setDeleteTarget(null);
      setError('Could not delete this product. It may be referenced by orders.');
    }
  };

  const openStock = (product) => { setStockTarget(product); setStockValue(product.stock || 0); };
  const saveStock = async () => {
    if (!stockTarget) return;
    try {
      await api.post(`/admin/products/${stockTarget.id}/stock`, { stock: Number(stockValue) });
      setStockTarget(null);
      setNotice('Stock updated successfully.');
      load();
    } catch (e) { setError('Could not update stock.'); }
  };

  const openGallery = async (product) => {
    setGalleryTarget(product);
    setGalleryFile(null);
    try {
      const res = await api.get(`/admin/products/${product.id}/images`);
      setGalleryImages(res.data || []);
    } catch (e) { setGalleryImages([]); }
  };

  const uploadGalleryImage = async () => {
    if (!galleryTarget || !galleryFile) return;
    setGalleryBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', galleryFile);
      const up = await api.post('/admin/upload?type=products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const filename = up.data.filename || up.data.image;
      await api.post(`/admin/products/${galleryTarget.id}/images`, { image: filename });
      setGalleryFile(null);
      const res = await api.get(`/admin/products/${galleryTarget.id}/images`);
      setGalleryImages(res.data || []);
    } catch (e) {
      setError('Could not upload gallery image.');
    } finally {
      setGalleryBusy(false);
    }
  };

  const removeGalleryImage = async (img) => {
    try {
      await api.delete(`/admin/products/images/${img.id}`);
      setGalleryImages((prev) => prev.filter((i) => i.id !== img.id));
    } catch (e) { setError('Could not remove image.'); }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Products</h4>
          <small className="text-muted">{filtered.length} total</small>
        </div>
        <Link to="/admin/products/add" className="btn-gold"><i className="bi bi-plus me-1"></i>Add Product</Link>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="ad-card">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="0">All Categories</option>
              {categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="ad-table-wrap">
        <table className="table ad-table">
          <thead>
            <tr>
              <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Badges</th><th>Status</th><th>Views</th><th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">No products found.</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={imageUrl(p.image)} className="table-avatar" alt={p.name} />
                    <div>
                      <strong>{p.name}</strong>
                      <small className="d-block text-muted">SKU: {p.sku || 'N/A'}</small>
                    </div>
                  </div>
                </td>
                <td>{p.category ? categoryName(p.category.id) : '—'}</td>
                <td>
                  <strong>{formatPrice(p.price)}</strong>
                  {p.oldPrice && <small className="d-block text-muted text-decoration-line-through">{formatPrice(p.oldPrice)}</small>}
                </td>
                <td>
                  <span className={`status-pill ${Number(p.stock) === 0 ? 'status-cancelled' : (Number(p.stock) <= 5 ? 'status-pending' : 'status-active')}`}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  {p.featured && <span className="status-pill status-confirmed me-1">Featured</span>}
                  {p.isNew && <span className="status-pill status-shipped me-1">New</span>}
                  {p.isBestSeller && <span className="status-pill status-delivered">Best</span>}
                </td>
                <td>
                  <button type="button" onClick={() => toggleStatus(p)} className={`status-pill border-0 ${p.status === 1 ? 'status-active' : 'status-inactive'}`}>
                    {p.status === 1 ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>{p.views || 0}</td>
                <td className="text-end">
                  <button type="button" className="btn-outline-gold btn-sm me-1" title="Gallery" onClick={() => openGallery(p)}><i className="bi bi-images"></i></button>
                  <button type="button" className="btn-outline-gold btn-sm me-1" title="Stock" onClick={() => openStock(p)}><i className="bi bi-box-seam"></i></button>
                  <Link to={`/admin/products/edit/${p.id}`} className="btn-outline-gold btn-sm me-1" title="Edit"><i className="bi bi-pencil"></i></Link>
                  <button type="button" className="btn-danger-ghost btn-sm" title="Delete" onClick={() => setDeleteTarget(p)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        message={`Remove product "${deleteTarget?.name || ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteProduct}
      />

      {stockTarget && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(33,24,17,.45)' }} onClick={() => setStockTarget(null)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content ad-confirm-modal">
                <div className="modal-body">
                  <h5 className="text-center mb-3">Update Stock</h5>
                  <p className="text-center text-muted small mb-3">{stockTarget.name}</p>
                  <label className="form-label">Stock quantity</label>
                  <input type="number" min="0" className="form-control" value={stockValue} onChange={(e) => setStockValue(e.target.value)} />
                </div>
                <div className="modal-footer justify-content-center border-0">
                  <button type="button" className="btn btn-light" onClick={() => setStockTarget(null)}>Cancel</button>
                  <button type="button" className="btn-gold" onClick={saveStock}>Save Stock</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {galleryTarget && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(33,24,17,.45)' }} onClick={() => setGalleryTarget(null)}>
            <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content ad-confirm-modal">
                <div className="modal-body">
                  <h5 className="mb-1">Gallery — {galleryTarget.name}</h5>
                  <p className="text-muted small mb-3">Manage extra images for this product.</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {galleryImages.length === 0 && <span className="text-muted small">No gallery images yet.</span>}
                    {galleryImages.map((img) => (
                      <div key={img.id} className="position-relative">
                        <img src={imageUrl(img.image)} className="gallery-thumb" alt="" />
                        <button type="button" className="btn btn-sm btn-danger position-absolute" style={{ top: -8, right: -8, borderRadius: '50%', width: 24, height: 24, padding: 0, lineHeight: 1 }} onClick={() => removeGalleryImage(img)}>
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <input type="file" accept="image/*" className="form-control" onChange={(e) => setGalleryFile(e.target.files[0] || null)} />
                    <button type="button" className="btn-gold" disabled={!galleryFile || galleryBusy} onClick={uploadGalleryImage}>
                      {galleryBusy ? 'Uploading…' : 'Upload'}
                    </button>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setGalleryTarget(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default Products;
