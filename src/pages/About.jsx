import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';

export default function About() {
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

  return (
    <>
      <SEOHead title="CVR Handicrafts | About - Our Heritage & Artistry" />
      
      {/* 10. ABOUT US SECTION */}
      <section className="section-padding reveal-element" id="about" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="about-grid">
            {/* Left: Collage */}
            <div className="about-image-wrapper">
              <div className="about-image-frame">
                <img src="/assets/cat_custom.png" alt="CVR Handicrafts Master Artisan Workshop Carver" loading="lazy" />
              </div>
            </div>

            {/* Right: Content */}
            <div className="about-content">
              <span className="italic-sub">The Soul of the Wood</span>
              <h2>Our Heritage & Journey</h2>
              <p>At CVR Handicrafts, our story is etched directly in wood. Founded as a small family woodshop three decades ago, we have committed ourselves to preserving traditional Indian chiseled handicrafts for global modern homes.</p>
              <p>We source only high-density, ethically harvested logs of teakwood, mahogany, rosewood, and cedar. Every fine line and organic curve is sculpted manually, utilizing traditional heritage chisels, ensuring no two creations are ever fully identical. Our mission is to keep this spectacular, ancient art alive, honoring the dedicated woodcarvers who pour their soul into every creation.</p>
              
              <div className="about-metrics">
                <div className="metric-item">
                  <span className="metric-num">30+</span>
                  <span className="metric-lbl">Years Heritage</span>
                </div>
                <div className="metric-item">
                  <span className="metric-num">15+</span>
                  <span className="metric-lbl">Master Artisans</span>
                </div>
                <div className="metric-item">
                  <span className="metric-num">10k+</span>
                  <span className="metric-lbl">Homes Adorned</span>
                </div>
              </div>
              
              <Link to="/contact" className="btn btn-primary">Connect With Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
