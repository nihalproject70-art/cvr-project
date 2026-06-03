import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiMinus, FiPlus, FiShare2, FiChevronRight } from 'react-icons/fi';
import { SEOHead, ProductSchema, BreadcrumbSchema } from '@/components/seo/SEOHead';
import { ProductCard } from '@/components/product/ProductCard';
import { WhatsAppButton } from '@/components/product/WhatsAppButton';
import { FloatingWhatsApp } from '@/components/product/WhatsAppButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice, getDiscount } from '@/utils/helpers';
import { getOptimizedUrl } from '@/services/cloudinary';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const prod = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          setProduct(prod);
          // Fetch related products
          if (prod.category) {
            const relQ = query(
              collection(db, 'products'),
              where('category', '==', prod.category),
              limit(4)
            );
            const relSnapshot = await getDocs(relQ);
            setRelatedProducts(
              relSnapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(p => p.id !== prod.id)
                .slice(0, 4)
            );
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="font-heading text-2xl text-espresso mb-4">Product Not Found</h2>
      <Link to="/shop" className="btn-primary"><span>Browse Shop</span></Link>
    </div>
  );

  const wishlisted = isInWishlist(product.id);
  const discount = getDiscount(product.price, product.salePrice);
  const allImages = [product.mainImage, ...(product.galleryImages || [])].filter(Boolean);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <>
      <SEOHead
        title={`${product.name} | CVR Handicrafts`}
        description={product.shortDescription || product.description || `Buy ${product.name} from CVR Handicrafts`}
        ogImage={product.mainImage}
        ogType="product"
        canonical={`${window.location.origin}/product/${product.slug}`}
      />
      <ProductSchema product={product} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: product.category || 'Shop', url: `/category/${(product.category || '').toLowerCase().replace(/\s+/g, '-')}` },
        { name: product.name },
      ]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-wood-light mb-8">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <FiChevronRight size={12} />
          <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
          {product.category && (
            <>
              <FiChevronRight size={12} />
              <Link to={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gold transition-colors">
                {product.category}
              </Link>
            </>
          )}
          <FiChevronRight size={12} />
          <span className="text-espresso font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square rounded-lg overflow-hidden bg-cream mb-4">
              <img
                src={allImages[selectedImage] ? getOptimizedUrl(allImages[selectedImage], { width: 800, height: 800 }) : '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-gold' : 'border-transparent hover:border-wood/20'
                    }`}
                  >
                    <img src={getOptimizedUrl(img, { width: 80, height: 80 })} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {product.category && (
              <p className="text-xs text-wood-light uppercase tracking-widest font-medium mb-2">{product.category}</p>
            )}
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-espresso mb-4">{product.name}</h1>

            {product.sku && <p className="text-xs text-wood-light mb-4">SKU: {product.sku}</p>}

            <div className="flex items-center gap-4 mb-6">
              <span className="font-heading text-3xl font-bold text-espresso">
                {formatPrice(product.salePrice || product.price)}
              </span>
              {product.salePrice && product.salePrice < product.price && (
                <>
                  <span className="text-xl text-wood-light line-through">{formatPrice(product.price)}</span>
                  <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded">-{discount}%</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-success' : 'bg-error'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-success' : 'text-error'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {product.shortDescription && (
              <p className="text-wood-light leading-relaxed mb-6">{product.shortDescription}</p>
            )}

            {/* Quantity + Cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-wood/15 rounded">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-cream transition-colors">
                  <FiMinus size={16} />
                </button>
                <span className="px-5 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-cream transition-colors">
                  <FiPlus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary w-full disabled:opacity-50"
              >
                <FiShoppingBag size={18} />
                <span>Add to Cart</span>
              </button>

              <WhatsAppButton product={product} />

              <div className="flex gap-3">
                <button
                  onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
                  className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider border rounded flex items-center justify-center gap-2 transition-all ${
                    wishlisted ? 'border-error text-error' : 'border-wood/20 hover:border-gold hover:text-gold'
                  }`}
                >
                  <FiHeart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                  {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button onClick={handleShare} className="px-4 py-3 border border-wood/20 rounded hover:border-gold hover:text-gold transition-all">
                  <FiShare2 size={16} />
                </button>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-wood/10 pt-6">
                <h3 className="font-heading text-lg font-semibold text-espresso mb-3">Description</h3>
                <div className="text-sm text-wood-light leading-relaxed whitespace-pre-line">{product.description}</div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs bg-cream px-3 py-1 rounded-full text-wood-light">{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-heading text-2xl font-semibold text-espresso text-center mb-10">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
      <FloatingWhatsApp />
    </>
  );
};

export default ProductDetail;
