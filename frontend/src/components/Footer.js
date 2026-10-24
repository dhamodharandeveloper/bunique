import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
    api.get('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/newsletter/subscribe', { email });
      setMsg(res.data.message);
      if (res.data.success) setEmail('');
    } catch (e) {
      setMsg('Something went wrong');
    }
  };

  return (
    <>
      <section className="newsletter-band">
        <div className="container text-center">
          <div className="section-title-wrap">
            <span className="eyebrow">Stay in touch</span>
            <h2 style={{color:'#fff'}}>Join Our Newsletter</h2>
            <p>Get exclusive offers, new arrivals and styling tips straight to your inbox.</p>
          </div>
          <form className="newsletter-form d-flex" onSubmit={handleSubscribe}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" required />
            <button type="submit" className="btn btn-gold">Subscribe</button>
          </form>
          {msg && <p className="mt-3 mb-0" style={{color:'#2e8b57',fontWeight:500}}>{msg}</p>}
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4 footer-about">
              <h5 className="text-uppercase">B.unique</h5>
              <p>{settings.about_us || ''}</p>
              <div className="footer-social">
                <a href={settings.instagram || '#'} aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                <a href={settings.whatsapp || '#'} aria-label="WhatsApp"><i className="bi bi-whatsapp"></i></a>
              </div>
            </div>
            <div className="col-lg-2 col-6">
              <h5>Shop</h5>
              <ul>
                <li><Link to="/shop">All Products</Link></li>
                <li><Link to="/shop?filter=featured">Featured</Link></li>
                <li><Link to="/shop?sort=newest">New Arrivals</Link></li>
                <li><Link to="/shop?filter=best">Best Sellers</Link></li>
                <li><Link to="/shop?filter=sale">Sale Items</Link></li>
              </ul>
            </div>
            <div className="col-lg-2 col-6">
              <h5>Categories</h5>
              <ul>
                {categories.slice(0,5).map(cat => (
                  <li key={cat.id}><Link to={`/category/${cat.slug}`}>{cat.name}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-lg-2 col-6">
              <h5>Company</h5>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/track-order">Track Order</Link></li>
                <li><Link to="/return-policy">Return Policy</Link></li>
              </ul>
            </div>
            <div className="col-lg-2 col-6">
              <h5>Help</h5>
              <ul>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/return-policy">Returns</Link></li>
                <li><Link to="/faq">Support</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p>&copy; {new Date().getFullYear()} B.unique Handmade Jewellery. All rights reserved.</p>
            <div className="payment-icons">
              <i className="bi bi-phone"></i>
              <span className="small">UPI</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
