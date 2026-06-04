import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiPackage, FiHeart } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/seo/SEOHead';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      const msg = error.code === 'auth/user-not-found' ? 'No account found'
        : error.code === 'auth/wrong-password' ? 'Incorrect password'
        : 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Sign In | CVR Handicrafts" noIndex />
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
              Where tradition meets artistry — handcrafted treasures for your home
            </p>
            <div className="auth-deco-divider" />
            <div className="auth-deco-features">
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiShield size={16} /></div>
                <span>Secure & trusted checkout</span>
              </div>
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiPackage size={16} /></div>
                <span>Track orders in real-time</span>
              </div>
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiHeart size={16} /></div>
                <span>Save your favourite collections</span>
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
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue</p>
            </div>

            {/* Form Card */}
            <div className="auth-card">
              <form onSubmit={handleSubmit(onSubmit)}>
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
                  <div className="field-row">
                    <label>Password</label>
                    <Link to="/forgot-password">Forgot Password?</Link>
                  </div>
                  <div className="auth-input-wrap">
                    <FiLock className="input-icon" size={16} />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Min 6 characters' }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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
                  <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
                </button>
              </form>

              {/* Register Link */}
              <p className="auth-footer-text">
                Don't have an account?{' '}
                <Link to="/register">Create Account</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
