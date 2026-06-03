import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-espresso text-white/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl text-white mb-4">
              <span className="text-gold">CVR</span> Handicrafts
            </h3>
            <p className="text-sm leading-relaxed mb-6">
              Crafting timeless pieces of art with traditional techniques and premium materials.
              Every piece tells a story of heritage and craftsmanship.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all" aria-label="Instagram">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all" aria-label="Facebook">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all" aria-label="YouTube">
                <FiYoutube size={18} />
              </a>
              <a href="https://wa.me/918807173498" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] transition-all" aria-label="WhatsApp">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Shop', 'About', 'Contact'].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link === 'Home' ? '' : link.toLowerCase()}`}
                    className="text-sm hover:text-gold transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-gold/40 rounded-full" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-lg text-white mb-4">Categories</h4>
            <ul className="space-y-3">
              {['Wooden Furniture', 'Brass Idols', 'Home Decor', 'Wall Art', 'Pooja Items', 'Wooden Toys'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm hover:text-gold transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-gold/40 rounded-full" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg text-white mb-4">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-gold mt-1 flex-shrink-0" size={16} />
                <p className="text-sm">CVR Handicrafts, Tamil Nadu, India</p>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-gold flex-shrink-0" size={16} />
                <a href="tel:+918807173498" className="text-sm hover:text-gold transition-colors">+91 8807173498</a>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-gold flex-shrink-0" size={16} />
                <a href="mailto:info@cvrhandicrafts.com" className="text-sm hover:text-gold transition-colors">info@cvrhandicrafts.com</a>
              </div>
              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-gold flex-shrink-0" size={16} />
                <a href="https://wa.me/918807173498" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-gold transition-colors">WhatsApp Us</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50">
              &copy; {currentYear} CVR Handicrafts. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-xs text-white/50 hover:text-gold transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-xs text-white/50 hover:text-gold transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
