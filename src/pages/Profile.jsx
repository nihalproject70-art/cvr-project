import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiShoppingBag, FiHeart, FiEdit3, FiCheck, FiX, FiCalendar, FiShield, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { SEOHead } from '@/components/seo/SEOHead';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateUserProfile, updateUserPassword, logout } = useAuth();
  const { setIsOpen: setWishlistOpen } = useWishlist();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Get user initials for the avatar
  const getInitials = () => {
    const name = user?.displayName || user?.email || 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Format the creation date
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : null;

  return (
    <>
      <SEOHead title="My Account | CVR Handicrafts" noIndex />

      {/* Page Header Banner */}
      <div className="profile-banner">
        <div className="profile-banner-pattern" />
        <div className="profile-banner-content container">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="profile-banner-title"
          >
            My Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="profile-banner-subtitle"
          >
            Manage your profile, orders, and preferences
          </motion.p>
        </div>
      </div>

      <section className="profile-section">
        <div className="container profile-grid">
          {/* ─── Sidebar ─── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="profile-sidebar"
          >
            {/* Avatar Card */}
            <div className="profile-avatar-card">
              <div className="profile-avatar">
                <span>{getInitials()}</span>
              </div>
              <h2 className="profile-user-name">{user?.displayName || 'User'}</h2>
              <p className="profile-user-email">{user?.email}</p>
              {memberSince && (
                <div className="profile-member-badge">
                  <FiCalendar size={12} />
                  <span>Member since {memberSince}</span>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <nav className="profile-nav">
              <Link to="/orders" className="profile-nav-item">
                <div className="profile-nav-icon"><FiShoppingBag size={18} /></div>
                <div className="profile-nav-text">
                  <span className="profile-nav-label">Order History</span>
                  <span className="profile-nav-desc">View past orders & tracking</span>
                </div>
              </Link>
              <button onClick={() => setWishlistOpen(true)} className="profile-nav-item">
                <div className="profile-nav-icon"><FiHeart size={18} /></div>
                <div className="profile-nav-text">
                  <span className="profile-nav-label">My Wishlist</span>
                  <span className="profile-nav-desc">Your saved favourites</span>
                </div>
              </button>
              <button onClick={handleLogout} className="profile-nav-item profile-nav-logout">
                <div className="profile-nav-icon"><FiLogOut size={18} /></div>
                <div className="profile-nav-text">
                  <span className="profile-nav-label">Sign Out</span>
                  <span className="profile-nav-desc">Log out of your account</span>
                </div>
              </button>
            </nav>
          </motion.aside>

          {/* ─── Main Content ─── */}
          <div className="profile-main">
            {/* Profile Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="profile-card"
            >
              <div className="profile-card-header">
                <div className="profile-card-title-group">
                  <div className="profile-card-icon"><FiUser size={18} /></div>
                  <h2 className="profile-card-title">Profile Information</h2>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="profile-edit-btn"
                >
                  {editMode ? <><FiX size={14} /> Cancel</> : <><FiEdit3 size={14} /> Edit</>}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleSubmit(onUpdateProfile)} className="profile-form">
                  <div className="auth-field">
                    <label>Display Name</label>
                    <div className="auth-input-wrap">
                      <FiUser className="input-icon" size={16} />
                      <input
                        {...register('displayName', { required: 'Name is required' })}
                        className={`luxury-input pl-11 ${errors.displayName ? 'border-error' : ''}`}
                        placeholder="Your display name"
                      />
                    </div>
                    {errors.displayName && <p className="auth-error">{errors.displayName.message}</p>}
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="profile-save-btn">
                      <FiCheck size={16} /> Save Changes
                    </button>
                    <button type="button" onClick={() => setEditMode(false)} className="profile-cancel-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <div className="profile-info-icon"><FiUser size={16} /></div>
                    <div>
                      <span className="profile-info-label">Full Name</span>
                      <span className="profile-info-value">{user?.displayName || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-icon"><FiMail size={16} /></div>
                    <div>
                      <span className="profile-info-label">Email Address</span>
                      <span className="profile-info-value">{user?.email}</span>
                    </div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-icon"><FiShield size={16} /></div>
                    <div>
                      <span className="profile-info-label">Email Verified</span>
                      <span className="profile-info-value">
                        {user?.emailVerified ? '✓ Verified' : 'Not verified'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Security / Change Password Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="profile-card"
            >
              <div className="profile-card-header">
                <div className="profile-card-title-group">
                  <div className="profile-card-icon"><FiLock size={18} /></div>
                  <h2 className="profile-card-title">Security</h2>
                </div>
                <button
                  onClick={() => setChangingPassword(!changingPassword)}
                  className="profile-edit-btn"
                >
                  {changingPassword ? <><FiX size={14} /> Cancel</> : <><FiLock size={14} /> Change Password</>}
                </button>
              </div>

              {changingPassword ? (
                <form onSubmit={pwdSubmit(onChangePassword)} className="profile-form">
                  <div className="auth-field">
                    <label>New Password</label>
                    <div className="auth-input-wrap">
                      <FiLock className="input-icon" size={16} />
                      <input
                        {...pwdRegister('newPassword', {
                          required: 'Required',
                          minLength: { value: 6, message: 'Min 6 characters' }
                        })}
                        type="password"
                        className={`luxury-input pl-11 ${pwdErrors.newPassword ? 'border-error' : ''}`}
                        placeholder="Min 6 characters"
                      />
                    </div>
                    {pwdErrors.newPassword && <p className="auth-error">{pwdErrors.newPassword.message}</p>}
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="profile-save-btn">
                      <FiCheck size={16} /> Update Password
                    </button>
                    <button type="button" onClick={() => setChangingPassword(false)} className="profile-cancel-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-security-status">
                  <div className="profile-info-item">
                    <div className="profile-info-icon"><FiLock size={16} /></div>
                    <div>
                      <span className="profile-info-label">Password</span>
                      <span className="profile-info-value">••••••••</span>
                    </div>
                  </div>
                  <p className="profile-security-hint">
                    For your security, we recommend changing your password periodically.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
