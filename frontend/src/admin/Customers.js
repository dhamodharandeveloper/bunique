import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import { formatDate, formatPrice, imageUrl, titleCase } from './utils';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/customers')
      .then((res) => { setCustomers(res.data.customers || []); setError(''); })
      .catch(() => setError('Unable to load customers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) =>
      String(c.name || '').toLowerCase().includes(term)
      || String(c.email || '').toLowerCase().includes(term)
      || String(c.phone || '').toLowerCase().includes(term)
    );
  }, [customers, search]);

  const toggleStatus = async (c) => {
    try {
      await api.put(`/admin/customers/${c.id}/status`, { status: c.status === 'active' ? 'banned' : 'active' });
      load();
    } catch (e) { setError('Could not update customer status.'); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/customers/${deleteTarget.id}`);
      setDeleteTarget(null);
      setNotice('Customer deleted successfully.');
      load();
    } catch (e) {
      setDeleteTarget(null);
      setError('Could not delete this customer. They may have orders linked to their account.');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Customers</h4>
          <small className="text-muted">{filtered.length} total</small>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="ad-card">
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <input type="text" className="form-control" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="ad-table-wrap">
        <table className="table ad-table">
          <thead>
            <tr>
              <th>Customer</th><th>Contact</th><th>Location</th><th>Orders</th><th>Spent</th><th>Last Order</th><th>Status</th><th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">No customers found.</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={imageUrl(c.avatar, 'users')} className="table-avatar" alt={c.name} />
                    <div>
                      <strong>{c.name}</strong>
                      {!c.emailVerifiedAt && <span className="status-pill status-pending ms-1">Unverified</span>}
                    </div>
                  </div>
                </td>
                <td>
                  <div>{c.email}</div>
                  <small className="text-muted">{c.phone || 'No phone'}</small>
                </td>
                <td>{c.city ? `${c.city}${c.state ? `, ${c.state}` : ''}` : '—'}</td>
                <td><span className="badge text-bg-light">{c.ordersCount || 0}</span></td>
                <td><strong>{formatPrice(c.spent)}</strong></td>
                <td>{c.lastOrder ? formatDate(c.lastOrder) : '—'}</td>
                <td>
                  <button type="button" className={`status-pill border-0 ${c.status === 'active' ? 'status-active' : 'status-cancelled'}`} onClick={() => toggleStatus(c)}>
                    {titleCase(c.status)}
                  </button>
                </td>
                <td className="text-end">
                  <Link to={`/admin/customers/${c.id}`} className="btn-outline-gold btn-sm me-1"><i className="bi bi-eye"></i></Link>
                  <button type="button" className="btn-danger-ghost btn-sm" onClick={() => setDeleteTarget(c)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        message={`Delete customer "${deleteTarget?.name || ''}" and all their data?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </>
  );
};

export default Customers;
