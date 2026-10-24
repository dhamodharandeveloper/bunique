import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const UPLOAD_BASE = 'http://localhost:8080/uploads/products/';

const formatPrice = (value) => {
  const amount = Number(value || 0);
  return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const productImageUrl = (image) => image ? `${UPLOAD_BASE}${image}` : '';

const Stars = ({ rating = 0 }) => (
  <span className="star-rating">
    {[1, 2, 3, 4, 5].map((i) => (
      <i key={i} className={`bi ${i <= rating ? 'bi-star-fill' : 'bi-star'}`}></i>
    ))}
  </span>
);

const timeAgo = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const intervals = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, secondsIn] of intervals) {
    const count = Math.floor(seconds / secondsIn);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCounts } = useCart();

  const [data, setData] = useState({ product: null, images: [], reviews: [], related: [], avgRating: 0, reviewCount: 0 });
  const [settings, setSettings] = useState({});
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [activeTab, setActiveTab] = useState('desc');
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomImage, setZoomImage] = useState('');
  const [actionMsg, setActionMsg] = useState(null);
  const [reviewMsg, setReviewMsg] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setNotFound(false);
    setData({ product: null, images: [], reviews: [], related: [], avgRating: 0, reviewCount: 0 });
    setActiveTab('desc');
    setActionMsg(null);
    setReviewMsg(null);
    setQty(1);

    api.get(`/products/${slug}`)
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setMainImage(productImageUrl(res.data.product && res.data.product.image));
      })
      .catch(() => { if (active) setNotFound(true); });

    api.get('/settings').then((res) => { if (active) setSettings(res.data || {}); }).catch(() => {});

    return () => { active = false; };
  }, [slug]);

  const product = data.product;
  const reviews = data.reviews || [];
  const images = data.images || [];

  useEffect(() => {
    if (!user || !product) { setWishlisted(false); return; }
    let active = true;
    api.get('/wishlist')
      .then((res) => {
        if (active) setWishlisted((res.data.items || []).some((item) => item.id === product.id));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [user, product]);

  const galleryImages = useMemo(() => {
    const list = [];
    const primary = product ? productImageUrl(product.image) : '';
    if (primary) list.push(primary);
    images.forEach((img) => {
      const url = productImageUrl(img.image);
      if (url && !list.includes(url)) list.push(url);
    });
    return list;
  }, [product, images]);

  if (notFound) {
    return (
      <div className="container py-5 text-center">
        <h2>Product not found</h2>
        <p className="text-muted">The product you are looking for is no longer available.</p>
        <Link to="/shop" className="btn-gold">Continue Shopping</Link>
      </div>
    );
  }

  if (!product) return <div className="container py-5">Loading...</div>;

  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);
  const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  const categoryName = product.category?.name || product.categoryName || 'Jewellery';
  const categorySlug = product.category?.slug || product.categorySlug || '';
  const avgRating = Number(data.avgRating || 0);
  const reviewCount = data.reviewCount != null ? data.reviewCount : reviews.length;
  const returnsDays = Number(settings.returns_days || 7);

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
  ];
  if (categorySlug) breadcrumbItems.push({ label: categoryName, to: `/category/${categorySlug}` });
  breadcrumbItems.push({ label: product.name });

  const addToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.post('/cart/add', { productId: product.id, quantity: qty });
      fetchCounts();
      setActionMsg({ type: 'success', text: res.data.message || 'Added to cart!' });
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Could not add this product to your cart.' });
    }
  };

  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.post(wishlisted ? '/wishlist/remove' : '/wishlist/add', { productId: product.id });
      setWishlisted(!wishlisted);
      fetchCounts();
      setActionMsg({ type: 'success', text: res.data.message || (wishlisted ? 'Removed from wishlist.' : 'Added to wishlist.') });
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Could not update your wishlist.' });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewMsg(null);
    if (!reviewForm.comment.trim()) {
      setReviewMsg({ type: 'danger', text: 'Please write a short review.' });
      return;
    }
    try {
      await api.post('/reviews', {
        productId: product.id,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      setReviewMsg({ type: 'success', text: 'Thank you! Your review has been submitted and will appear after approval.' });
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      setReviewMsg({ type: 'danger', text: err.response?.data?.message || 'Please login to write a review.' });
    }
  };

  return (
    <>
      <PageBanner title={product.name} items={breadcrumbItems} />

      <section className="section">
        <div className="container">
          <div className="row g-5">
            {/* Gallery */}
            <div className="col-lg-6">
              <div className="product-gallery">
                <div className="main-img">
                  <img
                    id="mainProductImg"
                    src={mainImage || productImageUrl(product.image)}
                    alt={product.name}
                    style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', cursor: 'zoom-in' }}
                    onClick={() => setZoomImage(mainImage || productImageUrl(product.image))}
                  />
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {galleryImages.map((src, index) => (
                    <div
                      className={`thumb-img ${src === mainImage ? 'active' : ''}`}
                      key={`${src}-${index}`}
                      onClick={() => setMainImage(src)}
                    >
                      <img src={src} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="col-lg-6 product-detail">
              <span className="cat-label text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--bu-muted)' }}>
                {categoryName}
              </span>
              <h1 className="mt-1">{product.name}</h1>

              <div className="d-flex align-items-center gap-2 mb-3">
                <Stars rating={Math.round(avgRating)} />
                <span className="text-muted small">{avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : 'No ratings yet'}</span>
                <span className="text-muted small">({reviewCount} reviews)</span>
              </div>

              <div className="mb-3">
                <span className="detail-price">{formatPrice(product.price)}</span>
                {oldPrice > 0 && (
                  <>
                    <span className="detail-old ms-2">{formatPrice(oldPrice)}</span>
                    <span className="badge-sale ms-2">{discount}% OFF</span>
                  </>
                )}
              </div>

              <p className="text-muted mb-4" style={{ whiteSpace: 'pre-line' }}>{product.shortDescription}</p>

              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <small className="text-muted text-uppercase d-block">SKU</small>
                  <strong>{product.sku || 'N/A'}</strong>
                </div>
                <div className="col-6 col-md-3">
                  <small className="text-muted text-uppercase d-block">Material</small>
                  <strong>{product.material || 'N/A'}</strong>
                </div>
                <div className="col-6 col-md-3">
                  <small className="text-muted text-uppercase d-block">Weight</small>
                  <strong>{product.weight || 'N/A'}</strong>
                </div>
                <div className="col-6 col-md-3">
                  <small className="text-muted text-uppercase d-block">Stock</small>
                  <strong className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </strong>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
                <div className="qty-box">
                  <button type="button" className="qty-minus" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>&#8722;</button>
                  <input
                    type="number"
                    className="qty-input"
                    value={qty}
                    min="1"
                    max={Math.max(1, product.stock)}
                    onChange={(e) => {
                      const next = parseInt(e.target.value, 10) || 1;
                      setQty(Math.min(Math.max(1, next), Math.max(1, product.stock)));
                    }}
                  />
                  <button type="button" className="qty-plus" aria-label="Increase" onClick={() => setQty((q) => Math.min(q + 1, Math.max(1, product.stock)))}>+</button>
                </div>
                <button type="button" className="btn-gold" onClick={addToCart} disabled={product.stock <= 0} style={{ flex: 1 }}>
                  <i className="bi bi-bag-plus me-1"></i>Add to Cart
                </button>
                <button type="button" className="btn-outline-gold" onClick={toggleWishlist} aria-label="Wishlist">
                  <i className={`bi ${wishlisted ? 'bi-heart-fill text-gold' : 'bi-heart'}`}></i>
                </button>
              </div>

              {actionMsg && <div className={`alert alert-${actionMsg.type} py-2`} role="alert">{actionMsg.text}</div>}

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="feature-item justify-content-start">
                    <i className="bi bi-arrow-repeat"></i>
                    <div><h6 style={{ fontSize: '12px' }}>{returnsDays}-Day Returns</h6><small>Easy returns &amp; refunds</small></div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="feature-item justify-content-start">
                    <i className="bi bi-shield-check"></i>
                    <div><h6 style={{ fontSize: '12px' }}>Secure Payment</h6><small>UPI payments</small></div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="feature-item justify-content-start">
                    <i className="bi bi-gem"></i>
                    <div><h6 style={{ fontSize: '12px' }}>Handmade</h6><small>Crafted by artisans</small></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="detail-tabs mt-5">
            <ul className="nav nav-tabs" id="detailTabs" role="tablist">
              <li className="nav-item">
                <button type="button" className={`nav-link ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Description</button>
              </li>
              <li className="nav-item">
                <button type="button" className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({reviewCount})</button>
              </li>
              <li className="nav-item">
                <button type="button" className={`nav-link ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>Returns &amp; Care</button>
              </li>
            </ul>
            <div className="tab-content">
              <div className={`tab-pane fade ${activeTab === 'desc' ? 'show active' : ''}`} id="tab-desc">
                <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
              </div>

              <div className={`tab-pane fade ${activeTab === 'reviews' ? 'show active' : ''}`} id="tab-reviews">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="rating-summary mb-4">
                      <span className="big">{avgRating ? avgRating.toFixed(1) : '--'}</span>
                      <div>
                        <Stars rating={Math.round(avgRating)} />
                        <small className="d-block text-muted">{reviewCount} verified review(s)</small>
                      </div>
                    </div>
                    <h6 className="text-uppercase" style={{ fontSize: '13px', letterSpacing: '1px' }}>Write a Review</h6>
                    {user ? (
                      <form className="mt-2" onSubmit={submitReview}>
                        {reviewMsg && <div className={`alert alert-${reviewMsg.type}`}>{reviewMsg.text}</div>}
                        <div className="mb-2">
                          <label className="form-label small">Your Rating</label>
                          <select
                            className="form-select"
                            value={reviewForm.rating}
                            onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                          >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Bad</option>
                          </select>
                        </div>
                        <div className="mb-2">
                          <label className="form-label small">Review Title</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Short headline"
                            value={reviewForm.title}
                            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small">Your Review</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            required
                            placeholder="Share your experience..."
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          ></textarea>
                        </div>
                        <button type="submit" className="btn-gold" style={{ padding: '9px 22px' }}>Submit Review</button>
                      </form>
                    ) : (
                      <p className="text-muted small">Please <Link to="/login">login</Link> to write a review.</p>
                    )}
                  </div>

                  <div className="col-lg-8">
                    {reviews.length === 0 ? (
                      <div className="empty-state" style={{ padding: '30px' }}>
                        <i className="bi bi-chat-square-text"></i>
                        <h5 className="mt-3">No reviews yet</h5>
                        <p className="text-muted">Be the first to review this product.</p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div className="review-item" key={review.id}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong>{review.userName || 'Customer'}</strong>
                            <small className="text-muted">{timeAgo(review.createdAt)}</small>
                          </div>
                          <Stars rating={review.rating} />
                          {review.title && <h6 className="mt-2 mb-1">{review.title}</h6>}
                          <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-line' }}>{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className={`tab-pane fade ${activeTab === 'returns' ? 'show active' : ''}`} id="tab-ship">
                <p><strong>Returns:</strong> You can return unused products in original packaging within {returnsDays} days for a full refund or exchange.</p>
                <p><strong>Care:</strong> Store jewellery in a dry box, avoid contact with water and perfume to keep it shining.</p>
              </div>
            </div>
          </div>

          {/* Related */}
          {data.related && data.related.length > 0 && (
            <div className="mt-5">
              <div className="section-title-wrap">
                <span className="eyebrow">You May Also Like</span>
                <h2>Related Products</h2>
                <span className="line"></span>
              </div>
              <div className="row">
                {data.related.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      {zoomImage && (
        <div className="zoom-overlay show" onClick={() => setZoomImage('')}>
          <img src={zoomImage} alt={product.name} />
        </div>
      )}
    </>
  );
};

export default ProductDetails;
