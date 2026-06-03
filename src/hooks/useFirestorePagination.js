import { useState, useCallback, useEffect } from 'react';
import { collection, query, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';

export const useFirestorePagination = (collectionName, constraints = [], pageSize = 12) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchItems = useCallback(async (isLoadMore = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const collRef = collection(db, collectionName);
      const queryConstraints = [...constraints, limit(pageSize)];

      if (isLoadMore && lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      const q = query(collRef, ...queryConstraints);
      const snapshot = await getDocs(q);

      const newItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (isLoadMore) {
        setItems((prev) => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      setError(err.message);
      console.error('Firestore pagination error:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [collectionName, constraints, pageSize, lastDoc, loading]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchItems(true);
    }
  }, [fetchItems, hasMore, loading]);

  const refresh = useCallback(() => {
    setItems([]);
    setLastDoc(null);
    setHasMore(true);
    setInitialLoad(true);
    fetchItems(false);
  }, []);

  useEffect(() => {
    fetchItems(false);
  }, []);

  return { items, loading, error, hasMore, loadMore, refresh, initialLoad };
};
