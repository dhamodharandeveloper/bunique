import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { fetchCounts } = useCart();
  const navigate = useNavigate();

  const price = Number(product.price || 0);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : 0;
  const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  const imgUrl = product.image
    ? `http://localhost:8080/uploads/products/${product.image}`
    : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';
  const catName = product.category?.name || product.categoryName || product.category_name || '';

  const addToWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/wishlist/add', { productId: product.id });
      fetchCounts();
    } catch (e) {}
  };

  const addToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/cart/add', { productId: product.id, quantity: 1 });
      fetchCounts();
    } catch (e) {}
  };

  return (
    <div className="col-lg-3 col-md-4 col-6 mb-4">
      <div className="product-card">
        <div className="product-img">
          {discount > 0 ? (
            <div className="product-badges"><span className="badge-sale">-{discount}%</span></div>
          ) : product.isNew ? (
            <div className="product-badges"><span className="badge-new">New</span></div>
          ) : null}
          {product.isBestSeller && (
            <div className="product-badges" style={{ top: discount > 0 ? '40px' : '12px' }}>
              <span className="badge-best">Best Seller</span>
            </div>
          )}

          <div className="product-actions">
            <button type="button" onClick={addToCart} title="Add to cart" aria-label="Add to cart"><i className="bi bi-bag-plus"></i></button>
            <button type="button" onClick={addToWishlist} title="Wishlist" aria-label="Wishlist"><i className="bi bi-heart"></i></button>
            <Link to={`/product/${product.slug}`} title="View" aria-label="View"><i className="bi bi-eye"></i></Link>
          </div>

          <Link to={`/product/${product.slug}`}>
            <img src={imgUrl} alt={product.name} loading="lazy" />
          </Link>
        </div>
        <div className="product-info">
          <span className="cat-label">{catName}</span>
          <h6><Link to={`/product/${product.slug}`}>{product.name}</Link></h6>
          <div className="product-price">
            <span className="price">₹ {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {oldPrice > 0 && <span className="old-price">₹ {oldPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
            {discount > 0 && <span className="discount">({discount}% off)</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
