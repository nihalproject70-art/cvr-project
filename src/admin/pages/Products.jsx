import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, doc, deleteDoc, writeBatch, addDoc, serverTimestamp, limit, startAfter, orderBy, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice } from '@/utils/helpers';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiCopy, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [firstDocs, setFirstDocs] = useState([]); // Keep track of first docs for back pagination
  
  const { logActivity } = useActivityLog();
  const navigate = useNavigate();
  const PAGE_SIZE = 12;

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  const fetchProducts = useCallback(async (isNext = false, isPrev = false) => {
    setLoading(true);
    try {
      let qConstraints = [orderBy('createdAt', 'desc')];

      if (selectedCategory) {
        qConstraints.push(where('category', '==', selectedCategory));
      }

      // Pagination
      if (isNext && lastDoc) {
        qConstraints.push(startAfter(lastDoc));
      } else if (isPrev && firstDocs[page - 2]) {
        // For going back, we restart from the previous page's starting point
        qConstraints.push(startAfter(firstDocs[page - 2]));
      }

      qConstraints.push(limit(PAGE_SIZE));

      const q = query(collection(db, 'products'), ...qConstraints);
      const snap = await getDocs(q);

      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);

      if (snap.docs.length > 0) {
        setLastDoc(snap.docs[snap.docs.length - 1]);
        if (!isNext && !isPrev) {
          // Reset pagination trackers on new query
          setFirstDocs([snap.docs[0]]);
          setPage(1);
        } else if (isNext) {
          setFirstDocs(prev => [...prev, snap.docs[0]]);
          setPage(prev => prev + 1);
        } else if (isPrev) {
          setPage(prev => prev - 1);
        }
      }

      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, lastDoc, page, firstDocs]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const deleteImageFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
      await fetch('/api/cloudinary-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;

    try {
      // 1. Delete from Cloudinary
      if (product.cloudinaryPublicId) {
        await deleteImageFromCloudinary(product.cloudinaryPublicId);
      }
      if (Array.isArray(product.galleryImagesPublicIds)) {
        await Promise.all(product.galleryImagesPublicIds.map(id => deleteImageFromCloudinary(id)));
      }

      // 2. Delete from Firestore
      await deleteDoc(doc(db, 'products', product.id));
      await logActivity('Delete Product', `Deleted product: ${product.name} (SKU: ${product.sku || 'N/A'})`);

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) return;

    try {
      const batch = writeBatch(db);
      for (const id of selectedIds) {
        const prod = products.find(p => p.id === id);
        if (prod) {
          // Delete image asynchronously
          if (prod.cloudinaryPublicId) deleteImageFromCloudinary(prod.cloudinaryPublicId);
          if (Array.isArray(prod.galleryImagesPublicIds)) {
            prod.galleryImagesPublicIds.forEach(pid => deleteImageFromCloudinary(pid));
          }
          batch.delete(doc(db, 'products', id));
        }
      }
      await batch.commit();
      await logActivity('Bulk Delete Products', `Deleted ${selectedIds.length} products`);
      setSelectedIds([]);
      toast.success('Products deleted successfully');
      fetchProducts();
    } catch (err) {
      console.error('Error batch deleting products:', err);
      toast.error('Failed to delete products');
    }
  };

  const handleDuplicate = async (product) => {
    try {
      const duplicateData = {
        ...product,
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Math.floor(Math.random() * 1000)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      delete duplicateData.id;

      await addDoc(collection(db, 'products'), duplicateData);
      await logActivity('Duplicate Product', `Duplicated product: ${product.name}`);
      toast.success('Product duplicated successfully');
      fetchProducts();
    } catch (err) {
      console.error('Error duplicating product:', err);
      toast.error('Failed to duplicate product');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered products for client-side search overlay
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Products</h1>
          <p className="text-sm text-wood-light mt-1">Manage and edit your luxury catalog.</p>
        </div>
        <Link
          to="/admin/add-product"
          className="btn-primary flex items-center justify-center gap-2 self-start py-3 px-5"
        >
          <FiPlus />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border border-wood/5 p-4 rounded-lg flex flex-col md:flex-row md:items-center gap-4 justify-between shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-wood/40" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-wood/10 rounded-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 border border-wood/10 rounded-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm w-full sm:w-48 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-error text-white text-xs font-semibold py-2 px-4 rounded hover:bg-error/90 flex items-center gap-2"
          >
            <FiTrash2 /> Bulk Delete ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingSpinner className="h-96" />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-wood/5 p-12 rounded-lg text-center shadow-sm">
          <p className="text-wood-light text-sm">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-wood/5 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-wood/10 bg-cream/10 text-xs font-semibold text-wood-light uppercase">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={products.length > 0 && selectedIds.length === products.length}
                    />
                  </th>
                  <th className="p-4">Image</th>
                  <th className="p-4">Name / SKU / Code</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood/5 text-sm">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-cream/10 transition-colors">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(prod.id)}
                        onChange={() => handleSelectOne(prod.id)}
                      />
                    </td>
                    <td className="p-4">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded border border-wood/10"
                        loading="lazy"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-espresso">{prod.name}</div>
                      <div className="text-xs text-wood-light mt-0.5">
                        SKU: {prod.sku || 'N/A'} {prod.productCode && ` | Code: ${prod.productCode}`}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        prod.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {prod.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-wood-light">{prod.category}</td>
                    <td className="p-4">
                      {prod.salePrice ? (
                        <div className="space-y-0.5">
                          <div className="font-semibold text-espresso">{formatPrice(prod.salePrice)}</div>
                          <div className="text-xs line-through text-wood-light">{formatPrice(prod.price)}</div>
                        </div>
                      ) : (
                        <div className="font-semibold text-espresso">{formatPrice(prod.price)}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${prod.stock <= 5 ? 'text-error' : 'text-espresso'}`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDuplicate(prod)}
                          title="Duplicate"
                          className="p-2 text-wood-light hover:text-gold transition-colors"
                        >
                          <FiCopy size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/edit-product/${prod.id}`)}
                          title="Edit"
                          className="p-2 text-wood-light hover:text-gold transition-colors"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(prod)}
                          title="Delete"
                          className="p-2 text-wood-light hover:text-error transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-cream/10 border-t border-wood/5 flex items-center justify-between">
            <span className="text-xs text-wood-light">Page {page}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => fetchProducts(false, true)}
                className="p-2 border border-wood/10 rounded disabled:opacity-40 hover:bg-cream/30 text-espresso"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                disabled={!hasMore || loading}
                onClick={() => fetchProducts(true, false)}
                className="p-2 border border-wood/10 rounded disabled:opacity-40 hover:bg-cream/30 text-espresso"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
