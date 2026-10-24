import React from 'react';
import PageBanner from '../components/PageBanner';

const Terms = () => (
  <>
    <PageBanner title="Terms & Conditions" items={[{ label: 'Home', to: '/' }, { label: 'Terms & Conditions' }]} />
    <section className="section">
      <div className="container static-content" style={{ maxWidth: '860px' }}>
        <p className="text-muted">Last updated: Recently</p>
        <p>By accessing and using B.unique (the "Website"), you agree to the following terms and conditions. Please read them carefully.</p>
        <h4>1. Use of the Website</h4>
        <ul>
          <li>You must be at least 18 years old, or use the site under the supervision of a guardian.</li>
          <li>You agree to provide accurate and complete information while creating an account or placing an order.</li>
          <li>You agree not to misuse the website or engage in any fraudulent activity.</li>
        </ul>
        <h4>2. Products &amp; Pricing</h4>
        <ul>
          <li>All prices are listed in INR and are subject to change without notice.</li>
          <li>Product images are for representation only. Slight variations may occur due to handmade nature.</li>
          <li>We strive to display accurate product information, but errors may occur.</li>
        </ul>
        <h4>3. Orders &amp; Payment</h4>
        <ul>
          <li>Placing an order constitutes an offer to purchase.</li>
          <li>We reserve the right to cancel or refuse any order at our discretion.</li>
          <li>Payment must be completed as per the payment method selected at checkout.</li>
        </ul>
        <h4>4. Intellectual Property</h4>
        <p>All content on this website, including images, logos, designs and text, is the property of B.unique and protected by applicable laws.</p>
        <h4>5. Limitation of Liability</h4>
        <p>B.unique shall not be liable for any indirect, incidental, or consequential damages arising from use of this website.</p>
        <h4>6. Governing Law</h4>
        <p>These terms shall be governed by and interpreted in accordance with the laws of India.</p>
      </div>
    </section>
  </>
);

export default Terms;
