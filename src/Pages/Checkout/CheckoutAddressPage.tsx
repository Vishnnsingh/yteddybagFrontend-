import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '../../redux/store';
import { useAccount, type UserAddress } from '../../Context/AccountContext';
import AddressModal from '../../Components/AddressModal';

export default function CheckoutAddressPage() {
  const navigate = useNavigate();

  const { items: cartItems, giftingEnabled, donationAmount } = useSelector(
    (state: RootState) => state.cart
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Require login to checkout address
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to proceed with checkout');
      navigate('/login', { state: { from: '/checkout/address' } });
    }
  }, [isAuthenticated, navigate]);

  // Dynamic user addresses from AccountContext (Synced with My Account & Database)
  const {
    addresses: accountAddresses,
    fetchAddresses,
    deleteAddress,
  } = useAccount();

  // Load addresses on mount
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

  // Auto-sync selectedAddressId if missing
  useEffect(() => {
    if (!selectedAddressId && selectedAddress) {
      setSelectedAddressId(selectedAddress.id);
      try {
        localStorage.setItem('yteddy_selected_address_id', selectedAddress.id);
      } catch {}
    }
  }, [selectedAddress, selectedAddressId]);

  // Shared AddressModal state (Same modal used across My Account & Cart)
  const [isAddEditAddressModalOpen, setIsAddEditAddressModalOpen] = useState(false);
  const [editingAddressForModal, setEditingAddressForModal] = useState<UserAddress | null>(null);

  // Selected cart items
  const selectedItems = useMemo(
    () => cartItems.filter((item) => item.isSelected),
    [cartItems]
  );

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

  // Split into Default Address and Other Addresses (Matching Myntra Image 2 layout)
  const defaultAddress = useMemo(() => {
    if (accountAddresses.length === 0) return null;
    return accountAddresses.find((a) => a.isDefault) || accountAddresses[0];
  }, [accountAddresses]);

  const otherAddresses = useMemo(() => {
    if (!defaultAddress) return [];
    return accountAddresses.filter((a) => a.id !== defaultAddress.id);
  }, [accountAddresses, defaultAddress]);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    try {
      localStorage.setItem('yteddy_selected_address_id', id);
    } catch {}
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
    if (ok) {
      toast.success('Address removed successfully');
      if (selectedAddressId === id) {
        const remaining = accountAddresses.filter((a) => a.id !== id);
        if (remaining.length > 0) {
          handleSelectAddress(remaining[0].id);
        }
      }
    }
  };

  const handleAddressSaved = (savedId?: string) => {
    if (savedId) {
      handleSelectAddress(savedId);
    }
    setIsAddEditAddressModalOpen(false);
  };

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address to continue');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Your bag has no selected items');
      navigate('/cart');
      return;
    }
    navigate('/checkout/payment');
  };

  // If cart is empty, redirect back to cart
  if (cartItems.length === 0 || selectedItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFF5EB] flex items-center justify-center text-[#D26900] mb-4 text-3xl">
          🛍️
        </div>
        <h2 className="text-xl font-bold text-[#282C3F] mb-2">No items selected for checkout</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6">
          Please select items in your bag before proceeding to address and payment.
        </p>
        <Link
          to="/cart"
          className="px-6 py-2.5 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors"
        >
          Return to Bag
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#282C3F] pb-24 lg:pb-16 font-sans">
      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">
          {/* LEFT COLUMN: 7 / 12 (Select Delivery Address & Address Cards) */}
          <div className="lg:col-span-7 lg:pr-8 xl:pr-10 lg:border-r lg:border-[#EAEAEC] space-y-6 pb-12">
            {/* Header: Title + Add New Address Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#282C3F]">
                Select Delivery Address
              </h2>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="px-3.5 py-1.5 rounded-xs sm:rounded-sm border border-[#282C3F] hover:border-[#D26900] hover:text-[#D26900] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                + ADD NEW ADDRESS
              </button>
            </div>

            {/* Empty State: No Addresses Saved */}
            {accountAddresses.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-xs sm:rounded-sm p-8 text-center bg-gray-50/50 space-y-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-[#D26900] flex items-center justify-center mx-auto text-xl">
                  📍
                </div>
                <h3 className="text-sm font-bold text-gray-800">No Delivery Address Found</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Please add your delivery address to complete your order.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="mt-2 px-6 py-2.5 bg-[#D26900] hover:bg-[#B85800] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  + Add New Address
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. DEFAULT ADDRESS SECTION */}
                {defaultAddress && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                      DEFAULT ADDRESS
                    </span>

                    {(() => {
                      const addr = defaultAddress;
                      const isSelected = addr.id === selectedAddressId;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr.id)}
                          className={`border rounded-xs sm:rounded-sm p-4 sm:p-5 bg-white relative transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#EAEAEC] shadow-2xs'
                              : 'border-[#EAEAEC] hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Radio Button */}
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'border-[#D26900]'
                                    : 'border-gray-400 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#D26900]" />
                                )}
                              </div>
                            </div>

                            {/* Address Details */}
                            <div className="flex-1 min-w-0">
                              {/* Name & Badge */}
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-extrabold text-[#282C3F] text-sm sm:text-base">
                                  {addr.name}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500 text-teal-600 uppercase tracking-wide">
                                  {addr.type || 'HOME'}
                                </span>
                              </div>

                              {/* Street & Locality */}
                              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                                {addr.address}
                                {addr.locality ? `, ${addr.locality}` : ''}
                              </p>

                              {/* City, State - Pincode */}
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>

                              {/* Phone */}
                              <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-2">
                                Mobile:{' '}
                                <span className="font-bold text-[#282C3F]">
                                  {addr.mobile}
                                </span>
                              </p>

                              {/* Delivery Badge */}
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2 font-medium">
                                <span>•</span>
                                <span>Pay on Delivery available</span>
                              </div>

                              {/* Action Buttons (REMOVE / EDIT) shown when selected */}
                              {isSelected && (
                                <div className="flex items-center gap-3 pt-3.5 mt-3.5 border-t border-gray-100">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAddress(addr.id);
                                    }}
                                    className="px-4 py-1.5 rounded-xs sm:rounded-sm border border-[#282C3F] hover:border-red-600 hover:text-red-600 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    REMOVE
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditAddress(addr);
                                    }}
                                    className="px-4 py-1.5 rounded-xs sm:rounded-sm border border-[#282C3F] hover:border-[#D26900] hover:text-[#D26900] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    EDIT
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. OTHER ADDRESSES SECTION */}
                {otherAddresses.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                      OTHER ADDRESS
                    </span>

                    <div className="space-y-3">
                      {otherAddresses.map((addr) => {
                        const isSelected = addr.id === selectedAddressId;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr.id)}
                            className={`border rounded-xs sm:rounded-sm p-4 sm:p-5 bg-white relative transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#EAEAEC] shadow-2xs'
                                : 'border-[#EAEAEC] hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              {/* Radio Button */}
                              <div className="pt-0.5 shrink-0">
                                <div
                                  className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'border-[#D26900]'
                                      : 'border-gray-400 bg-white'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#D26900]" />
                                  )}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="font-extrabold text-[#282C3F] text-sm sm:text-base">
                                    {addr.name}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500 text-teal-600 uppercase tracking-wide">
                                    {addr.type || 'HOME'}
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                                  {addr.address}
                                  {addr.locality ? `, ${addr.locality}` : ''}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>

                                <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-2">
                                  Mobile:{' '}
                                  <span className="font-bold text-[#282C3F]">
                                    {addr.mobile}
                                  </span>
                                </p>

                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2 font-medium">
                                  <span>•</span>
                                  <span>Pay on Delivery available</span>
                                </div>

                                {/* Action Buttons shown when selected */}
                                {isSelected && (
                                  <div className="flex items-center gap-3 pt-3.5 mt-3.5 border-t border-gray-100">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAddress(addr.id);
                                      }}
                                      className="px-4 py-1.5 rounded-xs sm:rounded-sm border border-[#282C3F] hover:border-red-600 hover:text-red-600 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      REMOVE
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditAddress(addr);
                                      }}
                                      className="px-4 py-1.5 rounded-xs sm:rounded-sm border border-[#282C3F] hover:border-[#D26900] hover:text-[#D26900] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      EDIT
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. + ADD NEW ADDRESS DASHED BOX (Exact match with Image 2) */}
                <div
                  onClick={handleOpenAddAddress}
                  className="border border-dashed border-[#D4D5D9] hover:border-[#D26900] rounded-xs sm:rounded-sm p-4 text-[#D26900] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors bg-white hover:bg-orange-50/20"
                >
                  <span className="text-base font-bold">+</span>
                  <span>Add New Address</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: 5 / 12 (Delivery Estimates & Price Details) */}
          <div className="lg:col-span-5 lg:pl-8 xl:pl-10 space-y-6 pt-6 lg:pt-0 pb-12">
            {/* DELIVERY ESTIMATES */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                DELIVERY ESTIMATES
              </span>

              <div className="space-y-2.5">
                {selectedItems.map((item) => {
                  const product = item.product;
                  const primaryImg =
                    product?.primary_image ||
                    (product?.images && product.images[0]?.url) ||
                    '';

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-1 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-10 h-12 rounded-xs overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        {primaryImg ? (
                          <img
                            src={primaryImg}
                            alt={product?.title || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                            Bag
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="text-gray-700">
                          Estimated delivery by{' '}
                          <strong className="text-gray-900 font-extrabold">
                            {estimatedDeliveryDate}
                          </strong>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRICE DETAILS (Flat structure matching Image 2 reference) */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                PRICE DETAILS ({selectedItems.length}{' '}
                {selectedItems.length === 1 ? 'Item' : 'Items'})
              </span>

              <div className="space-y-2.5 text-xs sm:text-sm">
                {/* Total MRP */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total MRP</span>
                  <span className="font-semibold text-gray-900">
                    ₹{totalMrp.toLocaleString('en-IN')}
                  </span>
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
                    <span className="font-semibold text-gray-900">
                      ₹{donationAmount}
                    </span>
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

              {/* Total Amount & CONTINUE Button */}
              <div className="border-t border-[#EAEAEC] pt-4 space-y-4">
                <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[#282C3F]">
                  <span>Total Amount</span>
                  <span>
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Desktop Only: Inline CONTINUE button (hidden on mobile, bottom bar is used on mobile) */}
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  disabled={!selectedAddress}
                  className={`hidden lg:flex w-full py-3.5 px-4 rounded-xs sm:rounded-sm font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 items-center justify-center gap-2 cursor-pointer shadow-sm ${
                    !selectedAddress
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#D26900] hover:bg-[#B85800] text-white active:scale-[0.99] hover:shadow'
                  }`}
                >
                  <span>CONTINUE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR FOR MOBILE (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAEAEC] p-3 px-4 z-40 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xs font-bold text-[#282C3F] block">
            Total Amount
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-[#282C3F]">
              ₹{finalTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinueToPayment}
          disabled={!selectedAddress}
          className={`py-3 px-8 rounded-xs font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
            !selectedAddress
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#D26900] hover:bg-[#B85800] text-white shadow-sm'
          }`}
        >
          <span>CONTINUE</span>
        </button>
      </div>

      {/* SHARED ADDRESS MODAL (Exact same component as My Account & Cart) */}
      <AddressModal
        isOpen={isAddEditAddressModalOpen}
        editingAddress={editingAddressForModal}
        onClose={() => setIsAddEditAddressModalOpen(false)}
        onSuccess={handleAddressSaved}
      />
    </div>
  );
}
