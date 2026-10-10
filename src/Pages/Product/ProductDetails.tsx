import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { AppDispatch, RootState } from '../../redux/store';
import { fetchProductById } from '../../redux/slices/productSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import ProductCard from '../../Components/ProductCard';

export default function ProductDetails() {
  const { id, productId, itemSlug } = useParams<{
    id?: string;
    productId?: string;
    itemSlug?: string;
    headerSlug?: string;
    dropdownSlug?: string;
  }>();
  const activeId = productId || id || itemSlug || '';

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProduct, relatedProducts, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const { itemIds: wishlistedIds } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isWishlisted = currentProduct ? wishlistedIds.includes(currentProduct.id) : false;

  // User selections
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Fetch product on route change
  useEffect(() => {
    if (activeId) {
      dispatch(fetchProductById(activeId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dispatch, activeId]);

  // Do NOT add default dummy fields on load (clean unselected state)
  useEffect(() => {
    if (currentProduct) {
      setSelectedImageIndex(0);
      setSelectedColor('');
      setSelectedSize('');
    }
  }, [currentProduct]);

  // Mandatory Auth Check for Add to Cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to your cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    const details = [selectedColor, selectedSize].filter(Boolean).join(', ');
    toast.success(
      `Added "${currentProduct?.title}"${details ? ` (${details})` : ''} to Cart!`,
      {
        icon: '🛍️',
      }
    );
  };

  // Mandatory Auth Check for Buy Now
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    toast.success(`Proceeding to checkout for "${currentProduct?.title}"...`, {
      icon: '⚡',
    });
  };

  // Mandatory Auth Check for Wishlist
  const handleWishlistClick = () => {
    if (!currentProduct) return;
    if (!isAuthenticated) {
      toast.error('Please login to add items to your wishlist');
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

    dispatch(toggleWishlist(currentProduct));
    toast.success(
      isWishlisted
        ? `Removed "${currentProduct.title}" from Wishlist`
        : `Added "${currentProduct.title}" to Wishlist!`,
      { icon: isWishlisted ? unlistToastIcon : wishlistToastIcon }
    );
  };

  if (loading && !currentProduct) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#D26900] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-gray-800">Unpacking Product Details...</h2>
        <p className="text-xs text-gray-500 mt-1">Fetching plush handcrafted specs & photos</p>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-5xl mb-3">🧸</span>
        <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
          {error || 'The product you are looking for may have been retired or moved.'}
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white font-bold rounded-xl shadow-md text-xs"
        >
          Return to Home Catalog
        </Link>
      </div>
    );
  }

  const allImages =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : [
          {
            id: 'fallback-1',
            url:
              currentProduct.primary_image ||
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200',
            is_primary: true,
          },
        ];

  const currentImg = allImages[selectedImageIndex] || allImages[0];
  const savings = Math.max(0, currentProduct.mrp - currentProduct.price);

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    const matchedIdx = allImages.findIndex(
      (img) => img.color_name && img.color_name.toLowerCase() === colorName.toLowerCase()
    );
    if (matchedIdx !== -1) {
      setSelectedImageIndex(matchedIdx);
    }
  };

  const handleThumbnailClick = (idx: number) => {
    setSelectedImageIndex(idx);
    const img = allImages[idx];
    if (img && img.color_name) {
      setSelectedColor(img.color_name);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Breadcrumb Navigation: Home / Header / Dropdown / Product */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto py-1">
          <Link to="/" className="hover:text-[#D26900] transition-colors flex-shrink-0 font-medium">
            Home
          </Link>
          <span>/</span>
          {currentProduct.header_title ? (
            <>
              <Link
                to={
                  currentProduct.header_path ||
                  `/category/${currentProduct.header_title.toLowerCase().replace(/\s+/g, '-')}`
                }
                className="hover:text-[#D26900] transition-colors flex-shrink-0 font-bold uppercase text-gray-700"
              >
                {currentProduct.header_title}
              </Link>
              <span>/</span>
            </>
          ) : (
            <>
              <Link
                to="/products"
                className="hover:text-[#D26900] transition-colors flex-shrink-0 font-bold uppercase text-gray-700"
              >
                Catalog
              </Link>
              <span>/</span>
            </>
          )}
          {currentProduct.dropdown_title && (
            <>
              <Link
                to={
                  currentProduct.dropdown_path ||
                  `/category/${currentProduct.header_title ? currentProduct.header_title.toLowerCase().replace(/\s+/g, '-') : 'all'}/${currentProduct.dropdown_title.toLowerCase().replace(/\s+/g, '-')}`
                }
                className="hover:text-[#D26900] text-gray-600 transition-colors flex-shrink-0 font-medium capitalize"
              >
                {currentProduct.dropdown_title}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#D26900] font-bold truncate">{currentProduct.title}</span>
        </nav>

        {/* Main Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Multi-Photo Gallery (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 lg:sticky lg:top-24">
            {/* Thumbnails Strip */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[500px] flex-shrink-0 pb-2 sm:pb-0">
              {allImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-amber-50/50 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/30 shadow-md scale-102'
                      : 'border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Product thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300';
                    }}
                  />
                  {img.color_name && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">
                      {img.color_name}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Big Featured Image Stage */}
            <div className="relative flex-1 rounded-3xl overflow-hidden bg-gradient-to-b from-amber-50/40 to-orange-50/20 border border-amber-100 shadow-sm aspect-square sm:aspect-auto sm:min-h-[480px] max-h-[600px] flex items-center justify-center p-4">
              <motion.img
                key={currentImg.url}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={currentImg.url}
                alt={currentProduct.title}
                className="w-full h-full object-contain max-h-[540px] drop-shadow-md select-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800';
                }}
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                {currentProduct.badge_text && (
                  <span className="px-3 py-1 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md">
                    {currentProduct.badge_text}
                  </span>
                )}
                {currentProduct.discount_percent > 0 && (
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-extrabold rounded-full shadow-sm">
                    {currentProduct.discount_percent}% OFF
                  </span>
                )}
              </div>

              {/* Photo Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-full">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info, Options, Purchase & MYNTRA-STYLE DETAILS (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Header & Title (KIDS TOY badge removed as requested) */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {currentProduct.title}
              </h1>
              {currentProduct.subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {currentProduct.subtitle}
                </p>
              )}
            </div>

            {/* Rating & SKU Meta */}
            <div className="flex items-center gap-3 text-xs border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                <span className="text-amber-500">★</span>
                <span>{currentProduct.rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">
                  ({currentProduct.reviews_count} reviews)
                </span>
              </div>
              {currentProduct.sku && (
                <span className="text-gray-400 font-mono text-[11px]">
                  SKU: {currentProduct.sku}
                </span>
              )}
              <span className="text-emerald-700 font-semibold text-xs ml-auto">
                ✓ Verified Authentic
              </span>
            </div>

            {/* Price Box with Crossed-Out MRP */}
            <div className="p-4 bg-gradient-to-r from-amber-50/70 via-orange-50/30 to-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">₹{currentProduct.price}</span>
                {currentProduct.mrp > currentProduct.price && (
                  <span className="text-base text-gray-400 line-through font-semibold">
                    MRP ₹{currentProduct.mrp}
                  </span>
                )}
                {savings > 0 && (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg">
                    Save ₹{savings} ({currentProduct.discount_percent}% OFF)
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-amber-200/50">
                <span>Inclusive of all taxes</span>
                <span className="text-emerald-700 font-bold">
                  ⚡ 100% Handcrafted Luxury
                </span>
              </div>
            </div>

            {/* Color Selection Swatches */}
            {currentProduct.colors && currentProduct.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Color:{' '}
                    <span className="text-[#D26900] font-semibold">
                      {selectedColor || 'Select a color'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {currentProduct.colors.map((c, i) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleColorSelect(c.name)}
                        className={`group relative flex items-center justify-center p-1 rounded-full transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-[#D26900] ring-offset-2 scale-110 shadow-xs'
                            : 'hover:scale-105'
                        }`}
                        title={c.name}
                      >
                        <span
                          className="w-7 h-7 rounded-full border border-gray-300 shadow-inner block"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection (Preset & Custom Sizes) */}
            {currentProduct.sizes && currentProduct.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Select Size:{' '}
                    <span className="text-[#D26900] font-semibold">
                      {selectedSize || 'Choose a size'}
                    </span>
                  </span>
                  <span className="text-[11px] text-gray-400">Dimensions in specs</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.sizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D26900] text-white shadow-md ring-2 ring-[#D26900]/30'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & CTA Buttons (MANDATORY LOGIN) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Counter */}
                <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-10 flex items-center justify-center text-gray-600 hover:text-black font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-10 flex items-center justify-center text-gray-600 hover:text-black font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-[#D26900] text-[#D26900] hover:bg-orange-50 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>🛍️</span>
                  Add to Cart
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className={`py-3 px-4 rounded-xl border transition-all duration-200 shadow-2xs flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-98 ${
                    isWishlisted
                      ? 'border-[#535766] bg-[#535766] hover:bg-[#424553] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#D26900] hover:text-[#D26900]'
                  }`}
                  title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  {isWishlisted ? (
                    <svg
                      className="w-4 h-4 text-[#D26900] fill-current shrink-0"
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
                      className="w-4 h-4 text-current fill-none stroke-current shrink-0"
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
                  <span className="hidden sm:inline">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
              </div>

              {/* Buy Now Primary CTA */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D26900] via-[#E65100] to-[#D26900] hover:opacity-95 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                Buy Now
              </button>
            </div>

            {/* Luxury Quality & Authenticity Card */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-gray-900">
                <span className="flex items-center gap-1.5 text-amber-950 font-bold">
                  <span>🧸</span>
                  Authentic YTeddybags Craftsmanship
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#D26900]">✓</span>
                  <span>100% Non-Toxic PP Plush</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#D26900]">✓</span>
                  <span>Precision Reinforced Stitching</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#D26900]">✓</span>
                  <span>Ultra-Soft & Shed-Proof</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#D26900]">✓</span>
                  <span>Gentle Child-Safe Zipper</span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* MYNTRA STYLE: RIGHT COLUMN DETAILS, HIGHLIGHTS & SPECS */}
            {/* ========================================================= */}
            <div className="pt-6 border-t border-gray-200 space-y-6">
              {/* Product Full Story / Description */}
              {currentProduct.description && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <span>📖</span>
                    Product Details & Story
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentProduct.description}
                  </p>
                </div>
              )}

              {/* "Why You'll Love It" Highlights */}
              {currentProduct.why_love_it && currentProduct.why_love_it.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <span className="text-[#D26900]">✨</span>
                    Why You'll Love It
                  </h4>
                  <div className="space-y-2">
                    {currentProduct.why_love_it.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                        <span className="text-[#D26900] font-bold mt-0.5">✓</span>
                        <span className="leading-relaxed font-medium">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications (Myntra 2-column key-value grid) */}
              {Array.isArray(currentProduct.specifications) && currentProduct.specifications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <span>📋</span>
                    Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
                    {currentProduct.specifications.map((spec, idx) => (
                      <div key={idx} className="border-b border-gray-100 pb-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                          {spec.key}
                        </span>
                        <span className="text-xs font-bold text-gray-800 block mt-0.5">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Washing & Care Instructions */}
              <div className="space-y-2 text-xs text-gray-600 bg-amber-50/40 p-3.5 rounded-xl border border-amber-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <span>🧼</span>
                  Washing & Care Instructions
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {Array.isArray(currentProduct.specifications)
                    ? currentProduct.specifications.find((s) =>
                        s.key.toLowerCase().includes('care') || s.key.toLowerCase().includes('wash')
                      )?.value || 'Gently hand wash with cold water. Dry flat in shade. Do not bleach.'
                    : 'Gently hand wash with cold water. Dry flat in shade. Do not bleach.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products / More You'll Adore */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  More You'll Adore 🧸
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Handpicked companions from the same collection
                </p>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-[#D26900] hover:underline"
              >
                View All Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
