import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [data, setData] = useState({ banners: [], categories: [], newArrivals: [], bestSellers: [], featured: [] });
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/home').then(res => setData(res.data)).catch(() => {});
    api.get('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const testimonials = [
    { name: 'Ananya Sharma', city: 'Mumbai', text: "The craftsmanship is absolutely stunning. My kundan necklace set received so many compliments at my sister's wedding!", initials: 'AS' },
    { name: 'Priya Patel', city: 'Ahmedabad', text: 'Beautiful handcrafted pieces at very reasonable prices. Packaging was elegant and the whole experience was smooth.', initials: 'PP' },
    { name: 'Ritu Verma', city: 'Delhi', text: 'I ordered the rose gold butterfly necklace and it is even prettier in person. Will definitely shop here again.', initials: 'RV' },
  ];

  const banners = data.banners.length > 0 ? data.banners : [
    { title: 'Handmade Jewellery', subtitle: 'Crafted with love, worn with pride', link: '/shop' },
    { title: 'Festive Collection', subtitle: 'Up to 30% off on kundan sets', link: '/shop' },
  ];

  const gradients = [
    'linear-gradient(135deg,#2c2017 0%,#4a3523 55%,#7a5a35 100%)',
    'linear-gradient(135deg,#1d1610 0%,#3d2f22 50%,#6b4e2e 100%)',
    'linear-gradient(135deg,#261b12 0%,#54381f 60%,#8a6236 100%)',
    'linear-gradient(135deg,#2c2017 0%,#503a25 50%,#74583a 100%)',
  ];

  return (
    <>
      <section className="hero-slider">
        <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            {banners.map((b, i) => (
              <button key={i} type="button" data-bs-target="#heroCarousel" data-bs-slide-to={i} className={i === 0 ? 'active' : ''}></button>
            ))}
          </div>
          <div className="carousel-inner">
            {banners.map((b, i) => (
              <div key={i} className={`carousel-item ${i === 0 ? 'active' : ''}`}>
                {b.image ? (
                  <div className="hero-bg" style={{backgroundImage:`url(http://localhost:8080/uploads/banners/${b.image})`}}></div>
                ) : (
                  <div className="hero-bg" style={{background:'linear-gradient(135deg,#2c2017 0%,#4a3523 55%,#7a5a35 100%)'}}></div>
                )}
                <div className="hero-overlay"></div>
                <div className="carousel-caption">
                  <span className="hero-eyebrow">{i === 0 ? 'B.unique Collection' : 'Handcrafted for you'}</span>
                  <h1 className="hero-title">{b.title}</h1>
                  <p className="hero-text">{b.subtitle}</p>
                  <Link to={b.link?.replace('.php','') || '/shop'} className="btn-gold">Shop Now <i className="bi bi-arrow-right ms-1"></i></Link>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon"></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      </section>

      <section className="feature-strip">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3 col-6"><div className="feature-item"><i className="bi bi-gift"></i><div><h6>Made with Love</h6><small>Every piece unique</small></div></div></div>
            <div className="col-md-3 col-6"><div className="feature-item"><i className="bi bi-arrow-repeat"></i><div><h6>Easy Returns</h6><small>{settings.returns_days || 7}-day return policy</small></div></div></div>
            <div className="col-md-3 col-6"><div className="feature-item"><i className="bi bi-gem"></i><div><h6>Handmade</h6><small>Handcrafted by artisans</small></div></div></div>
            <div className="col-md-3 col-6"><div className="feature-item"><i className="bi bi-shield-check"></i><div><h6>Secure Payment</h6><small>100% safe UPI checkout</small></div></div></div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-title-wrap">
            <span className="eyebrow">Browse Collections</span>
            <h2>Shop by Category</h2>
            <p>From timeless classics to modern statement pieces, explore our handcrafted collections.</p>
            <span className="line"></span>
          </div>
          <div className="row">
            {data.categories.map(cat => (
              <div className="col-lg-3 col-md-4 col-6 mb-4" key={cat.id}>
                <Link to={`/category/${cat.slug}`} className="category-card">
                  <div className="img-wrap">
                    <img
                      src={cat.image ? `http://localhost:8080/uploads/categories/${cat.image}` : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600'}
                      alt={cat.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="cat-name">
                    <h6>{cat.name}</h6>
                    {cat.productCount > 0 && <small>{cat.productCount} products</small>}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="container">
          <div className="section-title-wrap">
            <span className="eyebrow">Just In</span>
            <h2>New Arrivals</h2>
            <p>Freshly crafted pieces added to our collection.</p>
            <span className="line"></span>
          </div>
          <div className="row">
            {data.newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-2">
            <Link to="/shop?filter=newest" className="btn-outline-gold">View All New Arrivals</Link>
          </div>
        </div>
      </section>

      <section className="dual-banner" style={{paddingTop:0}}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6">
              <Link className="banner-box" to="/category/necklaces">
                <div style={{position:'absolute',inset:0,background:'linear-gradient(120deg,#4a3523,#8a6236)'}}></div>
                <div className="banner-text">
                  <span className="hero-eyebrow">Bridal Edit</span>
                  <h3>Kundan &amp; Polki Sets</h3>
                  <p>Traditional grandeur for your special day.</p>
                  <span className="btn-light-ghost align-self-start mt-2">Discover</span>
                </div>
              </Link>
            </div>
            <div className="col-lg-6">
              <Link className="banner-box" to="/shop?filter=sale">
                <div style={{position:'absolute',inset:0,background:'linear-gradient(120deg,#1d1610,#54381f)'}}></div>
                <div className="banner-text">
                  <span className="hero-eyebrow">Limited Time</span>
                  <h3>Up to 30% Off</h3>
                  <p>Handpicked pieces at seasonal prices.</p>
                  <span className="btn-light-ghost align-self-start mt-2">Shop Sale</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{paddingTop:0}}>
        <div className="container">
          <div className="section-title-wrap">
            <span className="eyebrow">Customer Favourites</span>
            <h2>Best Sellers</h2>
            <p>The most loved pieces by our community.</p>
            <span className="line"></span>
          </div>
          <div className="row">
            {data.bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="container">
          <div className="section-title-wrap">
            <span className="eyebrow">Curated For You</span>
            <h2>Featured Pieces</h2>
            <span className="line"></span>
          </div>
          <div className="row">
            {data.featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-2">
            <Link to="/shop" className="btn-gold">Browse Full Collection</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-title-wrap">
            <span className="eyebrow">What They Say</span>
            <h2>Loved by Our Customers</h2>
            <span className="line"></span>
          </div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div className="col-lg-4 col-md-6" key={i}>
                <div className="testimonial-card">
                  <span className="quote">&ldquo;</span>
                  <p>{t.text}</p>
                  <div className="star-rating">
                    <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                  </div>
                  <div className="author">
                    <div style={{width:'46px',height:'46px',borderRadius:'50%',background:'var(--bu-gold)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600}}>{t.initials}</div>
                    <div>
                      <h6>{t.name}</h6>
                      <small className="text-muted">{t.city}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
