import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import type { AppDispatch } from './redux/store';
import { fetchCurrentUserAPI } from './redux/slices/authSlice';
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

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // If accessToken is present, re-validate session and rehydrate user profile from Supabase DB
    const token = LocalStorage.getString(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      dispatch(fetchCurrentUserAPI());
    }
  }, [dispatch]);

  return (
    <HeaderNavigationProvider>
      <HomeBannerProvider>
        <AccountProvider>
          <Toaster position="top-center" offset={80} />
          <RouterProvider router={router} />
        </AccountProvider>
      </HomeBannerProvider>
    </HeaderNavigationProvider>
  );
}

export default App;
