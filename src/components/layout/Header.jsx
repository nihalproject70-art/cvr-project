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

  const isHome = location.pathname === '/';

  return (
    <>
      <header className={`header-wrapper ${isScrolled ? 'sticky' : ''} ${isHome ? 'home-theme' : 'white-theme'}`} id="mainHeader">
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

          {/* Actions Panel (Search, Cart, User Account, Menu) */}
          <div className="header-actions">
            {/* Search Button Toggle */}
            <button className="action-icon-btn" onClick={onSearchOpen} id="searchOpenBtn" aria-label="Open Search Searchbar">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
            
            {/* Shopping Cart Toggle */}
            <button className="action-icon-btn" onClick={() => setCartOpen(true)} id="cartOpenBtn" aria-label="Open Shopping Cart">
              <i className="fa-solid fa-bag-shopping"></i>
              <span className="cart-count-badge" id="cartCountBadge">{cartCount}</span>
            </button>

            {/* User Account Dropdown / Login Button */}
            {user ? (
              <div className="user-dropdown-container">
                <button className="action-icon-btn" aria-label="User account menu" id="userMenuBtn">
                  <i className="fa-solid fa-circle-user"></i>
                </button>
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <p className="user-name">{user.displayName || 'My Account'}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      <i className="fa-solid fa-gauge"></i> Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item">
                    <i className="fa-solid fa-user-gear"></i> Profile Details
                  </Link>
                  <Link to="/orders" className="dropdown-item">
                    <i className="fa-solid fa-receipt"></i> My Orders
                  </Link>
                  <div className="user-dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="action-icon-btn login-nav-btn" id="loginBtn" aria-label="Login">
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                <span className="login-text">Sign In</span>
              </Link>
            )}

            {/* Mobile Navigation Hamburger */}
            <button 
              className={`hamburger-btn ${mobileOpen ? 'active' : ''}`} 
              onClick={() => setMobileOpen(!mobileOpen)}
              id="mobileMenuToggle"
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
        <div className={`mobile-nav-panel ${mobileOpen ? 'active' : ''}`} id="mobileNavPanel" aria-label="Mobile Navigation Drawer">
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

            <div className="user-dropdown-divider" style={{ margin: '1rem 0', opacity: 0.5 }}></div>

            {/* Mobile Auth Options */}
            {user ? (
              <>
                <div style={{ padding: '0.5rem 1rem' }}>
                  <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-dark-deep)' }}>
                    {user.displayName || 'My Account'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-wood-light)' }}>
                    {user.email}
                  </p>
                </div>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>
                    <i className="fa-solid fa-gauge" style={{ marginRight: '8px' }}></i> Admin Dashboard
                  </Link>
                )}
                <Link to="/profile" className="nav-link" onClick={() => setMobileOpen(false)}>
                  <i className="fa-solid fa-user-gear" style={{ marginRight: '8px' }}></i> Profile Details
                </Link>
                <Link to="/orders" className="nav-link" onClick={() => setMobileOpen(false)}>
                  <i className="fa-solid fa-receipt" style={{ marginRight: '8px' }}></i> My Orders
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }} 
                  className="nav-link" 
                  style={{ textAlign: 'left', width: '100%', color: 'var(--color-error)' }}
                >
                  <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '8px' }}></i> Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-gold)' }}>
                <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: '8px' }}></i> Sign In / Register
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
