import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { formatDate, formatPrice, imageUrl, titleCase } from './utils';

const CustomerDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/admin/customers/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Customer not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error || !data) return <div className="alert alert-danger">{error || 'Customer not found.'}</div>;

  const c = data.customer || {};
  const orders = data.orders || [];
  const reviews = data.reviews || [];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Customer: {c.name}</h4>
          <small className="text-muted">Joined {formatDate(c.createdAt)}</small>
        </div>
        <Link to="/admin/customers" className="btn-outline-gold btn-sm"><i className="bi bi-arrow-left me-1"></i>Back</Link>
      </div>

      <div className="row g-3">
        <div className="col-xl-3">
          <div className="stat-card"><div className="icon blue"><i className="bi bi-bag-check"></i></div><div><h3>{data.ordersCount || 0}</h3><small>Orders</small></div></div>
        </div>
        <div className="col-xl-3">
          <div className="stat-card"><div className="icon green"><i className="bi bi-cash-stack"></i></div><div><h3>{formatPrice(data.totalSpent)}</h3><small>Total Spent</small></div></div>
        </div>
        <div className="col-xl-3">
          <div className="stat-card"><div className="icon purple"><i className="bi bi-heart"></i></div><div><h3>{data.wishlistCount || 0}</h3><small>Wishlist</small></div></div>
        </div>
        <div className="col-xl-3">
          <div className="stat-card"><div className="icon gold"><i className="bi bi-star"></i></div><div><h3>{reviews.length}</h3><small>Reviews</small></div></div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="ad-card">
            <div className="card-title"><i className="bi bi-person-badge"></i> Profile</div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <img src={imageUrl(c.avatar, 'users')} className="table-avatar" style={{ width: 64, height: 64, borderRadius: '50%' }} alt="" />
              <div>
                <h5 className="mb-0">{c.name}</h5>
                <span className={`status-pill ${c.status === 'active' ? 'status-active' : 'status-cancelled'} mt-1`}>{titleCase(c.status)}</span>
              </div>
            </div>
            <div className="detail-grid">
              <div className="item"><div className="k">Email</div><div className="v">{c.email}</div></div>
              <div className="item"><div className="k">Phone</div><div className="v">{c.phone || '—'}</div></div>
              <div className="item"><div className="k">Address</div><div className="v">{c.address || '—'}</div></div>
              <div className="item"><div className="k">City / State</div><div className="v">{c.city ? `${c.city}, ${c.state || ''}` : '—'}</div></div>
              <div className="item"><div className="k">PIN</div><div className="v">{c.zip || '—'}</div></div>
              <div className="item"><div className="k">Email Verified</div><div className="v">{c.emailVerifiedAt ? 'Yes' : 'No'}</div></div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="ad-card">
            <div className="card-title"><i className="bi bi-receipt"></i> Order History ({orders.length})</div>
            <div className="ad-table-wrap">
              <table className="table ad-table">
                <thead><tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted py-3">No orders.</td></tr>
                  ) : orders.map((o) => (
                    <tr key={o.id}>
                      <td><strong>{o.orderNumber}</strong></td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>{formatPrice(o.total)}</td>
                      <td><span className={`status-pill status-${o.orderStatus}`}>{titleCase(o.orderStatus)}</span></td>
                      <td><Link to={`/admin/orders/${o.id}`} className="btn-outline-gold btn-sm">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ad-card">
            <div className="card-title"><i className="bi bi-star"></i> Recent Reviews ({reviews.length})</div>
            {reviews.length === 0 ? (
              <p className="text-muted mb-0">No reviews by this customer.</p>
            ) : reviews.map((rv) => (
              <div className="d-flex justify-content-between align-items-start border-bottom py-2" key={rv.id}>
                <div>
                  <strong>{rv.productName}</strong>
                  <span className="text-warning ms-2">{'★'.repeat(rv.rating || 0)}{'☆'.repeat(5 - (rv.rating || 0))}</span>
                  <p className="mb-0 text-muted small">{rv.comment}</p>
                </div>
                <span className={`status-pill status-${rv.status}`}>{rv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDetails;
