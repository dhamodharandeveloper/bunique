import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="container d-flex justify-content-between align-items-center flex-wrap">
          <span>Crafted with love, designed to make you shine.</span>
        </div>
      </div>
      <Header />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <button
        className={`scroll-top ${showScroll ? 'show' : ''}`}
        id="scrollTop"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <i className="bi bi-arrow-up"></i>
      </button>
    </>
  );
};

export default Layout;
