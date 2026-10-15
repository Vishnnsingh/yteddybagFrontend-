import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { AppDispatch, RootState } from '../../redux/store';
import { fetchProductById } from '../../redux/slices/productSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { useRelatedProductsQuery } from '../../hooks/useProductsQuery';
import { useCheckDelhiveryPincodeQuery } from '../../hooks/useOrdersQuery';
import ProductCard from '../../Components/ProductCard';
import PageLoader from '../../Components/PageLoader';

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
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);

  // TanStack Query: Fetch up to 50 related products from the same category
  const { data: relatedData } = useRelatedProductsQuery(activeId, 50);

  // Delhivery Pincode Delivery Checker State
  const [pincodeInput, setPincodeInput] = useState(() => {
    return localStorage.getItem('yteddy_delivery_pincode') || '';
  });
  const [activePincode, setActivePincode] = useState(() => {
    return localStorage.getItem('yteddy_delivery_pincode') || '';
  });
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  const {
    data: pincodeDeliveryData,
    isLoading: isCheckingPincode,
  } = useCheckDelhiveryPincodeQuery(activePincode, {
    enabled: Boolean(activePincode && activePincode.length === 6 && /^\d{6}$/.test(activePincode)),
  });

  const handleCheckPincode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pincodeInput.trim();
    if (!clean) {
      setPincodeError('Please enter a 6-digit PIN code');
      return;
    }
    if (!/^\d{6}$/.test(clean)) {
      setPincodeError('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    setPincodeError('');
    setActivePincode(clean);
    setIsEditingPincode(false);
    localStorage.setItem('yteddy_delivery_pincode', clean);
  };

  // Fetch product on route change (deduplicated if already loaded)
  useEffect(() => {
    if (activeId) {
      if (!currentProduct || (currentProduct.id !== activeId && currentProduct.slug !== activeId)) {
        dispatch(fetchProductById(activeId));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dispatch, activeId, currentProduct]);

  // Do NOT add default dummy fields on load (clean unselected state)
  useEffect(() => {
    if (currentProduct) {
      setSelectedImageIndex(0);
      setSelectedColor('');
      setSelectedSize('');
    }
  }, [currentProduct]);

  // Add to Cart with Active Options (Color, Size, Qty) + Toast notification matching Wishlist
  const handleAddToCart = () => {
    if (!currentProduct) return;

    const chosenColor =
      selectedColor ||
      (currentProduct.colors && currentProduct.colors.length > 0
        ? typeof currentProduct.colors[0] === 'string'
          ? currentProduct.colors[0]
          : currentProduct.colors[0].name
        : null);

    const chosenSize =
      selectedSize ||
      (currentProduct.sizes && currentProduct.sizes.length > 0
        ? currentProduct.sizes[0]
        : null);

    dispatch(
      addToCart({
        product: currentProduct,
        selectedColor: chosenColor,
        selectedSize: chosenSize,
        quantity: quantity || 1,
      })
    );

    const details = [chosenColor, chosenSize].filter(Boolean).join(' • ');

    const cartToastIcon = (
      <svg
        className="w-4.5 h-4.5 text-[#D26900] fill-none stroke-current shrink-0"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    );

    toast.success(
      `Added "${currentProduct.title}"${details ? ` (${details})` : ''} to Bag!`,
      {
        icon: cartToastIcon,
        action: {
          label: 'View Bag',
          onClick: () => navigate('/cart'),
        },
      }
    );
  };

  // Buy Now: adds to cart with active options and navigates to Cart
  const handleBuyNow = () => {
    if (!currentProduct) return;

    const chosenColor =
      selectedColor ||
      (currentProduct.colors && currentProduct.colors.length > 0
        ? typeof currentProduct.colors[0] === 'string'
          ? currentProduct.colors[0]
          : currentProduct.colors[0].name
        : null);

    const chosenSize =
      selectedSize ||
      (currentProduct.sizes && currentProduct.sizes.length > 0
        ? currentProduct.sizes[0]
        : null);

    dispatch(
      addToCart({
        product: currentProduct,
        selectedColor: chosenColor,
        selectedSize: chosenSize,
        quantity: quantity || 1,
      })
    );
    navigate('/cart');
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

  // Compute images and savings safely before early returns
  const allImages =
    currentProduct?.images && currentProduct.images.length > 0
      ? currentProduct.images
      : currentProduct?.primary_image
      ? [
          {
            id: 'fallback-1',
            url: currentProduct.primary_image,
            is_primary: true,
          },
        ]
      : [];

  const currentImg = allImages[selectedImageIndex] || allImages[0];
  const isOutOfStock =
    currentProduct
      ? currentProduct.in_stock === false ||
        (currentProduct.stock_quantity !== undefined && currentProduct.stock_quantity <= 0)
      : false;

  // Automatic carousel rotation for featured large image if multiple images exist
  useEffect(() => {
    if (allImages.length <= 1 || isGalleryHovered) return;

    const timer = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [allImages.length, isGalleryHovered]);

  if (loading && !currentProduct) {
    return (
      <PageLoader message="Loading product details..." minHeight="min-h-[70vh]" />
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

  // Use TanStack Query 50-items related products, falling back to Redux relatedProducts
  const displayRelatedProducts =
    relatedData?.products && relatedData.products.length > 0
      ? relatedData.products
      : relatedProducts;

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
          {/* LEFT COLUMN: Multi-Photo Gallery (7 cols on lg) - Sticky removed so it scrolls naturally */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails Strip (no-scrollbar removes unwanted horizontal bar) */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden max-h-[500px] flex-shrink-0 pb-2 sm:pb-0 no-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border transition-all flex-shrink-0 bg-white cursor-pointer ${
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

            {/* Big Featured Image Stage (Clean transparent/white matching page background, with auto-slide support) */}
            <div
              onMouseEnter={() => setIsGalleryHovered(true)}
              onMouseLeave={() => setIsGalleryHovered(false)}
              className="group/gallery relative flex-1 rounded-2xl overflow-hidden bg-white border border-gray-100 aspect-square sm:aspect-auto sm:min-h-[480px] max-h-[600px] flex items-center justify-center p-2 sm:p-4"
            >
              <motion.img
                key={currentImg.url}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={currentImg.url}
                alt={currentProduct.title}
                className={`w-full h-full object-contain max-h-[540px] select-none ${
                  isOutOfStock ? 'opacity-65 grayscale contrast-90' : ''
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800';
                }}
              />

              {/* Out of Stock Banner across big image */}
              {isOutOfStock && (
                <div className="absolute bottom-6 inset-x-0 flex justify-center z-15 pointer-events-none">
                  <span className="bg-white/95 text-[#E65100] border-2 border-[#FFCCBC] px-5 py-2 rounded-xl text-xs sm:text-sm font-black tracking-widest uppercase shadow-md">
                    OUT OF STOCK
                  </span>
                </div>
              )}

              {/* Prev / Next Manual Navigation Controls (visible on hover if >1 image) */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity cursor-pointer z-10"
                    title="Previous photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity cursor-pointer z-10"
                    title="Next photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Photo Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-full z-10">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info, Options, Purchase & MYNTRA-STYLE DETAILS (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Header & Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                {currentProduct.title}
              </h1>
              {currentProduct.subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                  {currentProduct.subtitle}
                </p>
              )}
            </div>

            {/* Rating, Badges & SKU Row (Clean Myntra-style, no yellow background, verified authentic removed) */}
            <div className="flex items-center gap-3 text-xs border-b border-gray-100 pb-3 flex-wrap">
              {/* Clean Bordered Rating Pill (No yellow bg, white with gray border like reference image) */}
              <div className="flex items-center gap-1.5 bg-white text-gray-800 font-bold px-2.5 py-1 rounded border border-gray-200 shadow-2xs">
                <span>{currentProduct.rating.toFixed(1)}</span>
                <span className="text-[#D26900] text-xs">★</span>
                <span className="text-gray-300 font-light">|</span>
                <span className="text-gray-500 font-normal">
                  {currentProduct.reviews_count} Ratings
                </span>
              </div>

              {/* Badges moved to this row alongside SKU */}
              {isOutOfStock ? (
                <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-[11px] font-black uppercase rounded tracking-wide shadow-2xs">
                  Out of Stock
                </span>
              ) : currentProduct.badge_text ? (
                <span className="px-2.5 py-1 bg-[#D26900] text-white text-[11px] font-bold uppercase rounded tracking-wide shadow-2xs">
                  {currentProduct.badge_text}
                </span>
              ) : null}

              {currentProduct.sku && (
                <span className="text-gray-400 font-mono text-[11px]">
                  SKU: {currentProduct.sku}
                </span>
              )}
            </div>

            {/* Price Details (Clean Myntra-Style Typography, NO yellow card background) */}
            <div className="pt-1 pb-1 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{currentProduct.price}
                </span>
                {currentProduct.mrp > currentProduct.price && (
                  <span className="text-base sm:text-lg text-gray-400 line-through font-normal">
                    MRP ₹{currentProduct.mrp}
                  </span>
                )}
                {currentProduct.discount_percent > 0 && (
                  <span className="text-base sm:text-lg font-bold text-[#D26900]">
                    ({currentProduct.discount_percent}% OFF)
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-emerald-700">
                inclusive of all taxes
              </p>
            </div>

            {/* Color Selection Swatches */}
            {currentProduct.colors && currentProduct.colors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    More Colors
                  </span>
                  {selectedColor && (
                    <span className="text-xs text-[#D26900] font-semibold capitalize">
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {currentProduct.colors.map((c, i) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleColorSelect(c.name)}
                        className={`group relative flex items-center justify-center p-0.5 rounded-full transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-[#D26900] ring-offset-2 scale-105'
                            : 'hover:scale-105'
                        }`}
                        title={c.name}
                      >
                        <span
                          className="w-7 h-7 rounded-full border border-gray-300 shadow-2xs block"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection (Preset & Custom Sizes - Myntra circular pill style) */}
            {currentProduct.sizes && currentProduct.sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Select Size
                  </span>
                  <span className="text-[11px] text-[#D26900] font-semibold">Dimensions in specs</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {currentProduct.sizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-[46px] h-10 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'border-2 border-[#D26900] text-[#D26900] bg-white shadow-2xs'
                            : 'border border-gray-300 text-gray-800 hover:border-gray-500 bg-white'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity, Wishlist & Action CTAs */}
            <div className="space-y-3 pt-2">
              {/* Row 1: Quantity Counter (flex-1) & Wishlist Button (flex-1) perfectly aligned */}
              <div className="flex items-center gap-3">
                {/* Quantity Counter (Exact same width as Add to Cart below) */}
                <div className="flex-1 h-12 px-3 sm:px-4 rounded-xl border border-gray-300 bg-white shadow-2xs flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-black font-bold text-base cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-7 sm:w-8 text-center font-bold text-xs sm:text-sm text-gray-900">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      disabled={
                        isOutOfStock ||
                        (currentProduct.stock_quantity > 0 && quantity >= currentProduct.stock_quantity)
                      }
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-black font-bold text-base cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Wishlist Button (Exact same width as Buy Now below) */}
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className={`flex-1 h-12 px-4 rounded-xl border transition-all duration-200 shadow-2xs flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-98 ${
                    isWishlisted
                      ? 'border-[#535766] bg-[#535766] hover:bg-[#424553] text-white shadow-sm'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#535766] hover:text-gray-900'
                  }`}
                  title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <svg
                    className={`w-4 h-4 ${isWishlisted ? 'fill-[#D26900] text-[#D26900]' : 'fill-none stroke-current'} shrink-0`}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{isWishlisted ? 'WISHLISTED' : 'WISHLIST'}</span>
                </button>
              </div>

              {/* Row 2: ADD TO CART & BUY NOW in ONE UNIFIED ROW */}
              <div className="flex items-center gap-3 pt-0.5">
                {/* Add to Cart */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 px-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                      : 'bg-[#D26900] hover:bg-[#B85800] text-white shadow-sm hover:shadow cursor-pointer active:scale-98'
                  }`}
                >
                  {isOutOfStock ? (
                    <>
                      <span>🚫</span>
                      <span>Out of Stock</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Buy Now (In the same row as Add to Cart) */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`flex-1 h-12 px-4 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'border-2 border-[#D26900] hover:bg-[#D26900] hover:text-white text-[#D26900] active:scale-98 cursor-pointer shadow-2xs group'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Unavailable</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#D26900] group-hover:text-white shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Buy Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* DELHIVERY B2C LOGISTICS & PINCODE SERVICEABILITY CHECKER */}
            {/* ========================================================= */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Delivery Options
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                  Delhivery Express
                </span>
              </div>

              {/* Pincode Input or Checked Pill */}
              {activePincode && !isEditingPincode ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-orange-200 bg-orange-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-gray-700">
                      Deliver to: <strong className="font-mono text-gray-900">{activePincode}</strong>
                      {pincodeDeliveryData?.city && (
                        <span className="text-gray-500 ml-1">({pincodeDeliveryData.city})</span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPincode(true);
                      setPincodeInput(activePincode);
                    }}
                    className="text-xs font-bold text-[#D26900] hover:text-[#B85800] uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckPincode} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={pincodeInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setPincodeInput(val);
                          if (pincodeError) setPincodeError('');
                        }}
                        placeholder="Enter 6-digit Indian PIN code"
                        className="w-full h-11 px-3.5 pr-8 rounded-lg border border-gray-300 bg-white text-xs font-mono font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-sans focus:outline-none focus:border-[#D26900] focus:ring-1 focus:ring-[#D26900] transition-colors"
                      />
                      {pincodeInput && (
                        <button
                          type="button"
                          onClick={() => setPincodeInput('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isCheckingPincode || pincodeInput.trim().length !== 6}
                      className="h-11 px-5 rounded-lg bg-[#D26900] hover:bg-[#B85800] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs hover:shadow cursor-pointer shrink-0"
                    >
                      {isCheckingPincode ? 'Checking...' : 'Check'}
                    </button>
                  </div>
                  {pincodeError && (
                    <p className="text-[11px] text-red-600 font-medium pl-1">{pincodeError}</p>
                  )}
                </form>
              )}

              {/* Delivery Serviceability Highlights */}
              {isCheckingPincode ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
                  <div className="w-3.5 h-3.5 border-2 border-[#D26900] border-t-transparent rounded-full animate-spin" />
                  <span>Checking serviceability with Delhivery courier...</span>
                </div>
              ) : activePincode && pincodeDeliveryData ? (
                pincodeDeliveryData.serviceable ? (
                  <div className="space-y-2 pt-1 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <svg className="w-4 h-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>
                        Get it by <strong className="text-gray-900">{pincodeDeliveryData.estimatedDeliveryDate}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>
                          {pincodeDeliveryData.codAvailable
                            ? 'Cash on Delivery Available'
                            : 'Online Payment Only'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>All India Delivery (Free on ₹499+)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
                    <p className="font-bold">Currently not serviceable</p>
                    <p className="text-[11px] text-red-600">
                      Sorry, Delhivery does not deliver to PIN code {activePincode} at this moment. Please try an alternate PIN code.
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-2 pt-1 border-t border-gray-100 text-[11px] text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D26900]" />
                    <span>Enter your 6-digit PIN code to check exact delivery date & COD availability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D26900]" />
                    <span>Express dispatch across all 28 states & 8 UTs via Delhivery B2C Logistics</span>
                  </div>
                </div>
              )}

              {/* Trust Badges Strip */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#D26900] font-bold">★</span>
                  <span>100% Original Products</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#D26900] font-bold">★</span>
                  <span>Easy 7-Day Returns</span>
                </div>
              </div>
            </div>

            {/* Authentic Craftsmanship Card (Clean white card, NO yellow background) */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <svg className="w-4 h-4 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Authentic YTeddybags Craftsmanship</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#D26900] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100% Non-Toxic PP Plush</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#D26900] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Precision Reinforced Stitching</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#D26900] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ultra-Soft & Shed-Proof</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#D26900] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gentle Child-Safe Zipper</span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT COLUMN DETAILS, HIGHLIGHTS & SPECS */}
            {/* ========================================================= */}
            <div className="pt-6 border-t border-gray-200 space-y-6">
              {/* Product Full Story / Description */}
              {currentProduct.description && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Why You'll Love It
                  </h4>
                  <div className="space-y-2">
                    {currentProduct.why_love_it.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-[#D26900] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-relaxed font-medium">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications (Myntra 2-column key-value grid with See More) */}
              {Array.isArray(currentProduct.specifications) && currentProduct.specifications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#D26900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
                    {(showAllSpecs
                      ? currentProduct.specifications
                      : currentProduct.specifications.slice(0, 4)
                    ).map((spec, idx) => (
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

                  {currentProduct.specifications.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSpecs(!showAllSpecs)}
                      className="text-xs font-bold text-[#D26900] hover:text-[#B85800] hover:underline uppercase tracking-wider pt-1 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {showAllSpecs
                          ? 'See Less'
                          : `See More (${currentProduct.specifications.length - 4} more)`}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          showAllSpecs ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* RATINGS BREAKDOWN SECTION (Exact Image 3 Style with Top Border) */}
              {/* ========================================================= */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  RATINGS
                  <svg
                    className="w-4 h-4 text-gray-400 stroke-current fill-none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </h4>

                <div className="flex items-center gap-6 sm:gap-10 pt-2">
                  {/* Left: Overall Rating & Verified Buyers Count */}
                  <div className="flex flex-col items-start pr-6 sm:pr-8 border-r border-gray-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-4xl sm:text-5xl font-light text-gray-900 tracking-tight leading-none">
                        {currentProduct.rating.toFixed(1)}
                      </span>
                      <span className="text-2xl sm:text-3xl text-[#14958f] leading-none">★</span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-2">
                      {currentProduct.reviews_count >= 1000
                        ? `${(currentProduct.reviews_count / 1000).toFixed(1)}k`
                        : currentProduct.reviews_count}{' '}
                      Verified Buyers
                    </span>
                  </div>

                  {/* Right: Star breakdown bars (5 to 1) */}
                  <div className="flex-1 space-y-1.5 max-w-xs">
                    {[
                      {
                        stars: 5,
                        pct: 71,
                        count: Math.round((currentProduct.reviews_count || 100) * 0.71),
                        color: 'bg-[#14958f]',
                      },
                      {
                        stars: 4,
                        pct: 13,
                        count: Math.round((currentProduct.reviews_count || 100) * 0.13),
                        color: 'bg-[#14958f]',
                      },
                      {
                        stars: 3,
                        pct: 5,
                        count: Math.round((currentProduct.reviews_count || 100) * 0.05),
                        color: 'bg-[#5cd4ca]',
                      },
                      {
                        stars: 2,
                        pct: 3,
                        count: Math.round((currentProduct.reviews_count || 100) * 0.03),
                        color: 'bg-[#f59e0b]',
                      },
                      {
                        stars: 1,
                        pct: 7,
                        count: Math.round((currentProduct.reviews_count || 100) * 0.07),
                        color: 'bg-[#f43f5e]',
                      },
                    ].map((tier) => (
                      <div
                        key={tier.stars}
                        className="flex items-center gap-2 text-xs text-gray-500 font-medium"
                      >
                        <span className="w-5 flex items-center justify-end gap-0.5 text-gray-600 font-normal text-[11px]">
                          {tier.stars} <span className="text-[10px] text-gray-400">★</span>
                        </span>
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${tier.color} rounded-full`}
                            style={{ width: `${tier.pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-gray-700 font-mono text-[11px]">
                          {tier.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RELATED PRODUCTS / MORE YOU'LL ADORE (Up to 50 items, 4 per row, Theme Styled) */}
        {/* ========================================================= */}
        {displayRelatedProducts && displayRelatedProducts.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-900">
                  SIMILAR PRODUCTS
                </h2>
              </div>

              <Link
                to={currentProduct.dropdown_path || currentProduct.header_path || '/products'}
                className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D26900] text-[#D26900] hover:bg-[#D26900] hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-2xs group cursor-pointer"
              >
                <span>View All Catalog</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Grid displaying up to 50 items (4 items per row on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayRelatedProducts.slice(0, 50).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
