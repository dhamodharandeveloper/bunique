import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSuggest(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    const term = value.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      api.get('/products', { params: { search: term, size: 5, page: 0 } })
        .then((res) => {
          setSuggestions(res.data.products || []);
          setShowSuggest((res.data.products || []).length > 0);
        })
        .catch(() => {});
    }, 250);
  };

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSuggest(false);
    };
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <header className="main-header">
      <div className="container">
        <div className="header-inner">
          <Link className="logo" to="/">
            B.unique
            <small>Handmade Jewellery</small>
          </Link>

          <div className="header-search" ref={wrapRef}>
            <form onSubmit={handleSearch}>
              <input type="search" value={search} onChange={handleChange} placeholder="Search for jewellery..." autoComplete="off" />
              <button type="submit" aria-label="Search"><i className="bi bi-search"></i></button>
            </form>
            <div className={`search-suggest ${showSuggest ? 'show' : ''}`} id="searchSuggest">
              {suggestions.map((p) => (
                <Link
                  className="suggestion"
                  key={p.id}
                  to={`/product/${p.slug}`}
                  onClick={() => setShowSuggest(false)}
                >
                  <span
                    className="thumb"
                    style={{ backgroundImage: `url(${p.image ? `http://localhost:8080/uploads/products/${p.image}` : ''})` }}
                  ></span>
                  <span className="name">{p.name}</span>
                  <span className="price">₹ {Number(p.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="header-actions">
            {user ? (
              <>
                <Link className="header-action" to="/profile">
                  <i className="bi bi-person-circle"></i><span>Hi, {user.name?.split(' ')[0]}</span>
                </Link>
                <Link className="header-action" to="/wishlist">
                  <i className="bi bi-heart"></i>
                  <span>Wishlist</span>
                  {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
                </Link>
                <Link className="header-action" to="/cart">
                  <i className="bi bi-bag"></i>
                  <span>Cart</span>
                  {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                </Link>
                <Link className="header-action" to="/" onClick={(e) => { e.preventDefault(); logout(); }}>
                  <i className="bi bi-box-arrow-right"></i><span>Logout</span>
                </Link>
              </>
            ) : (
              <>
                <Link className="header-action" to="/wishlist">
                  <i className="bi bi-heart"></i><span>Wishlist</span>
                  {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
                </Link>
                <Link className="header-action" to="/cart">
                  <i className="bi bi-bag"></i><span>Cart</span>
                  {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                </Link>
                <Link className="header-action" to="/login">
                  <i className="bi bi-person"></i><span>Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
