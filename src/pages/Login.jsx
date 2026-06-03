import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
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
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header / Branding */}
          <div className="text-center mb-8">
            <Link to="/" className="font-heading text-2xl font-bold text-espresso inline-block">
              <span className="text-gold">CVR</span> Handicrafts
            </Link>
            <h1 className="font-heading text-3xl font-bold text-espresso mt-6 mb-2">Welcome Back</h1>
            <p className="text-wood-light">Sign in to your account</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-wood/5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-espresso mb-1.5">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-light" size={16} />
                  <input
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                    type="email"
                    placeholder="your@email.com"
                    className={`luxury-input pl-11 ${errors.email ? 'border-error' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-espresso">Password</label>
                  <Link to="/forgot-password" className="text-xs text-gold hover:text-gold-hover">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-light" size={16} />
                  <input
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className={`luxury-input pl-11 pr-11 ${errors.password ? 'border-error' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-wood-light">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </form>

            {/* Register Link */}
            <p className="text-center text-sm text-wood-light mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold font-semibold hover:text-gold-hover">Create Account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
