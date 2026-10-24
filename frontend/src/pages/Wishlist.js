import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import PageBanner from '../components/PageBanner';

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/wishlist').then(res => { setItems(res.data.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, [user, navigate]);

  return (
    <>
      <PageBanner title="My Wishlist" items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <section className="section">
        <div className="container">
          {loading ? <p>Loading...</p> : items.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-heart"></i>
              <h4>Your wishlist is empty</h4>
              <p className="text-muted">Save your favourite pieces and they'll appear here.</p>
              <Link to="/shop" className="btn-gold">Browse Products</Link>
            </div>
          ) : (
            <div className="row">
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Wishlist;
