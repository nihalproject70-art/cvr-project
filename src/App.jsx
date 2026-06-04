import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { AdminRoute } from '@/routes/AdminRoute';

// Lazy-loaded public pages
const Home = lazy(() => import('@/pages/Home'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Category = lazy(() => import('@/pages/Category'));
const Categories = lazy(() => import('@/pages/Categories'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const Profile = lazy(() => import('@/pages/Profile'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderHistory = lazy(() => import('@/pages/OrderHistory'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Lazy-loaded admin pages
const AdminLogin = lazy(() => import('@/admin/pages/AdminLogin'));
const Dashboard = lazy(() => import('@/admin/pages/Dashboard'));
const AdminProducts = lazy(() => import('@/admin/pages/Products'));
const AddProduct = lazy(() => import('@/admin/pages/AddProduct'));
const EditProduct = lazy(() => import('@/admin/pages/EditProduct'));
const AdminCategories = lazy(() => import('@/admin/pages/Categories'));
const AdminOrders = lazy(() => import('@/admin/pages/Orders'));
const AdminCustomers = lazy(() => import('@/admin/pages/Customers'));
const AdminReviews = lazy(() => import('@/admin/pages/Reviews'));
const AdminSettings = lazy(() => import('@/admin/pages/Settings'));
const AdminBanners = lazy(() => import('@/admin/pages/Banners'));
const AdminHomepageManager = lazy(() => import('@/admin/pages/HomepageManager'));
const AdminPayments = lazy(() => import('@/admin/pages/Payments'));
const AdminReports = lazy(() => import('@/admin/pages/Reports'));
const AdminNotifications = lazy(() => import('@/admin/pages/Notifications'));

function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Customer Routes */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
        </Route>

        {/* Admin Login (no layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="homepage" element={<AdminHomepageManager />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
