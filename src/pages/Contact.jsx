import { useEffect, useState } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Reveal animation logic
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal-element');
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add('active');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      toast.success('Your message has been sent successfully! Our concierge will contact you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="CVR Handicrafts | Contact - Premium Handcrafted Luxury Wooden Art" />
      
      {/* 13. CONTACT SECTION */}
      <section className="section-padding reveal-element" id="contact" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="italic-sub">Artisan Concierge</span>
            <h2>Contact Concierge</h2>
            <p>Have a question about our heritage wood carvings, custom orders, or shipping guarantees? Get in touch with our dedicated art concierge team.</p>
          </div>

          <div className="contact-grid">
            {/* Left: Contact Info Panel */}
            <div className="contact-info-panel">
              <div className="contact-info-header">
                <h3>Get in Touch</h3>
                <p>Our concierge advisors are available to guide you through customized dimensions, name carvings, corporate gifting portfolios, or general care instructions for your luxury wooden art pieces.</p>
              </div>

              <div className="contact-details-list">
                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div className="contact-detail-text">
                    <h4>Showroom Address</h4>
                    <p>No. 45, Gallery Road, Near Heritage Circle, Bangalore - 560001, Karnataka, India</p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="contact-detail-text">
                    <h4>Phone Number</h4>
                    <a href="tel:+918807173498">+91 88071 73498</a>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div className="contact-detail-text">
                    <h4>Email Address</h4>
                    <a href="mailto:info@cvrhandicrafts.com">info@cvrhandicrafts.com</a>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div className="contact-detail-text">
                    <h4>Concierge Hours</h4>
                    <p>Monday - Saturday: 9:00 AM - 7:00 PM (IST)</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Contact Button */}
              <a href="https://wa.me/918807173498" target="_blank" rel="noopener noreferrer" className="whatsapp-btn" aria-label="Chat with us on WhatsApp">
                <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
              </a>
            </div>

            {/* Right: Contact Form Panel */}
            <div className="contact-form-panel">
              <form id="contactForm" noValidate onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="form-control" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="form-control" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="form-control" 
                    placeholder="Custom carving request / General Inquiry" 
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label htmlFor="message">Your Message *</label>
                  <textarea 
                    id="message" 
                    className="form-control" 
                    placeholder="Tell us how we can help you..." 
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Action Button */}
      <a href="https://wa.me/918807173498" target="_blank" rel="noopener noreferrer" className="whatsapp-floating" aria-label="Chat with us on WhatsApp">
        <i className="fa-brands fa-whatsapp"></i>
      </a>
    </>
  );
}
