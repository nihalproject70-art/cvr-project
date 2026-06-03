import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/helpers';
import { getOptimizedUrl } from '@/services/cloudinary';

export const WishlistDrawer = () => {
  const { items, isOpen, setIsOpen, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    addToCart({ ...item, mainImage: item.image });
    removeFromWishlist(item.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-espresso/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-wood/10">
              <div className="flex items-center gap-2">
                <FiHeart className="text-gold" size={20} />
                <h2 className="font-heading text-xl font-semibold">Wishlist</h2>
                <span className="ml-1 text-sm text-wood-light">({wishlistCount})</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-cream rounded-full transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FiHeart className="text-wood/20 mb-4" size={64} />
                  <p className="font-heading text-lg text-espresso mb-2">Your wishlist is empty</p>
                  <p className="text-sm text-wood-light mb-6">Save items you love for later</p>
                  <Link to="/shop" onClick={() => setIsOpen(false)} className="btn-primary text-sm">
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
                          <h4 className="text-sm font-medium text-espresso line-clamp-2 hover:text-gold transition-colors">{item.name}</h4>
                        </Link>
                        <p className="font-heading text-base font-semibold text-espresso mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors flex items-center gap-1"
                          >
                            <FiShoppingBag size={12} /> Move to Cart
                          </button>
                          <span className="text-wood/20">|</span>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-xs text-wood-light hover:text-error transition-colors"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
