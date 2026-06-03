import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/seo/SEOHead';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/utils/helpers';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Status-to-color mapping for order badges
const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Packed: 'bg-indigo-100 text-indigo-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Firestore on mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <>
      <SEOHead title="Order History | CVR Handicrafts" noIndex />
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-heading text-3xl font-bold text-espresso mb-8">Order History</h1>

          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-lg border border-wood/5">
              <FiPackage className="mx-auto text-wood/20 mb-4" size={64} />
              <p className="font-heading text-xl text-espresso mb-2">No orders yet</p>
              <p className="text-wood-light mb-6">Start shopping to see your orders here</p>
              <Link to="/shop" className="btn-primary"><span>Browse Shop</span></Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-lg border border-wood/5 hover:border-gold/10 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-heading text-lg font-semibold text-espresso">{order.orderId}</p>
                      <p className="text-sm text-wood-light">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                      <span className="font-heading text-lg font-bold text-espresso">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  {order.items && (
                    <div className="mt-4 pt-4 border-t border-wood/5">
                      <p className="text-sm text-wood-light">{order.items.length} item(s): {order.items.map(i => i.name).join(', ')}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default OrderHistory;
