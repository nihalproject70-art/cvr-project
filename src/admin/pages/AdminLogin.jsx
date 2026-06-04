import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield } from 'react-icons/fi';
import { SEOHead } from '@/components/seo/SEOHead';
import { Link } from 'react-router-dom';

export default function AdminLogin() {
  const { login, resetPassword, logout, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { rememberMe: true }
  });

  const {
    register: fpRegister,
    handleSubmit: fpSubmit,
    formState: { errors: fpErrors },
    reset: fpReset
  } = useForm();

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (user && isAdmin && !loading) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Firebase auth persistence is usually handled globally (e.g. in firebase.js setPersistence)
      // For this we will just rely on standard Firebase behavior which is local persistence by default.
      await login(data.email, data.password);
      toast.success('Authenticating admin...');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid admin credentials');
      setSubmitting(false);
    }
  };

  const onForgotPassword = async (data) => {
    setResetting(true);
    try {
      await resetPassword(data.email);
      toast.success('Password reset link sent to your email.');
      setIsForgotPassword(false);
      fpReset();
    } catch (error) {
      console.error('Reset error:', error);
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setResetting(false);
    }
  };

  // Listen for login completion to check admin status
  useEffect(() => {
    if (user && !loading) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Logged in user is not admin
        toast.error('Access denied. Administrator privileges required.');
        logout();
        setSubmitting(false);
      }
    }
  }, [user, isAdmin, loading, navigate, logout]);

  if (loading) return null; // Or a subtle loader

  return (
    <>
      <SEOHead title="Admin Portal | CVR Handicrafts" noIndex />
      <div className="min-h-screen bg-cream flex items-center justify-center p-4 sm:p-8 font-body relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gold/5 blur-[80px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-espresso/5 blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo / Branding */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group mb-2">
              <h2 className="font-heading text-4xl font-extrabold text-espresso tracking-tight transition-transform group-hover:scale-105">
                <span className="text-gold">CVR</span> Handicrafts
              </h2>
            </Link>
            <div className="flex items-center justify-center gap-2 mt-2 text-wood-light font-semibold uppercase tracking-widest text-xs">
              <FiShield className="text-gold" size={14} />
              <span>Admin Portal Access</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-wood/10 relative overflow-hidden">
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

            <AnimatePresence mode="wait">
              {!isForgotPassword ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6" 
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="text-center mb-6">
                    <h3 className="font-heading text-2xl font-bold text-espresso">Welcome Back</h3>
                    <p className="text-sm text-wood-light mt-1">Please sign in to access the control panel</p>
                  </div>

                  <div className="auth-field">
                    <label className="text-xs font-semibold uppercase tracking-wider text-espresso mb-1.5 block">
                      Admin Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-wood-light">
                        <FiMail size={16} />
                      </div>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        className={`luxury-input pl-11 w-full ${errors.email ? 'border-error/50 focus:border-error focus:ring-error' : ''}`}
                        placeholder="admin@cvrhandicrafts.com"
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-error font-medium flex items-center gap-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="auth-field">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-espresso">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs font-semibold text-gold hover:text-gold-hover transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-wood-light">
                        <FiLock size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: 'Password is required',
                        })}
                        className={`luxury-input pl-11 pr-11 w-full ${errors.password ? 'border-error/50 focus:border-error focus:ring-error' : ''}`}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-wood-light hover:text-espresso transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-error font-medium flex items-center gap-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      {...register('rememberMe')}
                      className="h-4 w-4 text-gold focus:ring-gold border-wood/20 rounded cursor-pointer transition-colors"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-espresso cursor-pointer">
                      Remember me for 30 days
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary py-3.5 uppercase tracking-widest text-sm"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      'Secure Login'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="reset-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                  onSubmit={fpSubmit(onForgotPassword)}
                >
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-wood-light hover:text-espresso uppercase tracking-wider transition-colors mb-4"
                  >
                    <FiArrowLeft size={14} /> Back to Login
                  </button>

                  <div className="mb-6">
                    <h3 className="font-heading text-2xl font-bold text-espresso">Reset Password</h3>
                    <p className="text-sm text-wood-light mt-1">Enter your admin email to receive a secure reset link.</p>
                  </div>

                  <div className="auth-field">
                    <label className="text-xs font-semibold uppercase tracking-wider text-espresso mb-1.5 block">
                      Admin Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-wood-light">
                        <FiMail size={16} />
                      </div>
                      <input
                        type="email"
                        {...fpRegister('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        className={`luxury-input pl-11 w-full ${fpErrors.email ? 'border-error/50 focus:border-error focus:ring-error' : ''}`}
                        placeholder="admin@cvrhandicrafts.com"
                      />
                    </div>
                    {fpErrors.email && (
                      <p className="mt-1.5 text-xs text-error font-medium">{fpErrors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={resetting}
                    className="w-full btn-primary py-3.5 uppercase tracking-widest text-sm"
                  >
                    {resetting ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
