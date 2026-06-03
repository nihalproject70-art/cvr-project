import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiEye, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice, getDiscount } from '@/utils/helpers';
import { getOptimizedUrl as cloudinaryOptimize } from '@/services/cloudinary';

const StarRating = ({ rating = 0 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-gold' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export const ProductCard = memo(({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const discount = getDiscount(product.price, product.salePrice);
  const imageUrl = product.mainImage
    ? cloudinaryOptimize(product.mainImage, { width: 400, height: 400 })
    : '/placeholder.svg';

  return (
    <motion.div
      className="product-card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Image */}
      <div className="product-image relative aspect-square bg-cream/50">
        <Link to={`/product/${product.slug}`}>
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-espresso text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-error text-white text-[10px] font-bold tracking-wider px-2.5 py-1">
              -{discount}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gold text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1">
              Best Seller
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
              wishlisted
                ? 'bg-error text-white'
                : 'bg-white text-espresso hover:bg-gold hover:text-white'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="w-9 h-9 rounded-full bg-white text-espresso flex items-center justify-center hover:bg-gold hover:text-white transition-all shadow-md"
              aria-label="Quick view"
            >
              <FiEye size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <p className="text-[11px] text-wood-light uppercase tracking-widest font-medium mb-1">
            {product.category}
          </p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-heading text-base font-semibold text-espresso mb-2 line-clamp-2 hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="mb-2">
            <StarRating rating={product.rating} />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="font-heading text-lg font-bold text-espresso">
            {formatPrice(product.salePrice || product.price)}
          </span>
          {product.salePrice && product.salePrice < product.price && (
            <span className="text-sm text-wood-light line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-2.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            product.stock === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-espresso text-white hover:bg-gold'
          }`}
        >
          <FiShoppingBag size={14} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
