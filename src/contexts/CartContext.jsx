import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

const CART_STORAGE_KEY = 'cvr_cart';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage or Firestore
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          setLoading(true);
          const cartDoc = await getDoc(doc(db, 'cart', user.uid));
          if (cartDoc.exists()) {
            setItems(cartDoc.data().items || []);
          } else {
            // Migrate local cart to Firestore
            const localCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
            if (localCart.length > 0) {
              await setDoc(doc(db, 'cart', user.uid), { items: localCart });
              setItems(localCart);
              localStorage.removeItem(CART_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error('Cart load error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        const localCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
        setItems(localCart);
      }
    };
    loadCart();
  }, [user]);

  // Save cart
  const saveCart = useCallback(async (newItems) => {
    setItems(newItems);
    if (user) {
      try {
        await setDoc(doc(db, 'cart', user.uid), { items: newItems });
      } catch (error) {
        console.error('Cart save error:', error);
      }
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    }
  }, [user]);

  const addToCart = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      let newItems;
      if (existing) {
        newItems = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev, {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.salePrice || product.price,
          originalPrice: product.price,
          image: product.mainImage,
          quantity,
        }];
      }
      // Save async
      if (user) {
        setDoc(doc(db, 'cart', user.uid), { items: newItems }).catch(console.error);
      } else {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      }
      return newItems;
    });
    setIsOpen(true);
  }, [user]);

  const removeFromCart = useCallback((productId) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== productId);
      if (user) {
        setDoc(doc(db, 'cart', user.uid), { items: newItems }).catch(console.error);
      } else {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      }
      return newItems;
    });
  }, [user]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setItems(prev => {
      const newItems = prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      if (user) {
        setDoc(doc(db, 'cart', user.uid), { items: newItems }).catch(console.error);
      } else {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      }
      return newItems;
    });
  }, [user]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      try {
        await setDoc(doc(db, 'cart', user.uid), { items: [] });
      } catch (error) {
        console.error('Cart clear error:', error);
      }
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [user]);

  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const cartCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  const value = {
    items,
    isOpen,
    setIsOpen,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
