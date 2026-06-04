import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { slugify } from '@/utils/helpers';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [mainImagePublicId, setMainImagePublicId] = useState('');
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [galleryPublicIds, setGalleryPublicIds] = useState([]);

  const { logActivity } = useActivityLog();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      price: '',
      salePrice: '',
      stock: 10,
      sku: '',
      category: '',
      description: '',
      shortDescription: '',
      featured: false,
      bestSeller: false,
      newArrival: true,
      active: true,
      productCode: '',
      height: '',
      weight: '',
    }
  });

  const productName = watch('name');

  // Sync Name with Slug
  useEffect(() => {
    if (productName) {
      setValue('slug', slugify(productName));
    }
  }, [productName, setValue]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  const onSubmit = async (data) => {
    if (!mainImageUrl) {
      toast.error('Please upload a main product image');
      return;
    }

    setSubmitting(true);
    try {
      const productPayload = {
        name: data.name,
        slug: data.slug,
        sku: data.sku || `CVR-${Date.now().toString().slice(-6)}`,
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), productPayload);
      await logActivity('Create Product', `Created product: ${data.name} (SKU: ${productPayload.sku})`);
      toast.success('Product added successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="font-heading text-3xl font-bold text-espresso">Add Product</h1>
          <p className="text-sm text-wood-light mt-0.5">Create a new item in your luxury catalog.</p>
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
                placeholder="Brass Lord Ganesha Idol"
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
                  placeholder="e.g. CVR-001"
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
                  placeholder="e.g. BR-01"
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
                  placeholder="2499"
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
                  placeholder="1999"
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
                  placeholder="10"
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
                  placeholder="e.g. 10 inches"
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
                  placeholder="e.g. 1.5 kg"
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
                placeholder="A brief summary of the craftsmanship and details."
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
                placeholder="Provide details about the material, dimension, weight, care instructions, and artisans."
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

              {/* Badges and Badging */}
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
            <span>{submitting ? 'Saving Product...' : 'Save Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
