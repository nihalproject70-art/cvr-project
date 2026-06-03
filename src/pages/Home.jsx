import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { preload } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowRight, FiStar, FiShield, FiTruck, FiAward, FiHeart, FiSmile, FiChevronLeft, FiChevronRight, FiEye, FiShoppingBag } from 'react-icons/fi';
import { collection, query, where, limit, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { SEOHead } from '@/components/seo/SEOHead';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { FloatingWhatsApp } from '@/components/product/WhatsAppButton';
import { getOptimizedUrl } from '@/services/cloudinary';
import { formatPrice, getDocsWithTimeout } from '@/utils/helpers';
import { mockProducts } from '@/utils/mockData';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

// Scroll reveal wrapper
const RevealSection = ({ children, className = '', delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

import heroBg from '@/assets/hero_bg.png';

// Preload Large LCP Hero background image at the browser level
preload(heroBg, { as: 'image', fetchPriority: 'high' });

// ===== HERO SECTION =====
const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <img
        src={heroBg}
        alt="CVR Handicrafts Showroom"
        className="absolute inset-0 w-full h-full object-cover z-0"
        fetchpriority="high"
        loading="eager"
      />
      {/* Dark Tint Overlay */}
      <div className="absolute inset-0 bg-espresso/75 z-10" />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 bg-gold/5 rounded-full blur-3xl z-10"
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-48 h-48 bg-wood/5 rounded-full blur-2xl z-10"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div style={{ y, opacity }} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center text-white relative z-20">
        <motion.p
          className="text-gold text-xs sm:text-sm uppercase tracking-[0.4em] font-semibold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Legacy of Craftsmanship
        </motion.p>
        <motion.h1
          className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wider leading-tight uppercase mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          CVR Handicrafts
        </motion.h1>
        <motion.p
          className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Elevate your living spaces with authentic, high-end wood carvings, traditional masks, and premium sculptures crafted by master artisans. Bringing heritage wood craftsmanship to modern luxury.
        </motion.p>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link to="/shop" className="btn-primary">
            <span>Shop Now</span>
          </Link>
          <Link to="/about" className="btn-outline border-white text-white hover:bg-white hover:text-espresso">
            Explore Story
          </Link>
        </motion.div>
      </motion.div>

      {/* Mouse scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-[10px] uppercase tracking-[0.2em] font-semibold z-20">
        <span>Discover More</span>
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 bg-gold rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    </section>
  );
};

// ===== CATEGORIES SECTION =====
const CategoriesSection = () => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategoriesList(items);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const fallbackCategories = [
    { name: 'Wooden Sculptures', slug: 'wooden-sculptures', image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=800' },
    { name: 'Wooden Masks', slug: 'wooden-masks', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800' },
    { name: 'Home Decor', slug: 'home-decor', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800' },
    { name: 'Wooden Temples', slug: 'wooden-temples', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800' },
    { name: 'Brass Idols', slug: 'brass-idols', image: 'https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?q=80&w=800' },
    { name: 'Wall Art', slug: 'wall-art', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800' },
  ];

  const displayCats = categoriesList.length > 0 ? categoriesList : fallbackCategories;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <RevealSection>
          <div className="text-center mb-12">
            <p className="section-subtitle">Browse Collection</p>
            <h2 className="section-title font-heading text-3xl lg:text-4xl">Shop by Category</h2>
            <div className="section-divider" />
          </div>
        </RevealSection>

        {loading && categoriesList.length === 0 && !categoriesList ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-wood/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="luxury-category-grid">
            {displayCats.map((cat, i) => (
              <RevealSection key={cat.slug} delay={i * 0.05}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="luxury-category-card"
                >
                  {/* Background Image */}
                  <img
                    src={getOptimizedUrl(cat.image, { width: 500 })}
                    alt={cat.name}
                    loading="lazy"
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="luxury-category-overlay" />

                  {/* Text Overlay at bottom */}
                  <div className="luxury-category-content">
                    <h3 className="luxury-category-title">
                      {cat.name}
                    </h3>
                    <span className="luxury-category-button">
                      <span>VIEW PRODUCTS</span>
                      <span className="arrow-icon">→</span>
                    </span>
                  </div>
                </Link>
              </RevealSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ===== FEATURED PRODUCTS =====
const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('isFeatured', '==', true),
          limit(8)
        );
        const snapshot = await getDocsWithTimeout(q, 1500);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts(mockProducts.filter(p => p.isFeatured).slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts(mockProducts.filter(p => p.isFeatured).slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection>
          <p className="section-subtitle">Curated Selection</p>
          <h2 className="section-title font-heading text-3xl lg:text-4xl">Featured Products</h2>
          <div className="section-divider" />
        </RevealSection>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-wood-light">Featured products coming soon</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/shop" className="btn-outline">
            View All Products <FiArrowRight size={14} className="ml-2" />
          </Link>
        </div>

        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      </div>
    </section>
  );
};

// ===== MASTERPIECE CARD =====
const MasterpieceCard = ({ product, onQuickView, onAddToCart }) => {
  const displayMaterial = product.shortDescription
    ? product.shortDescription.toUpperCase()
    : `${product.categoryName || 'TEAKWOOD'} • ${product.name}`.toUpperCase();

  const imageUrl = product.mainImage || product.image;

  return (
    <div className="masterpiece-card group">
      {/* Product Image Container */}
      <div className="masterpiece-image-container">
        <img
          src={getOptimizedUrl(imageUrl, { width: 400, height: 400 })}
          alt={product.name}
          loading="lazy"
        />
        {/* Best Seller Badge */}
        <div className="masterpiece-badge">
          BEST SELLER
        </div>

        {/* Hover overlay with center actions */}
        <div className="masterpiece-actions">
          <button
            onClick={() => onQuickView(product)}
            className="masterpiece-action-btn"
            title="Quick View"
          >
            <FiEye size={20} />
          </button>
          <button
            onClick={() => onAddToCart(product)}
            className="masterpiece-action-btn"
            title="Add to Cart"
          >
            <FiShoppingBag size={20} />
          </button>
        </div>
      </div>

      {/* Product Information Details (Left-aligned) */}
      <div className="masterpiece-details">
        <p className="masterpiece-material truncate">
          {displayMaterial}
        </p>
        <h3 className="masterpiece-title font-heading truncate">
          {product.name}
        </h3>
        <p className="masterpiece-price">
          {formatPrice(product.salePrice || product.price || 120)}
        </p>
      </div>
    </div>
  );
};

// ===== BEST SELLERS SLIDER (MASTERPIECES) =====
const BestSellersSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { addToCart } = useCart();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('isBestSeller', '==', true),
          limit(10)
        );
        const snapshot = await getDocsWithTimeout(q, 1500);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts(mockProducts.filter(p => p.isBestSeller).slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setProducts(mockProducts.filter(p => p.isBestSeller).slice(0, 10));
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading && products.length === 0) return null;

  const fallbackMasterpieces = [
    { id: '1', name: 'Teakwood Elephant Statue', slug: 'teakwood-elephant-statue', mainImage: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=600', shortDescription: 'TEAKWOOD • 12 INCHES', price: 245, categoryName: 'Wooden Sculptures' },
    { id: '2', name: 'Ornate Teak Tree of Life Carving', slug: 'ornate-teak-tree-carving', mainImage: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=600', shortDescription: 'TEAKWOOD • 30X30 INCHES', price: 280, categoryName: 'Wooden Panels' },
    { id: '3', name: 'Ornate Sandalwood Jewelry Chest', slug: 'sandalwood-jewelry-chest', mainImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600', shortDescription: 'SANDALWOOD • BRASS INLAY', price: 150, categoryName: 'Home Decor' },
    { id: '4', name: 'Traditional Oak Tribal Mask', slug: 'traditional-oak-tribal-mask', mainImage: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600', shortDescription: 'OAK WOOD • RUSTIC FINISH', price: 110, categoryName: 'Wooden Masks' },
  ];

  const displayProds = products.length > 0 ? products : fallbackMasterpieces;

  return (
    <section className="masterpiece-section relative">
      <div className="masterpiece-container px-4 sm:px-6 lg:px-8">
        <RevealSection>
          <div className="text-center mb-12">
            <p className="section-subtitle">Premium Highlights</p>
            <h2 className="section-title font-heading text-3xl lg:text-4xl">Best Seller Masterpieces</h2>
            <div className="section-divider" />
          </div>
        </RevealSection>

        {/* Slider container with edge arrows */}
        <div className="relative px-6 sm:px-10">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-wood/10 flex items-center justify-center hover:bg-gold hover:text-white transition-all z-20 cursor-pointer text-espresso"
            aria-label="Previous page"
          >
            <FiChevronLeft size={20} />
          </button>

          {/* Slider Content */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-[18px] lg:gap-5 xl:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayProds.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-full md:w-[calc(50%-9px)] lg:w-[calc(33.333%-13.33px)] xl:w-[calc(25%-18px)] snap-start"
              >
                <MasterpieceCard
                  product={product}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-wood/10 flex items-center justify-center hover:bg-gold hover:text-white transition-all z-20 cursor-pointer text-espresso"
            aria-label="Next page"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      </div>
    </section>
  );
};

// ===== WHY CHOOSE US =====
const features = [
  { icon: FiAward, title: 'Handmade Excellence', desc: 'Every piece crafted by skilled artisans with decades of experience' },
  { icon: FiStar, title: 'Premium Materials', desc: 'Only the finest wood, brass, and traditional materials used' },
  { icon: FiShield, title: 'Traditional Craftsmanship', desc: 'Ancient techniques passed down through generations' },
  { icon: FiTruck, title: 'Secure Delivery', desc: 'Safe packaging and reliable shipping across India' },
  { icon: FiAward, title: 'Quality Assurance', desc: 'Every product inspected for perfection before dispatch' },
  { icon: FiSmile, title: 'Customer Satisfaction', desc: '10,000+ happy customers and counting' },
];

const WhyChooseUs = () => (
  <section className="py-20 bg-gradient-to-b from-cream to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <RevealSection>
        <p className="section-subtitle">Why CVR Handicrafts</p>
        <h2 className="section-title font-heading text-3xl lg:text-4xl">The CVR Promise</h2>
        <div className="section-divider" />
      </RevealSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <RevealSection key={i} delay={i * 0.1}>
            <div className="group bg-white rounded-lg p-8 border border-wood/5 hover:border-gold/20 transition-all duration-500 hover:shadow-xl text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <feature.icon className="text-gold" size={28} />
              </div>
              <h3 className="font-heading text-lg font-semibold text-espresso mb-3">{feature.title}</h3>
              <p className="text-sm text-wood-light leading-relaxed">{feature.desc}</p>
            </div>
          </RevealSection>
        ))}
      </div>
    </div>
  </section>
);

// ===== TESTIMONIALS =====
const testimonials = [
  { name: 'Priya Sharma', location: 'Mumbai', rating: 5, review: 'The wooden temple I ordered is absolutely stunning. The craftsmanship is unparalleled. CVR Handicrafts truly delivers premium quality.' },
  { name: 'Rajesh Kumar', location: 'Delhi', rating: 5, review: 'Ordered a brass idol collection. The detail and finish is museum quality. Highly recommended for anyone seeking authentic handicrafts.' },
  { name: 'Anitha Menon', location: 'Bangalore', rating: 5, review: 'Beautiful home decor pieces that transformed our living room. The wood quality is exceptional and delivery was prompt.' },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-espresso text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealSection>
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-semibold mb-4">Testimonials</p>
          <h2 className="font-heading text-3xl lg:text-4xl mb-12">What Our Customers Say</h2>
        </RevealSection>

        <div className="relative min-h-[200px]">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ opacity: current === i ? 1 : 0, y: current === i ? 0 : 20 }}
              className={`${current === i ? '' : 'absolute inset-0 pointer-events-none'}`}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <FiStar key={j} className="text-gold fill-gold" size={20} />
                ))}
              </div>
              <p className="font-heading text-xl lg:text-2xl italic text-white/90 leading-relaxed mb-8">
                "{t.review}"
              </p>
              <div>
                <p className="font-semibold text-gold">{t.name}</p>
                <p className="text-sm text-white/50">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${current === i ? 'bg-gold w-8' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ===== NEWSLETTER =====
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
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
    <section className="py-20 bg-gradient-to-r from-wood to-wood-light text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealSection>
          <p className="text-gold-hover text-sm uppercase tracking-[0.3em] font-semibold mb-4">Stay Connected</p>
          <h2 className="font-heading text-3xl lg:text-4xl mb-4">Join Our Newsletter</h2>
          <p className="text-white/70 mb-8">Get exclusive offers, new arrivals, and artisan stories delivered to your inbox.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-gold"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-gold text-espresso font-semibold text-sm uppercase tracking-wider rounded hover:bg-gold-hover transition-all disabled:opacity-50"
            >
              {submitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </RevealSection>
      </div>
    </section>
  );
};

// ===== MAIN HOME COMPONENT =====
const Home = () => {
  return (
    <>
      <SEOHead />
      <HeroSection />
      <BestSellersSlider />
      <CategoriesSection />
      <FeaturedProducts />
      <WhyChooseUs />
      <TestimonialsSection />
      <NewsletterSection />
      <FloatingWhatsApp />
    </>
  );
};

export default Home;
