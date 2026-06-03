import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { SEOHead } from '@/components/seo/SEOHead';
import { formatPrice, generateOrderId } from '@/utils/helpers';
import { getOptimizedUrl } from '@/services/cloudinary';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, name: 'Shipping', icon: FiMapPin },
  { id: 2, name: 'Review', icon: FiCreditCard },
  { id: 3, name: 'Confirmation', icon: FiCheck },
];

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { user } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
    },
  });

  const onSubmitShipping = () => {
    setStep(2);
    window.scrollTo(0, 0);
  };

  const onPlaceOrder = async () => {
    setSubmitting(true);
    try {
      const shippingData = getValues();
      const newOrderId = generateOrderId();
      await addDoc(collection(db, 'orders'), {
        orderId: newOrderId,
        userId: user.uid,
        userEmail: user.email,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shipping: {
          name: shippingData.name,
          email: shippingData.email,
          phone: shippingData.phone,
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state,
          pincode: shippingData.pincode,
        },
        total: cartTotal,
        status: 'Pending',
        paymentStatus: 'Pending',
        createdAt: serverTimestamp(),
      });
      setOrderId(newOrderId);
      await clearCart();
      setStep(3);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="font-heading text-xl text-espresso mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/shop')} className="btn-primary"><span>Browse Shop</span></button>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Checkout | CVR Handicrafts" noIndex />

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= s.id ? 'text-gold' : 'text-wood-light'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step > s.id ? 'bg-gold text-white' : step === s.id ? 'bg-gold/20 text-gold border-2 border-gold' : 'bg-cream text-wood-light border border-wood/15'
                  }`}>
                    {step > s.id ? <FiCheck size={18} /> : s.id}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{s.name}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-px mx-2 ${step > s.id ? 'bg-gold' : 'bg-wood/10'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Shipping */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-heading text-2xl font-bold text-espresso mb-6">Shipping Information</h2>
              <form onSubmit={handleSubmit(onSubmitShipping)} className="bg-white p-6 lg:p-8 rounded-lg border border-wood/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">Full Name *</label>
                    <input {...register('name', { required: 'Required' })} className={`luxury-input ${errors.name ? 'border-error' : ''}`} />
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">Email *</label>
                    <input {...register('email', { required: 'Required' })} className={`luxury-input ${errors.email ? 'border-error' : ''}`} />
                    {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">Phone *</label>
                    <input {...register('phone', { required: 'Required' })} className={`luxury-input ${errors.phone ? 'border-error' : ''}`} />
                    {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">Pincode *</label>
                    <input {...register('pincode', { required: 'Required' })} className={`luxury-input ${errors.pincode ? 'border-error' : ''}`} />
                    {errors.pincode && <p className="text-error text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-espresso mb-1.5">Address *</label>
                    <textarea {...register('address', { required: 'Required' })} rows={3} className={`luxury-input resize-none ${errors.address ? 'border-error' : ''}`} />
                    {errors.address && <p className="text-error text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">City *</label>
                    <input {...register('city', { required: 'Required' })} className={`luxury-input ${errors.city ? 'border-error' : ''}`} />
                    {errors.city && <p className="text-error text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">State *</label>
                    <input {...register('state', { required: 'Required' })} className={`luxury-input ${errors.state ? 'border-error' : ''}`} />
                    {errors.state && <p className="text-error text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>
                <button type="submit" className="btn-primary mt-6"><span>Continue to Review</span></button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-heading text-2xl font-bold text-espresso mb-6">Order Review</h2>
              <div className="bg-white p-6 lg:p-8 rounded-lg border border-wood/5">
                <div className="space-y-4 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 py-3 border-b border-wood/5 last:border-0">
                      <img
                        src={item.image ? getOptimizedUrl(item.image, { width: 80, height: 80 }) : '/placeholder.svg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-espresso">{item.name}</p>
                        <p className="text-xs text-wood-light">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-heading font-semibold text-espresso">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-wood/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-wood-light">Subtotal</span>
                    <span className="font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-wood-light">Shipping</span>
                    <span className="text-success font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-heading font-bold pt-2 border-t border-wood/10">
                    <span>Total</span>
                    <span className="text-gold">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-outline"><span>Back</span></button>
                  <button onClick={onPlaceOrder} disabled={submitting} className="btn-primary flex-1">
                    <span>{submitting ? 'Placing Order...' : 'Place Order'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="bg-white p-8 lg:p-12 rounded-lg border border-wood/5 max-w-lg mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
                  <FiCheck className="text-success" size={40} />
                </div>
                <h2 className="font-heading text-3xl font-bold text-espresso mb-3">Order Placed!</h2>
                <p className="text-wood-light mb-2">Thank you for your order.</p>
                <p className="text-sm text-wood-light mb-6">Order ID: <span className="font-semibold text-gold">{orderId}</span></p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate('/orders')} className="btn-primary"><span>View Orders</span></button>
                  <button onClick={() => navigate('/shop')} className="btn-outline">Continue Shopping</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default Checkout;
