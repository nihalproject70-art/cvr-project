import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

const WISHLIST_STORAGE_KEY = 'cvr_wishlist';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load wishlist
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const wishlistDoc = await getDoc(doc(db, 'wishlist', user.uid));
          if (wishlistDoc.exists()) {
            setItems(wishlistDoc.data().items || []);
          } else {
            const localWishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
            if (localWishlist.length > 0) {
              await setDoc(doc(db, 'wishlist', user.uid), { items: localWishlist });
              setItems(localWishlist);
              localStorage.removeItem(WISHLIST_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error('Wishlist load error:', error);
        }
      } else {
        const localWishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
        setItems(localWishlist);
      }
    };
    loadWishlist();
  }, [user]);

  const addToWishlist = useCallback((product) => {
    setItems(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      const newItems = [...prev, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.salePrice || product.price,
        originalPrice: product.price,
        image: product.mainImage,
        category: product.category,
      }];
      if (user) {
        setDoc(doc(db, 'wishlist', user.uid), { items: newItems }).catch(console.error);
      } else {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newItems));
      }
      return newItems;
    });
  }, [user]);

  const removeFromWishlist = useCallback((productId) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== productId);
      if (user) {
        setDoc(doc(db, 'wishlist', user.uid), { items: newItems }).catch(console.error);
      } else {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newItems));
      }
      return newItems;
    });
  }, [user]);

  const isInWishlist = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const value = {
    items,
    isOpen,
    setIsOpen,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount: items.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
