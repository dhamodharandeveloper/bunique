import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatDate, formatPrice, imageUrl, titleCase } from './utils';

const Dashboard = () => {
  const [data, setData] = useState({
    totalSales: 0, totalOrders: 0, todayOrders: 0, totalCustomers: 0, totalProducts: 0,
    totalSubscribers: 0, pendingOrders: 0, pendingReviews: 0, lowStockCount: 0,
    statusBreakdown: {}, recentOrders: [], lowStock: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => { setError('Unable to load dashboard data.'); setLoading(false); });
  }, []);

  const admin = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || 'null'); } catch (e) { return null; }
  })();

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const stats = [
    { icon: 'bi-cash-stack', color: 'gold', value: formatPrice(data.totalSales), label: 'Revenue' },
    { icon: 'bi-bag-check', color: 'blue', value: data.totalOrders, label: 'Orders' },
    { icon: 'bi-bag-plus', color: 'green', value: data.todayOrders, label: "Today's Orders" },
    { icon: 'bi-people', color: 'purple', value: data.totalCustomers, label: 'Customers' },
    { icon: 'bi-gem', color: 'red', value: data.totalProducts, label: 'Products' },
    { icon: 'bi-envelope-paper', color: 'gold', value: data.totalSubscribers, label: 'Subscribers' },
  ];

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h4 className="mb-0">Dashboard</h4>
          <small className="text-muted">
            Welcome back, {admin?.name || 'Admin'}. Here's what's happening today ({today}).
          </small>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? <p>Loading…</p> : (
        <>
          <div className="row g-3">
            {stats.map((s) => (
              <div className="col-xl-2 col-md-4 col-6" key={s.label}>
                <div className="stat-card">
                  <div className={`icon ${s.color}`}><i className={`bi ${s.icon}`}></i></div>
                  <div><h3>{s.value}</h3><small>{s.label}</small></div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3">
            <div className="col-lg-8">
              <div className="ad-card">
                <div className="card-title"><i className="bi bi-clock-history"></i> Recent Orders</div>
                <div className="ad-table-wrap">
                  <table className="table ad-table">
                    <thead>
                      <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {(!data.recentOrders || data.recentOrders.length === 0) ? (
                        <tr><td colSpan="6" className="text-center text-muted py-4">No orders yet.</td></tr>
                      ) : data.recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td><strong>{o.orderNumber}</strong></td>
                          <td>{o.customerName}</td>
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
                <div className="card-title"><i className="bi bi-exclamation-triangle"></i> Low Stock Alerts</div>
                <div className="ad-table-wrap">
                  <table className="table ad-table">
                    <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Price</th><th></th></tr></thead>
                    <tbody>
                      {(!data.lowStock || data.lowStock.length === 0) ? (
                        <tr><td colSpan="5" className="text-center text-muted py-4">All products have sufficient stock.</td></tr>
                      ) : data.lowStock.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img src={imageUrl(p.image)} className="table-avatar" alt={p.name} />
                              {p.name}
                            </div>
                          </td>
                          <td>{p.sku || 'N/A'}</td>
                          <td><span className={`status-pill ${Number(p.stock) === 0 ? 'status-cancelled' : 'status-pending'}`}>{p.stock}</span></td>
                          <td>{formatPrice(p.price)}</td>
                          <td><Link to={`/admin/products/edit/${p.id}`} className="btn-outline-gold btn-sm">Update</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="ad-card">
                <div className="card-title"><i className="bi bi-speedometer2"></i> Quick Actions</div>
                <div className="d-grid gap-2">
                  <Link to="/admin/products/add" className="btn-gold"><i className="bi bi-plus-circle me-1"></i> Add Product</Link>
                  <Link to="/admin/categories" className="btn-outline-gold"><i className="bi bi-plus me-1"></i> Add Category</Link>
                  <Link to="/admin/coupons" className="btn-outline-gold"><i className="bi bi-tag me-1"></i> Create Coupon</Link>
                  <Link to="/admin/banners" className="btn-outline-gold"><i className="bi bi-image me-1"></i> Add Banner</Link>
                  <Link to="/admin/orders?status=pending" className="btn-outline-gold"><i className="bi bi-hourglass me-1"></i> Pending Orders ({data.pendingOrders || 0})</Link>
                </div>
              </div>

              <div className="ad-card">
                <div className="card-title"><i className="bi bi-inbox"></i> Needs Attention</div>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span><i className="bi bi-star me-2 text-warning"></i>Pending Reviews</span>
                    <span className="badge bg-warning">{data.pendingReviews || 0}</span>
                  </li>
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span><i className="bi bi-box-seam me-2 text-primary"></i>Low Stock Items</span>
                    <span className="badge bg-primary">{data.lowStockCount || 0}</span>
                  </li>
                  <li className="d-flex justify-content-between py-2">
                    <span><i className="bi bi-truck me-2 text-success"></i>Pending Shipments</span>
                    <span className="badge bg-success">{data.pendingShipments || 0}</span>
                  </li>
                </ul>
              </div>

              <div className="ad-card">
                <div className="card-title"><i className="bi bi-bar-chart"></i> Order Status Breakdown</div>
                {statuses.map((st) => (
                  <div className="d-flex justify-content-between align-items-center py-1" style={{ fontSize: 13 }} key={st}>
                    <span className="text-capitalize">{st}</span>
                    <strong>{(data.statusBreakdown && data.statusBreakdown[st]) || 0}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
