import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';

const statusColors = {
  pending: '#e67e22', confirmed: '#2980b9', shipped: '#8e44ad',
  delivered: '#2e8b57', cancelled: '#c0392b', returned: '#7f8c8d'
};

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order_number') || '');
  const [data, setData] = useState(null);
  const [searched, setSearched] = useState(false);

  const track = async (num) => {
    if (!num) return;
    setSearched(true);
    try {
      const res = await api.get('/orders/track', { params: { orderNumber: num } });
      setData(res.data.success ? res.data : null);
    } catch (e) { setData(null); }
  };

  useEffect(() => {
    const num = searchParams.get('order_number');
    if (num) track(num);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setSearchParams({ order_number: orderNumber });
    track(orderNumber);
  };

  const order = data?.order;
  const fmt = (v) => `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const statusFlow = ['pending', 'confirmed', 'shipped', 'delivered'];
  const labels = ['Order Placed', 'Order Confirmed', 'Order Shipped', 'Order Delivered'];
  const currentIdx = order ? statusFlow.indexOf(order.orderStatus) : -1;

  return (
    <>
      <PageBanner title="Track Order" items={[{ label: 'Home', to: '/' }, { label: 'Track Order' }]} />
      <section className="section">
        <div className="container" style={{maxWidth:760}}>
          <div className="profile-card text-center mb-4">
            <div style={{width:70,height:70,borderRadius:'50%',background:'var(--bu-cream-2)',color:'var(--bu-gold)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 16px'}}>
              <i className="bi bi-truck"></i>
            </div>
            <h4>Track Your Order</h4>
            <p className="text-muted">Enter your order number to see its current status.</p>
            <form className="d-flex mx-auto" style={{maxWidth:420}} onSubmit={submit}>
              <input type="text" className="form-control me-2" placeholder="e.g. BU260804XXXX" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
              <button type="submit" className="btn-gold" style={{border:0}}><i className="bi bi-search me-1"></i>Track</button>
            </form>
          </div>

          {searched && !order && (
            <div className="empty-state">
              <i className="bi bi-emoji-frown"></i>
              <h4>Order not found</h4>
              <p className="text-muted">Please check your order number and try again.</p>
            </div>
          )}

          {order && (
            <>
              <div className="order-card">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <h5 className="mb-0">Order #{order.orderNumber}</h5>
                    <small className="text-muted">Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                  </div>
                  <span className="badge rounded-pill text-uppercase" style={{background: statusColors[order.orderStatus] || '#7f8c8d', color:'#fff'}}>
                    {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                  </span>
                </div>
                <hr />
                <div className="timeline mt-3">
                  {statusFlow.map((st, i) => (
                    <div className={`step ${currentIdx >= i ? 'done' : ''}`} key={st}>
                      <h6>{labels[i]}</h6>
                      <small className="text-muted">{currentIdx >= i ? new Date(order.createdAt).toLocaleString('en-IN') : 'Pending'}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cart-table">
                <table className="table">
                  <thead><tr><th style={{paddingLeft:20}}>Product</th><th className="text-center">Qty</th><th className="text-end" style={{paddingRight:20}}>Amount</th></tr></thead>
                  <tbody>
                    {(data.items || []).map(item => (
                      <tr key={item.id}>
                        <td data-label="Product">
                          <div className="cart-product">
                            <img src={item.productImage ? `http://localhost:8080/uploads/products/${item.productImage}` : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200'} alt="" />
                            <span>{item.productName}</span>
                          </div>
                        </td>
                        <td data-label="Qty" className="text-center">{item.quantity}</td>
                        <td data-label="Amount" className="text-end">{fmt(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default TrackOrder;
