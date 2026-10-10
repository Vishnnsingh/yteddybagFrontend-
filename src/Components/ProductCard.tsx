import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch, RootState } from '../redux/store';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import type { ProductItem } from '../redux/slices/productSlice';

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { itemIds: wishlistedIds } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isWishlisted = wishlistedIds.includes(product.id);

  const [isHovered, setIsHovered] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Construct clean hierarchical URL without random UUID/hash (e.g. /toys/kids-toy/product-1)
  const productUrl = useMemo(() => {
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
  }, [product]);

  // Extract all available images
  const imagesList = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const urls = product.images.map((img) => img.url).filter(Boolean);
      if (urls.length > 0) return urls;
    }
    if (product.primary_image) {
      return [product.primary_image];
    }
    return ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800'];
  }, [product.images, product.primary_image]);

  // Render Badge based on admin style & color choice (default website color theme #D26900)
  const renderBadge = () => {
    if (!product.badge_text) return null;
    const style = product.badge_style || 'ribbon';
    const color = product.badge_color || '#D26900';

    if (style === 'pill') {
      return (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span
            className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-full shadow-md"
            style={{ backgroundColor: color }}
          >
            {product.badge_text}
          </span>
        </div>
      );
    }

    if (style === 'minimal') {
      return (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span
            className="inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white rounded-xs border border-white/60 backdrop-blur-xs shadow-xs"
            style={{ backgroundColor: color }}
          >
            {product.badge_text}
          </span>
        </div>
      );
    }

    if (style === 'glass') {
      return (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span
            className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-lg backdrop-blur-md border border-white/30 shadow-md"
            style={{ backgroundColor: `${color}E6` }}
          >
            {product.badge_text}
          </span>
        </div>
      );
    }

    if (style === 'energetic') {
      return (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-md shadow-md"
            style={{ backgroundColor: color }}
          >
            <span>🔥</span>
            <span>{product.badge_text}</span>
          </span>
        </div>
      );
    }

    // Default 'ribbon' style (Image 2) with brand website theme color
    return (
      <div className="absolute top-2.5 left-0 z-10 pointer-events-none">
        <span
          className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-r-md shadow-sm"
          style={{ backgroundColor: color }}
        >
          {product.badge_text}
        </span>
      </div>
    );
  };

  // Automatically slide through images on hover when multiple images exist
  useEffect(() => {
    if (!isHovered || imagesList.length <= 1) {
      setActiveImgIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % imagesList.length);
    }, 1250);

    return () => clearInterval(interval);
  }, [isHovered, imagesList.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveImgIndex(0);
  };

  // Click card to open in a NEW TAB
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(productUrl, '_blank', 'noopener,noreferrer');
  };

  // Wishlist toggle with MANDATORY LOGIN check
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to add items to your wishlist!');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    const wishlistToastIcon = (
      <svg
        className="w-4.5 h-4.5 text-[#D26900] fill-[#D26900] shrink-0"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    );

    const unlistToastIcon = (
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
    );

    dispatch(toggleWishlist(product));
    toast.success(
      isWishlisted
        ? `Removed "${product.title}" from Wishlist`
        : `Added "${product.title}" to Wishlist!`,
      { icon: isWishlisted ? unlistToastIcon : wishlistToastIcon }
    );
  };

  const sizeDisplay = useMemo(() => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.join(', ');
    }
    return 'Free Size';
  }, [product.sizes]);

  const ratingValue = product.rating ? Number(product.rating).toFixed(1) : '4.9';
  const reviewsCount = product.reviews_count ?? 95;

  const formatReviewCount = (count: number): string => {
    if (!count || isNaN(count)) return '0';
    if (count < 1000) return String(count);
    if (count < 10000) {
      const k = count / 1000;
      return `${parseFloat(k.toFixed(2))}k`;
    }
    if (count < 1000000) {
      const k = count / 1000;
      return `${parseFloat(k.toFixed(1))}k`;
    }
    const m = count / 1000000;
    return `${parseFloat(m.toFixed(1))}M`;
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col bg-white rounded-xl border-0 shadow-xs hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer select-none ${className}`}
    >
      {/* IMAGE STAGE (Compact Aspect Ratio for 5-Card Row Layout) */}
      <div
        className="relative aspect-[4/4.5] w-full overflow-hidden bg-gray-50 shrink-0"
      >
        <img
          src={imagesList[activeImgIndex] || imagesList[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-all duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600';
          }}
        />

        {/* DYNAMIC BADGE (Admin custom style & color, defaults to website color theme) */}
        {renderBadge()}

        {/* FLOATING RATING PILL AT BOTTOM LEFT (Formatted review count e.g. 1.22k, 88.9k) */}
        <div
          className={`absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded shadow-xs text-[10px] font-bold text-gray-800 pointer-events-none transition-opacity duration-200 ${
            isHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <span>{ratingValue}</span>
          <span className="text-amber-500 text-xs">★</span>
          {reviewsCount > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-normal">{formatReviewCount(reviewsCount)}</span>
            </>
          )}
        </div>

        {/* MULTI-PHOTO INDICATOR BADGE (Image 2 Reference at Bottom-Right of photo) */}
        {imagesList.length > 1 && isHovered && (
          <div className="absolute bottom-2 right-2 z-20 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-none">
            <svg
              className="w-3.5 h-3.5 text-[#E65100]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <rect x="2" y="2" width="13" height="13" rx="2" />
              <path d="M5 15h11a2 2 0 0 0 2-2V5" />
              <path d="M9 19h11a2 2 0 0 0 2-2V9" />
            </svg>
          </div>
        )}

        {/* NAVIGATION DOTS (Image 2 Reference at bottom edge of photo) */}
        {imagesList.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
            {imagesList.map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex(i);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex(i);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  activeImgIndex === i
                    ? 'w-1.5 h-1.5 bg-[#D26900] scale-125'
                    : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* CARD CONTENT DETAILS (Identical height for resting and hover states) */}
      <div className="p-2.5 sm:px-3 sm:py-2.5 h-[88px] sm:h-[92px] flex flex-col justify-between bg-white relative">
        {isHovered ? (
          /* HOVER STATE: Image 2 Reference Style (Crisp rectangular Wishlist button, clean Sizes, Price row) */
          <div className="flex flex-col justify-between h-full animate-fadeIn">
            {/* Wishlist Button: Image 2 Reference Style */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`w-full h-7.5 sm:h-8 px-3 rounded font-bold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-[#535766] hover:bg-[#424553] border border-[#535766] text-white shadow-xs'
                  : 'bg-white border border-[#d4d5d9] text-[#282C3F] hover:border-[#D26900] hover:text-[#D26900]'
              }`}
            >
              {isWishlisted ? (
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D26900] fill-current shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-current fill-none stroke-current shrink-0"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
              <span className="leading-none">{isWishlisted ? 'WISHLISTED' : 'WISHLIST'}</span>
            </button>

            {/* Sizes Line (Image 2 Reference) */}
            <div className="text-[10px] sm:text-[11px] text-[#535766] font-medium truncate leading-tight">
              Sizes: {sizeDisplay}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-1.5 flex-wrap leading-none">
              <span className="text-xs sm:text-sm font-bold text-[#282C3F]">
                Rs. {product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-[10px] sm:text-[11px] text-gray-400 line-through">
                  Rs. {product.mrp}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="text-[10px] font-bold text-[#D26900]">
                  ({product.discount_percent}% OFF)
                </span>
              )}
            </div>
          </div>
        ) : (
          /* RESTING STATE (Clean compact details without cutting product name or subtitle) */
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Title - clean truncate without cutting off letters */}
              <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 truncate group-hover:text-[#D26900] transition-colors leading-snug">
                {product.title}
              </h3>

              {/* Subtitle - clean truncate without cutting descenders */}
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate leading-normal mt-0.5">
                {product.subtitle || 'Handcrafted plush piece'}
              </p>
            </div>

            {/* Price row */}
            <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5 leading-none">
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                Rs. {product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-[10px] sm:text-[11px] text-gray-400 line-through">
                  Rs. {product.mrp}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="text-[10px] font-bold text-[#D26900]">
                  ({product.discount_percent}% OFF)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
