import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import { FiTrash2, FiPlus, FiLock, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [loading, setLoading] = useState(true);
  const [savingAdmin, setSavingAdmin] = useState(false);

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

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="space-y-8 font-body">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Settings & Auditing</h1>
        <p className="text-sm text-wood-light mt-1">Manage admin permissions and inspect store operations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin Emails Section */}
        <div className="bg-white border border-wood/5 rounded-xl p-6 shadow-sm h-fit space-y-6">
          <div className="border-b border-wood/5 pb-2">
            <h2 className="font-heading text-lg font-bold text-espresso flex items-center gap-2">
              <FiLock className="text-gold" /> Admin Accounts
            </h2>
            <p className="text-xs text-wood-light mt-1">Manage access privileges for the CVR admin portal.</p>
          </div>

          {/* Add Admin Form */}
          {isSuperAdmin ? (
            <form onSubmit={handleAddAdmin} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-espresso">
                  Add Administrator Email
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="name@cvrhandicrafts.com"
                  className="mt-1 block w-full px-3 py-2 border border-wood/10 rounded text-xs focus:ring-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-espresso">
                  Assign Access Role
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  className="mt-1 block w-full py-1.5 px-3 border border-wood/10 rounded bg-white text-xs"
                >
                  <option value="admin">Administrator</option>
                  <option value="superAdmin">Super Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={savingAdmin}
                className="w-full btn-primary flex items-center justify-center gap-1.5 py-2 text-xs"
              >
                <FiPlus />
                <span>Add Access</span>
              </button>
            </form>
          ) : (
            <div className="bg-cream/40 p-4 border border-wood/5 rounded text-xs text-wood-light">
              Only <strong>Super Administrators</strong> can register new admin accounts or alter access permissions.
            </div>
          )}

          {/* Admin Emails List */}
          <div className="space-y-3 pt-3 border-t border-wood/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-espresso">Active Admins</h3>
            <div className="divide-y divide-wood/5 text-xs">
              {admins.map((adm) => (
                <div key={adm.email} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-espresso truncate">{adm.email}</p>
                    <p className="text-[10px] text-wood-light capitalize mt-0.5">{adm.role === 'superAdmin' ? 'Super Admin' : 'Admin'}</p>
                  </div>
                  {isSuperAdmin && adm.email !== user.email && (
                    <button
                      onClick={() => handleRemoveAdmin(adm.email)}
                      className="p-1.5 text-wood-light hover:text-error transition-colors"
                      title="Revoke access"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log Section */}
        <div className="lg:col-span-2 bg-white border border-wood/5 rounded-xl p-6 shadow-sm space-y-4">
          <div className="border-b border-wood/5 pb-2">
            <h2 className="font-heading text-lg font-bold text-espresso flex items-center gap-2">
              <FiList className="text-gold" /> System Audit Trail
            </h2>
            <p className="text-xs text-wood-light mt-1">Audit log of catalog updates and administrative operations.</p>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-wood/10 text-xs font-semibold text-wood-light uppercase">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Admin</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood/5 text-xs text-wood-light">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-wood-light">No activity logs recorded yet.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-cream/10 transition-colors">
                      <td className="py-3 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                      <td className="py-3 text-espresso font-medium">{log.adminEmail}</td>
                      <td className="py-3 font-semibold text-gold">{log.action}</td>
                      <td className="py-3 max-w-[200px] truncate" title={log.details}>{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
