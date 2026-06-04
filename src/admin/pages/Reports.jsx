import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/utils/helpers';
import { FiDownload, FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('sales');
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all necessary data for reports
        // In a real massive prod app, you'd use Cloud Functions or pagination, but for our scale, fetching all is fine for reports.
        const [ordersSnap, productsSnap, customersSnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'products'))),
          getDocs(query(collection(db, 'users')))
        ]);

        setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setCustomers(customersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (err) {
        console.error('Error fetching report data:', err);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
  };

  const handleExportSales = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Payment Method', 'Items', 'Total'];
    const rows = orders.map(o => [
      o.orderId || o.id,
      formatDate(o.createdAt),
      o.shippingAddress?.fullName || 'Guest',
      o.status,
      o.paymentMethod || 'Online',
      o.items?.length || 0,
      o.total || 0
    ]);
    exportCSV('Sales_Report', headers, rows);
  };

  const handleExportInventory = () => {
    const headers = ['Product Code', 'Name', 'Category', 'Price', 'Stock', 'Status'];
    const rows = products.map(p => [
      p.productCode || 'N/A',
      p.name,
      p.category,
      p.salePrice || p.price,
      p.stock,
      p.active !== false ? 'Active' : 'Inactive'
    ]);
    exportCSV('Inventory_Report', headers, rows);
  };

  const handleExportCustomers = () => {
    const headers = ['Name', 'Email', 'Phone', 'Registered On'];
    const rows = customers.map(c => [
      c.displayName || 'Guest',
      c.email,
      c.phone || 'N/A',
      formatDate(c.createdAt)
    ]);
    exportCSV('Customers_Report', headers, rows);
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  // Computed metrics for Sales Report
  const successfulOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Shipped' || o.status === 'Confirmed' || o.status === 'Processing');
  const totalRevenue = successfulOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgOrderValue = successfulOrders.length > 0 ? totalRevenue / successfulOrders.length : 0;

  // Computed metrics for Inventory Report
  const lowStockProducts = products.filter(p => Number(p.stock) <= 5);
  const outOfStockProducts = products.filter(p => Number(p.stock) === 0);
  
  return (
    <div className="space-y-6 font-body pb-12">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Reports & Analytics</h1>
        <p className="text-sm text-wood-light mt-1">Export store data and view high-level analytics.</p>
      </div>

      <div className="flex border-b border-wood/10 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setReportType('sales')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            reportType === 'sales' ? 'border-gold text-espresso' : 'border-transparent text-wood-light hover:text-espresso'
          }`}
        >
          Sales & Revenue
        </button>
        <button
          onClick={() => setReportType('inventory')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            reportType === 'inventory' ? 'border-gold text-espresso' : 'border-transparent text-wood-light hover:text-espresso'
          }`}
        >
          Inventory & Products
        </button>
        <button
          onClick={() => setReportType('customers')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
            reportType === 'customers' ? 'border-gold text-espresso' : 'border-transparent text-wood-light hover:text-espresso'
          }`}
        >
          Customers
        </button>
      </div>

      <div className="bg-white border border-wood/10 rounded-xl p-6 shadow-sm">
        
        {reportType === 'sales' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-wood/5 pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-espresso">Sales Overview</h2>
                <p className="text-xs text-wood-light mt-1">Lifetime revenue and order statistics.</p>
              </div>
              <button onClick={handleExportSales} className="btn-outline flex items-center gap-2 py-2 px-4 text-xs">
                <FiDownload size={14} /> Export CSV
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-cream/30 p-4 rounded-xl border border-wood/5">
                <div className="flex items-center gap-2 text-gold mb-2">
                  <FiDollarSign size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                </div>
                <div className="font-heading text-2xl font-bold text-espresso">{formatPrice(totalRevenue)}</div>
              </div>
              
              <div className="bg-cream/30 p-4 rounded-xl border border-wood/5">
                <div className="flex items-center gap-2 text-gold mb-2">
                  <FiShoppingBag size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Successful Orders</span>
                </div>
                <div className="font-heading text-2xl font-bold text-espresso">{successfulOrders.length}</div>
              </div>
              
              <div className="bg-cream/30 p-4 rounded-xl border border-wood/5">
                <div className="flex items-center gap-2 text-gold mb-2">
                  <FiTrendingUp size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value</span>
                </div>
                <div className="font-heading text-2xl font-bold text-espresso">{formatPrice(avgOrderValue)}</div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-wood/5 pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-espresso">Inventory Health</h2>
                <p className="text-xs text-wood-light mt-1">Stock levels and product distribution.</p>
              </div>
              <button onClick={handleExportInventory} className="btn-outline flex items-center gap-2 py-2 px-4 text-xs">
                <FiDownload size={14} /> Export CSV
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-cream/30 p-4 rounded-xl border border-wood/5">
                <div className="text-wood-light mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
                </div>
                <div className="font-heading text-2xl font-bold text-espresso">{products.length}</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="text-red-700 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Low Stock (≤5)</span>
                </div>
                <div className="font-heading text-2xl font-bold text-red-900">{lowStockProducts.length}</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="text-orange-700 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                </div>
                <div className="font-heading text-2xl font-bold text-orange-900">{outOfStockProducts.length}</div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'customers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-wood/5 pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-espresso">Customer Demographics</h2>
                <p className="text-xs text-wood-light mt-1">Registered users and engagement.</p>
              </div>
              <button onClick={handleExportCustomers} className="btn-outline flex items-center gap-2 py-2 px-4 text-xs">
                <FiDownload size={14} /> Export CSV
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-cream/30 p-4 rounded-xl border border-wood/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gold mb-2">
                    <FiUsers size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Registered Customers</span>
                  </div>
                  <div className="font-heading text-2xl font-bold text-espresso">{customers.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
