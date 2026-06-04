import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { SEOHead } from '@/components/seo/SEOHead';
import { formatPrice } from '@/utils/helpers';
import { getOptimizedUrl } from '@/services/cloudinary';
import { localProducts } from '@/data/products';
import toast from 'react-hot-toast';

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const categoryMap = {
    'brass-items': { title: 'Brass Items', subtitle: 'Traditional Excellence' },
    'mandirs': { title: 'Mandirs', subtitle: 'Divine Sanctuaries' },
    'home-decor': { title: 'Home Decor', subtitle: 'Artistry in Living' },
    'sandalwood-maalai': { title: 'Sandalwood Maalai', subtitle: 'Spiritual Purity' },
    'gift-items': { title: 'Gift Items', subtitle: 'Bespoke Offerings' },
    'wooden-art-work': { title: 'Wooden Art Work', subtitle: 'Heritage in Form' }
  };

  const currentCategory = categoryMap[slug] || { title: slug.replace('-', ' '), subtitle: 'Category' };

  useEffect(() => {
    const fetchCategoryProducts = () => {
      setLoading(true);
      setTimeout(() => {
        // filter by category or subcategory slug
        const fetchedProducts = localProducts.filter(p => {
          const catSlug = p.category.toLowerCase().replace(/\s+/g, '-');
          const subCatSlug = p.subcategory.toLowerCase().replace(/\s+/g, '-');
          return catSlug === slug || subCatSlug === slug;
        });
        
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts([
            { id: 'fallback-1', name: `Premium ${currentCategory.title} Item`, salePrice: 150.00, mainImage: '/assets/cat_sculptures.png', category: slug, shortDescription: 'Handcrafted Wood' }
          ]);
        }
        setLoading(false);
      }, 500);
    };
    fetchCategoryProducts();
  }, [slug, currentCategory.title]);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      <SEOHead title={`CVR Handicrafts | ${currentCategory.title}`} />

      {/* Category Banner */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-cream)', paddingBottom: 0 }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="italic-sub">{currentCategory.subtitle}</span>
            <h2 style={{ textTransform: 'capitalize' }}>{currentCategory.title}</h2>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="product-category-group">
            <div className="product-grid">
              {products.map(product => (
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
                    <span className="product-meta">{product.shortDescription || currentCategory.title}</span>
                    <h4 className="product-title">{product.name}</h4>
                    <span className="product-price">{formatPrice(product.salePrice || product.price)}</span>
                    <button className="product-mobile-add-btn add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                      <i className="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {loading && <div className="text-center" style={{ padding: '40px 0' }}>Loading products...</div>}

            {!loading && products.length === 0 && (
              <div className="text-center" style={{ padding: '40px 0' }}>No products found in this category.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
