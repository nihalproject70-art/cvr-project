import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiPackage, FiLayers, FiShoppingCart, FiUsers,
  FiStar, FiSettings, FiLogOut, FiMenu, FiX, FiChevronRight,
  FiImage, FiLayout, FiCreditCard, FiPieChart, FiBell, FiSearch
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const sidebarSections = [
  {
    title: 'Main',
    links: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
      { name: 'Products', path: '/admin/products', icon: FiPackage },
      { name: 'Categories', path: '/admin/categories', icon: FiLayers },
      { name: 'Orders', path: '/admin/orders', icon: FiShoppingCart },
      { name: 'Customers', path: '/admin/customers', icon: FiUsers },
      { name: 'Reviews', path: '/admin/reviews', icon: FiStar },
    ]
  },
  {
    title: 'Content & Storefront',
    links: [
      { name: 'Homepage', path: '/admin/homepage', icon: FiLayout },
      { name: 'Banners', path: '/admin/banners', icon: FiImage },
      { name: 'Payments & QR', path: '/admin/payments', icon: FiCreditCard },
    ]
  },
  {
    title: 'System & Reports',
    links: [
      { name: 'Reports', path: '/admin/reports', icon: FiPieChart },
      { name: 'Notifications', path: '/admin/notifications', icon: FiBell },
      { name: 'Settings', path: '/admin/settings', icon: FiSettings },
    ]
  }
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-white/10 flex items-center justify-between lg:block">
        <Link to="/admin/dashboard" className="block" onClick={() => setSidebarOpen(false)}>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
            <span className="text-gold">CVR</span> Admin
          </h2>
        </Link>
        <button className="lg:hidden p-2 text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
          <FiX size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {sidebarSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gold/20 text-gold shadow-sm'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-gold' : 'text-white/50'} />
                    {link.name}
                    {isActive && <FiChevronRight className="ml-auto text-gold" size={14} />}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="px-3 py-2 mb-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold text-espresso flex items-center justify-center font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Logged in as</p>
            <p className="text-xs text-white/90 truncate font-medium">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-lg text-sm font-semibold text-white/60 hover:bg-error/20 hover:text-error transition-all uppercase tracking-wider"
        >
          <FiLogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream/50 flex font-body">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1a1412] text-white min-h-screen fixed left-0 top-0 border-r border-wood/10 shadow-2xl z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-espresso/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 w-[280px] h-full bg-[#1a1412] text-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-wood/10 shadow-sm">
          <div className="px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 -ml-2 text-espresso hover:bg-cream rounded-lg transition-colors"
              >
                <FiMenu size={24} />
              </button>
              
              {/* Optional Search Bar in Header */}
              <div className="hidden sm:flex items-center relative w-64">
                <FiSearch className="absolute left-3 text-wood/40" size={16} />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-cream/50 border border-wood/10 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to="/admin/notifications" 
                className="relative p-2 text-wood hover:text-gold transition-colors rounded-full hover:bg-cream"
                title="Notifications"
              >
                <FiBell size={20} />
                {/* Example Badge - this would be dynamic in Phase 7 */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
              </Link>
              
              <div className="hidden sm:block h-6 w-px bg-wood/10 mx-1"></div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-espresso uppercase tracking-wider">Administrator</p>
                  <p className="text-[10px] text-wood-light">Store Management</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold font-heading">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
