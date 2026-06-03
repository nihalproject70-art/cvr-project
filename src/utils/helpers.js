// Generate URL-friendly slug from text
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Format price in Indian Rupees
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Calculate discount percentage
export const getDiscount = (price, salePrice) => {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
};

// Generate WhatsApp URL for product
export const getWhatsAppUrl = (product, customerName = '') => {
  const phone = import.meta.env.VITE_ADMIN_WHATSAPP || '918807173498';
  const productUrl = `${window.location.origin}/product/${product.slug}`;
  const price = product.salePrice || product.price;

  const message = `Hello CVR Handicrafts,

I would like to buy this product.

Product Name: ${product.name}

Price: ₹${price}

Product URL:
${productUrl}

Customer Name:
${customerName || 'Guest'}

Please contact me regarding this product.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// Truncate text with ellipsis
export const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Generate star rating array
export const getStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push('full');
    else if (i - 0.5 <= rating) stars.push('half');
    else stars.push('empty');
  }
  return stars;
};

// Format date
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Generate order ID
export const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CVR-${timestamp}-${random}`;
};
