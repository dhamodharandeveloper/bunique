import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import PageBanner from '../components/PageBanner';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [msg, setMsg] = useState('');
  const { fetchCounts } = useCart();

  const load = () => api.get('/cart').then(res => {
    setItems(res.data.items || []);
    setSubtotal(res.data.subtotal || 0);
  }).catch(() => {});

  useEffect(() => { load(); }, []);

  const updateQty = async (productId, qty) => {
    await api.post('/cart/update', { productId, quantity: qty });
    load(); fetchCounts();
  };

  const remove = async (productId) => {
    await api.post('/cart/remove', { productId });
    load(); fetchCounts();
  };

  const applyCoupon = async (e) => {
    e.preventDefault();
    const res = await api.post('/coupon/apply', { code });
    if (res.data.success) { setCoupon(res.data.coupon); setMsg('Coupon "' + res.data.coupon.code + '" applied!'); }
    else setMsg(res.data.message);
  };

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percent') {
      discount = subtotal * coupon.discountValue / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
    } else {
      discount = Math.min(Number(coupon.discountValue), subtotal);
    }
  }
  const tax = 0;
  const total = subtotal - discount + tax;
  const fmt = (v) => `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <PageBanner title="Shopping Cart" items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />

      <section className="section">
        <div className="container">
          {msg && <div className="alert alert-info">{msg}</div>}
          {items.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bag"></i>
              <h4>Your cart is empty</h4>
              <p className="text-muted">Looks like you haven't added anything yet. Explore our beautiful handcrafted collection!</p>
              <Link to="/shop" className="btn-gold">Start Shopping</Link>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="cart-table">
                  <table className="table table-responsive">
                    <thead>
                      <tr>
                        <th style={{paddingLeft:20}}>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th className="text-end" style={{paddingRight:20}}>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td data-label="Product">
                            <div className="cart-product">
                              <img src={item.image ? `http://localhost:8080/uploads/products/${item.image}` : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200'} alt={item.name} />
                              <div>
                                <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                <small className="d-block text-muted">SKU: {item.sku || 'N/A'}</small>
                                {item.stock <= 0 && <small className="text-danger">Out of stock</small>}
                              </div>
                            </div>
                          </td>
                          <td data-label="Price">{fmt(item.price)}</td>
                          <td data-label="Quantity">
                            <div className="qty-box">
                              <button type="button" onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}>&#8722;</button>
                              <input type="number" value={item.qty} readOnly />
                              <button type="button" onClick={() => updateQty(item.id, Math.min(item.qty + 1, Math.max(1, item.stock)))}>+</button>
                            </div>
                          </td>
                          <td data-label="Subtotal" className="text-end">{fmt(item.price * item.qty)}</td>
                          <td className="text-end">
                            <button className="cart-remove" onClick={() => remove(item.id)} title="Remove"><i className="bi bi-x-circle"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                  <Link to="/shop" className="btn-outline-gold"><i className="bi bi-arrow-left me-1"></i>Continue Shopping</Link>
                  <a href="#" className="text-muted small" onClick={(e) => { e.preventDefault(); setCoupon(null); setMsg(''); }}>Clear Cart Coupon</a>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="cart-summary">
                  <h5>Apply Coupon</h5>
                  <form className="coupon-box mb-4" onSubmit={applyCoupon}>
                    <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Coupon code (e.g. WELCOME10)" />
                    <button type="submit" className="btn btn-gold">Apply</button>
                  </form>

                  <h5>Order Summary</h5>
                  <div className="summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                  {discount > 0 && <div className="summary-row text-success"><span>Discount ({coupon.code})</span><span>-{fmt(discount)}</span></div>}
                  {tax > 0 && <div className="summary-row"><span>Tax</span><span>{fmt(tax)}</span></div>}
                  <div className="summary-row total"><span>Total</span><span>{fmt(total)}</span></div>

                  <Link to="/checkout" state={{ coupon }} className="btn-gold w-100 text-center mb-2" style={{padding:'12px 0'}}>Proceed to Checkout</Link>
                  <Link to="/wishlist" className="btn-outline-gold w-100 text-center" style={{padding:'10px 0'}}><i className="bi bi-heart me-1"></i>View Wishlist</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Cart;
