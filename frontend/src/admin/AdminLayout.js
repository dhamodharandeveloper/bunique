import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const readAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem('admin') || 'null');
  } catch (e) {
    return null;
  }
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(readAdmin());
  const [checking, setChecking] = useState(!readAdmin());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({ pendingOrders: 0, pendingReviews: 0 });

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/admin.css';
    link.id = 'bunique-admin-css';
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById('bunique-admin-css');
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }
    if (admin) {
      setChecking(false);
    }
    api.get('/admin/auth/me')
      .then((res) => {
        if (!active) return;
        if (res.data && res.data.success) {
          localStorage.setItem('admin', JSON.stringify(res.data.admin));
          setAdmin(res.data.admin);
        } else {
          localStorage.removeItem('admin');
          navigate('/login', { replace: true });
        }
      })
      .catch(() => {
        if (!active) return;
        if (!readAdmin()) navigate('/login', { replace: true });
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!admin) return;
    api.get('/admin/dashboard')
      .then((res) => setBadges({
        pendingOrders: res.data.pendingOrders || 0,
        pendingReviews: res.data.pendingReviews || 0,
      }))
      .catch(() => {});
  }, [admin, location.pathname]);

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLink = (to, icon, label, end = false, badge = 0) => (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
      <i className={`bi ${icon}`}></i> {label}
      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </NavLink>
  );

  if (checking) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f4f1ec' }}>
        <div className="text-center">
          <div className="spinner-border" style={{ color: '#b98a4e' }} role="status"></div>
          <p className="mt-3 text-muted mb-0">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link className="admin-brand" to="/admin">
          B.unique
          <small>Admin Panel</small>
        </Link>
        <nav className="admin-nav">
          {navLink('/admin', 'bi-grid-1x2', 'Dashboard', true)}

          <div className="nav-heading">Catalogue</div>
          {navLink('/admin/products', 'bi-gem', 'Products')}
          {navLink('/admin/categories', 'bi-collection', 'Categories')}
          {navLink('/admin/banners', 'bi-images', 'Banners')}
          {navLink('/admin/coupons', 'bi-tags', 'Coupons')}

          <div className="nav-heading">Sales</div>
          {navLink('/admin/orders', 'bi-bag-check', 'Orders', false, badges.pendingOrders)}
          {navLink('/admin/customers', 'bi-people', 'Customers')}

          <div className="nav-heading">Engagement</div>
          {navLink('/admin/reviews', 'bi-star', 'Reviews', false, badges.pendingReviews)}
          {navLink('/admin/newsletter', 'bi-envelope-paper', 'Newsletter')}

          <div className="nav-heading">System</div>
          {navLink('/admin/settings', 'bi-sliders', 'Settings')}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" target="_blank"><i className="bi bi-browser-chrome"></i> View Website</Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-toggle d-lg-none" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <i className="bi bi-list"></i>
          </button>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <Link to="/" target="_blank" className="top-link" title="View site"><i className="bi bi-globe"></i></Link>
            <div className="dropdown">
              <button className="admin-user" data-bs-toggle="dropdown" type="button">
                <span className="avatar">{String(admin?.name || 'A').charAt(0).toUpperCase()}</span>
                <span className="d-none d-md-inline">{admin?.name || 'Admin'}</span>
                <i className="bi bi-chevron-down ms-1" style={{ fontSize: 12 }}></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to="/admin/profile"><i className="bi bi-person me-2"></i>My Profile</Link></li>
                <li><Link className="dropdown-item" to="/" target="_blank"><i className="bi bi-browser-chrome me-2"></i>View Website</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item text-danger" href="#" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i>Logout</a></li>
              </ul>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>

        <footer className="admin-footer">
          &copy; {new Date().getFullYear()} B.unique Admin &bull; Version 1.0
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
