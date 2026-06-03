import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiShoppingBag, FiHeart, FiEdit3 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/seo/SEOHead';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateUserProfile, updateUserPassword } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile form
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { displayName: user?.displayName || '' },
  });

  // Password form (separate instance)
  const { register: pwdRegister, handleSubmit: pwdSubmit, formState: { errors: pwdErrors }, reset: pwdReset } = useForm();

  const onUpdateProfile = async (data) => {
    try {
      await updateUserProfile({ displayName: data.displayName });
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (error) {
      toast.error('Update failed.');
    }
  };

  const onChangePassword = async (data) => {
    try {
      await updateUserPassword(data.newPassword);
      toast.success('Password changed!');
      setChangingPassword(false);
      pwdReset();
    } catch (error) {
      toast.error(error.code === 'auth/requires-recent-login' ? 'Please re-login first' : 'Password change failed.');
    }
  };

  return (
    <>
      <SEOHead title="My Account | CVR Handicrafts" noIndex />
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-heading text-3xl font-bold text-espresso mb-8">My Account</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="space-y-3">
              {/* User Avatar Card */}
              <div className="bg-white p-6 rounded-lg border border-wood/5">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                  <FiUser className="text-gold" size={28} />
                </div>
                <p className="text-center font-heading text-lg font-semibold text-espresso">{user?.displayName || 'User'}</p>
                <p className="text-center text-sm text-wood-light">{user?.email}</p>
              </div>

              {/* Navigation Links */}
              <Link to="/orders" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-wood/5 hover:border-gold/20 transition-all">
                <FiShoppingBag className="text-gold" size={18} /> <span className="text-sm font-medium">Order History</span>
              </Link>
              <Link to="#" onClick={() => {}} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-wood/5 hover:border-gold/20 transition-all">
                <FiHeart className="text-gold" size={18} /> <span className="text-sm font-medium">My Wishlist</span>
              </Link>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Information Section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-lg border border-wood/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-semibold text-espresso">Profile Information</h2>
                  <button onClick={() => setEditMode(!editMode)} className="text-sm text-gold hover:text-gold-hover flex items-center gap-1">
                    <FiEdit3 size={14} /> Edit
                  </button>
                </div>
                {editMode ? (
                  <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-espresso mb-1 block">Display Name</label>
                      <input {...register('displayName', { required: 'Name is required' })} className="luxury-input" />
                      {errors.displayName && <p className="text-error text-xs mt-1">{errors.displayName.message}</p>}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary text-sm py-2 px-6"><span>Save</span></button>
                      <button type="button" onClick={() => setEditMode(false)} className="btn-outline text-sm py-2 px-6">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><FiUser className="text-wood-light" size={16} /><span className="text-sm">{user?.displayName || 'Not set'}</span></div>
                    <div className="flex items-center gap-3"><FiMail className="text-wood-light" size={16} /><span className="text-sm">{user?.email}</span></div>
                  </div>
                )}
              </motion.div>

              {/* Change Password Section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-lg border border-wood/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-semibold text-espresso">Change Password</h2>
                  <button onClick={() => setChangingPassword(!changingPassword)} className="text-sm text-gold hover:text-gold-hover flex items-center gap-1">
                    <FiLock size={14} /> Change
                  </button>
                </div>
                {changingPassword && (
                  <form onSubmit={pwdSubmit(onChangePassword)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-espresso mb-1 block">New Password</label>
                      <input {...pwdRegister('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} type="password" className="luxury-input" placeholder="Min 6 characters" />
                      {pwdErrors.newPassword && <p className="text-error text-xs mt-1">{pwdErrors.newPassword.message}</p>}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary text-sm py-2 px-6"><span>Update Password</span></button>
                      <button type="button" onClick={() => setChangingPassword(false)} className="btn-outline text-sm py-2 px-6">Cancel</button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
