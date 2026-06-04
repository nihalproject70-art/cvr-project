import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/helpers';
import { getOptimizedUrl } from '@/services/cloudinary';

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`cart-drawer-backdrop ${isOpen ? 'active' : ''}`} 
        id="cartDrawerBackdrop" 
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Drawer */}
      <div 
        className={`cart-drawer ${isOpen ? 'active' : ''}`} 
        id="cartDrawer" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Shopping Cart Drawer"
      >
        <div className="cart-drawer-header">
          <h3>Shopping Bag {cartCount > 0 && `(${cartCount})`}</h3>
          <button 
            className="cart-close-btn" 
            onClick={() => setIsOpen(false)} 
            aria-label="Close Shopping Cart"
          >
            &times;
          </button>
        </div>

        <div className="cart-items-container" id="cartItemsContainer">
          {items.length === 0 ? (
            <div className="cart-empty-message">
              <FiShoppingBag size={48} className="mb-4 text-wood-light/50 mx-auto block" />
              <p>Your luxury shopping bag is currently empty.</p>
              <Link 
                to="/shop" 
                onClick={() => setIsOpen(false)} 
                className="btn btn-gold btn-sm mt-4 inline-block"
              >
                Explore Shop
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-image">
                  <Link to={`/product/${item.slug}`} onClick={() => setIsOpen(false)}>
                    <img 
                      src={item.image ? getOptimizedUrl(item.image, { width: 80, height: 80 }) : '/placeholder.svg'} 
                      alt={item.name} 
                      loading="lazy" 
                    />
                  </Link>
                </div>
                <div className="cart-item-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link to={`/product/${item.slug}`} onClick={() => setIsOpen(false)}>
                      <h4 className="cart-item-title">{item.name}</h4>
                    </Link>
                    <button 
                      className="cart-item-remove-btn" 
                      onClick={() => removeFromCart(item.id)} 
                      aria-label="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <span className="cart-item-price">{formatPrice(item.price)}</span>
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        disabled={item.quantity <= 1} 
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-line">
              <span>Subtotal:</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart-summary-line">
              <span>Safe shipping packaging:</span>
              <span className="gold-text">Complimentary</span>
            </div>
            <div className="flex items-center justify-between mt-4 mb-6">
              <span className="font-heading text-2xl font-bold text-espresso">Total:</span>
              <span className="font-heading text-2xl font-bold text-espresso">{formatPrice(cartTotal)}</span>
            </div>
            <Link 
              to="/checkout" 
              onClick={() => setIsOpen(false)} 
              className="btn btn-primary cart-checkout-btn block text-center mt-4 w-full"
            >
              Proceed To Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};
