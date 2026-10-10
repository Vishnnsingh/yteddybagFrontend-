import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch, RootState } from '../redux/store';
import { removeFromWishlist } from '../redux/slices/wishlistSlice';
import type { ProductItem } from '../redux/slices/productSlice';

interface WishlistCardProps {
  product: ProductItem;
}

export default function WishlistCard({ product }: WishlistCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const primaryImg =
    product.primary_image ||
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800';

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const productUrl = (() => {
    const headerSlug = product.header_title
      ? product.header_title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      : 'toys';
    const dropdownSlug = product.dropdown_title
      ? product.dropdown_title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      : 'kids-toy';
    const itemSlug = (product.title || 'product')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `/${headerSlug}/${dropdownSlug}/${itemSlug}`;
  })();

  const handleCardClick = () => {
    window.open(productUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeFromWishlist(product.id));
    toast.success(`Removed "${product.title}" from Wishlist`, {
      icon: (
        <svg
          className="w-4.5 h-4.5 text-gray-500 fill-none stroke-current shrink-0"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    });
  };

  const handleMoveToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to move items to your cart');
      navigate('/login', { state: { from: '/wishlist' } });
      return;
    }
    toast.success(`"${product.title}" added to your Cart!`, { icon: '🛍️' });
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-xl border-0 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Remove Button (✕ at top-right, Myntra style) */}
      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
        title="Remove from wishlist"
      >
        ✕
      </button>

      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
        <img
          src={primaryImg}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600';
          }}
        />

        {/* Badge */}
        {product.badge_text && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#D26900] rounded-sm shadow-2xs">
              {product.badge_text}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Brand & Subtitle */}
          <span className="text-[11px] font-black uppercase tracking-wider text-[#111827]">
            {product.dropdown_title || product.header_title || 'YTEDDYBAGS'}
          </span>
          <h3 className="text-xs font-medium text-gray-700 truncate mt-0.5" title={product.title}>
            {product.title}
          </h3>

          {/* Pricing Row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
            )}
            {product.discount_percent > 0 && (
              <span className="text-[11px] font-bold text-orange-600">
                ({product.discount_percent}% OFF)
              </span>
            )}
          </div>
        </div>

        {/* Action Button: MOVE TO CART */}
        <button
          type="button"
          onClick={handleMoveToCart}
          className="w-full py-2.5 bg-white border border-[#D26900] text-[#D26900] hover:bg-[#D26900] hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>🛍️</span>
          <span>Move To Bag</span>
        </button>
      </div>
    </div>
  );
}
