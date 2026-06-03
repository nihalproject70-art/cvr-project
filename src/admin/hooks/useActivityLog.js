import { useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useActivityLog = () => {
  const { user } = useAuth();

  const logActivity = useCallback(async (action, details = '') => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'activityLogs'), {
        action,
        adminEmail: user.email,
        timestamp: serverTimestamp(),
        details,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user]);

  return { logActivity };
};
