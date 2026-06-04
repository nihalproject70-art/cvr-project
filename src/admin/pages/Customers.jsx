import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/utils/helpers';
import { FiSearch, FiUser, FiDownload, FiMapPin, FiPhone, FiShoppingBag, FiMail, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(150));
        const snap = await getDocs(q);
        setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching customers:', err);
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const fetchCustomerDetails = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    try {
      // Fetch orders for this customer based on email or user ID
      // If we don't have a direct userId map, we search by email
      const q = query(collection(db, 'orders'), where('customerEmail', '==', customer.email));
      const snap = await getDocs(q);
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomerOrders(orders);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      toast.error('Failed to load customer history');
    } finally {
      setLoadingOrders(false);
    }
  };

  const exportToCSV = () => {
    if (customers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Registered On', 'Last Login'];
    const csvContent = [
      headers.join(','),
      ...customers.map(c => [
        `"${c.displayName || 'Guest User'}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${formatDate(c.createdAt) || ''}"`,
        `"${formatDate(c.lastLogin) || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export downloaded successfully');
  };

  const filteredCustomers = customers.filter(customer => {
    const name = customer.displayName?.toLowerCase() || '';
    const email = customer.email?.toLowerCase() || '';
    const phone = customer.phone?.toLowerCase() || '';
    const searchLower = searchQuery.toLowerCase();
    
    return name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
  });

  const totalSpend = customerOrders.reduce((sum, ord) => sum + (ord.status !== 'Cancelled' ? Number(ord.total || 0) : 0), 0);

  return (
    <div className="space-y-6 font-body pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Customers</h1>
          <p className="text-sm text-wood-light mt-1">View registered customers, engagement, and history.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-outline flex items-center justify-center gap-2 py-2.5 px-4 text-xs"
        >
          <FiDownload size={16} />
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-wood/5 p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-wood/40" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-wood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="h-96" />
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white border border-wood/5 p-16 rounded-xl text-center shadow-sm">
          <p className="text-wood-light text-sm font-medium">No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Customers Table */}
          <div className="xl:col-span-2 bg-white border border-wood/10 rounded-xl overflow-hidden shadow-sm flex flex-col h-fit">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-wood/10 bg-cream/30 text-xs font-bold text-wood-light uppercase tracking-wider">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Registered On</th>
                    <th className="p-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood/5 text-sm">
                  {filteredCustomers.map((cust) => (
                    <tr 
                      key={cust.id} 
                      onClick={() => fetchCustomerDetails(cust)}
                      className={`hover:bg-cream/30 transition-colors cursor-pointer ${
                        selectedCustomer && selectedCustomer.id === cust.id ? 'bg-gold/5 border-l-4 border-l-gold' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cream border border-wood/10 flex items-center justify-center text-espresso flex-shrink-0 font-bold">
                          {cust.displayName ? cust.displayName.charAt(0).toUpperCase() : <FiUser />}
                        </div>
                        <div>
                          <div className="font-semibold text-espresso">
                            {cust.displayName || 'Guest User'}
                          </div>
                          <div className="text-[10px] text-wood-light mt-0.5">ID: {cust.id.substring(0,8)}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-espresso font-medium">{cust.email}</div>
                        {cust.phone && <div className="text-xs text-wood-light mt-1">{cust.phone}</div>}
                      </td>
                      <td className="p-4 text-wood-light">
                        {formatDate(cust.createdAt)}
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

          {/* Customer Details Sidebar */}
          <div className="xl:col-span-1">
            {selectedCustomer ? (
              <div className="bg-white border border-wood/10 rounded-xl p-5 shadow-sm sticky top-24 space-y-6">
                
                {/* Header */}
                <div className="border-b border-wood/5 pb-4 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-cream border-2 border-gold/20 flex items-center justify-center text-gold text-3xl font-bold mb-3 shadow-sm">
                    {selectedCustomer.displayName ? selectedCustomer.displayName.charAt(0).toUpperCase() : <FiUser size={32} />}
                  </div>
                  <h2 className="font-heading text-xl font-bold text-espresso">
                    {selectedCustomer.displayName || 'Guest User'}
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-widest text-wood-light mt-1">
                    Customer Since {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 bg-cream/30 p-4 rounded-lg border border-wood/5">
                  <div className="flex items-center gap-3 text-sm">
                    <FiMail className="text-gold shrink-0" size={16} />
                    <span className="text-espresso font-medium break-all">{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <FiPhone className="text-gold shrink-0" size={16} />
                      <span className="text-espresso font-medium">{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                    <div className="flex items-start gap-3 text-sm">
                      <FiMapPin className="text-gold shrink-0 mt-0.5" size={16} />
                      <span className="text-espresso text-xs leading-relaxed">
                        {selectedCustomer.addresses[0].addressLine1}<br/>
                        {selectedCustomer.addresses[0].city}, {selectedCustomer.addresses[0].state} - {selectedCustomer.addresses[0].postalCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Lifetime Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-wood/10 rounded-lg p-3 text-center bg-white shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-wood-light mb-1">Total Orders</p>
                    <p className="text-2xl font-heading font-bold text-espresso">{customerOrders.length}</p>
                  </div>
                  <div className="border border-wood/10 rounded-lg p-3 text-center bg-white shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-wood-light mb-1">Total Spend</p>
                    <p className="text-lg font-heading font-bold text-gold mt-1 truncate">{formatPrice(totalSpend)}</p>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="pt-2 border-t border-wood/5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-wood-light mb-3 flex items-center gap-1.5">
                    <FiShoppingBag size={12} className="text-gold" /> Order History
                  </h3>
                  
                  {loadingOrders ? (
                    <div className="flex justify-center py-4"><LoadingSpinner className="h-8" /></div>
                  ) : customerOrders.length === 0 ? (
                    <p className="text-xs text-wood-light text-center py-4 bg-cream/20 rounded-lg border border-wood/5">No orders found for this customer.</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {customerOrders.sort((a, b) => b.createdAt - a.createdAt).map(order => (
                        <div key={order.id} className="bg-white border border-wood/10 p-3 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-espresso">{order.orderId || order.id.substring(0,8)}</span>
                            <span className="text-[10px] font-bold text-wood-light">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-gold/15 text-gold'
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-sm font-bold text-espresso">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white border border-wood/10 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center shadow-sm">
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-gold mb-4">
                  <FiUser size={24} />
                </div>
                <h3 className="font-heading font-bold text-espresso text-lg">No Customer Selected</h3>
                <p className="text-sm text-wood-light mt-2 max-w-[250px]">Select a customer from the list to view their complete profile and order history.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
