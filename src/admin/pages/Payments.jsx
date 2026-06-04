import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { CloudinaryUploader } from '../components/CloudinaryUploader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FiSave, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { logActivity } = useActivityLog();

  const [settings, setSettings] = useState({
    qrCodeImage: '',
    qrCodePublicId: '',
    upiId: '',
    paytmNumber: '',
    paymentInstructions: 'Please scan the QR code using any UPI app (GPay, PhonePe, Paytm). After payment, upload the screenshot during checkout or send it to our WhatsApp number.'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'payments'));
        if (snap.exists()) {
          setSettings(prev => ({
            ...prev,
            ...snap.data()
          }));
        }
      } catch (err) {
        console.error('Error loading payment settings:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'payments'), settings);
      await logActivity('Update Payment Settings', 'Updated UPI/QR payment configuration');
      toast.success('Payment settings saved successfully');
    } catch (err) {
      console.error('Error saving payment settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="space-y-6 font-body pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Payment Configuration</h1>
          <p className="text-sm text-wood-light mt-1">Manage your store's QR code and UPI details.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-sm"
        >
          <FiSave size={16} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        
        {/* QR Code Upload */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
            <FiCreditCard className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-bold text-espresso">QR Code Setup</h2>
          </div>
          
          <div className="mb-4">
            <CloudinaryUploader
              label="UPI QR Code Image *"
              value={settings.qrCodeImage}
              publicIds={settings.qrCodePublicId}
              onChange={(url, publicId) => {
                handleChange('qrCodeImage', url);
                handleChange('qrCodePublicId', publicId);
              }}
            />
          </div>
          <p className="text-[10px] text-wood-light mt-2">
            Upload your merchant QR code here. This will be displayed to customers during the manual checkout process.
          </p>
        </div>

        {/* Manual Payment Details */}
        <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2 border-b border-wood/5 pb-3">
            <FiSmartphone className="text-gold" size={20} />
            <h2 className="font-heading text-lg font-bold text-espresso">Payment Details</h2>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
              UPI ID
            </label>
            <input
              type="text"
              value={settings.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors"
              placeholder="e.g. yourname@ybl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
              Paytm / GPay Number
            </label>
            <input
              type="text"
              value={settings.paytmNumber}
              onChange={(e) => handleChange('paytmNumber', e.target.value)}
              className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors"
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">
              Checkout Instructions
            </label>
            <textarea
              rows={4}
              value={settings.paymentInstructions}
              onChange={(e) => handleChange('paymentInstructions', e.target.value)}
              className="w-full px-3 py-2 border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm bg-cream/30 focus:bg-white transition-colors resize-none"
              placeholder="Instructions displayed to users on the payment page..."
            />
          </div>
        </div>

      </div>
    </div>
  );
}
