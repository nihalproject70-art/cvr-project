import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import { FiSearch, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
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

  const filteredCustomers = customers.filter(customer => {
    const name = customer.displayName?.toLowerCase() || '';
    const email = customer.email?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 font-body">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Customers</h1>
        <p className="text-sm text-wood-light mt-1">View registered customers and engagement.</p>
      </div>

      <div className="bg-white border border-wood/5 p-4 rounded-lg flex items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-wood/40" />
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-wood/10 rounded-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="h-96" />
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white border border-wood/5 p-12 rounded-lg text-center shadow-sm">
          <p className="text-wood-light text-sm">No customers found.</p>
        </div>
      ) : (
        <div className="bg-white border border-wood/5 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-wood/10 bg-cream/10 text-xs font-semibold text-wood-light uppercase">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Registered On</th>
                  <th className="p-4 text-right">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood/5 text-sm">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-cream/10 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cream border border-wood/10 flex items-center justify-center text-espresso flex-shrink-0 font-bold">
                        {cust.displayName ? cust.displayName.charAt(0).toUpperCase() : <FiUser />}
                      </div>
                      <div className="font-semibold text-espresso">
                        {cust.displayName || 'Guest User'}
                      </div>
                    </td>
                    <td className="p-4 text-wood-light">{cust.email}</td>
                    <td className="p-4 text-wood-light">
                      {formatDate(cust.createdAt)}
                    </td>
                    <td className="p-4 text-right text-wood-light">
                      {formatDate(cust.lastLogin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
