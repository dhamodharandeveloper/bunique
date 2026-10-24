import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';

const RateProduct = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const productId = searchParams.get('product');
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (token && productId) {
      api.get('/rate', { params: { token, product: productId } })
        .then(res => setData(res.data))
        .catch(() => setMsg('This rating link is invalid or has expired.'));
    }
  }, [token, productId]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.post('/reviews', { productId, rating, title, comment });
    setMsg(res.data.message);
  };

  if (!data) return <div className="container py-5">{msg || 'Loading...'}</div>;
  if (!data.success) return <div className="container py-5">{data.message}</div>;

  const product = data.product;
  const fmt = (v) => `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <PageBanner title="Rate Your Purchase" items={[{ label: 'Home', to: '/' }, { label: `Rate ${product.name}` }]} />
      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <Link to={`/product/${product.slug}`}>
                      <img src={product.image ? `http://localhost:8080/uploads/products/${product.image}` : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200'} alt={product.name} className="rounded" style={{width:74,height:74,objectFit:'cover'}} />
                    </Link>
                    <div>
                      <h4 className="mb-1" style={{fontSize:18}}>{product.name}</h4>
                      <small className="text-muted">From order #{data.order.orderNumber}</small>
                    </div>
                  </div>

                  {msg && <div className="alert alert-info">{msg}</div>}

                  {data.existing ? (
                    <div className="text-center py-4">
                      <i className="bi bi-check-circle text-success" style={{fontSize:40}}></i>
                      <h5 className="mt-3">You have already rated this product</h5>
                      <p className="text-muted">Thank you for your feedback!</p>
                      <p className="mt-3 mb-0"><Link className="btn-outline-gold" to={`/product/${product.slug}`}>Back to product</Link></p>
                    </div>
                  ) : (
                    <form onSubmit={submit}>
                      <label className="form-label">Your Rating</label>
                      <div className="rate-stars mb-3">
                        {[1,2,3,4,5].map(s => (
                          <button type="button" key={s} onClick={() => setRating(s)} style={{background:'none',border:'none',fontSize:30,lineHeight:1,padding:'0 2px',color: s <= rating ? '#d4a54f' : '#c9b48f',cursor:'pointer'}}>
                            <i className="bi bi-star-fill"></i>
                          </button>
                        ))}
                      </div>
                      <div className="mb-3">
                        <label className="form-label small">Review Title <span className="text-muted">(optional)</span></label>
                        <input type="text" className="form-control" maxLength={150} placeholder="Short headline" value={title} onChange={e => setTitle(e.target.value)} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small">Your Review</label>
                        <textarea className="form-control" rows={4} required placeholder="How was the quality and packaging?" value={comment} onChange={e => setComment(e.target.value)}></textarea>
                      </div>
                      <button type="submit" className="btn-gold w-100">Submit Rating</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RateProduct;
