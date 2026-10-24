import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';
import ProductCard from '../components/ProductCard';
import ShopSidebar from '../components/ShopSidebar';

const Category = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ products: [], totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = pageParam > 0 ? pageParam - 1 : 0;

  useEffect(() => {
    let active = true;
    api.get('/categories').then((res) => {
      if (!active) return;
      setCategories(res.data || []);
      const cat = (res.data || []).find((c) => c.slug === slug);
      if (!cat) {
        navigate('/shop');
        return;
      }
      setCategory(cat);
    }).catch(() => { if (active) navigate('/shop'); });
    return () => { active = false; };
  }, [slug, navigate]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    api.get('/products', {
      params: {
        category: category.id,
        sort: sort || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        page,
        size: 12,
      },
    })
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, sort, minPrice, maxPrice, page]);

  const handleSort = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const totalPages = data.totalPages || 1;
  const totalElements = data.totalElements || 0;

  const buildPageLink = (p) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(p));
    return `${window.location.pathname}?${newParams.toString()}`;
  };

  if (!category) return <div className="container py-5">Loading...</div>;

  return (
    <>
      <PageBanner
        title={category.name}
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: category.name },
        ]}
      />
      <section className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-4">
              <ShopSidebar categories={categories} currentCategory={category.slug} minPrice={minPrice} maxPrice={maxPrice} />
            </div>
            <div className="col-lg-9 col-md-8">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                  <h5 className="mb-0">{category.name}</h5>
                  <small className="text-muted">{totalElements} product(s)</small>
                </div>
                <form className="sort-dropdown d-flex align-items-center gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input type="hidden" name="slug" value={slug} />
                  <label className="small text-muted text-uppercase mb-0">Sort:</label>
                  <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={handleSort}>
                    <option value="newest">Newest</option>
                    <option value="best">Popular</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </form>
              </div>

              {(data.products || []).length === 0 || loading ? (
                <div className="empty-state">
                  <i className="bi bi-box-seam"></i>
                  <h4>No products in this category yet</h4>
                  <p className="text-muted">Check back soon — new handcrafted pieces are added regularly.</p>
                  <Link to="/shop" className="btn-gold">Browse All Products</Link>
                </div>
              ) : (
                <>
                  <div className="row">
                    {(data.products || []).map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                  {totalPages > 1 && (
                    <nav aria-label="Pagination">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${pageParam <= 1 ? 'disabled' : ''}`}>
                          <a className="page-link" href={buildPageLink(pageParam - 1)}>&laquo;</a>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, pageParam - 2), Math.min(totalPages, pageParam + 2)).map((p) => (
                          <li className={`page-item ${p === pageParam ? 'active' : ''}`} key={p}>
                            <a className="page-link" href={buildPageLink(p)}>{p}</a>
                          </li>
                        ))}
                        <li className={`page-item ${pageParam >= totalPages ? 'disabled' : ''}`}>
                          <a className="page-link" href={buildPageLink(pageParam + 1)}>&raquo;</a>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Category;
