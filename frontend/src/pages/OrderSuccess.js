import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { user } = useAuth();
  const [data, setData] = useState({ order: null, items: [] });

  useEffect(() => {
    if (orderNumber) api.get(`/orders/${orderNumber}`).then(res => setData(res.data)).catch(() => {});
  }, [orderNumber]);

  const order = data.order;
  const fmt = (v) => `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <PageBanner title="Order Confirmation" items={[{ label: 'Home', to: '/' }, { label: 'Order Success' }]} />
      <section className="section">
        <div className="container" style={{maxWidth:780}}>
          <div className="profile-card text-center mb-4">
            <div style={{width:84,height:84,borderRadius:'50%',background:'#eaf7ef',color:'var(--bu-green)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,margin:'0 auto 18px'}}>
              <i className="bi bi-check-lg"></i>
            </div>
            <h3>Thank You, {user?.name?.split(' ')[0]}!</h3>
            <p className="text-muted">Your order has been placed successfully.</p>
            {order && (
              <div className="d-flex justify-content-center gap-3 flex-wrap mt-3">
                <div className="stat-card" style={{boxShadow:'none',border:'1px solid var(--bu-border)'}}>
                  <i className="bi bi-receipt"></i>
                  <div><h4 className="mb-0">{order.orderNumber}</h4><small>Order Number</small></div>
                </div>
                <div className="stat-card" style={{boxShadow:'none',border:'1px solid var(--bu-border)'}}>
                  <i className="bi bi-cash-stack"></i>
                  <div><h4 className="mb-0">{fmt(order.total)}</h4><small>Amount</small></div>
                </div>
              </div>
            )}
            <p className="text-muted small mt-3 mb-0">A confirmation email has been sent to <strong>{user?.email}</strong>.</p>
          </div>

          <div className="cart-table mb-4">
            <table className="table">
              <thead><tr><th style={{paddingLeft:20}}>Product</th><th className="text-center">Qty</th><th className="text-end" style={{paddingRight:20}}>Price</th></tr></thead>
              <tbody>
                {data.items.map(item => (
                  <tr key={item.id}>
                    <td data-label="Product">
                      <div className="cart-product">
                        <img src={item.productImage ? `http://localhost:8080/uploads/products/${item.productImage}` : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200'} alt="" />
                        <span>{item.productName}</span>
                      </div>
                    </td>
                    <td data-label="Qty" className="text-center">{item.quantity}</td>
                    <td data-label="Price" className="text-end">{fmt(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/my-orders" className="btn-gold">View My Orders</Link>
            <Link to="/track-order" className="btn-outline-gold">Track Order</Link>
            <Link to="/shop" className="btn-outline-gold">Continue Shopping</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderSuccess;
