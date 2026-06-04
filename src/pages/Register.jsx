import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAward, FiTruck, FiGift } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/seo/SEOHead';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await authRegister(data.email, data.password, data.name);
      toast.success('Account created! Please verify your email.');
      navigate('/');
    } catch (error) {
      const msg = error.code === 'auth/email-already-in-use' ? 'Email already registered'
        : 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Create Account | CVR Handicrafts" noIndex />
      <div className="auth-page">
        {/* Decorative Left Panel (Desktop only) */}
        <div className="auth-deco-panel">
          <div className="auth-pattern-overlay" />
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="auth-deco-content"
          >
            <div className="auth-logo">
              <span>CVR</span> Handicrafts
            </div>
            <p className="auth-deco-tagline">
              Join our community of art lovers — discover unique handcrafted creations
            </p>
            <div className="auth-deco-divider" />
            <div className="auth-deco-features">
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiAward size={16} /></div>
                <span>Premium artisan quality</span>
              </div>
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiTruck size={16} /></div>
                <span>Free shipping on first order</span>
              </div>
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiGift size={16} /></div>
                <span>Exclusive member-only offers</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="auth-form-wrapper"
          >
            {/* Mobile Brand */}
            <div className="auth-mobile-brand">
              <Link to="/"><span>CVR</span> Handicrafts</Link>
            </div>

            {/* Header */}
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Join the CVR Handicrafts family today</p>
            </div>

            {/* Form Card */}
            <div className="auth-card">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Full Name */}
                <div className="auth-field">
                  <label>Full Name</label>
                  <div className="auth-input-wrap">
                    <FiUser className="input-icon" size={16} />
                    <input
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Your full name"
                      className={`luxury-input pl-11 ${errors.name ? 'border-error' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="auth-error">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="auth-field">
                  <label>Email Address</label>
                  <div className="auth-input-wrap">
                    <FiMail className="input-icon" size={16} />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                      })}
                      type="email"
                      placeholder="your@email.com"
                      className={`luxury-input pl-11 ${errors.email ? 'border-error' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="auth-error">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-wrap">
                    <FiLock className="input-icon" size={16} />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Min 6 characters' }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      className={`luxury-input pl-11 pr-11 ${errors.password ? 'border-error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="toggle-pwd"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="auth-error">{errors.password.message}</p>}
                </div>

                {/* Submit */}
                <button type="submit" disabled={submitting} className="auth-submit-btn">
                  {submitting && <span className="auth-spinner" />}
                  <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </form>

              {/* Login Link */}
              <p className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/login">Sign In</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Register;
