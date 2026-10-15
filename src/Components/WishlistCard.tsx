import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from '../redux/store';
import { removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
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

    const chosenColor =
      product.colors && product.colors.length > 0
        ? typeof product.colors[0] === 'string'
          ? product.colors[0]
          : product.colors[0].name
        : null;

    const chosenSize =
      product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;

    // 1. Add item into Cart
    dispatch(
      addToCart({
        product,
        selectedColor: chosenColor,
        selectedSize: chosenSize,
        quantity: 1,
      })
    );

    // 2. Remove item from Wishlist
    dispatch(removeFromWishlist(product.id));

    // 3. Custom brand CTA shopping bag icon
    const cartToastIcon = (
      <div className="w-6 h-6 rounded-full bg-[#FFF5EB] border border-[#FDE3CE] flex items-center justify-center shrink-0">
        <svg
          className="w-3.5 h-3.5 text-[#D26900] fill-none stroke-current"
          viewBox="0 0 24 24"
          strokeWidth={2.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>
    );

    // 4. Toast notification with View Cart action
    toast.success(`"${product.title}" added to your Cart!`, {
      icon: cartToastIcon,
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart'),
      },
    });
  };

  const isOutOfStock =
    product.in_stock === false ||
    (product.stock_quantity !== undefined && product.stock_quantity <= 0);

  const handleShowSimilar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl =
      product.dropdown_path ||
      product.header_path ||
      (product.header_title
        ? `/category/${product.header_title.toLowerCase().replace(/\s+/g, '-')}`
        : '/products');
    navigate(targetUrl);
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
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
            isOutOfStock ? 'opacity-65 grayscale contrast-90' : ''
          }`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600';
          }}
        />

        {/* Out of Stock Image Banner (Exact Image 2 Reference) */}
        {isOutOfStock && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center z-10 pointer-events-none">
            <span className="bg-white/95 text-[#E65100] border border-[#FFCCBC] px-3.5 py-1 rounded text-[11px] font-black tracking-wider uppercase shadow-xs">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Badge (Only if in stock) */}
        {!isOutOfStock && product.badge_text && (
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

        {/* Action Button: MOVE TO CART (or SHOW SIMILAR if out of stock, matching Image 2) */}
        {isOutOfStock ? (
          <button
            type="button"
            onClick={handleShowSimilar}
            className="w-full py-2.5 bg-white border border-[#D26900] text-[#D26900] hover:bg-[#D26900] hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>SHOW SIMILAR</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMoveToCart}
            className="group/btn w-full py-2.5 bg-white border border-[#D26900] text-[#D26900] hover:bg-[#D26900] hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-[#D26900] group-hover/btn:text-white transition-colors shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span>ADD TO CART</span>
          </button>
        )}
      </div>
    </div>
  );
}
