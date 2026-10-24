import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [form, setForm] = useState({ shipName: '', shipPhone: '', shipEmail: '', paymentMethod: 'upi' });
  const [msg, setMsg] = useState('');
  const coupon = location.state?.coupon || null;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/cart').then(res => {
      setItems(res.data.items || []);
      setSubtotal(res.data.subtotal || 0);
    });
    setForm(f => ({ ...f, shipName: user.name || '', shipPhone: user.phone || '', shipEmail: user.email || '' }));
  }, [user, navigate]);

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percent') {
      discount = subtotal * coupon.discountValue / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
    } else discount = Math.min(Number(coupon.discountValue), subtotal);
  }
  const total = subtotal - discount;
  const fmt = (v) => `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.post('/orders', { ...form, couponId: coupon?.id });
    if (res.data.success) navigate(`/order-success?order=${res.data.orderNumber}`);
    else setMsg(res.data.message);
  };

  return (
    <>
      <PageBanner title="Checkout" items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />

      <section className="section">
        <div className="container">
          {msg && <div className="alert alert-danger">{msg}</div>}
          <form onSubmit={submit} id="checkoutForm">
            <div className="row g-4">
              <div className="col-lg-8 checkout-section">
                <div className="profile-card mb-4">
                  <h5 className="mb-4"><i className="bi bi-person me-2 text-gold"></i>Contact Details</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-control" value={form.shipName} onChange={e => setForm({...form, shipName: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone *</label>
                      <input type="tel" className="form-control" value={form.shipPhone} onChange={e => setForm({...form, shipPhone: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email *</label>
                      <input type="email" className="form-control" value={form.shipEmail} onChange={e => setForm({...form, shipEmail: e.target.value})} required />
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <h5 className="mb-4"><i className="bi bi-phone me-2 text-gold"></i>Payment Method</h5>
                  <div className="payment-option selected">
                    <input type="radio" name="payment_method" value="upi" checked readOnly />
                    <i className="bi bi-phone fs-4 text-gold"></i>
                    <div><strong>UPI</strong><small className="d-block text-muted">GPay, PhonePe, Paytm</small></div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="cart-summary sticky-top" style={{top:90}}>
                  <h5>Your Order</h5>
                  {items.map(item => (
                    <div className="d-flex justify-content-between align-items-center mb-2" key={item.id}>
                      <div className="d-flex align-items-center gap-2">
                        <img src={item.image ? `http://localhost:8080/uploads/products/${item.image}` : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100'} alt={item.name} style={{width:42,height:42,borderRadius:6,objectFit:'cover'}} />
                        <span className="small">{item.name} <span className="text-muted">x{item.qty}</span></span>
                      </div>
                      <span className="small fw-semibold">{fmt(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                  {discount > 0 && <div className="summary-row text-success"><span>Discount</span><span>-{fmt(discount)}</span></div>}
                  <div className="summary-row total"><span>Total Payable</span><span>{fmt(total)}</span></div>
                  <button type="submit" className="btn-gold w-100 text-center" style={{padding:'13px 0'}}>Place Order <i className="bi bi-arrow-right ms-1"></i></button>
                  <p className="text-muted small text-center mt-3 mb-0"><i className="bi bi-shield-lock me-1"></i>Your payment details are secure.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
