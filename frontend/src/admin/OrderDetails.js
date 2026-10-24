import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { formatDate, formatDateTime, formatPrice, imageUrl, titleCase } from './utils';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];

const OrderDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoice = searchParams.get('invoice') === '1';
  const [data, setData] = useState({ order: null, items: [], payments: [] });
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/admin/orders/${id}`)
      .then((res) => {
        setData(res.data);
        setStatus(res.data.order?.orderStatus || 'pending');
        setError('');
      })
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/orders/${id}/status`, { orderStatus: status });
      setNotice('Order status updated successfully.');
      load();
    } catch (err) {
      setError('Could not update order status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error && !data.order) return <div className="alert alert-danger">{error}</div>;

  const order = data.order || {};
  const items = data.items || [];
  const payments = data.payments || [];

  if (invoice) {
    return (
      <div className="ad-card" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="d-flex justify-content-end gap-2 mb-3">
          <button type="button" className="btn-gold" onClick={() => window.print()}><i className="bi bi-printer me-1"></i>Print</button>
          <button type="button" className="btn-outline-gold" onClick={() => navigate(`/admin/orders/${id}`)}>Back</button>
        </div>
        <div className="d-flex justify-content-between align-items-end pb-3 mb-4" style={{ borderBottom: '3px solid #b98a4e' }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, color: '#2c2017' }}>B.unique</div>
            <small style={{ display: 'block', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#b98a4e' }}>Handmade Jewellery</small>
          </div>
          <div className="text-end">
            <h4 className="mb-1">TAX INVOICE</h4>
            <div style={{ fontSize: 14 }}><strong>Invoice #:</strong> {order.orderNumber}</div>
            <div style={{ fontSize: 14 }}><strong>Date:</strong> {formatDate(order.createdAt)}</div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-6">
            <strong style={{ fontSize: 13, textTransform: 'uppercase' }}>Billed To</strong>
            <div style={{ fontSize: 14 }}>{order.shippingName}</div>
            <div style={{ fontSize: 13 }}>Phone: {order.shippingPhone}</div>
            <div style={{ fontSize: 13 }}>Email: {order.shippingEmail}</div>
          </div>
          <div className="col-6">
            <strong style={{ fontSize: 13, textTransform: 'uppercase' }}>Order Info</strong>
            <div style={{ fontSize: 13 }}>Order Status: <span className="text-capitalize">{order.orderStatus}</span></div>
            <div style={{ fontSize: 13 }}>Payment: <span className="text-uppercase">{String(order.paymentMethod || '').replace(/_/g, ' ')}</span></div>
            <div style={{ fontSize: 13 }}>Payment Status: <span className="text-capitalize">{order.paymentStatus}</span></div>
          </div>
        </div>

        <table className="table table-bordered">
          <thead>
            <tr style={{ background: '#faf6ef' }}>
              <th style={{ width: '8%' }}>#</th><th>Product</th><th style={{ width: '12%' }}>Price</th><th style={{ width: '8%' }}>Qty</th><th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id}>
                <td>{i + 1}</td>
                <td>{it.productName}</td>
                <td>{formatPrice(it.price)}</td>
                <td>{it.quantity}</td>
                <td className="text-end">{formatPrice(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="row justify-content-end">
          <div className="col-md-4">
            <table className="table table-sm">
              <tbody>
                <tr><td>Subtotal</td><td className="text-end">{formatPrice(order.subtotal)}</td></tr>
                {Number(order.discount) > 0 && <tr><td>Discount</td><td className="text-end">-{formatPrice(order.discount)}</td></tr>}
                {Number(order.shipping) > 0 && <tr><td>Shipping</td><td className="text-end">{formatPrice(order.shipping)}</td></tr>}
                {Number(order.tax) > 0 && <tr><td>Tax</td><td className="text-end">{formatPrice(order.tax)}</td></tr>}
                <tr style={{ background: '#faf6ef' }}><td><strong>TOTAL</strong></td><td className="text-end"><strong>{formatPrice(order.total)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-3" style={{ fontSize: 12, color: '#888', borderTop: '1px solid #ddd' }}>
          Thank you for shopping with B.unique! This is a computer generated invoice and does not require a physical signature.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Order #{order.orderNumber}</h4>
          <small className="text-muted">Placed on {formatDateTime(order.createdAt)}</small>
        </div>
        <div>
          <button type="button" className="btn-outline-gold btn-sm me-1" onClick={() => navigate(`/admin/orders/${id}?invoice=1`)}><i className="bi bi-printer me-1"></i>Invoice</button>
          <Link to="/admin/orders" className="btn-outline-gold btn-sm"><i className="bi bi-arrow-left me-1"></i>Back</Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error} <button type="button" className="btn-close float-end" onClick={() => setError('')}></button></div>}
      {notice && <div className="alert alert-success">{notice} <button type="button" className="btn-close float-end" onClick={() => setNotice('')}></button></div>}

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="ad-card">
            <div className="card-title"><i className="bi bi-box-seam"></i> Order Items</div>
            <div className="ad-table-wrap">
              <table className="table ad-table">
                <thead><tr><th>Product</th><th>Price</th><th className="text-center">Qty</th><th className="text-end">Total</th></tr></thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img src={imageUrl(it.productImage)} className="table-avatar" alt="" />
                          {it.productName}
                        </div>
                      </td>
                      <td>{formatPrice(it.price)}</td>
                      <td className="text-center">{it.quantity}</td>
                      <td className="text-end"><strong>{formatPrice(it.total)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row mt-3">
              <div className="col-md-6 offset-md-6">
                <div className="d-flex justify-content-between py-1"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                {Number(order.discount) > 0 && <div className="d-flex justify-content-between py-1 text-success"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                {Number(order.shipping) > 0 && <div className="d-flex justify-content-between py-1"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>}
                {Number(order.tax) > 0 && <div className="d-flex justify-content-between py-1"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>}
                <div className="d-flex justify-content-between py-2 border-top fw-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
            </div>
          </div>

          <div className="ad-card">
            <div className="card-title"><i className="bi bi-wallet2"></i> Payments</div>
            <div className="ad-table-wrap">
              <table className="table ad-table">
                <thead><tr><th>ID</th><th>Method</th><th>Transaction</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted py-3">No payment records.</td></tr>
                  ) : payments.map((pm) => (
                    <tr key={pm.id}>
                      <td>#{pm.id}</td>
                      <td className="text-uppercase">{String(pm.paymentMethod || pm.method || '').replace(/_/g, ' ')}</td>
                      <td>{pm.transactionId || '—'}</td>
                      <td>{formatPrice(pm.amount)}</td>
                      <td><span className={`status-pill status-${pm.status}`}>{titleCase(pm.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ad-card">
            <div className="card-title"><i className="bi bi-geo-alt"></i> Shipping Address</div>
            <div className="detail-grid">
              <div className="item"><div className="k">Name</div><div className="v">{order.shippingName || '—'}</div></div>
              <div className="item"><div className="k">Phone</div><div className="v">{order.shippingPhone || '—'}</div></div>
              <div className="item"><div className="k">Address</div><div className="v">{order.shippingAddress || '—'}</div></div>
              <div className="item"><div className="k">City / State</div><div className="v">{order.shippingCity || '—'}{order.shippingState ? `, ${order.shippingState}` : ''}</div></div>
              <div className="item"><div className="k">ZIP / Country</div><div className="v">{order.shippingZip || '—'}{order.shippingCountry ? `, ${order.shippingCountry}` : ''}</div></div>
              <div className="item"><div className="k">Email</div><div className="v">{order.shippingEmail || '—'}</div></div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="ad-card">
            <div className="card-title"><i className="bi bi-person"></i> Customer Details</div>
            <p className="mb-1"><strong>{order.shippingName}</strong></p>
            <p className="mb-1"><i className="bi bi-envelope me-1"></i>{order.shippingEmail}</p>
            <p className="mb-0"><i className="bi bi-telephone me-1"></i>{order.shippingPhone}</p>
            <hr />
            <Link to={`/admin/customers/${order.userId}`} className="small"><i className="bi bi-person me-1"></i>View customer profile</Link>
          </div>

          <div className="ad-card">
            <div className="card-title"><i className="bi bi-sliders"></i> Update Status</div>
            <form className="ad-form" onSubmit={updateStatus}>
              <label className="form-label">Order Status</label>
              <select className="form-select mb-3" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statuses.map((st) => <option value={st} key={st}>{titleCase(st)}</option>)}
              </select>
              <button type="submit" className="btn-gold w-100" disabled={saving}>{saving ? 'Saving…' : 'Update Status'}</button>
            </form>
          </div>

          <div className="ad-card">
            <div className="card-title"><i className="bi bi-info-circle"></i> Order Info</div>
            <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="item"><div className="k">Payment Method</div><div className="v text-uppercase">{String(order.paymentMethod || '').replace(/_/g, ' ')}</div></div>
              <div className="item"><div className="k">Payment Status</div><div className="v text-capitalize">{order.paymentStatus}</div></div>
              <div className="item"><div className="k">Coupon</div><div className="v">{order.couponCode || '—'}</div></div>
              <div className="item"><div className="k">Customer Email</div><div className="v">{order.shippingEmail}</div></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
