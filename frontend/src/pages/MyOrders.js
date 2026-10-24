import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';

const statusColors = {
  pending: ['#e67e22', 'Pending'], confirmed: ['#2980b9', 'Confirmed'],
  shipped: ['#8e44ad', 'Shipped'], delivered: ['#2e8b57', 'Delivered'],
  cancelled: ['#c0392b', 'Cancelled'], returned: ['#7f8c8d', 'Returned']
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders').then(res => setOrders(res.data.orders || [])).catch(() => {});
  }, [user, navigate]);

  const fmt = (v) => `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <PageBanner title="My Orders" items={[{ label: 'Home', to: '/' }, { label: 'My Orders' }]} />
      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-3"><ProfileSidebar /></div>
            <div className="col-lg-9">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-box-seam"></i>
                  <h4>No orders yet</h4>
                  <p className="text-muted">When you place an order, it will appear here.</p>
                  <Link to="/shop" className="btn-gold">Start Shopping</Link>
                </div>
              ) : orders.map(o => {
                const sc = statusColors[o.orderStatus] || ['#7f8c8d', o.orderStatus];
                return (
                  <div className="order-card" key={o.id}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <h5 className="mb-1">{o.orderNumber}</h5>
                        <small className="text-muted">Placed on {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                      </div>
                      <div className="text-end">
                        <span className="badge rounded-pill" style={{background: sc[0], color:'#fff'}}>
                          <span className="order-status-dot" style={{background:'#fff'}}></span>{sc[1]}
                        </span>
                        <div className="mt-1"><strong>{fmt(o.total)}</strong></div>
                      </div>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <span className="text-muted small">
                        <i className="bi bi-cash me-1"></i>{(o.paymentMethod || '').toUpperCase()}
                        &nbsp;|&nbsp; <i className="bi bi-credit-card me-1"></i>{o.paymentStatus?.charAt(0).toUpperCase() + o.paymentStatus?.slice(1)}
                      </span>
                      <div className="d-flex gap-2">
                        <Link to={`/order-details/${o.id}`} className="btn-outline-gold" style={{padding:'7px 18px'}}>View Details</Link>
                        <Link to={`/track-order?order_number=${encodeURIComponent(o.orderNumber)}`} className="btn-gold" style={{padding:'7px 18px'}}>Track</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyOrders;
