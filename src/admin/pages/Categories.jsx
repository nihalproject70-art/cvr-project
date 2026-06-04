import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { slugify } from '@/utils/helpers';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  
  const { logActivity } = useActivityLog();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', slug: '', description: '', active: true }
  });

  const categoryName = watch('name');

  // Load categories and their product counts
  const loadCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'categories'));
      
      const catsWithCounts = await Promise.all(snap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        // Fetch product count for this category slug
        const q = query(collection(db, 'products'), where('category', '==', data.slug));
        const countSnap = await getCountFromServer(q);
        return {
          id: docSnap.id,
          ...data,
          productCount: countSnap.data().count
        };
      }));

      setCategories(catsWithCounts);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Sync Category Name with Slug
  useEffect(() => {
    if (categoryName && !editingId) {
      setValue('slug', slugify(categoryName));
    }
  }, [categoryName, setValue, editingId]);

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

  const handleEdit = (category) => {
    setEditingId(category.id);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      active: category.active !== false // default true
    });
    setImageUrl(category.image || '');
    setImagePublicId(category.cloudinaryPublicId || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ name: '', slug: '', description: '', active: true });
    setImageUrl('');
    setImagePublicId('');
  };

  const handleDelete = async (category) => {
    if (category.productCount > 0) {
      toast.error(`Cannot delete category with ${category.productCount} active products. Reassign them first.`);
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${category.name}?`)) return;

    try {
      if (category.cloudinaryPublicId) {
        await deleteImageFromCloudinary(category.cloudinaryPublicId);
      }
      await deleteDoc(doc(db, 'categories', category.id));
      await logActivity('Delete Category', `Deleted category: ${category.name}`);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    }
  };

  const onSubmit = async (data) => {
    if (!imageUrl) {
      toast.error('Please upload an image for the category');
      return;
    }

    try {
      if (editingId) {
        const existing = categories.find(c => c.id === editingId);
        if (existing && existing.cloudinaryPublicId && existing.cloudinaryPublicId !== imagePublicId) {
          await deleteImageFromCloudinary(existing.cloudinaryPublicId);
        }

        await updateDoc(doc(db, 'categories', editingId), {
          name: data.name,
          slug: data.slug,
          description: data.description,
          active: data.active,
          image: imageUrl,
          cloudinaryPublicId: imagePublicId,
          updatedAt: serverTimestamp(),
        });
        await logActivity('Update Category', `Updated category: ${data.name}`);
        toast.success('Category updated successfully');
      } else {
        await addDoc(collection(db, 'categories'), {
          name: data.name,
          slug: data.slug,
          description: data.description,
          active: data.active,
          image: imageUrl,
          cloudinaryPublicId: imagePublicId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await logActivity('Create Category', `Created category: ${data.name}`);
        toast.success('Category created successfully');
      }
      handleCancelEdit();
      loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error('Failed to save category');
    }
  };

  return (
    <div className="space-y-6 font-body pb-12">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Categories</h1>
        <p className="text-sm text-wood-light mt-1">Manage storefront product groupings.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Categories List (Left) */}
        <div className="xl:col-span-2 bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-espresso border-b border-wood/5 pb-2 mb-4">
            Existing Categories
          </h2>

          {loading ? (
            <LoadingSpinner className="h-60" />
          ) : categories.length === 0 ? (
            <p className="text-sm text-wood-light text-center py-12">No categories defined yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className={`flex gap-4 p-4 border rounded-xl transition-all group ${
                  cat.active === false ? 'border-wood/5 bg-cream/10 opacity-75' : 'border-wood/10 bg-white hover:shadow-sm'
                }`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-20 h-20 object-cover rounded-lg border border-wood/10 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold text-espresso truncate">{cat.name}</h3>
                        {cat.active === false && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Disabled</span>
                        )}
                      </div>
                      <p className="text-[11px] text-wood-light truncate mt-0.5 font-medium">/{cat.slug}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-wood-light">
                        <FiPackage className={cat.productCount > 0 ? "text-gold" : ""} />
                        <span>{cat.productCount} Products</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 text-wood-light hover:text-gold transition-colors bg-cream/50 hover:bg-cream rounded"
                          title="Edit"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className={`p-1.5 transition-colors rounded ${
                            cat.productCount > 0 
                              ? 'text-wood/20 cursor-not-allowed bg-cream/20' 
                              : 'text-wood-light hover:text-error hover:bg-error/10 bg-cream/50'
                          }`}
                          title={cat.productCount > 0 ? "Cannot delete category with products" : "Delete"}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Form (Right) */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-wood/5 pb-2 mb-4">
            <h2 className="font-heading text-lg font-bold text-espresso">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-wood-light hover:text-espresso p-1 bg-cream/50 hover:bg-cream rounded transition-colors"
                title="Cancel Edit"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
                Category Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors"
                placeholder="Wooden Furniture"
              />
              {errors.name && <p className="text-[10px] text-error mt-1 font-bold">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
                Slug *
              </label>
              <input
                type="text"
                {...register('slug', { required: 'Slug is required' })}
                className={`w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm transition-colors ${
                  editingId ? 'bg-cream/30 focus:bg-white' : 'bg-wood/5 text-wood-light cursor-not-allowed'
                }`}
                placeholder="wooden-furniture"
                readOnly={!editingId}
              />
              {errors.slug && <p className="text-[10px] text-error mt-1 font-bold">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
                Description
              </label>
              <textarea
                rows={3}
                {...register('description')}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors resize-none"
                placeholder="Description of crafts in this category."
              />
            </div>

            <div className="flex items-center pt-2 border-t border-wood/5">
              <input
                type="checkbox"
                id="active"
                {...register('active')}
                className="h-4 w-4 text-gold border-wood/20 rounded focus:ring-gold cursor-pointer"
              />
              <label htmlFor="active" className="ml-2 text-sm text-espresso font-bold cursor-pointer">
                Enable Category
              </label>
            </div>

            <div className="pt-2 border-t border-wood/5">
              <CloudinaryUploader
                label="Category Image *"
                value={imageUrl}
                publicIds={imagePublicId}
                onChange={(url, publicId) => {
                  setImageUrl(url);
                  setImagePublicId(publicId);
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 mt-4 text-xs tracking-widest uppercase"
            >
              <FiSave size={16} />
              <span>{editingId ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
