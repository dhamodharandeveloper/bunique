import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { formatDate, formatPrice, titleCase } from './utils';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState(searchParams.get('s') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/orders')
      .then((res) => { setOrders(res.data || []); setError(''); })
      .catch(() => setError('Unable to load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = !status || o.orderStatus === status;
      const matchesSearch = !term
        || String(o.orderNumber || '').toLowerCase().includes(term)
        || String(o.customerName || '').toLowerCase().includes(term)
        || String(o.customerEmail || '').toLowerCase().includes(term);
      const matchesDate = !date || String(o.createdAt || '').slice(0, 10) === date;
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [orders, search, status, date]);

  const applyFilter = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (search) p.set('s', search);
    if (status) p.set('status', status);
    if (date) p.set('date', date);
    setSearchParams(p);
  };

  const advance = async (order) => {
    const flow = ['pending', 'confirmed', 'shipped', 'delivered'];
    let next;
    if (order.orderStatus === 'cancelled' || order.orderStatus === 'returned') next = 'pending';
    else {
      const idx = flow.indexOf(order.orderStatus);
      next = idx !== false && idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : 'pending';
    }
    setBusyId(order.id);
    try {
      await api.put(`/admin/orders/${order.id}/status`, { orderStatus: next });
      load();
    } catch (e) {
      setError('Could not update order status.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Orders</h4>
          <small className="text-muted">{filtered.length} order(s)</small>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}

      <div className="ad-card">
        <form className="row g-2 align-items-end" onSubmit={applyFilter}>
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Search #order, customer, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-md-2">
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'].map((st) => (
                <option value={st} key={st}>{titleCase(st)}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn-gold w-100"><i className="bi bi-funnel me-1"></i>Filter</button>
          </div>
        </form>
      </div>

      <div className="ad-table-wrap">
        <table className="table ad-table">
          <thead>
            <tr>
              <th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-muted py-4">No orders found.</td></tr>
            ) : filtered.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.orderNumber}</strong></td>
                <td>
                  <div>
                    <strong>{o.customerName}</strong>
                    <small className="d-block text-muted">{o.customerEmail}</small>
                  </div>
                </td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{o.itemCount}</td>
                <td><strong>{formatPrice(o.total)}</strong></td>
                <td>
                  <small className="d-block text-uppercase">{String(o.paymentMethod || '').replace(/_/g, ' ')}</small>
                  <span className={`status-pill status-${o.paymentStatus}`}>{o.paymentStatus}</span>
                </td>
                <td><span className={`status-pill status-${o.orderStatus}`}>{titleCase(o.orderStatus)}</span></td>
                <td className="text-end">
                  <Link to={`/admin/orders/${o.id}`} className="btn-outline-gold btn-sm me-1"><i className="bi bi-eye"></i></Link>
                  <button type="button" className="btn-outline-gold btn-sm me-1" title="Invoice" onClick={() => navigate(`/admin/orders/${o.id}?invoice=1`)}><i className="bi bi-printer"></i></button>
                  <button type="button" className="btn-gold btn-sm" title="Advance status" disabled={busyId === o.id} onClick={() => advance(o)}><i className="bi bi-arrow-right-circle"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orders;
