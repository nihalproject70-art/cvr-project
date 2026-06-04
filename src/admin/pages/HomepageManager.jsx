import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FiSave, FiLayout, FiStar, FiGrid, FiTrendingUp, FiShoppingBag, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function HomepageManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { logActivity } = useActivityLog();

  const [settings, setSettings] = useState({
    heroSection: {
      active: true,
      autoSlide: true,
      slideInterval: 5000,
    },
    newArrivals: {
      active: true,
      title: 'New Arrivals',
      subtitle: 'Discover our latest master pieces',
      limit: 8,
    },
    bestSellers: {
      active: true,
      title: 'Best Sellers',
      subtitle: 'Most loved by our customers',
      limit: 4,
    },
    featuredProducts: {
      active: true,
      title: 'Featured Collection',
      subtitle: 'Handpicked premium items',
      limit: 8,
    },
    categoriesSection: {
      active: true,
      title: 'Shop by Category',
      subtitle: 'Explore our wide range of crafts',
    },
    promoSection: {
      active: true,
      title: 'Authentic Craftsmanship',
      subtitle: 'Sourced directly from generational artisans.',
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'homepage'));
        if (snap.exists()) {
          // Merge to ensure we have default structure if some fields are missing
          setSettings(prev => ({
            ...prev,
            ...snap.data()
          }));
        }
      } catch (err) {
        console.error('Error loading homepage settings:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'homepage'), settings);
      await logActivity('Update Homepage Settings', 'Updated storefront layout configuration');
      toast.success('Homepage settings saved successfully');
    } catch (err) {
      console.error('Error saving homepage settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  const SectionToggle = ({ label, active, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-cream/30 rounded-lg border border-wood/5 mb-4">
      <span className="text-sm font-bold text-espresso">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={active}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-wood/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 font-body pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Homepage Manager</h1>
          <p className="text-sm text-wood-light mt-1">Configure sections, titles, and layout for the storefront homepage.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-sm"
        >
          <FiSave size={16} />
          <span>{saving ? 'Saving...' : 'Save Layout'}</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 text-sm shadow-sm">
        <FiInfo size={20} className="shrink-0 text-blue-500 mt-0.5" />
        <p>
          <strong>Tip:</strong> Disabling a section will hide it entirely from the storefront homepage immediately. 
          The products shown in these sections are automatically pulled from your inventory based on their flags (New Arrival, Best Seller, etc).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hero Section */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
            <FiLayout className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-bold text-espresso">Hero Banners</h2>
          </div>
          <SectionToggle 
            label="Enable Hero Banner Slider" 
            active={settings.heroSection.active} 
            onChange={(val) => handleChange('heroSection', 'active', val)} 
          />
          <div className="space-y-4 pl-2 opacity-90">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="autoSlide"
                checked={settings.heroSection.autoSlide}
                onChange={(e) => handleChange('heroSection', 'autoSlide', e.target.checked)}
                className="text-gold focus:ring-gold border-wood/20 rounded"
              />
              <label htmlFor="autoSlide" className="text-sm text-espresso font-semibold">Auto-play Slides</label>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">
                Slide Duration (ms)
              </label>
              <input
                type="number"
                value={settings.heroSection.slideInterval}
                onChange={(e) => handleChange('heroSection', 'slideInterval', Number(e.target.value))}
                className="w-full sm:w-1/2 px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30"
              />
            </div>
            <p className="text-xs text-wood-light italic mt-2">Note: Banner images are managed in the <a href="/admin/banners" className="text-gold hover:underline">Banners</a> page.</p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
            <FiGrid className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-bold text-espresso">Categories Grid</h2>
          </div>
          <SectionToggle 
            label="Enable Categories Section" 
            active={settings.categoriesSection.active} 
            onChange={(val) => handleChange('categoriesSection', 'active', val)} 
          />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Section Title</label>
              <input
                type="text"
                value={settings.categoriesSection.title}
                onChange={(e) => handleChange('categoriesSection', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Subtitle</label>
              <input
                type="text"
                value={settings.categoriesSection.subtitle}
                onChange={(e) => handleChange('categoriesSection', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* New Arrivals */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
            <FiShoppingBag className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-bold text-espresso">New Arrivals</h2>
          </div>
          <SectionToggle 
            label="Enable New Arrivals" 
            active={settings.newArrivals.active} 
            onChange={(val) => handleChange('newArrivals', 'active', val)} 
          />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Section Title</label>
              <input
                type="text"
                value={settings.newArrivals.title}
                onChange={(e) => handleChange('newArrivals', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Subtitle</label>
              <input
                type="text"
                value={settings.newArrivals.subtitle}
                onChange={(e) => handleChange('newArrivals', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Number of Items to Show</label>
              <input
                type="number"
                value={settings.newArrivals.limit}
                onChange={(e) => handleChange('newArrivals', 'limit', Number(e.target.value))}
                className="w-full sm:w-1/3 px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30"
              />
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
            <FiTrendingUp className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-bold text-espresso">Best Sellers</h2>
          </div>
          <SectionToggle 
            label="Enable Best Sellers" 
            active={settings.bestSellers.active} 
            onChange={(val) => handleChange('bestSellers', 'active', val)} 
          />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Section Title</label>
              <input
                type="text"
                value={settings.bestSellers.title}
                onChange={(e) => handleChange('bestSellers', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Subtitle</label>
              <input
                type="text"
                value={settings.bestSellers.subtitle}
                onChange={(e) => handleChange('bestSellers', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Number of Items to Show</label>
              <input
                type="number"
                value={settings.bestSellers.limit}
                onChange={(e) => handleChange('bestSellers', 'limit', Number(e.target.value))}
                className="w-full sm:w-1/3 px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30"
              />
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
            <FiStar className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-bold text-espresso">Featured Products</h2>
          </div>
          <SectionToggle 
            label="Enable Featured Section" 
            active={settings.featuredProducts.active} 
            onChange={(val) => handleChange('featuredProducts', 'active', val)} 
          />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Section Title</label>
              <input
                type="text"
                value={settings.featuredProducts.title}
                onChange={(e) => handleChange('featuredProducts', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Subtitle</label>
              <input
                type="text"
                value={settings.featuredProducts.subtitle}
                onChange={(e) => handleChange('featuredProducts', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Number of Items to Show</label>
              <input
                type="number"
                value={settings.featuredProducts.limit}
                onChange={(e) => handleChange('featuredProducts', 'limit', Number(e.target.value))}
                className="w-full sm:w-1/3 px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30"
              />
            </div>
          </div>
        </div>

        {/* Promotional / Text Section */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
            <FiInfo className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-bold text-espresso">Store Story / Promo</h2>
          </div>
          <SectionToggle 
            label="Enable Promo Section" 
            active={settings.promoSection.active} 
            onChange={(val) => handleChange('promoSection', 'active', val)} 
          />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Section Title</label>
              <input
                type="text"
                value={settings.promoSection.title}
                onChange={(e) => handleChange('promoSection', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wood-light mb-1">Subtitle / Description</label>
              <textarea
                rows={3}
                value={settings.promoSection.subtitle}
                onChange={(e) => handleChange('promoSection', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
