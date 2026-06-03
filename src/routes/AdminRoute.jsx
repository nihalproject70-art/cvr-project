import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';

export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};
