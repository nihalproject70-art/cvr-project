import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/seo/SEOHead';

const NotFound = () => (
  <>
    <SEOHead title="404 - Page Not Found | CVR Handicrafts" noIndex />
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-heading text-8xl font-bold text-gold/30 mb-4">404</p>
        <h1 className="font-heading text-3xl font-bold text-espresso mb-4">Page Not Found</h1>
        <p className="text-wood-light mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary"><span>Back to Home</span></Link>
      </motion.div>
    </div>
  </>
);

export default NotFound;
