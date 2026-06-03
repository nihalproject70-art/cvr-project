import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/seo/SEOHead';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Reset Password | CVR Handicrafts" noIndex />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-espresso mb-2">Reset Password</h1>
            <p className="text-wood-light">Enter your email to receive a reset link</p>
          </div>

          {/* Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-wood/5">
            {sent ? (
              /* Success State */
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                  <FiMail className="text-success" size={28} />
                </div>
                <p className="text-espresso font-medium mb-2">Email Sent!</p>
                <p className="text-sm text-wood-light mb-6">Check your inbox for the reset link.</p>
                <Link to="/login" className="text-gold font-semibold hover:text-gold-hover">Back to Login</Link>
              </div>
            ) : (
              /* Reset Form */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-light" size={16} />
                    <input {...register('email', { required: 'Email is required' })} type="email" placeholder="your@email.com" className={`luxury-input pl-11 ${errors.email ? 'border-error' : ''}`} />
                  </div>
                  {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  <span>{submitting ? 'Sending...' : 'Send Reset Link'}</span>
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-wood-light hover:text-gold transition-colors inline-flex items-center gap-1">
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
