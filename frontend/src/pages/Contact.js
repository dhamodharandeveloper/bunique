import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageBanner from '../components/PageBanner';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.name.length < 3) { setMsg('Please enter your name.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { setMsg('Please enter a valid email.'); return; }
    if (form.message.length < 10) { setMsg('Please enter a message (min 10 characters).'); return; }
    try {
      const res = await api.post('/contact', form);
      if (res.data.success) { setSent(true); setForm({ name: '', email: '', subject: '', message: '' }); }
      setMsg(res.data.message);
    } catch (e) { setMsg('Something went wrong.'); }
  };

  return (
    <>
      <PageBanner title="Contact Us" items={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]} />
      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-7">
              <div className="profile-card">
                <h4 className="mb-4">Send us a Message</h4>
                {msg && <div className={`alert ${sent ? 'alert-success' : 'alert-info'}`}>{msg}</div>}
                <form onSubmit={submit}>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="col-md-6"><label className="form-label">Email Address</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                    <div className="col-12"><label className="form-label">Subject</label><input className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
                    <div className="col-12"><label className="form-label">Message</label><textarea className="form-control" rows="6" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required></textarea></div>
                    <div className="col-12"><button className="btn-gold">Send Message</button></div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="profile-card mb-4">
                <h5 className="mb-3">Get in Touch</h5>
                <p className="text-muted mb-4">We'd love to hear from you. Our team will get back to you as soon as possible.</p>
                <div className="d-flex gap-3 mb-3"><div className="brand-icon" style={{width:'48px',height:'48px',fontSize:'20px'}}><i className="bi bi-geo-alt"></i></div><div><h6 className="mb-1">Address</h6><small className="text-muted">B.unique, Handmade Jewellery Studio<br />India</small></div></div>
                <div className="d-flex gap-3 mb-3"><div className="brand-icon" style={{width:'48px',height:'48px',fontSize:'20px'}}><i className="bi bi-envelope"></i></div><div><h6 className="mb-1">Email</h6><small className="text-muted">support@bunique.in</small></div></div>
                <div className="d-flex gap-3"><div className="brand-icon" style={{width:'48px',height:'48px',fontSize:'20px'}}><i className="bi bi-telephone"></i></div><div><h6 className="mb-1">Phone</h6><small className="text-muted">+91 XXXXX XXXXX</small></div></div>
              </div>
              <div className="profile-card">
                <h6 className="mb-2">Business Hours</h6>
                <ul className="list-unstyled mb-0 text-muted small"><li className="mb-1">Monday - Saturday: 10:00 AM - 6:00 PM</li><li>Sunday: Closed</li></ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
