import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart, FiShoppingBag, FiMinus, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice, getDiscount } from '@/utils/helpers';
import { getOptimizedUrl } from '@/services/cloudinary';
import { WhatsAppButton } from './WhatsAppButton';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlisted = product ? isInWishlist(product.id) : false;
  const discount = product ? getDiscount(product.price, product.salePrice) : 0;

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-espresso/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-square bg-cream">
                  <img
                    src={product.mainImage ? getOptimizedUrl(product.mainImage, { width: 600, height: 600 }) : '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 bg-error text-white text-xs font-bold px-3 py-1">
                      -{discount}%
                    </span>
                  )}
                  <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <FiX size={18} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-6 lg:p-8 flex flex-col">
                  {product.category && (
                    <p className="text-xs text-wood-light uppercase tracking-widest font-medium mb-2">{product.category}</p>
                  )}
                  <h2 className="font-heading text-2xl font-semibold text-espresso mb-3">{product.name}</h2>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-heading text-2xl font-bold text-espresso">
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                    {product.salePrice && product.salePrice < product.price && (
                      <span className="text-lg text-wood-light line-through">{formatPrice(product.price)}</span>
                    )}
                  </div>

                  {product.shortDescription && (
                    <p className="text-sm text-wood-light leading-relaxed mb-6">{product.shortDescription}</p>
                  )}

                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-success' : 'bg-error'}`} />
                    <span className={product.stock > 0 ? 'text-success' : 'text-error'}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-4 my-4">
                    <span className="text-sm font-medium text-espresso">Qty:</span>
                    <div className="flex items-center border border-wood/15 rounded">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-cream transition-colors">
                        <FiMinus size={14} />
                      </button>
                      <span className="px-4 text-sm font-medium">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-cream transition-colors">
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mt-auto">
                    <button
                      onClick={() => { addToCart(product, quantity); onClose(); }}
                      disabled={product.stock === 0}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiShoppingBag size={16} />
                      <span>Add to Cart</span>
                    </button>

                    <WhatsAppButton product={product} />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
                        className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider border rounded transition-all flex items-center justify-center gap-2 ${
                          wishlisted ? 'border-error text-error' : 'border-wood/20 text-espresso hover:border-gold hover:text-gold'
                        }`}
                      >
                        <FiHeart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
                        {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                      </button>
                      <Link
                        to={`/product/${product.slug}`}
                        onClick={onClose}
                        className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-center border border-wood/20 text-espresso hover:border-gold hover:text-gold rounded transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
