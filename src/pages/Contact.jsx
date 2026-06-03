import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { SEOHead } from '@/components/seo/SEOHead';
import toast from 'react-hot-toast';

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'contacts'), { ...data, createdAt: serverTimestamp() });
      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Contact Us | CVR Handicrafts" description="Get in touch with CVR Handicrafts. Contact us for inquiries about our handcrafted products." />

      <section className="bg-espresso py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-sm uppercase tracking-[0.3em] font-semibold mb-3">Get In Touch</p>
          <h1 className="font-heading text-3xl lg:text-4xl text-white">Contact Us</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 lg:gap-0 rounded-lg overflow-hidden shadow-xl">
            {/* Left - Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 bg-espresso text-white p-8 lg:p-12"
            >
              <h2 className="font-heading text-2xl mb-6">Contact Information</h2>
              <p className="text-white/60 text-sm mb-10">Feel free to reach out to us. We'd love to hear from you.</p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="text-gold" size={18} />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Address</p>
                    <p className="text-sm text-white/60">CVR Handicrafts, Tamil Nadu, India</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <FiPhone className="text-gold" size={18} />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Phone</p>
                    <a href="tel:+918807173498" className="text-sm text-white/60 hover:text-gold transition-colors">+91 8807173498</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <FiMail className="text-gold" size={18} />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <a href="mailto:info@cvrhandicrafts.com" className="text-sm text-white/60 hover:text-gold transition-colors">info@cvrhandicrafts.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                    <FaWhatsapp className="text-[#25D366]" size={18} />
                  </div>
                  <div>
                    <p className="font-medium mb-1">WhatsApp</p>
                    <a href="https://wa.me/918807173498" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-[#25D366] transition-colors">Chat with us</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <FiClock className="text-gold" size={18} />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Business Hours</p>
                    <p className="text-sm text-white/60">Mon - Sat: 9:00 AM - 7:00 PM</p>
                    <p className="text-sm text-white/60">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 bg-white p-8 lg:p-12">
              <h2 className="font-heading text-2xl text-espresso mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <input {...register('name', { required: 'Name is required' })} placeholder="Your Name" className={`luxury-input ${errors.name ? 'border-error' : ''}`} />
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} placeholder="Email Address" className={`luxury-input ${errors.email ? 'border-error' : ''}`} />
                    {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <input {...register('phone')} placeholder="Phone Number" className="luxury-input" />
                  </div>
                  <div>
                    <input {...register('subject', { required: 'Subject is required' })} placeholder="Subject" className={`luxury-input ${errors.subject ? 'border-error' : ''}`} />
                    {errors.subject && <p className="text-error text-xs mt-1">{errors.subject.message}</p>}
                  </div>
                </div>
                <div>
                  <textarea {...register('message', { required: 'Message is required' })} rows={5} placeholder="Your Message" className={`luxury-input resize-none ${errors.message ? 'border-error' : ''}`} />
                  {errors.message && <p className="text-error text-xs mt-1">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
