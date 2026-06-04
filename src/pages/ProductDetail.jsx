import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/helpers';
import { localProducts } from '@/data/products';
import { getOptimizedUrl } from '@/services/cloudinary';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = () => {
      setLoading(true);
      setTimeout(() => {
        const prod = localProducts.find(p => p.slug === slug || p.id === slug);
        setProduct(prod || null);
        setLoading(false);
      }, 500);
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading product details...</div>;
  if (!product) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2>Product Not Found</h2>
      <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Shop</Link>
    </div>
  );

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      <SEOHead title={`${product.name} | CVR Handicrafts`} description={product.shortDescription || product.description} />

      <section className="section-padding" style={{ backgroundColor: 'var(--color-white)', paddingTop: '150px' }}>
        <div className="container">
          
          {/* Breadcrumb */}
          <div style={{ marginBottom: '30px', fontSize: '0.9rem', color: 'var(--color-dark)' }}>
            <Link to="/" style={{ opacity: 0.7 }}>Home</Link>
            <span style={{ margin: '0 10px', opacity: 0.5 }}>/</span>
            <Link to="/shop" style={{ opacity: 0.7 }}>Shop</Link>
            {product.category && (
              <>
                <span style={{ margin: '0 10px', opacity: 0.5 }}>/</span>
                <Link to={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`} style={{ opacity: 0.7, textTransform: 'capitalize' }}>
                  {product.category.replace('-', ' ')}
                </Link>
              </>
            )}
            <span style={{ margin: '0 10px', opacity: 0.5 }}>/</span>
            <span>{product.name}</span>
          </div>

          <div className="quickview-grid" style={{ gap: '50px', alignItems: 'start' }}>
            <div className="quickview-image-panel" style={{ backgroundColor: 'var(--color-cream)', padding: '20px', borderRadius: '8px' }}>
              <img 
                src={getOptimizedUrl(product.mainImage || product.image || '/assets/cat_sculptures.png', { width: 800 })} 
                alt={product.name} 
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
            
            <div className="quickview-info-panel" style={{ padding: '20px 0' }}>
              <span className="quickview-meta" style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', fontWeight: 600 }}>
                {product.shortDescription || product.category || 'Premium Wood'}
              </span>
              <h1 className="quickview-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginTop: '10px', marginBottom: '20px' }}>
                {product.name}
              </h1>
              <div className="quickview-price" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '25px' }}>
                {formatPrice(product.salePrice || product.price)}
              </div>
              
              <p className="quickview-desc" style={{ lineHeight: 1.8, marginBottom: '30px', color: 'var(--color-dark)', opacity: 0.8 }}>
                {product.description || 'An incredibly detailed carving crafted from a single block of premium wood. Features ornate traditional reliefs and polished finish.'}
              </p>
              
              <div className="quickview-details-meta" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', backgroundColor: 'var(--color-cream)', borderRadius: '8px', marginBottom: '30px', fontSize: '0.95rem' }}>
                <span><strong>Material:</strong> {product.shortDescription ? product.shortDescription.split('•')[0] : 'Premium Wood'}</span>
                {product.sku && <span><strong>SKU:</strong> {product.sku}</span>}
                <span><strong>Packaging:</strong> Custom Multi-layer Shockproof Box</span>
                <span><strong>Shipping Guarantee:</strong> 100% Transit Safe Insured</span>
                <span style={{ color: product.stock > 0 ? '#2E7D32' : '#C62828', fontWeight: 600 }}>
                  {product.stock > 0 ? 'In Stock - Ready to Ship' : 'Out of Stock'}
                </span>
              </div>
              
              <div className="quickview-add-action" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px' }}>
                <div className="quickview-qty-select" style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', height: '50px' }}>
                  <button className="quickview-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
                  <span className="quickview-qty-val" style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                  <button className="quickview-qty-btn" onClick={() => setQuantity(quantity + 1)} style={{ width: '40px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddToCart} 
                  disabled={product.stock === 0}
                  style={{ flex: 1, height: '50px' }}
                >
                  <i className="fa-solid fa-cart-plus" style={{ marginRight: '10px' }}></i> Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
