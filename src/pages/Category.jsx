import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { SEOHead, BreadcrumbSchema } from '@/components/seo/SEOHead';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FiChevronRight } from 'react-icons/fi';

const Category = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const categoryName = slug
    ?.split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    try {
      const constraints = [
        where('category', '==', categoryName),
        orderBy('createdAt', 'desc'),
        limit(12),
      ];
      if (isLoadMore && lastDoc) constraints.push(startAfter(lastDoc));
      const q = query(collection(db, 'products'), ...constraints);
      const snapshot = await getDocs(q);
      const newProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (isLoadMore) setProducts(prev => [...prev, ...newProducts]);
      else setProducts(newProducts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 12);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoryName, lastDoc]);

  useEffect(() => {
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
    fetchProducts(false);
  }, [slug]);

  return (
    <>
      <SEOHead
        title={`${categoryName} | CVR Handicrafts`}
        description={`Explore our ${categoryName} collection. Premium handcrafted products by CVR Handicrafts.`}
        canonical={`${window.location.origin}/category/${slug}`}
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
        { name: categoryName },
      ]} />

      <section className="bg-espresso py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-white/50 mb-4">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <FiChevronRight size={12} />
            <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
            <FiChevronRight size={12} />
            <span className="text-gold">{categoryName}</span>
          </nav>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">{categoryName}</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {hasMore && (
                <div className="text-center mt-10">
                  <button onClick={() => fetchProducts(true)} disabled={loadingMore} className="btn-outline">
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="font-heading text-xl text-espresso mb-2">No products in this category</p>
              <Link to="/shop" className="text-gold hover:text-gold-hover transition-colors">Browse all products</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Category;
