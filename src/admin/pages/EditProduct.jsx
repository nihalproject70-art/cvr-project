import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { doc, getDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { slugify } from '@/utils/helpers';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EditProduct() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [mainImagePublicId, setMainImagePublicId] = useState('');
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [galleryPublicIds, setGalleryPublicIds] = useState([]);
  const [originalProduct, setOriginalProduct] = useState(null);

  const { logActivity } = useActivityLog();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const productName = watch('name');

  // Load product and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load categories
        const catSnap = await getDocs(collection(db, 'categories'));
        setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Load product
        const prodSnap = await getDoc(doc(db, 'products', id));
        if (prodSnap.exists()) {
          const data = prodSnap.data();
          setOriginalProduct({ id: prodSnap.id, ...data });
          reset({
            name: data.name,
            slug: data.slug,
            price: data.price,
            salePrice: data.salePrice || '',
            stock: data.stock,
            sku: data.sku || '',
            category: data.category,
            description: data.description || '',
            shortDescription: data.shortDescription || '',
            featured: data.featured || false,
            bestSeller: data.bestSeller || false,
            newArrival: data.newArrival || false,
            active: data.active !== undefined ? data.active : true,
            productCode: data.productCode || '',
            height: data.height || '',
            weight: data.weight || '',
          });
          setMainImageUrl(data.mainImage || '');
          setMainImagePublicId(data.cloudinaryPublicId || '');
          setGalleryUrls(data.galleryImages || []);
          setGalleryPublicIds(data.galleryImagesPublicIds || []);
        } else {
          toast.error('Product not found');
          navigate('/admin/products');
        }
      } catch (err) {
        console.error('Error loading product edit data:', err);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, reset, navigate]);

  // Sync Name with Slug (only if changed manually, but let's allow changing name without auto-overriding slug if it's already set)
  // We can let the user edit the slug or keep the sync if it was recently modified
  useEffect(() => {
    if (productName && originalProduct && productName !== originalProduct.name) {
      setValue('slug', slugify(productName));
    }
  }, [productName, setValue, originalProduct]);

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

  const onSubmit = async (data) => {
    if (!mainImageUrl) {
      toast.error('Please upload a main product image');
      return;
    }

    setSubmitting(true);
    try {
      // Deletion of old main image if changed
      if (originalProduct.cloudinaryPublicId && originalProduct.cloudinaryPublicId !== mainImagePublicId) {
        await deleteImageFromCloudinary(originalProduct.cloudinaryPublicId);
      }

      // Deletion of old gallery images that are removed
      const removedGalleryIds = (originalProduct.galleryImagesPublicIds || []).filter(
        pid => !galleryPublicIds.includes(pid)
      );
      if (removedGalleryIds.length > 0) {
        await Promise.all(removedGalleryIds.map(pid => deleteImageFromCloudinary(pid)));
      }

      const productPayload = {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : null,
        stock: Number(data.stock),
        category: data.category,
        description: data.description,
        shortDescription: data.shortDescription,
        featured: data.featured,
        bestSeller: data.bestSeller,
        newArrival: data.newArrival,
        active: data.active,
        productCode: data.productCode,
        height: data.height,
        weight: data.weight,
        mainImage: mainImageUrl,
        cloudinaryPublicId: mainImagePublicId,
        galleryImages: galleryUrls,
        galleryImagesPublicIds: galleryPublicIds,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'products', id), productPayload);
      await logActivity('Update Product', `Updated product: ${data.name} (SKU: ${data.sku})`);
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-body">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-cream border border-wood/10 rounded-lg text-espresso transition-colors"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Edit Product</h1>
          <p className="text-sm text-wood-light mt-0.5">Modify product details and pricing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 bg-white border border-wood/5 p-6 rounded-xl space-y-4 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-espresso border-b border-wood/5 pb-2">Product Info</h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Product Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
              />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  Slug (Auto-generated) *
                </label>
                <input
                  type="text"
                  {...register('slug', { required: 'Slug is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm bg-cream/30 text-wood-light"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  Product Code
                </label>
                <input
                  type="text"
                  {...register('productCode')}
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  {...register('sku')}
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                />
                {errors.price && <p className="text-xs text-error mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  {...register('salePrice', { min: 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  Stock *
                </label>
                <input
                  type="number"
                  {...register('stock', { required: 'Stock is required', min: 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  Height (inches/cm)
                </label>
                <input
                  type="text"
                  {...register('height')}
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  Weight (kg/gms)
                </label>
                <input
                  type="text"
                  {...register('weight')}
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Short Description *
              </label>
              <textarea
                rows={2}
                {...register('shortDescription', { required: 'Short description is required' })}
                className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Full Description
              </label>
              <textarea
                rows={5}
                {...register('description')}
                className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded-md focus:ring-gold focus:border-gold sm:text-sm"
              />
            </div>
          </div>

          {/* Sidebar Config */}
          <div className="space-y-6">
            <div className="bg-white border border-wood/5 p-6 rounded-xl space-y-4 shadow-sm">
              <h3 className="font-heading text-base font-bold text-espresso border-b border-wood/5 pb-2">Organization</h3>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="mt-1 block w-full py-2 px-3 border border-wood/10 rounded-md bg-white focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-error mt-1">{errors.category.message}</p>}
              </div>

              {/* Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    {...register('featured')}
                    className="h-4 w-4 text-gold border-wood/20 rounded focus:ring-gold"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-espresso font-medium">
                    Featured Product
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bestSeller"
                    {...register('bestSeller')}
                    className="h-4 w-4 text-gold border-wood/20 rounded focus:ring-gold"
                  />
                  <label htmlFor="bestSeller" className="ml-2 text-sm text-espresso font-medium">
                    Best Seller
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newArrival"
                    {...register('newArrival')}
                    className="h-4 w-4 text-gold border-wood/20 rounded focus:ring-gold"
                  />
                  <label htmlFor="newArrival" className="ml-2 text-sm text-espresso font-medium">
                    New Arrival
                  </label>
                </div>

                <div className="flex items-center pt-2 border-t border-wood/10 mt-2">
                  <input
                    type="checkbox"
                    id="active"
                    {...register('active')}
                    className="h-4 w-4 text-gold border-wood/20 rounded focus:ring-gold"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-espresso font-bold">
                    Product is Active
                  </label>
                </div>
              </div>
            </div>

            {/* Main Image Upload */}
            <div className="bg-white border border-wood/5 p-6 rounded-xl shadow-sm">
              <CloudinaryUploader
                label="Main Image *"
                value={mainImageUrl}
                publicIds={mainImagePublicId}
                onChange={(url, publicId) => {
                  setMainImageUrl(url);
                  setMainImagePublicId(publicId);
                }}
              />
            </div>
          </div>
        </div>

        {/* Gallery Images Upload */}
        <div className="bg-white border border-wood/5 p-6 rounded-xl shadow-sm">
          <CloudinaryUploader
            label="Gallery Images"
            multiple={true}
            value={galleryUrls}
            publicIds={galleryPublicIds}
            onChange={(urls, publicIds) => {
              setGalleryUrls(urls);
              setGalleryPublicIds(publicIds);
            }}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-outline py-3 px-6 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-sm"
          >
            <FiSave />
            <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
