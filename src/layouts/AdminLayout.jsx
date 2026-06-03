import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiPackage, FiLayers, FiShoppingCart, FiUsers,
  FiStar, FiSettings, FiLogOut, FiMenu, FiX, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
  { name: 'Products', path: '/admin/products', icon: FiPackage },
  { name: 'Categories', path: '/admin/categories', icon: FiLayers },
  { name: 'Orders', path: '/admin/orders', icon: FiShoppingCart },
  { name: 'Customers', path: '/admin/customers', icon: FiUsers },
  { name: 'Reviews', path: '/admin/reviews', icon: FiStar },
  { name: 'Settings', path: '/admin/settings', icon: FiSettings },
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

  return (
    <div className="min-h-screen bg-cream/50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-espresso text-white min-h-screen fixed left-0 top-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/admin/dashboard">
            <h2 className="font-heading text-xl">
              <span className="text-gold">CVR</span> Admin
            </h2>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold/20 text-gold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {link.name}
                {isActive && <FiChevronRight className="ml-auto" size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2 mb-3">
            <p className="text-xs text-white/50">Signed in as</p>
            <p className="text-sm text-white/90 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-white/70 hover:bg-error/20 hover:text-error transition-all"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-espresso/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 w-72 h-full bg-espresso text-white z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-heading text-xl">
                  <span className="text-gold">CVR</span> Admin
                </h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <FiX size={24} />
                </button>
              </div>
              <nav className="flex-1 py-6 px-3 space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gold/20 text-gold'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-white/70 hover:bg-error/20 hover:text-error transition-all"
                >
                  <FiLogOut size={18} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-30 glass-header px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <FiMenu size={24} className="text-espresso" />
          </button>
          <h2 className="font-heading text-lg text-espresso">
            <span className="text-gold">CVR</span> Admin
          </h2>
          <div className="w-10" />
        </div>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
