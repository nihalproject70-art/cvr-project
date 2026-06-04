import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import { FiTrash2, FiPlus, FiLock, FiList, FiSave, FiSettings, FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const isSuperAdmin = true; // All admins have equal access in the new single-role system
  const [activeTab, setActiveTab] = useState('store');
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [loading, setLoading] = useState(true);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [savingStore, setSavingStore] = useState(false);

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'CVR Handicrafts',
    phone: '',
    whatsapp: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    googleMapsUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    metaTitle: 'CVR Handicrafts - Luxury Brass Idols',
    metaDescription: 'Authentic Indian craftsmanship and premium brass decor.',
  });

  const fetchSettingsData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Admin Emails
      const adminSnap = await getDocs(collection(db, 'admins'));
      setAdmins(adminSnap.docs.map(doc => ({ email: doc.id, ...doc.data() })));

      // 2. Fetch recent activity logs (last 50 logs)
      const logsQ = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(50));
      const logsSnap = await getDocs(logsQ);
      setLogs(logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 3. Fetch store settings
      const storeSnap = await getDoc(doc(db, 'settings', 'store'));
      if (storeSnap.exists()) {
        setStoreSettings(prev => ({ ...prev, ...storeSnap.data() }));
      }
    } catch (err) {
      console.error('Error fetching settings data:', err);
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    if (!isSuperAdmin) {
      toast.error('Only Super Admins can add or remove admin accounts');
      return;
    }

    setSavingAdmin(true);
    try {
      const emailLower = newAdminEmail.trim().toLowerCase();
      await setDoc(doc(db, 'admins', emailLower), {
        role: newAdminRole,
        addedBy: user.email,
        createdAt: new Date(),
      });
      toast.success('Admin access added successfully');
      setNewAdminEmail('');
      setNewAdminRole('admin');
      fetchSettingsData();
    } catch (err) {
      console.error('Error adding admin:', err);
      toast.error('Failed to add admin email');
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (emailToDelete) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can add or remove admin accounts');
      return;
    }

    if (emailToDelete === user.email) {
      toast.error('You cannot revoke your own administrator access');
      return;
    }

    if (!window.confirm(`Revoke admin access for ${emailToDelete}?`)) return;

    try {
      await deleteDoc(doc(db, 'admins', emailToDelete));
      toast.success('Admin access revoked');
      fetchSettingsData();
    } catch (err) {
      console.error('Error revoking admin access:', err);
      toast.error('Failed to revoke admin access');
    }
  };

  const handleStoreChange = (field, value) => {
    setStoreSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveStore = async () => {
    setSavingStore(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), storeSettings);
      toast.success('Store settings saved successfully');
    } catch (err) {
      console.error('Error saving store settings:', err);
      toast.error('Failed to save store settings');
    } finally {
      setSavingStore(false);
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="space-y-6 font-body pb-12">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Settings</h1>
        <p className="text-sm text-wood-light mt-1">Configure your storefront, manage admins, and view audits.</p>
      </div>

      <div className="flex border-b border-wood/10 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'store' ? 'border-gold text-espresso' : 'border-transparent text-wood-light hover:text-espresso'
          }`}
        >
          Store Setup
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'admins' ? 'border-gold text-espresso' : 'border-transparent text-wood-light hover:text-espresso'
          }`}
        >
          Admin Accounts
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'audits' ? 'border-gold text-espresso' : 'border-transparent text-wood-light hover:text-espresso'
          }`}
        >
          System Audits
        </button>
      </div>

      <div className="mt-6">
        
        {/* TAB 1: STORE SETUP */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              
              <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
                  <FiSettings className="text-gold" size={20} />
                  <h2 className="font-heading text-lg font-bold text-espresso">General & SEO</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Store Name</label>
                    <input type="text" value={storeSettings.storeName} onChange={(e) => handleStoreChange('storeName', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Meta Title (SEO)</label>
                    <input type="text" value={storeSettings.metaTitle} onChange={(e) => handleStoreChange('metaTitle', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Meta Description (SEO)</label>
                    <textarea rows={2} value={storeSettings.metaDescription} onChange={(e) => handleStoreChange('metaDescription', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white resize-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
                  <FiGlobe className="text-gold" size={20} />
                  <h2 className="font-heading text-lg font-bold text-espresso">Social Links</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiInstagram className="text-wood-light" size={20} />
                    <input type="text" placeholder="Instagram URL" value={storeSettings.instagramUrl} onChange={(e) => handleStoreChange('instagramUrl', e.target.value)} className="flex-1 px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30" />
                  </div>
                  <div className="flex items-center gap-3">
                    <FiFacebook className="text-wood-light" size={20} />
                    <input type="text" placeholder="Facebook URL" value={storeSettings.facebookUrl} onChange={(e) => handleStoreChange('facebookUrl', e.target.value)} className="flex-1 px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30" />
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-6">
              
              <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
                  <FiPhone className="text-gold" size={20} />
                  <h2 className="font-heading text-lg font-bold text-espresso">Contact & Support</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Phone Number</label>
                      <input type="text" value={storeSettings.phone} onChange={(e) => handleStoreChange('phone', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">WhatsApp</label>
                      <input type="text" value={storeSettings.whatsapp} onChange={(e) => handleStoreChange('whatsapp', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Support Email</label>
                    <input type="email" value={storeSettings.email} onChange={(e) => handleStoreChange('email', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-wood/5 pb-3">
                  <FiMapPin className="text-gold" size={20} />
                  <h2 className="font-heading text-lg font-bold text-espresso">Location</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Address Line 1</label>
                    <input type="text" value={storeSettings.addressLine1} onChange={(e) => handleStoreChange('addressLine1', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Address Line 2</label>
                    <input type="text" value={storeSettings.addressLine2} onChange={(e) => handleStoreChange('addressLine2', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">City</label>
                      <input type="text" value={storeSettings.city} onChange={(e) => handleStoreChange('city', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">State</label>
                      <input type="text" value={storeSettings.state} onChange={(e) => handleStoreChange('state', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Pincode</label>
                      <input type="text" value={storeSettings.pincode} onChange={(e) => handleStoreChange('pincode', e.target.value)} className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-1">Google Maps Embed URL</label>
                    <input type="text" value={storeSettings.googleMapsUrl} onChange={(e) => handleStoreChange('googleMapsUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." className="w-full px-3 py-2 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveStore}
                  disabled={savingStore}
                  className="btn-primary flex items-center justify-center gap-2 py-3 px-8 text-sm"
                >
                  <FiSave size={16} />
                  <span>{savingStore ? 'Saving...' : 'Save All Settings'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ADMIN ACCOUNTS */}
        {activeTab === 'admins' && (
          <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm max-w-3xl">
            <div className="border-b border-wood/5 pb-2 mb-6">
              <h2 className="font-heading text-lg font-bold text-espresso flex items-center gap-2">
                <FiLock className="text-gold" /> Admin Accounts
              </h2>
              <p className="text-xs text-wood-light mt-1">Manage access privileges for the CVR admin portal.</p>
            </div>

            {isSuperAdmin ? (
              <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3 items-end mb-8">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-espresso mb-1">
                    Add Administrator Email
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="name@cvrhandicrafts.com"
                    className="w-full px-3 py-2.5 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white"
                    required
                  />
                </div>
                <div className="w-full sm:w-48">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-espresso mb-1">
                    Assign Role
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                    className="w-full py-2.5 px-3 border border-wood/10 rounded-lg bg-cream/30 text-sm focus:bg-white"
                  >
                    <option value="admin">Administrator</option>
                    <option value="superAdmin">Super Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={savingAdmin}
                  className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 py-2.5 px-6 text-sm whitespace-nowrap h-[42px]"
                >
                  <FiPlus />
                  <span>Add Access</span>
                </button>
              </form>
            ) : (
              <div className="bg-red-50 text-red-700 p-4 border border-red-100 rounded-lg text-xs mb-8 font-medium flex items-center gap-2">
                <FiLock size={16} /> Only Super Administrators can register new admin accounts or alter permissions.
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-espresso mb-3">Active Admins</h3>
              <div className="divide-y divide-wood/5 text-sm">
                {admins.map((adm) => (
                  <div key={adm.email} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-espresso truncate">{adm.email}</p>
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        adm.role === 'superAdmin' ? 'bg-gold/15 text-gold' : 'bg-wood/10 text-wood-light'
                      }`}>
                        {adm.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                    {isSuperAdmin && adm.email !== user.email && (
                      <button
                        onClick={() => handleRemoveAdmin(adm.email)}
                        className="p-2 text-wood-light hover:text-error hover:bg-error/10 bg-cream/50 rounded transition-colors"
                        title="Revoke access"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM AUDITS */}
        {activeTab === 'audits' && (
          <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
            <div className="border-b border-wood/5 pb-2 mb-6">
              <h2 className="font-heading text-lg font-bold text-espresso flex items-center gap-2">
                <FiList className="text-gold" /> System Audit Trail
              </h2>
              <p className="text-xs text-wood-light mt-1">Audit log of catalog updates and administrative operations.</p>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-wood/10 text-[10px] font-bold text-wood-light uppercase tracking-wider">
                    <th className="pb-3 pt-1">Timestamp</th>
                    <th className="pb-3 pt-1">Admin</th>
                    <th className="pb-3 pt-1">Action</th>
                    <th className="pb-3 pt-1">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood/5 text-xs text-wood-light">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-wood-light">No activity logs recorded yet.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-cream/10 transition-colors">
                        <td className="py-4 whitespace-nowrap font-medium">{formatDate(log.timestamp)}</td>
                        <td className="py-4 text-espresso font-semibold">{log.adminEmail}</td>
                        <td className="py-4 font-bold text-gold uppercase tracking-wider text-[10px]">{log.action}</td>
                        <td className="py-4 max-w-[300px] text-espresso truncate" title={log.details}>{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
