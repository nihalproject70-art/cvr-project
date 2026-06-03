import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { SEOHead } from '@/components/seo/SEOHead';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const PRODUCTS_PER_PAGE = 12;

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Popularity', value: 'popular' },
];

const categoryList = [
  'All', 'Wooden Furniture', 'Brass Idols', 'Home Decor',
  'Wall Art', 'Pooja Items', 'Wooden Toys', 'Gift Collections',
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const constraints = [];
      if (selectedCategory !== 'All') {
        constraints.push(where('category', '==', selectedCategory));
      }

      switch (sortBy) {
        case 'price-asc': constraints.push(orderBy('price', 'asc')); break;
        case 'price-desc': constraints.push(orderBy('price', 'desc')); break;
        case 'popular': constraints.push(orderBy('soldCount', 'desc')); break;
        default: constraints.push(orderBy('createdAt', 'desc'));
      }

      constraints.push(limit(PRODUCTS_PER_PAGE));
      if (isLoadMore && lastDoc) constraints.push(startAfter(lastDoc));

      const q = query(collection(db, 'products'), ...constraints);
      const snapshot = await getDocs(q);
      const newProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Client-side search filter
      const filtered = debouncedSearch
        ? newProducts.filter(p =>
            p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            p.category?.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : newProducts;

      if (isLoadMore) {
        setProducts(prev => [...prev, ...filtered]);
      } else {
        setProducts(filtered);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, sortBy, debouncedSearch, lastDoc]);

  useEffect(() => {
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
    fetchProducts(false);
  }, [selectedCategory, sortBy, debouncedSearch]);

  useEffect(() => {
    const params = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (sortBy !== 'newest') params.sort = sortBy;
    if (search) params.search = search;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, sortBy, search]);

  return (
    <>
      <SEOHead
        title="Shop | CVR Handicrafts - Premium Handcrafted Products"
        description="Browse our collection of premium handcrafted wooden furniture, brass idols, home decor and more."
      />

      {/* Page Header */}
      <section className="bg-espresso py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-semibold mb-3">Our Collection</p>
          <h1 className="font-heading text-3xl lg:text-4xl text-white mb-4">Shop All Products</h1>
          <p className="text-white/60 max-w-lg mx-auto">Discover our curated selection of handcrafted premium products</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-light" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="luxury-input pl-11"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-light hover:text-espresso">
                  <FiX size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Filter toggle (mobile) */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="sm:hidden btn-outline py-2.5 px-4 text-xs"
              >
                <FiFilter size={14} /> Filters
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="luxury-input py-2.5 pr-8 text-sm w-auto"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className={`${filtersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-56 flex-shrink-0`}>
              <div className="sticky top-24">
                <h3 className="font-heading text-lg font-semibold text-espresso mb-4">Categories</h3>
                <div className="space-y-1">
                  {categoryList.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-all ${
                        selectedCategory === cat
                          ? 'bg-gold/10 text-gold font-medium'
                          : 'text-espresso hover:bg-cream'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {loading ? (
                <ProductGridSkeleton count={12} />
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={setQuickViewProduct}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="text-center mt-10">
                      <button
                        onClick={() => fetchProducts(true)}
                        disabled={loadingMore}
                        className="btn-outline"
                      >
                        {loadingMore ? (
                          <><LoadingSpinner size="sm" className="inline" /> Loading...</>
                        ) : (
                          'Load More Products'
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="font-heading text-xl text-espresso mb-2">No products found</p>
                  <p className="text-wood-light">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
};

export default Shop;
