import React, { useEffect, Component, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import type { AppDispatch, RootState } from './redux/store';
import { fetchCurrentUserAPI } from './redux/slices/authSlice';
import { fetchWishlist } from './redux/slices/wishlistSlice';
import { purgeLegacyStaticCaches, LocalStorage, STORAGE_KEYS } from './Utils/storage';
import Layout from './Components/Layout';
import Home from './Pages/Home/Home';
import Login from './Pages/UserAuth/Login';
import AdminLogin from './Dashboard/AdminAuth/AdminLogin';
import DashboardLayout from './Dashboard/DashboardLayout';
import DashboardHome from './Dashboard/Pages/DashboardHome';
import AdminProfile from './Dashboard/Pages/AdminProfile';
import ManageHeader from './Dashboard/Pages/ManageHeader';
import ManageHomeBanner from './Dashboard/Pages/ManageHomeBanner';
import ManageProducts from './Dashboard/Pages/ManageProducts';
import ProductDetails from './Pages/Product/ProductDetails';
import ProductsPage from './Pages/Product/ProductsPage';
import { HeaderNavigationProvider } from './Context/HeaderNavigationContext';
import { AccountProvider } from './Context/AccountContext';
import { HomeBannerProvider } from './Context/HomeBannerContext';
import WishlistPage from './Pages/Wishlist/WishlistPage';
import TermsOfUse from './Pages/PublicPages/TermsOfUse';
import PrivacyPolicy from './Pages/PublicPages/PrivacyPolicy';
import GetHelp from './Pages/PublicPages/GetHelp';
import Myaccount from './Pages/Myaccount';
import { queryClient } from './lib/queryClient';
import { initSocketListeners, syncSocketUserRoom } from './Utils/socket';
import './App.css';

// Purge any stale legacy caches immediately on app load
purgeLegacyStaticCaches();

const router = createBrowserRouter([
  // User routes
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'my/wishlist', element: <WishlistPage /> },
      { path: 'account', element: <Myaccount /> },
      { path: 'myaccount', element: <Myaccount /> },
      { path: 'my/account', element: <Myaccount /> },
      { path: 'profile', element: <Myaccount /> },
      { path: 'my/profile', element: <Myaccount /> },
      { path: 'orders', element: <Myaccount /> },
      { path: 'addresses', element: <Myaccount /> },
      { path: 'my/address', element: <Myaccount /> },
      { path: 'terms', element: <TermsOfUse /> },
      { path: 'terms-of-use', element: <TermsOfUse /> },
      { path: 'termsofuse', element: <TermsOfUse /> },
      { path: 'privacy', element: <PrivacyPolicy /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'privacypolicy', element: <PrivacyPolicy /> },
      { path: 'help', element: <GetHelp /> },
      { path: 'get-help', element: <GetHelp /> },
      { path: 'gethelp', element: <GetHelp /> },
      // Customer product catalog & details routes
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:headerSlug', element: <ProductsPage /> },
      { path: 'products/:headerSlug/:dropdownSlug', element: <ProductsPage /> },
      { path: 'category/:headerSlug', element: <ProductsPage /> },
      { path: 'category/:headerSlug/:dropdownSlug', element: <ProductsPage /> },
      { path: 'collection/:headerSlug', element: <ProductsPage /> },
      { path: 'collection/:headerSlug/:dropdownSlug', element: <ProductsPage /> },
      { path: 'shop/:headerSlug', element: <ProductsPage /> },
      { path: 'shop/:headerSlug/:dropdownSlug', element: <ProductsPage /> },
      { path: 'product/:id', element: <ProductDetails /> },
      { path: 'product/detail/:id', element: <ProductDetails /> },
      { path: 'category/:headerSlug/product/:productId', element: <ProductDetails /> },
      { path: 'category/:headerSlug/:dropdownSlug/product/:productId', element: <ProductDetails /> },
      { path: ':headerSlug/:dropdownSlug/product/:productId', element: <ProductDetails /> },
      { path: ':headerSlug/product/:productId', element: <ProductDetails /> },
      // Direct clean routes without "product" keyword (e.g. /toys/kids-toy/product-1)
      { path: ':headerSlug/:dropdownSlug/:productId', element: <ProductDetails /> },
      { path: 'category/:headerSlug/:dropdownSlug/:productId', element: <ProductDetails /> },
      { path: ':headerSlug/:dropdownSlug', element: <ProductsPage /> },
    ],
  },
  // Dashboard routes (separate layout)
  {
    path: '/dashboard',
    children: [
      { path: 'login', element: <AdminLogin /> },
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHome /> },
          { path: 'header', element: <ManageHeader /> },
          { path: 'home-banner', element: <ManageHomeBanner /> },
          { path: 'products', element: <ManageProducts /> },
          { path: 'profile', element: <AdminProfile /> },
        ],
      },
    ],
  },
  // Global wildcard catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);


interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[RootErrorBoundary caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDF0EC] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#D26900] flex items-center justify-center text-3xl shadow-sm mb-4">
            🧸
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Something Went Wrong</h2>
          <p className="text-xs text-gray-600 max-w-md mt-1.5 mb-6">
            An unexpected error occurred. Please click reload to return to the catalog.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Initialize real-time Socket.io listeners for live silent updates across all clients
    initSocketListeners(dispatch, queryClient);

    // If accessToken is present, re-validate session and rehydrate user profile from Supabase DB
    const token = LocalStorage.getString(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      dispatch(fetchCurrentUserAPI());
    }

    // Fetch user or guest wishlist directly from DB / API
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Sync user-specific socket room and re-sync wishlist when user logs in / profile rehydrates
  useEffect(() => {
    if (currentUser?.id) {
      syncSocketUserRoom(currentUser.id);
      dispatch(fetchWishlist());
    }
  }, [currentUser?.id, dispatch]);

  return (
    <RootErrorBoundary>
      <HeaderNavigationProvider>
        <HomeBannerProvider>
          <AccountProvider>
            <Toaster position="top-center" offset={80} />
            <RouterProvider router={router} />
          </AccountProvider>
        </HomeBannerProvider>
      </HeaderNavigationProvider>
    </RootErrorBoundary>
  );
}

export default App;
