import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { imageUrl } from './utils';

const emptyForm = {
  name: '', categoryId: '', slug: '', sku: '', shortDescription: '', description: '',
  price: '', oldPrice: '', stock: 0, weight: '', material: '', image: '',
  featured: false, isNew: false, isBestSeller: false, status: 1,
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.get('/admin/categories').then((res) => setCategories(res.data || [])).catch(() => {});
    if (isEdit) {
      api.get('/admin/products')
        .then((res) => {
          const p = (res.data || []).find((x) => String(x.id) === String(id));
          if (p) {
            setForm({
              name: p.name || '',
              categoryId: p.category?.id || '',
              slug: p.slug || '',
              sku: p.sku || '',
              shortDescription: p.shortDescription || '',
              description: p.description || '',
              price: p.price ?? '',
              oldPrice: p.oldPrice ?? '',
              stock: p.stock ?? 0,
              weight: p.weight || '',
              material: p.material || '',
              image: p.image || '',
              featured: !!p.featured,
              isNew: !!p.isNew,
              isBestSeller: !!p.isBestSeller,
              status: p.status === 0 ? 0 : 1,
            });
          } else {
            setErrors(['Product not found.']);
          }
        })
        .catch(() => setErrors(['Unable to load this product.']))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    const list = [];
    if (form.name.trim().length < 3) list.push('Product name is required (min 3 characters).');
    if (!form.categoryId) list.push('Please select a category.');
    if (!(Number(form.price) > 0)) list.push('Please enter a valid price.');
    if (list.length) { setErrors(list); return; }

    setSaving(true);
    setErrors([]);
    try {
      let image = form.image;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await api.post('/admin/upload?type=products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        image = up.data.filename || up.data.image;
      }
      const payload = {
        name: form.name,
        categoryId: form.categoryId,
        slug: form.slug,
        sku: form.sku,
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price),
        oldPrice: form.oldPrice === '' ? '' : Number(form.oldPrice),
        stock: Number(form.stock) || 0,
        weight: form.weight,
        material: form.material,
        image,
        featured: !!form.featured,
        isNew: !!form.isNew,
        isBestSeller: !!form.isBestSeller,
        status: Number(form.status),
      };
      if (isEdit) await api.put(`/admin/products/${id}`, payload);
      else await api.post('/admin/products', payload);
      navigate('/admin/products');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not save the product.';
      setErrors([msg]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">{isEdit ? 'Edit Product' : 'Add Product'}</h4>
        </div>
        <div>
          {isEdit && <Link to="/admin/products" className="btn-outline-gold btn-sm me-1"><i className="bi bi-images me-1"></i>Gallery</Link>}
          <Link to="/admin/products" className="btn-outline-gold btn-sm"><i className="bi bi-arrow-left me-1"></i>Back</Link>
        </div>
      </div>

      <div className="ad-card">
        {errors.length > 0 && (
          <div className="alert alert-danger">
            <ul className="mb-0 ps-3">{errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
          </div>
        )}

        {loading ? <p>Loading…</p> : (
          <form className="ad-form" onSubmit={submit}>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Product Name *</label>
                <input type="text" className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} required>
                  <option value="">Select category</option>
                  {categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Slug</label>
                <input type="text" className="form-control" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generated from name" />
              </div>
              <div className="col-md-6">
                <label className="form-label">SKU</label>
                <input type="text" className="form-control" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Short Description</label>
                <input type="text" className="form-control" value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Full Description</label>
                <textarea className="form-control" rows="5" value={form.description} onChange={(e) => set('description', e.target.value)}></textarea>
              </div>
              <div className="col-md-3">
                <label className="form-label">Price *</label>
                <input type="number" step="0.01" min="0" className="form-control" value={form.price} onChange={(e) => set('price', e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Old Price</label>
                <input type="number" step="0.01" min="0" className="form-control" value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Stock</label>
                <input type="number" min="0" className="form-control" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Weight</label>
                <input type="text" className="form-control" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Material</label>
                <input type="text" className="form-control" value={form.material} onChange={(e) => set('material', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Main Image</label>
                <div className="d-flex align-items-center gap-3">
                  <img src={imageUrl(form.image)} className="gallery-thumb" alt="" />
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
                </div>
              </div>
              <div className="col-12">
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="f_featured" checked={!!form.featured} onChange={(e) => set('featured', e.target.checked)} />
                      <label className="form-check-label" htmlFor="f_featured">Featured</label>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="f_new" checked={!!form.isNew} onChange={(e) => set('isNew', e.target.checked)} />
                      <label className="form-check-label" htmlFor="f_new">New Arrival</label>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="f_best" checked={!!form.isBestSeller} onChange={(e) => set('isBestSeller', e.target.checked)} />
                      <label className="form-check-label" htmlFor="f_best">Best Seller</label>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="f_status" checked={Number(form.status) === 1} onChange={(e) => set('status', e.target.checked ? 1 : 0)} />
                      <label className="form-check-label" htmlFor="f_status">Active</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Saving…' : (isEdit ? 'Update Product' : 'Create Product')}</button>
                <Link to="/admin/products" className="btn-outline-gold ms-2">Cancel</Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default ProductForm;
