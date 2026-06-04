import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';

export default function Categories() {
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
      <SEOHead title="CVR Handicrafts | Categories - Shop by Artisan Style" />

      {/* 3. SHOP CATEGORIES SECTION */}
      <section className="section-padding reveal-element" id="categories" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="italic-sub">Curated Selections</span>
            <h2>Shop by Category</h2>
            <p>Browse our extensive collection of masterfully hand-chiseled creations, sorted by individual design themes to suit your style.</p>
          </div>

          <div className="categories-grid">
            {/* Category 1: Wooden Sculptures */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_sculptures.png" alt="Luxurious hand-carved wooden sculptures" loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Wooden Sculptures</h3>
                <Link to="/category/wooden-sculptures" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 2: Wooden Masks */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_masks.png" alt="Traditional carved wooden masks" loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Wooden Masks</h3>
                <Link to="/category/wooden-masks" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 3: Home Decor */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_decor.png" alt="Handcrafted wooden home decor items" loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Home Decor</h3>
                <Link to="/category/home-decor" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 4: Wall Art */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_wall_art.png" alt="Bespoke geometric wood carved wall art panels" loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Wall Art</h3>
                <Link to="/category/wall-art" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 5: Gift Items */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_gift.png" alt="Premium handcrafted wood gifting items" loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Gift Items</h3>
                <Link to="/category/gift-items" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 6: Custom Handicrafts */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_custom.png" alt="Artisan hand-carving custom designs in wood workshop" loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Custom Handicrafts</h3>
                <Link to="/contact" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
