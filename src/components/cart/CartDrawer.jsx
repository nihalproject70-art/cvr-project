import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/helpers';
import { getOptimizedUrl } from '@/services/cloudinary';

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-espresso/50 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-wood/10">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-gold" size={20} />
                <h2 className="font-heading text-xl font-semibold">Shopping Cart</h2>
                <span className="ml-1 text-sm text-wood-light">({cartCount})</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-cream rounded-full transition-colors">
                <FiX size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FiShoppingBag className="text-wood/20 mb-4" size={64} />
                  <p className="font-heading text-lg text-espresso mb-2">Your cart is empty</p>
                  <p className="text-sm text-wood-light mb-6">Discover our handcrafted collection</p>
                  <Link
                    to="/shop"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary text-sm"
                  >
                    <span>Browse Shop</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b border-wood/5">
                      <Link to={`/product/${item.slug}`} onClick={() => setIsOpen(false)} className="flex-shrink-0">
                        <img
                          src={item.image ? getOptimizedUrl(item.image, { width: 80, height: 80 }) : '/placeholder.svg'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                          loading="lazy"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.slug}`} onClick={() => setIsOpen(false)}>
                          <h4 className="text-sm font-medium text-espresso line-clamp-2 hover:text-gold transition-colors">
                            {item.name}
                          </h4>
                        </Link>
                        <p className="font-heading text-base font-semibold text-espresso mt-1">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-wood/15 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1.5 hover:bg-cream transition-colors disabled:opacity-30"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-cream transition-colors"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-wood-light hover:text-error transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-wood/10 bg-cream/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-wood-light uppercase tracking-wider">Subtotal</span>
                  <span className="font-heading text-xl font-bold text-espresso">{formatPrice(cartTotal)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full text-center mb-3"
                >
                  <span>Proceed to Checkout</span>
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-xs text-wood-light uppercase tracking-wider hover:text-error transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
