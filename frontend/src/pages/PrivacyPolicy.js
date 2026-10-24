import React from 'react';
import PageBanner from '../components/PageBanner';

const PrivacyPolicy = () => (
  <>
    <PageBanner title="Privacy Policy" items={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]} />
    <section className="section">
      <div className="container static-content" style={{ maxWidth: '860px' }}>
        <p className="text-muted">Last updated: Recently</p>
        <p>At B.unique ("we", "us"), we value your privacy and are committed to protecting your personal information. This policy explains what we collect and how we use it.</p>
        <h4>1. Information We Collect</h4>
        <ul>
          <li><strong>Account data:</strong> name, email address and phone number.</li>
          <li><strong>Order data:</strong> order history, payment method and transaction references.</li>
          <li><strong>Technical data:</strong> IP address, browser type and pages visited to improve our service.</li>
        </ul>
        <h4>2. How We Use Your Information</h4>
        <ul>
          <li>To process and deliver your orders.</li>
          <li>To manage your account and provide customer support.</li>
          <li>To send order updates, receipts and important notifications.</li>
          <li>To improve our website, products and customer experience.</li>
        </ul>
        <h4>3. Data Security</h4>
        <p>We use appropriate security measures to protect your personal data. Payment details are handled securely, and we never store sensitive payment information on our servers.</p>
        <h4>4. Cookies</h4>
        <p>Our website may use cookies to enhance your browsing experience and remember your preferences.</p>
        <h4>5. Third-Party Services</h4>
        <p>We may share necessary information with trusted service providers only to fulfill orders and operate our business.</p>
        <h4>6. Your Rights</h4>
        <p>You may request access, correction, or deletion of your personal information by contacting us.</p>
        <h4>7. Changes to This Policy</h4>
        <p>We may update this policy from time to time. Continued use of the site indicates acceptance of any changes.</p>
      </div>
    </section>
  </>
);

export default PrivacyPolicy;
