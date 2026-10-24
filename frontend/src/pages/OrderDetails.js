import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';

const statusColors = {
  pending: '#e67e22', confirmed: '#2980b9', shipped: '#8e44ad',
  delivered: '#2e8b57', cancelled: '#c0392b', returned: '#7f8c8d'
};

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ order: null, items: [] });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/orders/id/${id}`).then(res => setData(res.data)).catch(() => {});
  }, [id, user, navigate]);

  const order = data.order;
  const fmt = (v) => `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const statusFlow = ['pending', 'confirmed', 'shipped', 'delivered'];
  const labels = ['Order Placed', 'Order Confirmed', 'Order Shipped', 'Order Delivered'];
  const currentIdx = order ? statusFlow.indexOf(order.orderStatus) : -1;

  if (!order) return <div className="container py-5">Loading...</div>;

  return (
    <>
      <PageBanner title={`Order ${order.orderNumber}`} items={[{ label: 'Home', to: '/' }, { label: 'My Orders', to: '/my-orders' }, { label: order.orderNumber }]} />
      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-3"><ProfileSidebar /></div>
            <div className="col-lg-9">
              <div className="order-card">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1">Order #{order.orderNumber}</h5>
                    <small className="text-muted">Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                  </div>
                  <div className="text-end">
                    <span className="badge rounded-pill text-uppercase" style={{background: statusColors[order.orderStatus] || '#7f8c8d', color:'#fff'}}>{order.orderStatus}</span>
                    <span className="badge rounded-pill text-uppercase ms-1" style={{background:'#34495e', color:'#fff'}}>{order.paymentStatus}</span>
                  </div>
                </div>

                {currentIdx !== -1 && order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned' && (
                  <div className="mt-4">
                    <h6 className="text-uppercase mb-3" style={{fontSize:12,letterSpacing:'1.5px',color:'var(--bu-muted)'}}>Order Progress</h6>
                    <div className="timeline">
                      {statusFlow.map((st, i) => (
                        <div className={`step ${currentIdx >= i ? 'done' : ''}`} key={st}>
                          <h6>{labels[i]}</h6>
                          <small className="text-muted">{currentIdx >= i ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Pending'}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="cart-table mb-4">
                <table className="table">
                  <thead><tr><th style={{paddingLeft:20}}>Product</th><th className="text-center">Qty</th><th className="text-end">Price</th><th className="text-end" style={{paddingRight:20}}>Total</th></tr></thead>
                  <tbody>
                    {data.items.map(item => (
                      <tr key={item.id}>
                        <td data-label="Product">
                          <div className="cart-product">
                            <img src={item.productImage ? `http://localhost:8080/uploads/products/${item.productImage}` : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200'} alt="" />
                            <div>
                              <span>{item.productName}</span>
                              <small className="d-block text-muted">Price per piece</small>
                            </div>
                          </div>
                        </td>
                        <td data-label="Qty" className="text-center">{item.quantity}</td>
                        <td data-label="Price" className="text-end">{fmt(item.price)}</td>
                        <td data-label="Total" className="text-end">{fmt(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="order-card">
                    <h6 className="text-uppercase mb-3" style={{fontSize:12,letterSpacing:'1.5px',color:'var(--bu-muted)'}}>Contact Details</h6>
                    <p className="mb-1"><strong>{order.shippingName}</strong></p>
                    <p className="mb-1"><i className="bi bi-envelope me-1"></i>{order.shippingEmail}</p>
                    <p className="mb-0"><i className="bi bi-telephone me-1"></i>{order.shippingPhone}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="order-card">
                    <h6 className="text-uppercase mb-3" style={{fontSize:12,letterSpacing:'1.5px',color:'var(--bu-muted)'}}>Payment Summary</h6>
                    <div className="summary-row"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                    {Number(order.discount) > 0 && <div className="summary-row text-success"><span>Discount</span><span>-{fmt(order.discount)}</span></div>}
                    {Number(order.tax) > 0 && <div className="summary-row"><span>Tax</span><span>{fmt(order.tax)}</span></div>}
                    <div className="summary-row total"><span>Total Paid</span><span>{fmt(order.total)}</span></div>
                    <hr />
                    <p className="small text-muted mb-0"><i className="bi bi-cash me-1"></i>Paid via {(order.paymentMethod || '').toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-2">
                <Link to="/my-orders" className="btn-outline-gold"><i className="bi bi-arrow-left me-1"></i>Back to Orders</Link>
                {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                  <button className="btn-gold" onClick={async () => {
                    if (window.confirm('Cancel this order?')) {
                      await api.post(`/orders/${order.orderNumber}/cancel`);
                      navigate('/my-orders');
                    }
                  }}>Cancel Order</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderDetails;
