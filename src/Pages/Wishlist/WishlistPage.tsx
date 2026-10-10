import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { fetchWishlist, clearWishlist } from '../../redux/slices/wishlistSlice';
import WishlistCard from '../../Components/WishlistCard';
import PageLoader from '../../Components/PageLoader';
import { usePublicProductsQuery } from '../../hooks/useProductsQuery';
import type { ProductItem } from '../../redux/slices/productSlice';

export default function WishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { items, loading } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const reduxProducts = useSelector((state: RootState) => state.products.products);

  // TanStack Query integration: resolve live product details from cache
  const { data: cachedProducts } = usePublicProductsQuery();

  useEffect(() => {
    dispatch(fetchWishlist());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch]);

  // Dynamically resolve product details from TanStack Query cache & Redux to ensure
  // any price changes, discounts or stock updates from Socket.IO are immediately reflected
  const resolvedItems = useMemo<ProductItem[]>(() => {
    return items.map((item) => {
      const fromQuery = cachedProducts?.find(
        (p) => p.id === item.id || (p.slug && p.slug === item.slug)
      );
      if (fromQuery) return fromQuery;

      const fromRedux = reduxProducts.find(
        (p) => p.id === item.id || (p.slug && p.slug === item.slug)
      );
      if (fromRedux) return fromRedux;

      return item;
    });
  }, [items, cachedProducts, reduxProducts]);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 py-1">
          <Link to="/" className="hover:text-[#D26900] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#D26900] font-semibold">My Wishlist</span>
        </nav>

        {/* Guest Login Suggestion Banner (If user is not logged in) */}
        {!isAuthenticated && (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-800">
                  Save your wishlist forever!
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
                  Log in now to sync your shortlisted products across all your mobile and desktop devices.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login', { state: { from: '/wishlist' } })}
              className="px-5 py-2 bg-[#D26900] hover:bg-[#b45309] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Log In Now
            </button>
          </div>
        )}

        {/* Page Title & Count Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>My Wishlist</span>
              <span className="text-sm font-normal text-gray-500">
                ({resolvedItems.length} {resolvedItems.length === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>

          {resolvedItems.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearWishlist())}
              className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Loading State with theme spinner */}
        {loading && resolvedItems.length === 0 && (
          <PageLoader message="Loading your wishlist..." minHeight="min-h-[50vh]" />
        )}

        {/* Empty Wishlist State */}
        {!loading && resolvedItems.length === 0 && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center text-4xl mb-4 border border-orange-100 shadow-inner">
              🧸
            </div>
            <h2 className="text-lg font-bold text-gray-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-500 mt-1.5 mb-6 leading-relaxed">
              Explore our curated plush collections and tap the heart icon on any product to save your favorites here.
            </p>
            <Link
              to="/"
              className="px-6 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {/* Wishlist Items Grid (2 cols mobile, 3 cols tablet, 4-5 cols desktop) */}
        {resolvedItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
            {resolvedItems.map((prod) => (
              <WishlistCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
