import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiShield, FiLock, FiKey } from 'react-icons/fi';
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
              Don't worry — we'll help you get back into your account securely
            </p>
            <div className="auth-deco-divider" />
            <div className="auth-deco-features">
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiShield size={16} /></div>
                <span>Secure password recovery</span>
              </div>
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiLock size={16} /></div>
                <span>Encrypted email verification</span>
              </div>
              <div className="auth-deco-feature">
                <div className="auth-deco-feature-icon"><FiKey size={16} /></div>
                <span>Reset in just a few clicks</span>
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
              <h1>Reset Password</h1>
              <p>Enter your email to receive a reset link</p>
            </div>

            {/* Form Card */}
            <div className="auth-card">
              {sent ? (
                /* Success State */
                <div style={{ textAlign: 'center' }}>
                  <div className="auth-success-icon">
                    <FiMail size={28} />
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--color-dark-deep)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                    Email Sent!
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-wood-light)', marginBottom: '1.5rem' }}>
                    Check your inbox for the password reset link.
                  </p>
                  <Link to="/login" style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.9rem' }}>
                    Back to Sign In
                  </Link>
                </div>
              ) : (
                /* Reset Form */
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="auth-field">
                    <label>Email Address</label>
                    <div className="auth-input-wrap">
                      <FiMail className="input-icon" size={16} />
                      <input
                        {...register('email', { required: 'Email is required' })}
                        type="email"
                        placeholder="your@email.com"
                        className={`luxury-input pl-11 ${errors.email ? 'border-error' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="auth-error">{errors.email.message}</p>}
                  </div>
                  <button type="submit" disabled={submitting} className="auth-submit-btn">
                    {submitting && <span className="auth-spinner" />}
                    <span>{submitting ? 'Sending...' : 'Send Reset Link'}</span>
                  </button>
                </form>
              )}

              {/* Back to Login */}
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/login" className="auth-back-link">
                  <FiArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
