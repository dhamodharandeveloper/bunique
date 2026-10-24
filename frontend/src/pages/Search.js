import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import PageBanner from '../components/PageBanner';

const Search = () => {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim();
  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (q.length < 2) { setData({ products: [], categories: [] }); setLoading(false); return; }
    api.get('/products', { params: { search: q, size: 48, page: 0 } })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [q]);

  return (
    <>
      <PageBanner title="Search Results" items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
      <section className="section">
        <div className="container">
          <div className="mb-4">
            <h5 className="mb-1">Results for: "{q}"</h5>
            <small className="text-muted">{(data.products || []).length} product(s) found</small>
          </div>
          {loading ? <p>Loading...</p> : (data.products || []).length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-search"></i>
              <h4>No matching products</h4>
              <p className="text-muted">Try a different keyword or browse our collection.</p>
              <Link to="/shop" className="btn-gold">Browse Shop</Link>
            </div>
          ) : (
            <div className="row">
              {(data.products || []).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Search;
