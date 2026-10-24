import React from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

const About = () => (
  <>
    <PageBanner title="About Us" items={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} />
    <section>
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div style={{borderRadius:'14px',overflow:'hidden',minHeight:'420px',background:'linear-gradient(135deg,#2c2017 0%,#54381f 60%,#8a6236 100%)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--bu-gold-light)'}}>
              <div style={{textAlign:'center',padding:'40px'}}>
                <i className="bi bi-gem" style={{fontSize:'64px'}}></i>
                <h2 style={{color:'#fff',fontSize:'34px',marginTop:'18px'}}>Our Story</h2>
                <p style={{color:'#d9c9ad'}}>Crafted with love. Designed to last.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <span className="eyebrow">The House of B.unique</span>
            <h2 className="mb-4">Handmade Jewellery, Made with Soul</h2>
            <p>B.unique is a celebration of handcrafted elegance. Every piece in our collection is thoughtfully designed and meticulously crafted by skilled artisans, bringing together timeless traditions and contemporary aesthetics.</p>
            <p>We believe jewellery should be more than an accessory — it should tell a story. From delicate everyday pieces to statement designs for life's grandest moments, our creations are made to be treasured for generations.</p>
            <p>Each piece carries the touch of the maker — subtle, unique, and unmistakably human. That's the beauty of handmade.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-cream">
      <div className="container">
        <div className="section-title-wrap">
          <span className="eyebrow">Why Choose Us</span>
          <h2>Crafted with Purpose</h2>
          <span className="line"></span>
        </div>
        <div className="row g-4">
          {[{icon:'bi-gift',title:'Made with Love',text:'Every design begins with care and ends with perfection.'},{icon:'bi-gem',title:'Handcrafted',text:'Skilled artisans bring each detail to life by hand.'},{icon:'bi-award',title:'Quality Materials',text:'We use carefully selected materials for lasting beauty.'},{icon:'bi-heart',title:'Truly Unique',text:'No two handmade pieces are ever exactly alike.'}].map((v,i)=>(
            <div className="col-lg-3 col-md-6" key={i}>
              <div className="feature-item" style={{flexDirection:'column',textAlign:'center',padding:'30px 24px'}}>
                <i className={`bi ${v.icon}`} style={{fontSize:'32px',marginBottom:'16px'}}></i>
                <div><h6 style={{fontSize:'18px'}}>{v.title}</h6><small className="text-muted">{v.text}</small></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section>
      <div className="container text-center">
        <span className="eyebrow">Discover the Collection</span>
        <h2 className="mb-3">Find the Piece That Speaks to You</h2>
        <p className="text-muted mb-4">Explore our curated range of handcrafted jewellery for every occasion.</p>
        <Link to="/shop" className="btn-gold">Shop Now</Link>
      </div>
    </section>
  </>
);

export default About;
