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
            {/* Category 1: Brass Items */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_brass_items.png" alt="Elegant brass statues, lamps, pooja items, and traditional brass handicrafts." loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Brass Items</h3>
                <Link to="/category/brass-items" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 2: Mandirs */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_mandirs.png" alt="Premium wooden and decorative pooja mandirs for homes." loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Mandirs</h3>
                <Link to="/category/mandirs" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 3: Home Decor */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_home_decor.png" alt="Decorative home accessories, vases, wall decor, and interior styling products." loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Home Decor</h3>
                <Link to="/category/home-decor" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 4: Sandalwood Maalai */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_sandalwood_maalai.png" alt="Traditional sandalwood malas, spiritual accessories, and religious items." loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Sandalwood Maalai</h3>
                <Link to="/category/sandalwood-maalai" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 5: Gift Items */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_gift_items_new.png" alt="Corporate gifts, return gifts, customized gifts, and special occasion gifts." loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Gift Items</h3>
                <Link to="/category/gift-items" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>

            {/* Category 6: Wooden Art Work */}
            <div className="category-card">
              <div className="category-card-bg">
                <img src="/assets/cat_wooden_art.png" alt="Wooden carvings, sculptures, handcrafted wooden products, and artistic creations." loading="lazy" />
              </div>
              <div className="category-card-overlay"></div>
              <div className="category-card-content">
                <h3>Wooden Art Work</h3>
                <Link to="/category/wooden-art-work" className="btn-category">View Products <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
