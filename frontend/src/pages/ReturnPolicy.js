import React from 'react';
import PageBanner from '../components/PageBanner';

const ReturnPolicy = () => (
  <>
    <PageBanner title="Return & Refund Policy" items={[{ label: 'Home', to: '/' }, { label: 'Return Policy' }]} />
    <section className="section">
      <div className="container static-content" style={{ maxWidth: '860px' }}>
        <p className="text-muted">Last updated: Recently</p>
        <p>We want you to love your B.unique purchase. If something isn't right, here's how our returns and refunds work.</p>
        <h4>1. Return Window</h4>
        <p>You can request a return within the return window specified on our site from the date of receiving your order.</p>
        <h4>2. Conditions for Return</h4>
        <ul>
          <li>Items must be unused, unworn and in their original packaging with all tags intact.</li>
          <li>Handmade pieces may show minor variations; these are not considered defects.</li>
          <li>Customised or personalised items may not be eligible for return unless defective.</li>
          <li>Sale items may be subject to different return terms.</li>
        </ul>
        <h4>3. How to Initiate a Return</h4>
        <p>To initiate a return, please contact our support team with your order number and reason for return. We'll guide you through the process.</p>
        <h4>4. Refunds</h4>
        <ul>
          <li>Once we receive and inspect the returned item, we'll notify you about the approval of your refund.</li>
          <li>Approved refunds will be processed to the original payment method within a reasonable time.</li>
          <li>Shipping charges may not be refundable unless the item was received damaged or defective.</li>
        </ul>
        <h4>5. Damaged or Defective Items</h4>
        <p>If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the item and packaging.</p>
      </div>
    </section>
  </>
);

export default ReturnPolicy;
