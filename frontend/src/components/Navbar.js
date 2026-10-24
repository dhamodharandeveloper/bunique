import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const active = location.pathname;

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  return (
    <nav className="main-nav">
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav me-auto">
              <li className="nav-item"><Link className={`nav-link ${active === '/' ? 'active' : ''}`} to="/">Home</Link></li>
              <li className="nav-item has-megamenu">
                <Link className={`nav-link ${active.includes('/shop') || active.includes('/category') ? 'active' : ''}`} to="/shop">Shop <i className="bi bi-chevron-down" style={{fontSize:'10px'}}></i></Link>
                <div className="megamenu">
                  <div className="row g-4">
                    <div className="col-md-3">
                      <h6>Categories</h6>
                      <ul>
                        <li><Link to="/shop">All Products</Link></li>
                        {categories.slice(0,6).map(cat => (
                          <li key={cat.id}><Link to={`/category/${cat.slug}`}>{cat.name}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-md-3">
                      <h6>More Categories</h6>
                      <ul>
                        {categories.slice(6,10).map(cat => (
                          <li key={cat.id}><Link to={`/category/${cat.slug}`}>{cat.name}</Link></li>
                        ))}
                        <li><Link to="/shop?sort=newest">New Arrivals</Link></li>
                        <li><Link to="/shop?filter=best">Best Sellers</Link></li>
                      </ul>
                    </div>
                    <div className="col-md-3">
                      <h6>Collections</h6>
                      <ul>
                        <li><Link to="/shop?filter=featured">Featured Pieces</Link></li>
                        <li><Link to="/shop?filter=sale">Sale Items</Link></li>
                        <li><Link to="/shop">Handcrafted</Link></li>
                        <li><Link to="/track-order">Track Your Order</Link></li>
                      </ul>
                    </div>
                    <div className="col-md-3">
                      <div className="featured-box">
                        <i className="bi bi-gem" style={{fontSize:'40px',color:'var(--bu-gold)'}}></i>
                        <h5>Handcrafted with Love</h5>
                        <p style={{fontSize:'13px',color:'var(--bu-muted)'}}>Every piece is made by our artisans using the finest materials.</p>
                        <Link to="/about" className="btn-gold" style={{padding:'8px 20px'}}>Our Story</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li className="nav-item"><Link className={`nav-link ${active === '/about' ? 'active' : ''}`} to="/about">About</Link></li>
              <li className="nav-item"><Link className={`nav-link ${active === '/contact' ? 'active' : ''}`} to="/contact">Contact</Link></li>
              <li className="nav-item"><Link className={`nav-link ${active === '/track-order' ? 'active' : ''}`} to="/track-order">Track Order</Link></li>
            </ul>
          </div>
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;
