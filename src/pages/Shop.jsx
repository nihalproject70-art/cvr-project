import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useCart } from '@/contexts/CartContext';
import { SEOHead } from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';
import { formatPrice, getDocsWithTimeout } from '@/utils/helpers';
import { getOptimizedUrl } from '@/services/cloudinary';
import toast from 'react-hot-toast';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocsWithTimeout(q, 2000);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const fallbackProducts = [
    { id: 'sculp-1', name: 'Teakwood Elephant Statue', salePrice: 245.00, mainImage: '/assets/cat_sculptures.png', category: 'wooden-sculptures', shortDescription: 'Teakwood • 12 Inches' },
    { id: 'wall-2', name: 'Ornate Teak Tree of Life Carving', salePrice: 280.00, mainImage: '/assets/cat_wall_art.png', category: 'wall-art', shortDescription: 'Teakwood • 30x30 Inches' },
    { id: 'dec-3', name: 'Ornate Sandalwood Jewelry Chest', salePrice: 150.00, mainImage: '/assets/cat_decor.png', category: 'home-decor', shortDescription: 'Sandalwood • Brass Inlay' },
    { id: 'mask-1', name: 'Traditional Oak Tribal Mask', salePrice: 110.00, mainImage: '/assets/cat_masks.png', category: 'wooden-masks', shortDescription: 'Oak Wood • Rustic Finish' }
  ];

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const categories = [
    { id: 'wooden-sculptures', title: 'Wooden Sculptures', subtitle: 'Heritage in Form' },
    { id: 'wooden-masks', title: 'Wooden Masks', subtitle: 'Ancestral Heritage' },
    { id: 'home-decor', title: 'Home Decor', subtitle: 'Artistry in Living' },
    { id: 'wall-art', title: 'Wall Art Panels', subtitle: 'Rustic Elevations' },
    { id: 'gift-items', title: 'Luxury Gift Items', subtitle: 'Bespoke Offerings' }
  ];

  return (
    <>
      <SEOHead title="CVR Handicrafts | Shop - Artisan Hardwood Catalog" />
      
      {/* 4. CATEGORY PRODUCT SECTIONS (SHOPPING MODULE) */}
      <section className="section-padding" id="shop" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="italic-sub">Exquisite Collections</span>
            <h2>Artisan Catalog</h2>
            <p>Browse through our collections. Every single item represents weeks of intensive labor, historic chiseling techniques, and premium ethically-sourced wood.</p>
          </div>

          <div className="category-products-container">
            {categories.map((cat) => (
              groupedProducts[cat.id] && groupedProducts[cat.id].length > 0 && (
                <div className="product-category-group" id={`${cat.id}-section`} key={cat.id}>
                  <div className="section-header">
                    <span className="italic-sub">{cat.subtitle}</span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--color-dark)', marginBottom: 'var(--spacing-sm)' }}>
                      {cat.title}
                    </h3>
                  </div>
                  
                  <div className="product-grid">
                    {groupedProducts[cat.id].map(product => (
                      <div className="product-card" key={product.id}>
                        {product.isBestSeller && <span className="product-badge product-badge-bestseller">Best Seller</span>}
                        <div className="product-card-image">
                          <img src={getOptimizedUrl(product.mainImage || product.image || '/assets/cat_sculptures.png', { width: 400 })} alt={product.name} loading="lazy" />
                          <div className="product-actions-overlay">
                            <Link to={`/product/${product.slug || product.id}`} className="product-action-btn" aria-label={`Quick view ${product.name}`}>
                              <i className="fa-regular fa-eye"></i>
                            </Link>
                            <button className="product-action-btn add-to-cart-btn" onClick={() => handleAddToCart(product)} aria-label={`Add ${product.name} to cart`}>
                              <i className="fa-solid fa-cart-plus"></i>
                            </button>
                          </div>
                        </div>
                        <div className="product-info">
                          <span className="product-meta">{product.shortDescription || cat.title}</span>
                          <h4 className="product-title">{product.name}</h4>
                          <span className="product-price">{formatPrice(product.salePrice || product.price)}</span>
                          <button className="product-mobile-add-btn add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                            <i className="fa-solid fa-cart-plus"></i> Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            {loading && <div className="text-center" style={{ padding: '40px 0' }}>Loading products...</div>}
            
            {!loading && Object.keys(groupedProducts).length === 0 && (
              <div className="text-center" style={{ padding: '40px 0' }}>No products found.</div>
            )}
            
          </div>
        </div>
      </section>
    </>
  );
}
