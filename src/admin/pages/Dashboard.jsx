import { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy, getCountFromServer, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/utils/helpers';
import { 
  FiPackage, FiShoppingCart, FiDollarSign, FiUsers, 
  FiAlertTriangle, FiPlus, FiList, FiClock, FiCheckCircle, 
  FiTruck, FiCheckSquare, FiTrendingUp
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get basic counts
        const prodCountSnap = await getCountFromServer(collection(db, 'products'));
        const orderCountSnap = await getCountFromServer(collection(db, 'orders'));
        const custCountSnap = await getCountFromServer(collection(db, 'users'));

        // Query orders for stats (fetch last 200 to get a good spread of statuses and revenue)
        // In a real large app, this would use aggregation queries or a stats document.
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(200));
        const ordersSnap = await getDocs(ordersQuery);
        
        let computedRevenue = 0;
        let pendingCount = 0;
        let confirmedCount = 0;
        let shippedCount = 0;
        let deliveredCount = 0;
        const recentOrdList = [];

        ordersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'Cancelled') {
            computedRevenue += Number(data.total || 0);
          }
          
          if (data.status === 'Pending') pendingCount++;
          if (data.status === 'Confirmed') confirmedCount++;
          if (data.status === 'Shipped') shippedCount++;
          if (data.status === 'Delivered') deliveredCount++;
          
          if (recentOrdList.length < 5) {
            recentOrdList.push({ id: doc.id, ...data });
          }
        });

        setStats({
          products: prodCountSnap.data().count,
          orders: orderCountSnap.data().count,
          customers: custCountSnap.data().count,
          revenue: computedRevenue,
          pending: pendingCount,
          confirmed: confirmedCount,
          shipped: shippedCount,
          delivered: deliveredCount,
        });
        
        setRecentOrders(recentOrdList);

        // Latest Products
        const latestProdQ = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
        const latestProdSnap = await getDocs(latestProdQ);
        setLatestProducts(latestProdSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Low stock products (stock <= 5)
        const lowStockQ = query(collection(db, 'products'), where('stock', '<=', 5), limit(4));
        const lowStockSnap = await getDocs(lowStockQ);
        setLowStockProducts(lowStockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner className="h-96" />;

  const primaryStats = [
    { title: 'Total Revenue', value: formatPrice(stats.revenue), icon: FiDollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Total Orders', value: stats.orders, icon: FiShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Total Products', value: stats.products, icon: FiPackage, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { title: 'Customers', value: stats.customers, icon: FiUsers, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  const orderStats = [
    { title: 'Pending Orders', value: stats.pending, icon: FiClock, color: 'text-orange-500' },
    { title: 'Confirmed Orders', value: stats.confirmed, icon: FiCheckCircle, color: 'text-blue-500' },
    { title: 'Shipped Orders', value: stats.shipped, icon: FiTruck, color: 'text-indigo-500' },
    { title: 'Delivered Orders', value: stats.delivered, icon: FiCheckSquare, color: 'text-emerald-500' },
  ];

  // Dummy revenue data for the chart visualization
  const weeklyRevenueData = [
    { day: 'Mon', amount: 15000, height: '40%' },
    { day: 'Tue', amount: 22000, height: '60%' },
    { day: 'Wed', amount: 18000, height: '50%' },
    { day: 'Thu', amount: 35000, height: '100%' }, // Max
    { day: 'Fri', amount: 28000, height: '80%' },
    { day: 'Sat', amount: 32000, height: '90%' },
    { day: 'Sun', amount: 12000, height: '30%' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Dashboard Overview</h1>
          <p className="text-sm text-wood-light mt-1">Store performance and real-time activity.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Link to="/admin/add-product" className="flex items-center gap-2 px-4 py-2 bg-espresso text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-wood transition-colors whitespace-nowrap shadow-sm">
            <FiPlus size={16} /> Add Product
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-2 px-4 py-2 bg-white border border-wood/10 text-espresso rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-cream transition-colors whitespace-nowrap shadow-sm">
            <FiList size={16} /> View Orders
          </Link>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {primaryStats.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`bg-white border ${card.border} p-5 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-wider text-wood-light font-bold mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-espresso font-heading tracking-tight">{card.value}</p>
              </div>
              <div className={`p-3.5 rounded-xl ${card.bg} ${card.color} relative z-10 transition-transform group-hover:scale-110`}>
                <Icon size={24} />
              </div>
              {/* Decorative background shape */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${card.bg} opacity-50 z-0 transition-transform group-hover:scale-150`} />
            </div>
          );
        })}
      </div>

      {/* Order Status Breakdown & Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Stats */}
        <div className="lg:col-span-1 bg-white border border-wood/10 rounded-xl p-5 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-espresso mb-4 flex items-center gap-2">
            <FiShoppingCart className="text-gold" /> Order Pipeline
          </h2>
          <div className="space-y-4">
            {orderStats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-wood/5 bg-cream/30 hover:bg-cream/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white shadow-sm ${stat.color}`}>
                    <stat.icon size={16} />
                  </div>
                  <span className="text-sm font-semibold text-espresso">{stat.title}</span>
                </div>
                <span className="font-bold text-espresso text-lg">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart Visualization (CSS based) */}
        <div className="lg:col-span-2 bg-white border border-wood/10 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-espresso flex items-center gap-2">
                <FiTrendingUp className="text-emerald-500" /> Weekly Revenue Trend
              </h2>
              <p className="text-xs text-wood-light mt-0.5">Sample visualization of the last 7 days</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-wood-light">This Week</p>
              <p className="font-bold text-emerald-600 text-lg">₹1,62,000</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 mt-auto pt-6 border-b border-wood/5 pb-2 px-2 sm:px-6">
            {weeklyRevenueData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                {/* Tooltip (visible on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-espresso text-white text-[10px] py-1 px-2 rounded absolute -mt-8 whitespace-nowrap z-10 pointer-events-none">
                  {formatPrice(data.amount)}
                </div>
                {/* Bar */}
                <div className="w-full bg-cream/50 rounded-t-sm relative h-32 flex items-end">
                  <div 
                    className="w-full bg-gradient-to-t from-gold/80 to-gold rounded-t-sm transition-all duration-700 ease-out group-hover:from-gold group-hover:to-gold-hover shadow-[0_0_10px_rgba(201,162,39,0.2)]" 
                    style={{ height: data.height }}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-wood-light">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders, Latest Products, Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-wood/10 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-bold text-espresso">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-gold hover:text-gold-hover uppercase tracking-wider flex items-center gap-1">
              View All <FiChevronRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-wood-light py-8 text-center bg-cream/30 rounded-lg">No orders placed recently.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-wood/10 text-[10px] font-bold text-wood-light uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood/5 text-sm">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-cream/30 transition-colors group">
                      <td className="py-3 font-semibold text-espresso">{order.orderId || order.id.substring(0, 8)}</td>
                      <td className="py-3 text-wood-light">{order.shippingAddress?.fullName || 'Guest'}</td>
                      <td className="py-3 font-semibold text-espresso">{formatPrice(order.total)}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'Cancelled' ? 'bg-red-100 text-red-700'
                          : order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700'
                          : order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
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

        {/* Right Column Stack */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl border border-wood/10 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-espresso flex items-center gap-2">
                <FiAlertTriangle className="text-red-500" /> Low Stock Alerts
              </h2>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-wood-light py-4 text-center bg-cream/30 rounded-lg">Inventory is healthy.</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((prod) => (
                  <div key={prod.id} className="flex items-center gap-3 p-2 rounded-lg border border-red-100 bg-red-50/50">
                    <img src={prod.mainImage} alt={prod.name} className="w-10 h-10 object-cover rounded border border-wood/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-espresso truncate">{prod.name}</p>
                      <p className="text-xs text-red-600 font-bold mt-0.5">{prod.stock} items left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Products */}
          <div className="bg-white rounded-xl border border-wood/10 p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-espresso flex items-center gap-2">
                <FiPackage className="text-gold" /> Latest Additions
              </h2>
            </div>
            {latestProducts.length === 0 ? (
              <p className="text-xs text-wood-light py-4 text-center bg-cream/30 rounded-lg">No products added yet.</p>
            ) : (
              <div className="space-y-3">
                {latestProducts.map((prod) => (
                  <div key={prod.id} className="flex items-center gap-3 group">
                    <img src={prod.mainImage} alt={prod.name} className="w-10 h-10 object-cover rounded border border-wood/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-espresso truncate group-hover:text-gold transition-colors">{prod.name}</p>
                      <p className="text-xs text-wood-light truncate">{formatPrice(prod.salePrice || prod.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
