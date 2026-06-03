import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHeart, FiShoppingBag, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Categories', path: '/categories' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export const Header = ({ onSearchOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, setIsOpen: setCartOpen } = useCart();
  const { wishlistCount, setIsOpen: setWishlistOpen } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-header shadow-lg' 
            : location.pathname === '/' 
            ? 'bg-transparent border-b border-white/10' 
            : 'bg-cream/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className={`font-heading text-xl lg:text-2xl font-bold transition-colors ${
                isScrolled ? 'text-espresso' : location.pathname === '/' ? 'text-white' : 'text-espresso'
              }`}>
                <span className="text-gold">CVR</span> Handicrafts
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link text-sm uppercase tracking-wider transition-colors ${
                    isScrolled 
                      ? location.pathname === link.path ? 'active text-gold' : 'text-espresso'
                      : location.pathname === '/'
                      ? location.pathname === link.path ? 'active text-gold' : 'text-white'
                      : location.pathname === link.path ? 'active text-gold' : 'text-espresso'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Action Icons */}
            <div className={`flex items-center gap-3 lg:gap-4 transition-colors ${
              isScrolled ? 'text-espresso' : location.pathname === '/' ? 'text-white' : 'text-espresso'
            }`}>
              <button
                onClick={onSearchOpen}
                className="p-2 hover:text-gold transition-colors"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>

              <button
                onClick={() => setWishlistOpen(true)}
                className="p-2 hover:text-gold transition-colors relative"
                aria-label="Wishlist"
              >
                <FiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCartOpen(true)}
                className="p-2 hover:text-gold transition-colors relative"
                aria-label="Cart"
              >
                <FiShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/profile'}
                    className="p-2 hover:text-gold transition-colors"
                    aria-label="Profile"
                  >
                    <FiUser size={20} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:text-error transition-colors"
                    aria-label="Logout"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex btn-primary text-xs py-2 px-4"
                >
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-current"
                aria-label="Menu"
              >
                {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-espresso/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 w-80 h-full bg-cream z-50 lg:hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-heading text-xl font-bold text-espresso">
                    <span className="text-gold">CVR</span> Handicrafts
                  </h2>
                  <button onClick={() => setMobileOpen(false)}>
                    <FiX size={24} className="text-espresso" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-4 py-3 rounded text-sm uppercase tracking-wider font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'bg-gold/10 text-gold'
                          : 'text-espresso hover:bg-wood/5'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-wood/10">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        to={isAdmin ? '/admin/dashboard' : '/profile'}
                        className="px-4 py-3 text-sm uppercase tracking-wider font-medium text-espresso hover:bg-wood/5 rounded flex items-center gap-3"
                      >
                        <FiUser size={18} />
                        {isAdmin ? 'Admin Panel' : 'My Account'}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-3 text-sm uppercase tracking-wider font-medium text-error hover:bg-error/5 rounded flex items-center gap-3 text-left"
                      >
                        <FiLogOut size={18} />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link to="/login" className="btn-primary text-center">
                        <span>Sign In</span>
                      </Link>
                      <Link to="/register" className="btn-outline text-center">
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header spacer */}
      {location.pathname !== '/' && <div className="h-18 lg:h-20" />}
    </>
  );
};
