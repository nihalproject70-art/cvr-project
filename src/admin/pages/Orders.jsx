import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/utils/helpers';
import { FiEye, FiSearch, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const { logActivity } = useActivityLog();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Query last 100 orders
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      setOrders(prev =>
        prev.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord)
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }

      await logActivity('Update Order Status', `Updated order: ${orderId} status to ${newStatus}`);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update status');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    
    const customerName = order.shippingAddress?.fullName?.toLowerCase() || '';
    const orderId = order.orderId?.toLowerCase() || order.id?.toLowerCase() || '';
    const matchesSearch = searchQuery
      ? customerName.includes(searchQuery.toLowerCase()) || orderId.includes(searchQuery.toLowerCase())
      : true;

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 font-body">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Orders</h1>
        <p className="text-sm text-wood-light mt-1">Track and manage customer shipments.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-wood/5 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4 justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-wood/40" />
          <input
            type="text"
            placeholder="Search by Order ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-wood/10 rounded-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
              filterStatus === '' ? 'bg-espresso text-white' : 'bg-cream text-espresso border border-wood/10'
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                filterStatus === status ? 'bg-espresso text-white' : 'bg-cream text-espresso border border-wood/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner className="h-96" />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-wood/5 p-12 rounded-lg text-center shadow-sm">
          <p className="text-wood-light text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Table */}
          <div className="lg:col-span-2 bg-white border border-wood/5 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-wood/10 bg-cream/10 text-xs font-semibold text-wood-light uppercase">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood/5 text-sm">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-cream/10 transition-colors ${
                      selectedOrder && selectedOrder.id === order.id ? 'bg-gold/5' : ''
                    }`}>
                      <td className="p-4 font-semibold text-espresso">
                        {order.orderId || order.id.substring(0, 8)}
                      </td>
                      <td className="p-4 text-espresso">
                        {order.shippingAddress?.fullName || 'Guest'}
                      </td>
                      <td className="p-4 text-wood-light">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-4 text-espresso font-semibold">
                        {formatPrice(order.total)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === 'Delivered'
                            ? 'bg-success/15 text-success'
                            : order.status === 'Cancelled'
                            ? 'bg-error/15 text-error'
                            : 'bg-gold/15 text-gold'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-wood-light hover:text-gold transition-colors inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                        >
                          <FiEye size={16} /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Column (Right) */}
          <div className="bg-white border border-wood/5 rounded-xl p-6 shadow-sm h-fit space-y-6">
            {selectedOrder ? (
              <>
                <div className="border-b border-wood/5 pb-3 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-espresso">
                    Order Details
                  </h2>
                  <span className="text-xs text-wood-light font-semibold">
                    {selectedOrder.orderId || selectedOrder.id.substring(0, 8)}
                  </span>
                </div>

                {/* Status Update Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                    Update Order Status
                  </label>
                  <select
                    value={selectedOrder.status || 'Pending'}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full py-2 px-3 border border-wood/10 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Shipping Details */}
                <div className="space-y-2 border-b border-wood/5 pb-4">
                  <h3 className="font-heading font-semibold text-espresso flex items-center gap-2">
                    <FiInfo size={16} className="text-gold" /> Shipping Address
                  </h3>
                  <div className="text-xs text-wood-light space-y-1">
                    <p className="font-semibold text-espresso">{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}</p>
                    <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-heading font-semibold text-espresso">Items List</h3>
                  <div className="divide-y divide-wood/5 text-xs">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded border border-wood/10 flex-shrink-0"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-espresso truncate">{item.name}</p>
                            <p className="text-wood-light mt-0.5">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-espresso">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-wood/10 flex items-center justify-between text-sm font-bold text-espresso">
                    <span>Order Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FiInfo className="mx-auto text-wood/30 mb-2" size={32} />
                <p className="text-sm text-wood-light">Select an order from the list to view its full details and update its processing status.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
