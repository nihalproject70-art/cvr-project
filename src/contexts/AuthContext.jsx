import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { useIdleTimer } from '@/hooks/useIdleTimer';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured] = useState(!!auth);

  // Check admin status
  const checkAdminStatus = useCallback(async (email) => {
    if (!email || !db) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return;
    }
    try {
      const adminDoc = await getDoc(doc(db, 'admins', email));
      if (adminDoc.exists()) {
        setIsAdmin(true);
        setIsSuperAdmin(adminDoc.data().role === 'superAdmin');
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        await checkAdminStatus(currentUser.email);
        // Create/update user document
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
          } else {
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          }
        } catch (error) {
          console.error('User doc error:', error);
        }
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [checkAdminStatus]);

  // Auto logout on idle (30 min) - only for admin
  const handleIdle = useCallback(() => {
    if (isAdmin && auth) {
      signOut(auth);
    }
  }, [isAdmin]);
  useIdleTimer(handleIdle, 30 * 60 * 1000);

  // Auth methods
  const login = async (email, password) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  const register = async (email, password, displayName) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    await sendEmailVerification(result.user);
    return result;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserPassword = async (newPassword) => {
    if (auth && auth.currentUser) {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    }
  };

  const updateUserProfile = async (data) => {
    if (auth && auth.currentUser && db) {
      await updateProfile(auth.currentUser, data);
      // Also update Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, data, { merge: true });
    }
  };

  const value = {
    user,
    isAdmin,
    isSuperAdmin,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserPassword,
    updateUserProfile,
    isFirebaseConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
