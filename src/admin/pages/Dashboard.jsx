import { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy, getCountFromServer, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/utils/helpers';
import { FiPackage, FiShoppingCart, FiDollarSign, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get counts efficiently
        const prodCountSnap = await getCountFromServer(collection(db, 'products'));
        const orderCountSnap = await getCountFromServer(collection(db, 'orders'));
        const custCountSnap = await getCountFromServer(collection(db, 'users'));

        // Compute revenue (aggregate orders)
        // Note: For large scale, we should maintain a single settings/stats document.
        // For CVR, we fetch the last 100 orders or sum up from metadata.
        const ordersQuery = query(collection(db, 'orders'), limit(100));
        const ordersSnap = await getDocs(ordersQuery);
        let computedRevenue = 0;
        ordersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'Cancelled') {
            computedRevenue += Number(data.total || 0);
          }
        });

        setStats({
          products: prodCountSnap.data().count,
          orders: orderCountSnap.data().count,
          customers: custCountSnap.data().count,
          revenue: computedRevenue,
        });

        // Recent Orders
        const recentOrdersQ = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentOrdersSnap = await getDocs(recentOrdersQ);
        setRecentOrders(
          recentOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        );

        // Low stock products (stock <= 5)
        const lowStockQ = query(
          collection(db, 'products'),
          where('stock', '<=', 5),
          limit(5)
        );
        const lowStockSnap = await getDocs(lowStockQ);
        setLowStockProducts(
          lowStockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        );

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner className="h-96" />;

  const statCards = [
    { title: 'Total Products', value: stats.products, icon: FiPackage, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { title: 'Total Orders', value: stats.orders, icon: FiShoppingCart, color: 'text-green-600 bg-green-50 border-green-100' },
    { title: 'Customers', value: stats.customers, icon: FiUsers, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { title: 'Total Revenue', value: formatPrice(stats.revenue), icon: FiDollarSign, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="space-y-8 font-body">
      <div>
        <h1 className="font-heading text-3xl font-bold text-espresso">Dashboard Overview</h1>
        <p className="text-sm text-wood-light mt-1">Real-time store metrics and recent activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-wood/5 p-6 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-wood-light font-semibold">{card.title}</p>
                <p className="text-2xl font-bold text-espresso mt-2 font-heading">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg border ${card.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-wood/5 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-espresso">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-gold hover:underline uppercase tracking-wider">
              View All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-wood-light py-4 text-center">No orders placed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-wood/10 text-xs font-semibold text-wood-light uppercase">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood/5 text-sm">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-cream/20 transition-colors">
                      <td className="py-3 font-semibold text-espresso">{order.orderId || order.id.substring(0, 8)}</td>
                      <td className="py-3 text-wood-light">{order.shippingAddress?.fullName || 'Guest'}</td>
                      <td className="py-3 text-espresso">{formatPrice(order.total)}</td>
                      <td className="py-3 text-right">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-wood/5 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-espresso flex items-center gap-2">
              <FiAlertTriangle className="text-amber-500" /> Low Stock Alerts
            </h2>
            <Link to="/admin/products" className="text-xs font-semibold text-gold hover:underline uppercase tracking-wider">
              Manage Products
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-wood-light py-4 text-center">All products are well stocked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-wood/10 text-xs font-semibold text-wood-light uppercase">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood/5 text-sm">
                  {lowStockProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-cream/20 transition-colors">
                      <td className="py-3 font-medium text-espresso flex items-center gap-3">
                        <img
                          src={prod.mainImage}
                          alt={prod.name}
                          className="w-8 h-8 object-cover rounded border border-wood/10"
                        />
                        <span className="truncate max-w-[150px]">{prod.name}</span>
                      </td>
                      <td className="py-3 text-wood-light">{prod.sku || 'N/A'}</td>
                      <td className="py-3 text-right font-semibold text-error">{prod.stock} left</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
