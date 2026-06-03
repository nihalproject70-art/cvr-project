import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { slugify } from '@/utils/helpers';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';
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
    defaultValues: { name: '', slug: '', description: '' }
  });

  const categoryName = watch('name');

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'categories'));
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    });
    setImageUrl(category.image || '');
    setImagePublicId(category.cloudinaryPublicId || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ name: '', slug: '', description: '' });
    setImageUrl('');
    setImagePublicId('');
  };

  const handleDelete = async (category) => {
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
        // Find existing to check if image public ID changed
        const existing = categories.find(c => c.id === editingId);
        if (existing && existing.cloudinaryPublicId && existing.cloudinaryPublicId !== imagePublicId) {
          await deleteImageFromCloudinary(existing.cloudinaryPublicId);
        }

        await updateDoc(doc(db, 'categories', editingId), {
          name: data.name,
          slug: data.slug,
          description: data.description,
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
    <div className="space-y-6 font-body">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Categories</h1>
        <p className="text-sm text-wood-light mt-1">Manage storefront product groupings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories List (Left) */}
        <div className="lg:col-span-2 bg-white border border-wood/5 rounded-xl p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-espresso border-b border-wood/5 pb-2 mb-4">
            Existing Categories
          </h2>

          {loading ? (
            <LoadingSpinner className="h-60" />
          ) : categories.length === 0 ? (
            <p className="text-sm text-wood-light text-center py-12">No categories defined yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="flex gap-4 p-4 border border-wood/10 rounded-lg hover:shadow-sm transition-all group">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-16 h-16 object-cover rounded border border-wood/10 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-espresso truncate">{cat.name}</h3>
                    <p className="text-xs text-wood-light truncate mt-0.5">slug: {cat.slug}</p>
                    <p className="text-xs text-wood-light mt-1 truncate">{cat.description || 'No description'}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 text-wood-light hover:text-gold transition-colors"
                      title="Edit"
                    >
                      <FiEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-wood-light hover:text-error transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Form (Right) */}
        <div className="bg-white border border-wood/5 rounded-xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-wood/5 pb-2 mb-4">
            <h2 className="font-heading text-lg font-bold text-espresso">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-wood-light hover:text-espresso p-1"
                title="Cancel Edit"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Category Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                placeholder="Wooden Furniture"
              />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Slug *
              </label>
              <input
                type="text"
                {...register('slug', { required: 'Slug is required' })}
                className={`mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm ${
                  editingId ? '' : 'bg-cream/30 text-wood-light'
                }`}
                placeholder="wooden-furniture"
              />
              {errors.slug && <p className="text-xs text-error mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Description
              </label>
              <textarea
                rows={3}
                {...register('description')}
                className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                placeholder="Description of crafts in this category."
              />
            </div>

            <div>
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
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-2"
            >
              <FiSave />
              <span>{editingId ? 'Save Changes' : 'Save Category'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
