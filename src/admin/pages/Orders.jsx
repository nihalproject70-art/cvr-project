import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, arrayUnion } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useActivityLog } from '../hooks/useActivityLog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/utils/helpers';
import { 
  FiEye, FiSearch, FiPrinter, FiMessageCircle, FiMail, 
  FiFileText, FiClock, FiCreditCard, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  
  const { logActivity } = useActivityLog();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(150));
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
      const timelineEntry = {
        status: newStatus,
        date: new Date().toISOString(),
        note: `Status updated to ${newStatus}`
      };

      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date(),
        timeline: arrayUnion(timelineEntry)
      });
      
      setOrders(prev =>
        prev.map(ord => ord.id === orderId ? { 
          ...ord, 
          status: newStatus,
          timeline: [...(ord.timeline || []), timelineEntry] 
        } : ord)
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ 
          ...prev, 
          status: newStatus,
          timeline: [...(prev.timeline || []), timelineEntry]
        }));
      }

      await logActivity('Update Order Status', `Updated order: ${orderId} status to ${newStatus}`);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update status');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedOrder) return;
    setSavingNote(true);
    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        adminNotes: adminNote
      });
      
      setOrders(prev =>
        prev.map(ord => ord.id === selectedOrder.id ? { ...ord, adminNotes: adminNote } : ord)
      );
      setSelectedOrder(prev => ({ ...prev, adminNotes: adminNote }));
      
      toast.success('Admin note saved');
    } catch (err) {
      console.error('Error saving note:', err);
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      setAdminNote(selectedOrder.adminNotes || '');
    }
  }, [selectedOrder]);

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Invoice - ${order.orderId || order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .store-name { font-size: 24px; font-weight: bold; color: #c9a227; }
            .invoice-title { font-size: 20px; font-weight: bold; text-transform: uppercase; color: #666; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .section-title { font-weight: bold; margin-bottom: 5px; color: #555; text-transform: uppercase; font-size: 12px; }
            table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border-bottom: 1px solid #eee; padding: 12px 8px; text-align: left; }
            th { text-transform: uppercase; font-size: 12px; color: #666; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; font-size: 16px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="store-name">CVR Handicrafts</div>
              <div>Luxury Brass Idols & Artifacts</div>
            </div>
            <div class="text-right">
              <div class="invoice-title">INVOICE</div>
              <div>Order ID: ${order.orderId || order.id}</div>
              <div>Date: ${new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="details">
            <div>
              <div class="section-title">Billed To</div>
              <div><strong>${order.shippingAddress?.fullName || 'Guest'}</strong></div>
              <div>${order.shippingAddress?.addressLine1}</div>
              ${order.shippingAddress?.addressLine2 ? `<div>${order.shippingAddress.addressLine2}</div>` : ''}
              <div>${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.postalCode}</div>
              <div>Phone: ${order.shippingAddress?.phone}</div>
            </div>
            <div class="text-right">
              <div class="section-title">Payment Info</div>
              <div>Method: <strong>${order.paymentMethod || 'Online'}</strong></div>
              <div>Status: <strong>${order.paymentStatus || 'Completed'}</strong></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td class="text-right">${formatPrice(item.price)}</td>
                  <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" class="text-right">Grand Total</td>
                <td class="text-right">${formatPrice(order.total)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Thank you for shopping with CVR Handicrafts.<br/>
            For support, contact us at support@cvrhandicrafts.com
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Use timeout to allow styles/images to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleWhatsAppUpdate = (order) => {
    const phone = order.shippingAddress?.phone;
    if (!phone) {
      toast.error('No phone number available for this customer');
      return;
    }
    // Clean phone number (assume Indian numbers, prepend +91 if missing)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    
    const message = `Hello ${order.shippingAddress?.fullName},\n\nUpdate on your CVR Handicrafts order (${order.orderId || order.id.substring(0,8)}).\n\nYour order status is now: *${order.status}*.\n\nThank you for shopping with us!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmailUpdate = (order) => {
    const email = order.customerEmail || ''; // Might not be stored in all orders, fallback gracefully
    if (!email) {
      toast.error('No email address available for this order');
      return;
    }
    const subject = `Order Update: ${order.orderId || order.id.substring(0,8)} - CVR Handicrafts`;
    const body = `Hello ${order.shippingAddress?.fullName},\n\nWe wanted to update you on your recent order with CVR Handicrafts.\n\nOrder ID: ${order.orderId || order.id.substring(0,8)}\nCurrent Status: ${order.status}\n\nThank you for your business.\n\nRegards,\nCVR Handicrafts Team`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    const customerName = order.shippingAddress?.fullName?.toLowerCase() || '';
    const orderId = order.orderId?.toLowerCase() || order.id?.toLowerCase() || '';
    const phone = order.shippingAddress?.phone || '';
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery
      ? customerName.includes(searchLower) || orderId.includes(searchLower) || phone.includes(searchLower)
      : true;

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 font-body pb-12">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Order Management</h1>
        <p className="text-sm text-wood-light mt-1">Process shipments, print invoices, and update customers.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-wood/5 p-4 rounded-xl flex flex-col lg:flex-row items-center gap-4 justify-between shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-wood/40" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm"
          />
        </div>

        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              filterStatus === '' ? 'bg-espresso text-white' : 'bg-cream text-espresso hover:bg-wood/10'
            }`}
          >
            All Orders
          </button>
          {ORDER_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                filterStatus === status ? 'bg-gold text-white' : 'bg-cream text-espresso hover:bg-wood/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <LoadingSpinner className="h-96" />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-wood/5 p-16 rounded-xl text-center shadow-sm">
          <p className="text-wood-light text-sm font-medium">No orders found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Order List Table */}
          <div className="xl:col-span-2 bg-white border border-wood/10 rounded-xl overflow-hidden shadow-sm flex flex-col h-fit">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-wood/10 bg-cream/30 text-xs font-bold text-wood-light uppercase tracking-wider">
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood/5 text-sm">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className={`hover:bg-cream/30 transition-colors cursor-pointer ${
                        selectedOrder && selectedOrder.id === order.id ? 'bg-gold/5 border-l-4 border-l-gold' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-espresso">{order.orderId || order.id.substring(0, 8)}</div>
                        <div className="text-[11px] text-wood-light mt-1 font-medium">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-espresso">{order.shippingAddress?.fullName || 'Guest'}</div>
                        <div className="text-[11px] text-wood-light mt-1">{order.shippingAddress?.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-espresso">{order.paymentMethod || 'Online'}</div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
                          order.paymentStatus === 'Completed' || order.paymentStatus === 'Success' ? 'text-emerald-600' 
                          : order.paymentStatus === 'Failed' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {order.paymentStatus || 'Paid'}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-espresso">
                        {formatPrice(order.total)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'Cancelled' ? 'bg-red-100 text-red-700'
                          : order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700'
                          : order.status === 'Processing' ? 'bg-purple-100 text-purple-700'
                          : order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <FiEye size={18} className="text-wood-light group-hover:text-gold inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Detail Sidebar (Right) */}
          <div className="xl:col-span-1">
            {selectedOrder ? (
              <div className="bg-white border border-wood/10 rounded-xl p-5 shadow-sm sticky top-24 space-y-6">
                
                {/* Detail Header & Actions */}
                <div className="border-b border-wood/5 pb-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-espresso">Order Details</h2>
                      <p className="text-xs font-bold text-gold uppercase tracking-widest mt-1">
                        {selectedOrder.orderId || selectedOrder.id.substring(0, 8)}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrintInvoice(selectedOrder)}
                      className="p-2 bg-cream text-espresso rounded-lg hover:bg-wood hover:text-white transition-colors"
                      title="Print Invoice"
                    >
                      <FiPrinter size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleWhatsAppUpdate(selectedOrder)}
                      className="flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                    >
                      <FiMessageCircle size={14} /> WhatsApp
                    </button>
                    <button 
                      onClick={() => handleEmailUpdate(selectedOrder)}
                      className="flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors"
                    >
                      <FiMail size={14} /> Email
                    </button>
                  </div>
                </div>

                {/* Workflow Status Updater */}
                <div className="bg-cream/30 p-4 rounded-lg border border-wood/5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-espresso mb-2">
                    Current Workflow Status
                  </label>
                  <select
                    value={selectedOrder.status || 'Pending'}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full py-2.5 px-3 border border-wood/10 rounded-lg bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent cursor-pointer shadow-sm"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Shipping & Payment Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                  <div className="border border-wood/10 rounded-lg p-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-wood-light mb-2 flex items-center gap-1.5">
                      <FiCheckCircle size={12} className="text-gold" /> Shipping Address
                    </h3>
                    <p className="text-sm font-semibold text-espresso">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="text-xs text-wood mt-1 leading-relaxed">
                      {selectedOrder.shippingAddress?.addressLine1}<br/>
                      {selectedOrder.shippingAddress?.addressLine2 && <>{selectedOrder.shippingAddress.addressLine2}<br/></>}
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                    </p>
                    <p className="text-xs font-semibold text-espresso mt-2 pt-2 border-t border-wood/5">
                      Ph: {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>

                  <div className="border border-wood/10 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-wood-light mb-2 flex items-center gap-1.5">
                        <FiCreditCard size={12} className="text-gold" /> Payment Info
                      </h3>
                      <p className="text-sm font-semibold text-espresso">{selectedOrder.paymentMethod || 'Online Payment'}</p>
                      <p className="text-xs text-wood mt-1">Trans ID: {selectedOrder.paymentId || 'N/A'}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-wood/5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-wood-light uppercase tracking-wider">Status:</span>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{selectedOrder.paymentStatus || 'Completed'}</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-wood-light mb-3 flex items-center gap-1.5">
                    <FiFileText size={12} className="text-gold" /> Ordered Items ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-cream/20 p-2 rounded-lg border border-wood/5">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded bg-white" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-espresso truncate">{item.name}</p>
                          <p className="text-[10px] text-wood-light uppercase tracking-wider mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-espresso">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-wood/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-espresso">Order Total</span>
                    <span className="text-lg font-heading font-bold text-gold">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="pt-4 border-t border-wood/5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-wood-light mb-2">Admin Internal Notes</h3>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add private notes for staff here..."
                    className="w-full p-3 border border-wood/10 rounded-lg text-sm bg-cream/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold resize-none h-24"
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="px-4 py-1.5 bg-espresso text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-wood transition-colors disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </div>

                {/* Order Timeline */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div className="pt-4 border-t border-wood/5">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-wood-light mb-3 flex items-center gap-1.5">
                      <FiClock size={12} className="text-gold" /> Order History
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-wood/10 before:to-transparent">
                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-gold text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-gold/20 z-10">
                            <FiCheckCircle size={12} />
                          </div>
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-cream/30 p-2.5 rounded border border-wood/5">
                            <p className="text-xs font-bold text-espresso">{event.status}</p>
                            <p className="text-[10px] text-wood-light mt-0.5">{new Date(event.date).toLocaleString()}</p>
                          </div>
                        </div>
                      )).reverse()}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-wood/10 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center shadow-sm">
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-gold mb-4">
                  <FiEye size={24} />
                </div>
                <h3 className="font-heading font-bold text-espresso text-lg">No Order Selected</h3>
                <p className="text-sm text-wood-light mt-2 max-w-[250px]">Select an order from the list to view its complete details, print invoice, and update status.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
