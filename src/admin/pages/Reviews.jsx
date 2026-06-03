import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate, getStars } from '@/utils/helpers';
import { FiTrash2, FiStar, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { logActivity } = useActivityLog();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (review) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteDoc(doc(db, 'reviews', review.id));
      await logActivity('Delete Review', `Deleted review by ${review.userName} on product ${review.productName}`);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Product Reviews</h1>
        <p className="text-sm text-wood-light mt-1">Monitor and moderate customer feedback.</p>
      </div>

      {loading ? (
        <LoadingSpinner className="h-96" />
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-wood/5 p-12 rounded-lg text-center shadow-sm">
          <p className="text-wood-light text-sm">No reviews found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-wood/5 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-wood/5 pb-2">
                  <div>
                    <h3 className="font-heading font-semibold text-espresso text-sm">{rev.productName || 'Product'}</h3>
                    <p className="text-[11px] text-wood-light uppercase tracking-wider">By: {rev.userName || 'Verified Buyer'}</p>
                  </div>
                  <div className="flex items-center text-gold gap-0.5">
                    {getStars(rev.rating || 5).map((star, idx) => (
                      <FiStar
                        key={idx}
                        size={14}
                        fill={star === 'full' ? 'currentColor' : 'none'}
                        className={star === 'empty' ? 'text-wood/20' : ''}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 text-xs text-wood-light leading-relaxed">
                  <FiMessageSquare size={16} className="text-wood/30 flex-shrink-0 mt-0.5" />
                  <p className="italic">"{rev.comment || 'No comment text provided'}"</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-wood/5">
                <span className="text-[10px] text-wood-light uppercase tracking-wider font-semibold">
                  {formatDate(rev.createdAt)}
                </span>
                <button
                  onClick={() => handleDelete(rev)}
                  className="text-wood hover:text-error text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 p-1 transition-colors"
                >
                  <FiTrash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
