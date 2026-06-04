import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Categories', path: '/categories' },
  { name: 'Shop', path: '/shop' },
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
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

  // Utility styles for desktop-only items since we removed Tailwind from this component
  // We can just use standard media queries or rely on the fact that these are small tweaks.
  // We'll use inline styles with simple logic or rely on the CSS classes if they exist.
  // For now, let's keep them visible. The custom CSS handles most of it.

  return (
    <>
      <header className={`header-wrapper ${isScrolled ? 'sticky' : ''}`} id="mainHeader">
        <div className="container header-container">
          {/* Brand Logo */}
          <div className="logo">
            <Link to="/" aria-label="CVR Handicrafts Logo">
              <span className="logo-main">CVR</span>
              <span className="logo-sub">Handicrafts</span>
            </Link>
          </div>

          {/* Main Navigation Links (Desktop) */}
          <nav className="nav-menu" role="navigation" aria-label="Desktop Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions Panel (Search, Cart, Menu) */}
          <div className="header-actions">
            {/* Search Button Toggle */}
            <button className="action-icon-btn" onClick={onSearchOpen} aria-label="Open Search">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
            
            {/* Wishlist Button Toggle (From original react app) */}
            <button className="action-icon-btn" onClick={() => setWishlistOpen(true)} aria-label="Open Wishlist">
              <i className="fa-regular fa-heart"></i>
              {wishlistCount > 0 && (
                <span className="cart-count-badge" style={{ backgroundColor: 'var(--color-error)' }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Toggle */}
            <button className="action-icon-btn" onClick={() => setCartOpen(true)} aria-label="Open Shopping Cart">
              <i className="fa-solid fa-bag-shopping"></i>
              {cartCount > 0 && (
                <span className="cart-count-badge">{cartCount}</span>
              )}
            </button>

            {/* Desktop Auth Links */}
            <div className="hidden lg:flex" style={{ display: 'none' }}>
               {/* We don't have tailwind 'hidden lg:flex' readily working without tailwind, but we kept tailwind imported in index.css so it might work. If not, we will rely on CSS. Let's just use CSS. */}
            </div>

            {/* Mobile Navigation Hamburger */}
            <button 
              className={`hamburger-btn ${mobileOpen ? 'active' : ''}`} 
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen} 
              aria-label="Toggle Mobile Navigation Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <div className={`mobile-nav-panel ${mobileOpen ? 'active' : ''}`} aria-label="Mobile Navigation Drawer">
          <nav className="mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={isAdmin ? '/admin/dashboard' : '/profile'} className="nav-link" onClick={() => setMobileOpen(false)}>
                  {isAdmin ? 'Admin Panel' : 'My Account'}
                </Link>
                <button onClick={handleLogout} className="nav-link" style={{ textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', width: '100%', padding: '1rem 0' }}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
          </nav>
          <div className="mobile-nav-footer">
            <a href="tel:+918807173498"><i className="fa-solid fa-phone"></i> +91 88071 73498</a>
            <a href="mailto:info@cvrhandicrafts.com"><i className="fa-solid fa-envelope"></i> info@cvrhandicrafts.com</a>
          </div>
        </div>
      </header>

      {/* Header spacer */}
      {location.pathname !== '/' && <div style={{ height: '80px' }} />}
    </>
  );
};
