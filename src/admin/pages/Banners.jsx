import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiMove } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  
  const { logActivity } = useActivityLog();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { title: '', subtitle: '', link: '', displayOrder: 0, active: true }
  });

  const loadBanners = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'banners'), orderBy('displayOrder', 'asc'));
      const snap = await getDocs(q);
      setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching banners:', err);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const deleteImageFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
      await fetch('/api/cloudinary-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    reset({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      displayOrder: banner.displayOrder || 0,
      active: banner.active !== false
    });
    setImageUrl(banner.image || '');
    setImagePublicId(banner.cloudinaryPublicId || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ title: '', subtitle: '', link: '', displayOrder: banners.length, active: true });
    setImageUrl('');
    setImagePublicId('');
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Are you sure you want to delete banner: ${banner.title}?`)) return;

    try {
      if (banner.cloudinaryPublicId) {
        await deleteImageFromCloudinary(banner.cloudinaryPublicId);
      }
      await deleteDoc(doc(db, 'banners', banner.id));
      await logActivity('Delete Banner', `Deleted banner: ${banner.title}`);
      toast.success('Banner deleted successfully');
      loadBanners();
    } catch (err) {
      console.error('Error deleting banner:', err);
      toast.error('Failed to delete banner');
    }
  };

  const onSubmit = async (data) => {
    if (!imageUrl) {
      toast.error('Please upload an image for the banner');
      return;
    }

    try {
      const payload = {
        title: data.title,
        subtitle: data.subtitle,
        link: data.link,
        displayOrder: Number(data.displayOrder),
        active: data.active,
        image: imageUrl,
        cloudinaryPublicId: imagePublicId,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        const existing = banners.find(b => b.id === editingId);
        if (existing && existing.cloudinaryPublicId && existing.cloudinaryPublicId !== imagePublicId) {
          await deleteImageFromCloudinary(existing.cloudinaryPublicId);
        }
        await updateDoc(doc(db, 'banners', editingId), payload);
        await logActivity('Update Banner', `Updated banner: ${data.title}`);
        toast.success('Banner updated successfully');
      } else {
        await addDoc(collection(db, 'banners'), { ...payload, createdAt: serverTimestamp() });
        await logActivity('Create Banner', `Created banner: ${data.title}`);
        toast.success('Banner created successfully');
      }
      handleCancelEdit();
      loadBanners();
    } catch (err) {
      console.error('Error saving banner:', err);
      toast.error('Failed to save banner');
    }
  };

  return (
    <div className="space-y-6 font-body pb-12">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Banners</h1>
        <p className="text-sm text-wood-light mt-1">Manage promotional banners for the storefront homepage.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Banner List */}
        <div className="xl:col-span-2 bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-espresso border-b border-wood/5 pb-2 mb-4">
            Active Banners
          </h2>

          {loading ? (
            <LoadingSpinner className="h-60" />
          ) : banners.length === 0 ? (
            <div className="text-center py-12 bg-cream/30 rounded-lg border border-wood/5">
              <p className="text-sm text-wood-light">No banners uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.id} className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-xl transition-all ${
                  banner.active === false ? 'border-wood/5 bg-cream/10 opacity-75' : 'border-wood/10 bg-white shadow-sm'
                }`}>
                  <div className="w-full sm:w-48 h-32 flex-shrink-0 relative rounded-lg overflow-hidden border border-wood/10 bg-cream group">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {banner.active === false && (
                      <div className="absolute inset-0 bg-espresso/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Disabled</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-espresso truncate">{banner.title || 'Untitled Banner'}</h3>
                      {banner.subtitle && <p className="text-sm text-wood-light truncate mt-0.5">{banner.subtitle}</p>}
                      {banner.link && (
                        <p className="text-[11px] font-mono text-gold truncate mt-2 bg-gold/5 px-2 py-1 rounded inline-block">
                          Link: {banner.link}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-wood/5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-wood-light uppercase tracking-wider">
                        <FiMove size={14} /> Order: {banner.displayOrder}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-espresso bg-cream hover:bg-wood hover:text-white rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(banner)}
                          className="p-1.5 text-wood-light hover:text-error hover:bg-error/10 bg-cream/50 rounded transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banner Form */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-wood/5 pb-2 mb-4">
            <h2 className="font-heading text-lg font-bold text-espresso">
              {editingId ? 'Edit Banner' : 'Add New Banner'}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
                Banner Title
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors"
                placeholder="e.g. Festive Sale 50% Off"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
                Subtitle
              </label>
              <input
                type="text"
                {...register('subtitle')}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors"
                placeholder="e.g. Shop the new brass collection"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
                Target Link URL
              </label>
              <input
                type="text"
                {...register('link')}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors"
                placeholder="e.g. /category/brass-idols"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
                  Display Order *
                </label>
                <input
                  type="number"
                  {...register('displayOrder', { required: true, min: 0 })}
                  className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex flex-col justify-end pb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    {...register('active')}
                    className="h-4 w-4 text-gold border-wood/20 rounded focus:ring-gold cursor-pointer"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-espresso font-bold cursor-pointer">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-wood/5">
              <CloudinaryUploader
                label="Desktop/Mobile Banner Image *"
                value={imageUrl}
                publicIds={imagePublicId}
                onChange={(url, publicId) => {
                  setImageUrl(url);
                  setImagePublicId(publicId);
                }}
              />
              <p className="text-[10px] text-wood-light mt-1">Recommended ratio: 16:9 or 21:9 for desktop.</p>
            </div>

            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-4 text-xs tracking-widest uppercase"
            >
              <FiSave size={16} />
              <span>{editingId ? 'Save Changes' : 'Publish Banner'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
