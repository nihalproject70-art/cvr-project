import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import { FiBell, FiCheck, FiTrash2, FiInfo, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <FiShoppingCart size={18} className="text-emerald-500" />;
      case 'alert': return <FiAlertCircle size={18} className="text-red-500" />;
      default: return <FiInfo size={18} className="text-blue-500" />;
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 font-body pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Notifications</h1>
          <p className="text-sm text-wood-light mt-1">Stay updated on new orders and system alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-outline flex items-center justify-center gap-2 py-2 px-4 text-xs"
          >
            <FiCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white border border-wood/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-wood/5 bg-cream/30 flex items-center justify-between">
          <h2 className="text-sm font-bold text-espresso uppercase tracking-wider flex items-center gap-2">
            <FiBell className="text-gold" /> Recent Alerts
          </h2>
          <span className="text-[10px] font-bold bg-gold/15 text-gold px-2 py-0.5 rounded uppercase tracking-wider">
            {unreadCount} Unread
          </span>
        </div>

        <div className="divide-y divide-wood/5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-wood-light flex flex-col items-center">
              <FiBell size={32} className="text-wood/20 mb-3" />
              <p className="text-sm font-medium">You're all caught up!</p>
              <p className="text-xs mt-1">No new notifications at this time.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 sm:p-5 flex gap-4 transition-colors ${notif.read ? 'bg-white opacity-70' : 'bg-gold/5'}`}
              >
                <div className="shrink-0 mt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.read ? 'bg-cream' : 'bg-white shadow-sm border border-gold/20'}`}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm truncate pr-4 ${notif.read ? 'font-medium text-espresso' : 'font-bold text-espresso'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-bold text-wood-light whitespace-nowrap uppercase tracking-wider shrink-0 mt-1">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${notif.read ? 'text-wood-light' : 'text-espresso font-medium'}`}>
                    {notif.message}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    {!notif.read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-[10px] font-bold uppercase tracking-wider text-gold hover:text-espresso transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="text-[10px] font-bold uppercase tracking-wider text-wood-light hover:text-error transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
