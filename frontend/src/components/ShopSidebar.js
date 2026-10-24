import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ShopSidebar = ({ categories = [], currentCategory = '', minPrice = '', maxPrice = '' }) => {
  const navigate = useNavigate();
  const [min, setMin] = useState(minPrice || '');
  const [max, setMax] = useState(maxPrice || '');

  useEffect(() => { setMin(minPrice || ''); }, [minPrice]);
  useEffect(() => { setMax(maxPrice || ''); }, [maxPrice]);

  const applyPrice = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (currentCategory) params.set('slug', currentCategory);
    if (min !== '') params.set('min_price', min);
    if (max !== '') params.set('max_price', max);
    const base = currentCategory ? `/category/${currentCategory}` : '/shop';
    navigate(`${base}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <aside>
      <div className="filter-card">
        <h6>Categories</h6>
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            name="cat"
            id="catAll"
            checked={!currentCategory}
            onChange={() => navigate('/shop')}
          />
          <label className="form-check-label" htmlFor="catAll">All Categories</label>
        </div>
        {categories.map((cat) => (
          <div className="form-check mb-2" key={cat.id}>
            <input
              className="form-check-input"
              type="radio"
              name="cat"
              id={`cat${cat.id}`}
              checked={currentCategory === cat.slug}
              onChange={() => navigate(`/category/${cat.slug}`)}
            />
            <label className="form-check-label d-flex justify-content-between" htmlFor={`cat${cat.id}`}>
              <span>{cat.name}</span>
              <span className="text-muted small">({cat.productCount || 0})</span>
            </label>
          </div>
        ))}
      </div>

      <div className="filter-card">
        <h6>Price</h6>
        <form onSubmit={applyPrice}>
          <div className="d-flex gap-2">
            <input
              type="number"
              className="form-control"
              placeholder="Min"
              min="0"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Max"
              min="0"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-gold w-100 text-center mt-3" style={{ padding: '9px 0' }}>Apply</button>
        </form>
      </div>

      <div className="filter-card">
        <h6>Quick Filters</h6>
        <ul className="list-unstyled mb-0">
          <li className="mb-2"><Link to="/shop?filter=featured"><i className="bi bi-gem me-2"></i>Featured</Link></li>
          <li className="mb-2"><Link to="/shop?filter=newest"><i className="bi bi-stars me-2"></i>New Arrivals</Link></li>
          <li className="mb-2"><Link to="/shop?filter=best"><i className="bi bi-trophy me-2"></i>Best Sellers</Link></li>
          <li><Link to="/shop?filter=sale"><i className="bi bi-tags me-2"></i>On Sale</Link></li>
        </ul>
      </div>
    </aside>
  );
};

export default ShopSidebar;
