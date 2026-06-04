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

          {/* Actions Panel (Search, Cart, Menu) */}
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
