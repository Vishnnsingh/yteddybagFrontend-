import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState, AppDispatch } from '../../redux/store';
import {
  updateCartItemQty,
  toggleCartItemSelection,
  toggleSelectAll,
  removeFromCart,
  setGiftingEnabled,
  setDonationAmount,
  updateItemColorAndSize,
  type CartItem,
} from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { useAccount, type UserAddress } from '../../Context/AccountContext';
import AddressModal from '../../Components/AddressModal';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: cartItems, giftingEnabled, donationAmount } = useSelector(
    (state: RootState) => state.cart
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { itemIds: wishlistedIds } = useSelector((state: RootState) => state.wishlist);

  // Dynamic user addresses from AccountContext (Synced with My Account & Database)
  const {
    addresses: accountAddresses,
    fetchAddresses,
    deleteAddress,
  } = useAccount();

  // Load addresses from AccountContext on mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Selected delivery address tracking
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    return localStorage.getItem('yteddy_selected_address_id') || '';
  });

  const selectedAddress = useMemo(() => {
    if (accountAddresses.length === 0) return null;
    const found = accountAddresses.find((a) => a.id === selectedAddressId);
    return found || accountAddresses.find((a) => a.isDefault) || accountAddresses[0];
  }, [accountAddresses, selectedAddressId]);

  // Sync selectedAddressId if missing or unselected
  useEffect(() => {
    if (!selectedAddressId && selectedAddress) {
      setSelectedAddressId(selectedAddress.id);
      try {
        localStorage.setItem('yteddy_selected_address_id', selectedAddress.id);
      } catch {}
    }
  }, [selectedAddress, selectedAddressId]);

  // Address selection modal (Image 1 list) & shared AddressModal (Image 2 form)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddEditAddressModalOpen, setIsAddEditAddressModalOpen] = useState(false);
  const [editingAddressForModal, setEditingAddressForModal] = useState<UserAddress | null>(null);

  // Pincode quick-check state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeCheckResult, setPincodeCheckResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    try {
      localStorage.setItem('yteddy_selected_address_id', id);
    } catch {}
  };

  const handleDeliverHere = (addr: UserAddress) => {
    handleSelectAddress(addr.id);
    setIsAddressModalOpen(false);
    toast.success(`Delivering to ${addr.name}`);
  };

  const handleCheckPincode = () => {
    const trimmed = pincodeInput.trim();
    if (!trimmed || trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setPincodeCheckResult({
        valid: false,
        message: 'Please enter a valid 6-digit pincode',
      });
      return;
    }
    setPincodeCheckResult({
      valid: true,
      message: `Standard delivery available to ${trimmed} within 2-4 days`,
    });
  };

  const handleOpenAddAddress = () => {
    setEditingAddressForModal(null);
    setIsAddEditAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressForModal(addr);
    setIsAddEditAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (accountAddresses.length <= 1) {
      toast.error('At least one address must be saved');
      return;
    }
    const ok = await deleteAddress(id);
    if (ok && selectedAddressId === id) {
      const remaining = accountAddresses.filter((a) => a.id !== id);
      if (remaining.length > 0) {
        handleSelectAddress(remaining[0].id);
      }
    }
  };

  // Modal state for changing Size & Quantity
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [modalSize, setModalSize] = useState<string>('');
  const [modalQty, setModalQty] = useState<number>(1);

  // Offers strip carousel index
  const [offerIndex, setOfferIndex] = useState(0);
  const offersList = [
    {
      title: '7.5% Assured Cashback*',
      subtitle: 'on a minimum spend of ₹799. Applicable on all payment modes.',
      badge: 'BANK OFFER',
    },
    {
      title: 'Free Express Shipping*',
      subtitle: 'Guaranteed 2-3 day delivery across all metro cities in India.',
      badge: 'LIMITED TIME',
    },
    {
      title: 'Complimentary Surprise Gift*',
      subtitle: 'Get a collectible mini plush charm on orders over ₹1,499.',
      badge: 'EXCLUSIVE',
    },
    {
      title: 'Flat ₹150 Instant Cashback*',
      subtitle: 'on UPI payments above ₹999 using PayTM, PhonePe or GPay.',
      badge: 'UPI OFFER',
    },
  ];

  // Selection calculations
  const selectedItems = useMemo(
    () => cartItems.filter((item) => item.isSelected),
    [cartItems]
  );
  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < cartItems.length;

  // Price calculations
  const totalMrp = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + (item.product?.mrp || item.product?.price || 0) * item.quantity,
        0
      ),
    [selectedItems]
  );

  const totalSellingPrice = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      ),
    [selectedItems]
  );

  const discountOnMrp = totalMrp > totalSellingPrice ? totalMrp - totalSellingPrice : 0;
  const giftingFee = giftingEnabled ? 35 : 0;
  const finalTotal = Math.max(0, totalSellingPrice + giftingFee + donationAmount);

  // Handle select/deselect all
  const handleToggleSelectAll = () => {
    dispatch(toggleSelectAll(!allSelected));
  };

  // Remove selected items
  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) {
      toast.info('No items selected to remove');
      return;
    }
    selectedItems.forEach((item) => {
      dispatch(removeFromCart(item.id));
    });
    toast.success(`Removed ${selectedItems.length} items from Bag`);
  };

  // Move selected items to wishlist
  const handleMoveSelectedToWishlist = () => {
    if (selectedItems.length === 0) {
      toast.info('No items selected to move');
      return;
    }
    selectedItems.forEach((item) => {
      if (!wishlistedIds.includes(item.product.id)) {
        dispatch(toggleWishlist(item.product));
      }
      dispatch(removeFromCart(item.id));
    });
    toast.success(`Moved ${selectedItems.length} items to Wishlist`);
  };

  // Move single item to wishlist
  const handleMoveSingleToWishlist = (item: CartItem) => {
    if (!wishlistedIds.includes(item.product.id)) {
      dispatch(toggleWishlist(item.product));
    }
    dispatch(removeFromCart(item.id));
    toast.success(`Moved "${item.product.title}" to Wishlist`);
  };

  // Open Size & Quantity Edit Modal
  const handleOpenEditModal = (item: CartItem) => {
    setEditingItem(item);
    setModalSize(item.selectedSize || '');
    setModalQty(item.quantity);
  };

  const handleSaveItemEdit = () => {
    if (editingItem) {
      dispatch(
        updateItemColorAndSize({
          id: editingItem.id,
          selectedSize: modalSize || null,
        })
      );
      dispatch(
        updateCartItemQty({
          id: editingItem.id,
          quantity: modalQty,
        })
      );
      setEditingItem(null);
      toast.success('Updated item preferences');
    }
  };

  // Place order -> Navigate to Address step
  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least 1 item to place order');
      return;
    }
    if (!isAuthenticated) {
      toast.info('Please log in to proceed to checkout');
      navigate('/login', { state: { from: '/checkout/address' } });
      return;
    }
    navigate('/checkout/address');
  };

  // Estimated delivery date string (Current date + 4 days)
  const estimatedDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#282C3F] pb-24 lg:pb-16 font-sans">
      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {cartItems.length === 0 ? (
          /* EMPTY CART STATE */
          <div className="bg-white rounded-2xl p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs border border-[#EAEAEC] my-8">
            <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-[#FFF5EB] flex items-center justify-center text-[#D26900]">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#282C3F] tracking-tight mb-2">
              Hey, your bag is empty!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto">
              There is nothing in your bag right now. Let's add some of our handcrafted teddy bags and plush companions!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Explore Catalog
              </Link>
              <Link
                to="/wishlist"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-[#282C3F] font-bold text-xs uppercase tracking-wider transition-colors border border-[#D4D5D9]"
              >
                View Wishlist
              </Link>
            </div>
          </div>
        ) : (
          /* CART CONTENT: 2 COLUMNS (Left: Items & Offers, Right: Flat Price Details) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">
            {/* LEFT COLUMN: 7 / 12 (Items, Delivery Box, Offers) with Right Border Divider */}
            <div className="lg:col-span-7 lg:pr-8 xl:pr-10 lg:border-r lg:border-[#EAEAEC] space-y-4 pb-10">
              {/* Deliver to address box */}
              <div className="border border-[#EAEAEC] rounded-xs sm:rounded-sm p-3.5 sm:p-4 flex items-center justify-between bg-white">
                <div className="text-xs space-y-1 pr-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-500 font-medium">Deliver to:</span>
                    <span className="font-extrabold text-[#282C3F]">
                      {selectedAddress ? `${selectedAddress.name}, ${selectedAddress.pincode}` : 'No Address Selected'}
                    </span>
                  </div>
                  <p className="text-gray-600 truncate max-w-xs sm:max-w-md text-[11px] sm:text-xs">
                    {selectedAddress
                      ? `${selectedAddress.address}${selectedAddress.locality ? `, ${selectedAddress.locality}` : ''}, ${selectedAddress.city}`
                      : 'Please add your delivery address to complete your order.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (accountAddresses.length === 0) {
                      handleOpenAddAddress();
                    } else {
                      setIsAddressModalOpen(true);
                    }
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xs sm:rounded-sm border border-[#D26900] text-[#D26900] hover:bg-[#FFF7ED] text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {selectedAddress ? 'CHANGE ADDRESS' : '+ ADD ADDRESS'}
                </button>
              </div>

              {/* Myntra-style Large Offers Card */}
              <div className="border border-[#EAEAEC] rounded-xs sm:rounded-sm p-3.5 sm:p-4 bg-white space-y-3">
                {/* Offers Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-black text-gray-700">
                      %
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#282C3F]">
                      Offers ({offersList.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <button
                      type="button"
                      onClick={() => setOfferIndex((prev) => (prev > 0 ? prev - 1 : offersList.length - 1))}
                      className="w-6 h-6 flex items-center justify-center hover:text-black cursor-pointer font-bold text-base transition-colors"
                      aria-label="Previous Offer"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferIndex((prev) => (prev < offersList.length - 1 ? prev + 1 : 0))}
                      className="w-6 h-6 flex items-center justify-center hover:text-black cursor-pointer font-bold text-base transition-colors"
                      aria-label="Next Offer"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Offer Card Container with Bank/Credit Card Visual Graphic */}
                <div className="border border-[#EAEAEC] rounded-xs sm:rounded-sm p-3 sm:p-4 bg-white flex items-center gap-3.5">
                  {/* Graphical Bank / Reward Card visual */}
                  <div className="w-13 h-8.5 sm:w-15 sm:h-9.5 rounded-xs bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-1.5 flex flex-col justify-between shrink-0 shadow-xs border border-neutral-700 relative overflow-hidden select-none">
                    <div className="w-2.5 h-1.5 rounded-2xs bg-amber-400/90" />
                    <div className="flex items-center justify-between">
                      <span className="text-[6.5px] font-mono text-white/70 font-semibold tracking-wider">YTEDDY</span>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-90" />
                    </div>
                  </div>

                  {/* Offer Title & Terms */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-[#282C3F]">
                        {offersList[offerIndex].title}
                      </span>
                      {offersList[offerIndex].badge && (
                        <span className="text-[9px] font-extrabold bg-[#D26900]/10 text-[#D26900] px-1.5 py-0.5 rounded-2xs uppercase tracking-wider">
                          {offersList[offerIndex].badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-500 leading-snug mt-0.5">
                      {offersList[offerIndex].subtitle}{' '}
                      <span className="font-semibold text-gray-700 cursor-pointer hover:underline">T&C</span>
                    </p>
                  </div>
                </div>

                {/* Offer Carousel Dots */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {offersList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setOfferIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === offerIndex ? 'w-3.5 bg-[#D26900]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to offer ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Selection Summary Header Bar */}
              <div className="flex items-center justify-between py-2 text-xs font-bold text-[#282C3F]">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded-xs text-[#D26900] focus:ring-[#D26900] accent-[#D26900] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-extrabold text-[#282C3F] tracking-wide">
                    {selectedItems.length}/{cartItems.length} ITEMS SELECTED
                  </span>
                </label>

                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                  <button
                    type="button"
                    onClick={handleRemoveSelected}
                    className="hover:text-red-600 transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    REMOVE
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleMoveSelectedToWishlist}
                    className="hover:text-[#D26900] transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>MOVE TO WISHLIST</span>
                  </button>
                </div>
              </div>

              {/* Cart Items Cards */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const product = item.product;
                  const primaryImg =
                    product?.primary_image ||
                    (product?.images && product.images[0]?.url) ||
                    '';
                  const mrp = product?.mrp || product?.price || 0;
                  const price = product?.price || 0;
                  const discountOff = mrp > price ? mrp - price : 0;
                  const discountPercent =
                    product?.discount_percent ||
                    (mrp > price ? Math.round((discountOff / mrp) * 100) : 0);

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border transition-all duration-200 rounded-xs sm:rounded-sm p-3 sm:p-4 relative ${
                        item.isSelected ? 'border-[#EAEAEC]' : 'border-gray-200 opacity-75'
                      }`}
                    >
                      {/* Close/Remove Button in top right */}
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={item.isSelected}
                            onChange={() =>
                              dispatch(
                                toggleCartItemSelection({
                                  id: item.id,
                                  isSelected: !item.isSelected,
                                })
                              )
                            }
                            className="w-4 h-4 rounded-xs text-[#D26900] focus:ring-[#D26900] accent-[#D26900] cursor-pointer"
                          />
                        </div>

                        {/* Product Thumbnail */}
                        <Link
                          to={product?.slug ? `/product/${product.slug}` : `/product/${product?.id}`}
                          className="w-20 h-24 sm:w-24 sm:h-28 rounded-xs overflow-hidden bg-gray-100 shrink-0 border border-gray-100 block"
                        >
                          {primaryImg ? (
                            <img
                              src={primaryImg}
                              alt={product?.title || 'Cart Item'}
                              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                              No Image
                            </div>
                          )}
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="pr-6">
                            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                              {(product as any)?.brand || product?.subtitle || 'YTeddybags'}
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold text-[#282C3F] truncate">
                              <Link
                                to={product?.slug ? `/product/${product.slug}` : `/product/${product?.id}`}
                                className="hover:text-[#D26900] transition-colors"
                              >
                                {product?.title || 'Product'}
                              </Link>
                            </h3>
                            <p className="text-[10px] text-gray-400 truncate">
                              Sold by: YTeddybags Official
                            </p>
                          </div>

                          {/* Size & Qty Selection Pills - Sleek Myntra-style compact pills */}
                          <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 flex-wrap">
                            {/* Size selector pill */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="inline-flex items-center gap-1 bg-[#F5F5F6] hover:bg-[#EAEAEC] active:bg-[#DFDFE2] px-2 sm:px-2.5 py-1 rounded-xs text-[11px] sm:text-xs text-[#282C3F] whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-[#EAEAEC]"
                            >
                              <span className="text-gray-500 font-medium">Size:</span>
                              <span className="font-extrabold">{item.selectedSize || 'Standard'}</span>
                              <svg className="w-2.5 h-2.5 text-gray-500 shrink-0 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* Qty selector pill */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="inline-flex items-center gap-1 bg-[#F5F5F6] hover:bg-[#EAEAEC] active:bg-[#DFDFE2] px-2 sm:px-2.5 py-1 rounded-xs text-[11px] sm:text-xs text-[#282C3F] whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-[#EAEAEC]"
                            >
                              <span className="text-gray-500 font-medium">Qty:</span>
                              <span className="font-extrabold">{item.quantity}</span>
                              <svg className="w-2.5 h-2.5 text-gray-500 shrink-0 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* Selected Color indicator if any */}
                            {item.selectedColor && (
                              <span className="text-[10px] text-gray-500 font-medium px-2 py-0.5 bg-gray-50 rounded-xs border border-gray-100 hidden sm:inline-block">
                                Color: {item.selectedColor}
                              </span>
                            )}
                          </div>

                          {/* Price Row (Selling Price, MRP, Discount) */}
                          <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                            <span className="text-sm sm:text-base font-extrabold text-[#282C3F]">
                              ₹{price * item.quantity}
                            </span>
                            {mrp > price && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{mrp * item.quantity}
                              </span>
                            )}
                            {discountOff > 0 && (
                              <span className="text-xs font-bold text-[#D26900]">
                                ₹{discountOff * item.quantity} OFF ({discountPercent}% OFF)
                              </span>
                            )}
                          </div>

                          {/* Delivery info & Return note */}
                          <div className="pt-1 space-y-0.5 text-[11px] text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span><strong>7 days</strong> return available</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>
                                Delivery by{' '}
                                <strong className="text-gray-900">{estimatedDeliveryDate}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Move to Wishlist action link with SVG Heart */}
                          <div className="pt-2 border-t border-gray-100 mt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleMoveSingleToWishlist(item)}
                              className="text-[11px] sm:text-xs font-bold text-[#D26900] hover:text-[#B85800] transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wide"
                            >
                              <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>Move to Wishlist</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: 5 / 12 (Flat Myntra-style: Gifting, Welfare, Price Details - No Heavy Outer Cards) */}
            <div className="lg:col-span-5 lg:pl-8 xl:pl-10 space-y-6 pt-6 lg:pt-0 pb-12">
              {/* Gifting & Personalisation */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 block">
                  GIFTING & PERSONALISATION
                </span>
                <div className="bg-[#FFF8F3] border border-[#FCE3D2] rounded-xs sm:rounded-sm p-3.5 sm:p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shrink-0 shadow-2xs border border-[#FDE3CE]">
                    🎁
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      Buying for a loved one?
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-600 leading-snug mt-0.5">
                      Premium gift wrapping & personalised message card, Only for ₹35
                    </p>
                    <button
                      type="button"
                      onClick={() => dispatch(setGiftingEnabled(!giftingEnabled))}
                      className="mt-2 text-xs font-extrabold text-[#D26900] hover:text-[#B85800] uppercase tracking-wider cursor-pointer transition-colors block"
                    >
                      {giftingEnabled ? '✓ REMOVE GIFT PACKAGE' : '+ ADD GIFT PACKAGE'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Support Social Work / Children Welfare in India */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 block">
                  SUPPORT CHILDREN WELFARE IN INDIA
                </span>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-800 select-none">
                  <input
                    type="checkbox"
                    checked={donationAmount > 0}
                    onChange={(e) => dispatch(setDonationAmount(e.target.checked ? 10 : 0))}
                    className="w-4 h-4 rounded-xs text-[#D26900] focus:ring-[#D26900] accent-[#D26900] cursor-pointer"
                  />
                  <span>Donate and make a difference</span>
                </label>

                {/* Donation Pills */}
                <div className="flex items-center gap-2 pt-0.5">
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() =>
                        dispatch(setDonationAmount(donationAmount === amt ? 0 : amt))
                      }
                      className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        donationAmount === amt
                          ? 'bg-[#D26900] text-white border-[#D26900]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => toast.info('Your contributions support education and well-being of underprivileged children across India.')}
                  className="text-[11px] font-bold text-[#D26900] hover:underline cursor-pointer block"
                >
                  Know More
                </button>
              </div>

              {/* PRICE DETAILS (Flat structure matching Image 2 reference, no heavy card wrapper) */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                  PRICE DETAILS ({selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'})
                </span>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Total MRP */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total MRP</span>
                    <span className="font-semibold text-gray-900">₹{totalMrp.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Discount on MRP */}
                  {discountOnMrp > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Discount on MRP</span>
                      <span className="font-bold text-emerald-600">
                        - ₹{discountOnMrp.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {/* Gifting Packaging */}
                  {giftingEnabled && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Gift Packaging</span>
                      <span className="font-semibold text-gray-900">₹35</span>
                    </div>
                  )}

                  {/* Donation */}
                  {donationAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Social Donation</span>
                      <span className="font-semibold text-gray-900">₹{donationAmount}</span>
                    </div>
                  )}

                  {/* Platform Fee */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <span>Platform Fee</span>
                      <span className="text-[10px] text-[#D26900] font-bold bg-[#D26900]/10 px-1 py-0.5 rounded-2xs">
                        Offer
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="line-through text-gray-400 font-normal">₹10</span>
                      <span className="text-emerald-600">FREE</span>
                    </div>
                  </div>

                  {/* Shipping Fee */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping Fee</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="line-through text-gray-400 font-normal">₹49</span>
                      <span className="text-emerald-600">FREE</span>
                    </div>
                  </div>
                </div>

                {/* Total Amount, Terms & Place Order Button */}
                <div className="border-t border-[#EAEAEC] pt-4 space-y-3.5">
                  <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[#282C3F]">
                    <span>Total Amount</span>
                    <span>
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Desktop Only: Terms & Inline Place Order button (hidden on mobile, bottom bar is used on mobile) */}
                  <div className="hidden lg:block space-y-3.5">
                    <p className="text-[10px] text-gray-500 leading-snug">
                      By placing the order, you agree to YTeddybags{' '}
                      <Link to="/terms" className="text-[#D26900] underline font-medium">Terms of Use</Link> and{' '}
                      <Link to="/privacy" className="text-[#D26900] underline font-medium">Privacy Policy</Link>.
                    </p>

                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={selectedItems.length === 0}
                      className={`w-full py-3.5 px-4 rounded-xs sm:rounded-sm font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                        selectedItems.length === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#D26900] hover:bg-[#B85800] text-white active:scale-[0.99] hover:shadow'
                      }`}
                    >
                      <span>PLACE ORDER</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. STICKY BOTTOM BAR FOR MOBILE & TABLET (< 1024px) */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAEAEC] p-3 px-4 z-40 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-[#282C3F] block">Total Amount</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#282C3F]">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-medium text-gray-500">
                ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={selectedItems.length === 0}
            className={`py-3 px-6 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
              selectedItems.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#D26900] hover:bg-[#B85800] text-white shadow-sm'
            }`}
          >
            <span>PLACE ORDER</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* 4. SELECT / CHANGE DELIVERY ADDRESS MODAL (Dynamic & Connected with My Account) */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-lg shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden max-w-lg w-full"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#EAEAEC] shrink-0">
                <h3 className="font-extrabold text-base text-[#282C3F]">
                  Select Delivery Address
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-base leading-none"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4 space-y-3.5">
                {/* Enter Pincode Box */}
                <div>
                  <div className="border border-[#D4D5D9] rounded-md px-3.5 py-2.5 flex items-center justify-between focus-within:border-[#D26900] transition-colors bg-white">
                    <input
                      type="text"
                      value={pincodeInput}
                      onChange={(e) => {
                        setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setPincodeCheckResult(null);
                      }}
                      placeholder="Enter Pincode"
                      className="text-xs sm:text-sm font-semibold text-[#282C3F] placeholder:text-gray-400 outline-none w-full mr-2"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleCheckPincode}
                      className="text-xs font-extrabold text-gray-500 hover:text-[#D26900] tracking-wider uppercase shrink-0 transition-colors cursor-pointer"
                    >
                      CHECK
                    </button>
                  </div>
                  {pincodeCheckResult && (
                    <div
                      className={`text-[11px] font-semibold mt-1 px-1 ${
                        pincodeCheckResult.valid ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {pincodeCheckResult.message}
                    </div>
                  )}
                </div>

                {/* Section Header: SAVED ADDRESS + Add New Address */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-extrabold tracking-wider uppercase text-gray-500 text-[11px] sm:text-xs">
                    SAVED ADDRESS
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="font-bold text-[#D26900] hover:text-[#B85800] tracking-tight transition-colors cursor-pointer text-xs"
                  >
                    + Add New Address
                  </button>
                </div>

                {/* Addresses List from My Account */}
                {accountAddresses.length === 0 ? (
                  <div className="text-center py-8 px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-[#D26900] flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                      📍
                    </div>
                    <p className="text-sm font-bold text-gray-800">No saved addresses found</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      Add your delivery address to proceed with placing your order.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="mt-4 px-6 py-2.5 bg-[#D26900] hover:bg-[#B85800] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs"
                    >
                      Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accountAddresses.map((addr) => {
                      const isSelected = addr.id === selectedAddressId;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr.id)}
                          className={`rounded-md p-3.5 sm:p-4 border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#EAEAEC] bg-white shadow-2xs'
                              : 'border-[#EAEAEC] hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Radio Button */}
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors ${
                                  isSelected ? 'border-[#D26900]' : 'border-gray-400'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#D26900]" />
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center flex-wrap gap-1.5">
                                  <span className="font-bold text-xs sm:text-sm text-[#282C3F]">
                                    {addr.name}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[11px] text-gray-400 font-normal">
                                      (Default)
                                    </span>
                                  )}
                                </div>
                                <span className="border border-[#03A685] text-[#03A685] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                  {addr.type || 'HOME'}
                                </span>
                              </div>

                              {isSelected ? (
                                <>
                                  <p className="text-[11px] sm:text-xs text-gray-600 mt-1.5 leading-relaxed">
                                    {addr.address}
                                    {addr.locality ? (
                                      <>
                                        <br />
                                        {addr.locality}
                                      </>
                                    ) : null}
                                    <br />
                                    {addr.city}, {addr.state} - {addr.pincode}
                                  </p>
                                  <p className="text-[11px] sm:text-xs text-gray-600 mt-2">
                                    Mobile:{' '}
                                    <span className="font-bold text-[#282C3F]">{addr.mobile}</span>
                                  </p>

                                  {/* Action Buttons Row */}
                                  <div className="flex items-center gap-2 sm:gap-2.5 mt-3 pt-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeliverHere(addr);
                                      }}
                                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#EAEAEC] hover:bg-[#DCDDE0] text-[#282C3F] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                                    >
                                      DELIVERING HERE
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditAddress(addr);
                                      }}
                                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 border border-[#282C3F] hover:bg-gray-50 text-[#282C3F] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                                    >
                                      EDIT
                                    </button>
                                    {accountAddresses.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAddress(addr.id);
                                        }}
                                        className="p-1.5 sm:p-2 border border-[#282C3F] hover:bg-red-50 hover:text-red-600 hover:border-red-400 text-[#282C3F] rounded-sm transition-colors cursor-pointer"
                                        title="Delete address"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <p className="text-[11px] sm:text-xs text-gray-500 mt-1 truncate">
                                  {addr.address}, {addr.city}...
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Full-Width ADD NEW ADDRESS Button */}
              <div className="p-4 sm:p-5 border-t border-[#EAEAEC] shrink-0 bg-white">
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="w-full py-3 border-2 border-[#282C3F] hover:bg-[#D26900] hover:text-white hover:border-[#D26900] text-[#282C3F] font-extrabold text-xs uppercase tracking-widest rounded-md transition-colors cursor-pointer"
                >
                  ADD NEW ADDRESS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. ADD / EDIT ADDRESS MODAL (Exact same My Account component) */}
      <AddressModal
        isOpen={isAddEditAddressModalOpen}
        editingAddress={editingAddressForModal}
        onClose={() => setIsAddEditAddressModalOpen(false)}
        onSuccess={(savedId) => {
          if (savedId) {
            handleSelectAddress(savedId);
          }
        }}
      />

      {/* 5. SIZE & QUANTITY EDIT MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-sm sm:text-base text-[#282C3F]">
                  Select Size & Quantity
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {(editingItem.product?.sizes && editingItem.product.sizes.length > 0
                    ? editingItem.product.sizes
                    : ['Standard', 'Medium', 'Large', 'Extra Large']
                  ).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setModalSize(sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-colors cursor-pointer ${
                        modalSize === sz
                          ? 'border-[#D26900] bg-[#FFF8F3] text-[#D26900]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Select Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-extrabold text-sm text-[#282C3F]">
                    {modalQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => Math.min(10, q + 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveItemEdit}
                  className="w-full py-3 rounded-xl bg-[#D26900] hover:bg-[#B85800] text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
