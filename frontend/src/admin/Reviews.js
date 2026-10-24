import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import { formatDate, titleCase } from './utils';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/reviews')
      .then((res) => { setReviews(res.data || []); setError(''); })
      .catch(() => setError('Unable to load reviews.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return reviews;
    return reviews.filter((r) => r.status === statusFilter);
  }, [reviews, statusFilter]);

  const toggle = async (r) => {
    try {
      await api.put(`/admin/reviews/${r.id}/toggle`);
      load();
    } catch (e) { setError('Could not update review status.'); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/reviews/${deleteTarget.id}`);
      setDeleteTarget(null);
      setNotice('Review deleted successfully.');
      load();
    } catch (e) {
      setDeleteTarget(null);
      setError('Could not delete this review.');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Reviews</h4>
          <small className="text-muted">{filtered.length} found</small>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="ad-card">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ad-table-wrap">
        <table className="table ad-table">
          <thead>
            <tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th>Status</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center text-muted py-4">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-muted py-4">No reviews found.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.productName}</strong></td>
                <td>
                  <div>{r.userName}</div>
                  <small className="text-muted">{r.userEmail}</small>
                </td>
                <td><span className="text-warning">{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</span></td>
                <td style={{ maxWidth: 320 }}>{r.comment && r.comment.length > 90 ? `${r.comment.slice(0, 90)}…` : r.comment}</td>
                <td>{formatDate(r.createdAt)}</td>
                <td>
                  <button type="button" className={`status-pill border-0 status-${r.status}`} onClick={() => toggle(r)}>
                    {titleCase(r.status)}
                  </button>
                </td>
                <td className="text-end">
                  <button type="button" className="btn-danger-ghost btn-sm" onClick={() => setDeleteTarget(r)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        message="Delete this review?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </>
  );
};

export default Reviews;
