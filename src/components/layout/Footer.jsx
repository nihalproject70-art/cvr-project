import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import toast from 'react-hot-toast';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'newsletter'), {
        email,
        subscribedAt: serverTimestamp(),
      });
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (error) {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          
          {/* About Col */}
          <div className="footer-col footer-col-about">
            <h4 style={{ fontSize: '1.4rem' }}>CVR Handicrafts</h4>
            <p style={{ marginTop: '15px' }}>
              Keeping the soul of heritage woodcarving alive. Creating spectacular handcrafted teak, rosewood, and mahogany masterpieces to anchor luxury homes.
            </p>
            <div className="footer-social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Pinterest">
                <i className="fa-brands fa-pinterest-p"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="YouTube">
                <i className="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Sitemap Col */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links-list" style={{ marginTop: '15px' }}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/categories">Shop Categories</Link></li>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/about">About Our Story</Link></li>
              <li><Link to="/contact">Contact Concierge</Link></li>
            </ul>
          </div>

          {/* Categories Col */}
          <div className="footer-col">
            <h4>Categories</h4>
            <ul className="footer-links-list" style={{ marginTop: '15px' }}>
              <li><Link to="/category/wooden-sculptures">Wooden Sculptures</Link></li>
              <li><Link to="/category/wooden-masks">Wooden Masks</Link></li>
              <li><Link to="/category/home-decor">Home Decor</Link></li>
              <li><Link to="/category/wall-art">Wall Art Panels</Link></li>
              <li><Link to="/category/gift-items">Luxury Gift Items</Link></li>
              <li><Link to="/contact">Bespoke Work</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="footer-col footer-col-newsletter">
            <h4>Newsletter</h4>
            <p style={{ marginTop: '15px' }}>
              Subscribe to receive previews of new artisan collections, wood care guides, and private showroom events.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                className="newsletter-input" 
                placeholder="Your Email Address" 
                aria-label="Newsletter email field" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                type="submit" 
                className="newsletter-submit-btn" 
                aria-label="Subscribe to newsletter"
                disabled={submitting}
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>No spam. Unsubscribe anytime.</span>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CVR Handicrafts Private Limited. All Rights Reserved. Designed by Antigravity.</p>
          <div className="payment-gateways" aria-label="Supported Secure Payments">
            <i className="fa-brands fa-cc-visa"></i>
            <i className="fa-brands fa-cc-mastercard"></i>
            <i className="fa-brands fa-cc-stripe"></i>
            <i className="fa-brands fa-cc-paypal"></i>
            <i className="fa-brands fa-cc-apple-pay"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};
