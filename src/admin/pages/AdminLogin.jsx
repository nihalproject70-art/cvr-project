import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function AdminLogin() {
  const { login, logout, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
      const result = await login(data.email, data.password);
      // Wait a moment for auth state changes & admin verification
      // If after login they are not admin, logout and error
      toast.success('Logging in...');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
      setSubmitting(false);
    }
  };

  // Listen for login completion to check admin status
  useEffect(() => {
    if (user && !loading) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Logged in user is not admin
        toast.error('Access denied. You are not registered as an administrator.');
        logout();
        setSubmitting(false);
      }
    }
  }, [user, isAdmin, loading, navigate, logout]);

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="font-heading text-3xl font-extrabold text-espresso tracking-tight">
          <span className="text-gold">CVR</span> Handicrafts
        </h2>
        <p className="mt-2 text-sm text-wood-light font-medium uppercase tracking-widest">
          Admin Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-wood/5 rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood/40">
                  <FiMail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`pl-10 block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm font-body ${
                    errors.email
                      ? 'border-error/50 focus:ring-error focus:border-error'
                      : 'border-wood/20 focus:ring-gold focus:border-gold'
                  }`}
                  placeholder="admin@cvrhandicrafts.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-error font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood/40">
                  <FiLock size={16} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`pl-10 pr-10 block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm font-body ${
                    errors.password
                      ? 'border-error/50 focus:ring-error focus:border-error'
                      : 'border-wood/20 focus:ring-gold focus:border-gold'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-wood/40 hover:text-espresso"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-error font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-wood hover:bg-wood-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 transition-all cursor-pointer font-body uppercase tracking-wider"
              >
                {submitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
