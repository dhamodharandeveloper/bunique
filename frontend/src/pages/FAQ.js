import React from 'react';
import PageBanner from '../components/PageBanner';

const faqs = [
  { q: 'How can I place an order?', a: 'Browse our collection, add items to your cart, and proceed to checkout. You can pay securely via UPI.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI payments via GPay, PhonePe, and Paytm at checkout.' },
  { q: 'What is your return policy?', a: 'You can return unused products in their original packaging within the specified days of receiving your order for a full refund or exchange. Check our Return Policy for details.' },
  { q: 'Are the products handmade?', a: 'Yes! Every product is handcrafted by our skilled artisans. This means each piece may have subtle variations, making it truly one of a kind.' },
  { q: 'How do I track my order?', a: 'Go to the Track Order page and enter your order number. You will see the current status of your order in real time.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they are shipped. Contact our support team with your order number and we will help you with cancellation.' },
];

const FAQ = () => (
  <>
    <PageBanner title="FAQ" items={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />
    <section className="section">
      <div className="container" style={{ maxWidth: '860px' }}>
        <div className="section-title-wrap">
          <span className="eyebrow">Help Center</span>
          <h2>Frequently Asked Questions</h2>
          <span className="line"></span>
        </div>
        <div className="accordion" id="faqAccordion">
          {faqs.map((f, i) => (
            <div className="accordion-item" key={i} style={{ border: '1px solid #e7dfd0', marginBottom: '10px', borderRadius: '10px', overflow: 'hidden' }}>
              <h2 className="accordion-header">
                <button className={`accordion-button ${i !== 0 ? 'collapsed' : ''}`} type="button" data-bs-toggle="collapse" data-bs-target={`#faq${i}`}>
                  {f.q}
                </button>
              </h2>
              <div id={`faq${i}`} className={`accordion-collapse collapse ${i === 0 ? 'show' : ''}`} data-bs-parent="#faqAccordion">
                <div className="accordion-body">{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default FAQ;
