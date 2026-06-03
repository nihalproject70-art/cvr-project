import { FaWhatsapp } from 'react-icons/fa';
import { getWhatsAppUrl } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';

export const WhatsAppButton = ({ product, variant = 'full', className = '' }) => {
  const { user } = useAuth();
  const customerName = user?.displayName || '';

  const handleClick = () => {
    const url = getWhatsAppUrl(product, customerName);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#128C7E] transition-all hover:scale-110 shadow-lg ${className}`}
        aria-label="Buy on WhatsApp"
        title="Order via WhatsApp"
      >
        <FaWhatsapp size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`btn-whatsapp w-full ${className}`}
      aria-label="Order via WhatsApp"
    >
      <FaWhatsapp size={20} />
      <span>Order via WhatsApp</span>
    </button>
  );
};

// Floating WhatsApp button for entire site
export const FloatingWhatsApp = () => {
  return (
    <a
      href="https://wa.me/918807173498?text=Hello%20CVR%20Handicrafts%2C%20I%20have%20a%20question."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform hover:bg-[#128C7E]"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  );
};
