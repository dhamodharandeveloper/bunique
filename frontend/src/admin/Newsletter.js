import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import { formatDate } from './utils';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/newsletter')
      .then((res) => { setSubscribers(res.data || []); setError(''); })
      .catch(() => setError('Unable to load subscribers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (s) => {
    setBusyId(s.id);
    try {
      await api.put(`/admin/newsletter/${s.id}/toggle`);
      load();
    } catch (e) { setError('Could not update subscriber status.'); }
    finally { setBusyId(null); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/newsletter/${deleteTarget.id}`);
      setDeleteTarget(null);
      setNotice('Subscriber deleted successfully.');
      load();
    } catch (e) {
      setDeleteTarget(null);
      setError('Could not delete this subscriber.');
    }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get('/admin/newsletter/export', { responseType: 'text' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('Could not export subscribers.');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Newsletter Subscribers</h4>
          <small className="text-muted">{subscribers.length} total</small>
        </div>
        <button type="button" className="btn-outline-gold" onClick={exportCsv}><i className="bi bi-download me-1"></i>Export CSV</button>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="ad-table-wrap">
        <table className="table ad-table">
          <thead>
            <tr><th>Email</th><th>Subscribed On</th><th>Status</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading…</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No subscribers yet.</td></tr>
            ) : subscribers.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>{formatDate(s.createdAt)}</td>
                <td>
                  <button type="button" className={`status-pill border-0 ${s.status === 1 ? 'status-active' : 'status-inactive'}`} disabled={busyId === s.id} onClick={() => toggle(s)}>
                    {s.status === 1 ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="text-end">
                  <button type="button" className="btn-danger-ghost btn-sm" onClick={() => setDeleteTarget(s)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        message={`Remove subscriber "${deleteTarget?.email || ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </>
  );
};

export default Newsletter;
