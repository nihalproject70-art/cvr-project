import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { SEOHead } from '@/components/seo/SEOHead';
import { getOptimizedUrl } from '@/services/cloudinary';
import { formatPrice } from '@/utils/helpers';
import { localProducts } from '@/data/products';
import toast from 'react-hot-toast';
export default function Home() {
  // Best sellers state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const carouselRef = useRef(null);
  
  // Reviews state
  const [currentReview, setCurrentReview] = useState(0);

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
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchBestSellers = () => {
      setLoading(true);
      setTimeout(() => {
        const bestSellers = localProducts.filter(p => p.isBestSeller).slice(0, 10);
        setProducts(bestSellers);
        setLoading(false);
      }, 500);
    };
    fetchBestSellers();
  }, []);

  const displayProds = products;

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const reviews = [
    { name: 'Elizabeth Vance', location: 'London, UK', text: '"The Teakwood Elephant Statue is a complete showstopper in our main foyer! The depth of the chiseling and the quality of the wood grains exceed everything we\'ve bought online. Simply flawless craftsmanship."' },
    { name: 'Rohan Malhotra', location: 'Mumbai, India', text: '"Outstanding corporate gift pieces. We ordered a customized batch of 50 Mahogany desk organizers and name plaques for our annual executives meet. Every recipient was absolutely stunned by the rich finish."' },
    { name: 'Clara Dubois', location: 'Paris, France', text: '"The Traditional Oak Tribal Mask adds a gorgeous cultural focus to our dining room wall. I appreciate that CVR Handicrafts preserves traditional heritage woodcarving. Extremely fast, safe delivery!"' }
  ];

  return (
    <>
      <SEOHead title="CVR Handicrafts | Home - Premium Handcrafted Luxury Wooden Art" />

      {/* 2. HERO SECTION */}
      <section className="hero-section" id="home">
        <div className="hero-background">
          <img src="/assets/hero_bg.png" alt="Luxurious Handicraft Showroom Showcase" fetchpriority="high" />
        </div>
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-tagline">Legacy of Craftsmanship</span>
            <h1>CVR HANDICRAFTS</h1>
            <p className="hero-subheading">Elevate your living spaces with authentic, high-end wood carvings, traditional masks, and premium sculptures crafted by master artisans. Bringing heritage wood craftsmanship to modern luxury.</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-gold">Shop Now</Link>
              <Link to="/about" className="btn btn-outline">Explore Story</Link>
            </div>
          </div>
        </div>
        
        <a href="#best-sellers" className="scroll-indicator" aria-label="Scroll down to best sellers">
          <span>Discover More</span>
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
        </a>
      </section>

      {/* 3. BEST SELLER SECTION (CAROUSEL) */}
      <section className="section-padding reveal-element" id="best-sellers" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="italic-sub">The Artisan Icons</span>
            <h2>Best Seller Masterpieces</h2>
            <p>Our most celebrated works, renowned for their intricate chiseled structures and flawless traditional polishing finishes.</p>
          </div>

          <div className="bestseller-carousel-wrapper">
            <button className="carousel-btn carousel-btn-prev" onClick={() => scrollCarousel('left')} aria-label="Previous slide">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="carousel-btn carousel-btn-next" onClick={() => scrollCarousel('right')} aria-label="Next slide">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            
            <div className="bestseller-carousel-container" ref={carouselRef}>
              {displayProds.map((product) => (
                <div className="product-card" key={product.id}>
                  <span className="product-badge product-badge-bestseller">Best Seller</span>
                  <div className="product-card-image">
                    <img src={getOptimizedUrl(product.mainImage || product.image || '/assets/cat_sculptures.png', { width: 400 })} alt={product.name} loading="lazy" />
                    <div className="product-actions-overlay">
                      <Link to={`/product/${product.slug || product.id}`} className="product-action-btn" aria-label={`Quick view ${product.name}`}>
                        <i className="fa-regular fa-eye"></i>
                      </Link>
                      <button className="product-action-btn" onClick={() => handleAddToCart(product)} aria-label={`Add ${product.name} to cart`}>
                        <i className="fa-solid fa-cart-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <span className="product-meta">{product.shortDescription || product.categoryName}</span>
                    <h4 className="product-title">{product.name}</h4>
                    <span className="product-price">{formatPrice(product.salePrice || product.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SHOP CATEGORIES SECTION */}
      <section className="section-padding reveal-element" id="categories" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="italic-sub">Curated Selections</span>
            <h2>Shop by Category</h2>
            <p>Browse our extensive collection of masterfully hand-chiseled creations, sorted by individual design themes to suit your style.</p>
          </div>

          <div className="categories-grid">
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

          <div className="text-center" style={{ marginTop: 'var(--spacing-lg)' }}>
            <Link to="/shop" className="btn btn-primary">View Full Catalog</Link>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="section-padding reveal-element" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="italic-sub">Uncompromised Luxury</span>
            <h2>Why Choose CVR</h2>
            <p>We combine centuries-old artisan traditions with modern e-commerce security, providing a seamless luxury shopping experience.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-hands"></i></div>
              <h3>Handmade Products</h3>
              <p>100% manually hand-carved and hand-polished by lineage artisans. No computerized mass production.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-gem"></i></div>
              <h3>Premium Quality</h3>
              <p>Crafted exclusively from top-grade seasoned hardwoods (Teak, Rosewood, Cedar) to resist warping and crack lines.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-shield-halved"></i></div>
              <h3>Secure Payments</h3>
              <p>Encrypted checkouts integrated with international banking trust frameworks. Shop with peace of mind.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-truck-fast"></i></div>
              <h3>Fast Delivery</h3>
              <p>Custom multi-layer shockproof luxury wooden boxing to guarantee your carvings arrive without single scratches.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-pen-ruler"></i></div>
              <h3>Custom Orders</h3>
              <p>Collaborate directly with our master woodworkers to create custom dimensions, name carvings, or historic murals.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><i className="fa-solid fa-headset"></i></div>
              <h3>Customer Support</h3>
              <p>Dedicated personal art advisors to answer wood care questions or guide your tailored order shipments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section className="section-padding reveal-element" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="italic-sub">Artisan Appreciations</span>
            <h2>Voices of Our Patrons</h2>
            <p>See how our premium wooden collectibles have transformed living rooms, lobbies, and workspaces across the globe.</p>
          </div>

          <div className="reviews-slider-wrapper">
            <div className="reviews-slides-container" style={{ transform: `translateX(-${currentReview * 100}%)`, display: 'flex', transition: 'transform 0.5s ease' }}>
              {reviews.map((review, i) => (
                <div className="review-slide" key={i} style={{ minWidth: '100%' }}>
                  <div className="review-card">
                    <div className="star-rating" aria-label="5 out of 5 stars">
                      <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                    </div>
                    <blockquote className="review-text">{review.text}</blockquote>
                    <div className="review-user-info">
                      <span className="review-user-name">{review.name}</span>
                      <span className="review-user-location">{review.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="slider-dots" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              {reviews.map((_, i) => (
                <button 
                  key={i}
                  className={`slider-dot ${currentReview === i ? 'active' : ''}`}
                  onClick={() => setCurrentReview(i)}
                  aria-label={`Go to review slide ${i + 1}`}
                  style={{ width: currentReview === i ? '30px' : '10px', height: '10px', borderRadius: '5px', margin: '0 5px', backgroundColor: currentReview === i ? 'var(--color-gold)' : 'rgba(0,0,0,0.2)', border: 'none', transition: 'all 0.3s ease' }}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
