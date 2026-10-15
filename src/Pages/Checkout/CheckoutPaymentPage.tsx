import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState, AppDispatch } from '../../redux/store';
import { clearCart } from '../../redux/slices/cartSlice';
import { useAccount } from '../../Context/AccountContext';
import { useCreateOrderMutation } from '../../hooks/useOrdersQuery';

// --- PROFESSIONAL SVG VECTOR ICONS (Fixed exact 20px size & Myntra style) ---
function StarIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px' }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CashIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '20px', height: '15px', minWidth: '20px', minHeight: '15px' }}
      viewBox="0 0 24 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <rect x="1" y="1" width="22" height="14" rx="2" />
      <circle cx="12" cy="8" r="3" />
      <line x1="4" y1="8" x2="4.01" y2="8" strokeWidth="2" />
      <line x1="20" y1="8" x2="20.01" y2="8" strokeWidth="2" />
    </svg>
  );
}

function UpiIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '22px', height: '12px', minWidth: '22px', minHeight: '12px' }}
      viewBox="0 0 28 14"
      fill="none"
      className={`shrink-0 ${className}`}
    >
      <path d="M6 1L11 7L6 13H1L6 7L1 1H6Z" fill="#707070" />
      <path d="M12 1L17 7L12 13H7L12 7L7 1H12Z" fill="currentColor" />
      <path
        d="M19 2.5V8.5C19 10 20.2 11.2 21.7 11.2C23.2 11.2 24.4 10 24.4 8.5V2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '20px', height: '15px', minWidth: '20px', minHeight: '15px' }}
      viewBox="0 0 22 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <rect x="1" y="1" width="20" height="14" rx="2" />
      <line x1="1" y1="5.5" x2="21" y2="5.5" />
      <line x1="4" y1="10.5" x2="8" y2="10.5" />
      <line x1="10" y1="10.5" x2="13" y2="10.5" />
    </svg>
  );
}

function WalletIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '19px', height: '16px', minWidth: '19px', minHeight: '16px' }}
      viewBox="0 0 22 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <rect x="1" y="3" width="20" height="14" rx="2" />
      <path d="M15 7H21V13H15C13.5 13 13.5 7 15 7Z" />
      <circle cx="17" cy="10" r="0.8" fill="currentColor" />
      <path d="M4 3V2C4 1.5 4.5 1 5 1H18" />
    </svg>
  );
}

function PayLaterIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px' }}
      viewBox="0 0 22 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <rect x="1" y="1" width="20" height="16" rx="2" />
      <circle cx="11" cy="9" r="4.5" />
      <path d="M10 7.5H12M10 9H12M11 9V11" strokeWidth="1.3" />
    </svg>
  );
}

function EmiIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px' }}
      viewBox="0 0 22 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <rect x="1" y="1" width="20" height="16" rx="2" />
      <circle cx="7" cy="8" r="1.3" fill="currentColor" />
      <circle cx="15" cy="12" r="1.3" fill="currentColor" />
      <line x1="15" y1="7" x2="7" y2="13" />
    </svg>
  );
}

function NetBankingIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '19px', height: '17px', minWidth: '19px', minHeight: '17px' }}
      viewBox="0 0 22 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d="M1 6L11 1L21 6H1Z" />
      <line x1="1" y1="17" x2="21" y2="17" />
      <line x1="3" y1="17" x2="3" y2="6" />
      <line x1="8.3" y1="17" x2="8.3" y2="6" />
      <line x1="13.7" y1="17" x2="13.7" y2="6" />
      <line x1="19" y1="17" x2="19" y2="6" />
    </svg>
  );
}

function GiftIcon({ className = 'text-gray-700' }: { className?: string }) {
  return (
    <svg
      style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px' }}
      viewBox="0 0 22 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <polyline points="18 10 18 17 4 17 4 10" />
      <rect x="2" y="6" width="18" height="4" />
      <line x1="11" y1="17" x2="11" y2="6" />
      <path d="M11 6H7.5C6.1 6 5 4.9 5 3.5C5 2.1 6.1 1 7.5 1C10 1 11 6 11 6Z" />
      <path d="M11 6H14.5C15.9 6 17 4.9 17 3.5C17 2.1 15.9 1 14.5 1C12 1 11 6 11 6Z" />
    </svg>
  );
}

// --- OFFICIAL BANK LOGOS (Exact matching Image 1) ---
function AxisBankLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8 rounded-full shadow-2xs shrink-0">
      <circle cx="20" cy="20" r="19" fill="#97144D" />
      <path d="M20 9L29 27H23L20 21L17 27H11L20 9Z" fill="#FFFFFF" />
    </svg>
  );
}

function HdfcBankLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8 rounded-full shadow-2xs shrink-0">
      <circle cx="20" cy="20" r="19" fill="#FFFFFF" stroke="#E5E7EB" />
      <rect x="10" y="10" width="20" height="20" fill="#004C8F" rx="2" />
      <rect x="14" y="14" width="12" height="12" fill="#FFFFFF" />
      <rect x="16" y="16" width="8" height="8" fill="#ED232A" />
      <rect x="18" y="10" width="4" height="20" fill="#004C8F" />
      <rect x="10" y="18" width="20" height="4" fill="#004C8F" />
    </svg>
  );
}

function IciciBankLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8 rounded-full shadow-2xs shrink-0">
      <circle cx="20" cy="20" r="19" fill="#FFFFFF" stroke="#E5E7EB" />
      <circle cx="20" cy="20" r="15" fill="#B02A30" />
      <path
        d="M17 11C22 11 26 14 26 19C26 24 22 27 17 27C15 27 13.5 26.5 12 25.5C14 26 16.5 25.5 18 24C20 22 20.5 19 19.5 16.5C18.5 14 16 12.5 13 13C14 11.5 15.5 11 17 11Z"
        fill="#F37021"
      />
      <circle cx="20" cy="14" r="2" fill="#FFFFFF" />
      <rect x="18.5" y="18" width="3" height="7" rx="1" fill="#FFFFFF" />
    </svg>
  );
}

function KotakBankLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8 rounded-full shadow-2xs shrink-0">
      <circle cx="20" cy="20" r="19" fill="#ED1C24" />
      <path
        d="M13 20C13 17 15.5 15 18 15C21 15 22.5 17.5 24 20C25.5 22.5 27 25 30 25C32.5 25 35 23 35 20C35 17 32.5 15 30 15C27 15 25.5 17.5 24 20C22.5 22.5 21 25 18 25C15.5 25 13 23 13 20Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SbiBankLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8 rounded-full shadow-2xs shrink-0">
      <circle cx="20" cy="20" r="19" fill="#0072BB" />
      <circle cx="20" cy="20" r="8.5" fill="#FFFFFF" />
      <circle cx="20" cy="20" r="5" fill="#0072BB" />
      <rect x="18" y="20" width="4" height="15" fill="#FFFFFF" />
    </svg>
  );
}

export default function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const createOrderMutation = useCreateOrderMutation();

  const { items: cartItems, giftingEnabled, donationAmount } = useSelector(
    (state: RootState) => state.cart
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Require login to checkout payment
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to proceed with checkout');
      navigate('/login', { state: { from: '/checkout/payment' } });
    }
  }, [isAuthenticated, navigate]);

  // Selected delivery address tracking
  const { addresses: accountAddresses, fetchAddresses } = useAccount();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const selectedAddressId = localStorage.getItem('yteddy_selected_address_id') || '';
  const selectedAddress = useMemo(() => {
    if (accountAddresses.length === 0) return null;
    const found = accountAddresses.find((a) => a.id === selectedAddressId);
    return found || accountAddresses.find((a) => a.isDefault) || accountAddresses[0];
  }, [accountAddresses, selectedAddressId]);

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
  const couponDiscount = 200; // Reference Image 5: ₹200 saved with BFF10
  const giftingFee = giftingEnabled ? 35 : 0;
  const finalTotal = Math.max(0, totalSellingPrice - couponDiscount + giftingFee + donationAmount);

  // Offers Carousel
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

  // Payment Modes State (8 standard modes matching Images 1, 2, 3)
  type PaymentMode =
    | 'recommended'
    | 'cod'
    | 'upi'
    | 'card'
    | 'wallet'
    | 'paylater'
    | 'emi'
    | 'netbanking';

  const [activeMode, setActiveMode] = useState<PaymentMode>('upi');

  // Mobile Accordion open state (in Image 5, user taps accordion headers)
  const [mobileOpenAccordion, setMobileOpenAccordion] = useState<PaymentMode | 'giftcard' | null>(
    'upi'
  );

  // Mobile bottom price drawer toggle
  const [isMobilePriceOpen, setIsMobilePriceOpen] = useState(false);

  // COD State (Captcha generation & verification)
  const generateCaptcha = () => Math.floor(1000 + Math.random() * 9000).toString();
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');

  // UPI State (Scan & Pay selected as in Images 2 & 3)
  const [upiSubMode, setUpiSubMode] = useState<'scan' | 'vpa'>('scan');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCardRbi, setSaveCardRbi] = useState(true);

  // Net Banking State (Banks list matching Image 1)
  const [selectedBank, setSelectedBank] = useState<'axis' | 'hdfc' | 'icici' | 'kotak' | 'sbi' | string>(
    'axis'
  );
  const [otherBankSelect, setOtherBankSelect] = useState('');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Gift Card State
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardPin, setGiftCardPin] = useState('');

  // Processing state for payment submission
  const [isProcessing, setIsProcessing] = useState(false);

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Card Expiry
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Detect Card Network
  const cardNetwork = useMemo(() => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    if (/^(60|65|81|82)/.test(clean)) return 'RUPAY';
    return '';
  }, [cardNumber]);

  // Handle Order Placement
  const handlePlaceOrder = async (modeOverride?: PaymentMode) => {
    const effectiveMode = modeOverride || activeMode;

    if (!selectedAddress) {
      toast.error('Delivery address missing. Please return to address step.');
      navigate('/checkout/address');
      return;
    }

    if (effectiveMode === 'cod') {
      if (captchaInput.trim() !== captchaCode) {
        toast.error('Invalid verification code. Please enter the correct 4 digits.');
        return;
      }
    } else if (effectiveMode === 'upi') {
      if (upiSubMode === 'vpa') {
        if (!upiIdInput.includes('@') || upiIdInput.length < 5) {
          toast.error('Please enter a valid UPI ID (e.g. mobile@upi)');
          return;
        }
      }
    } else if (effectiveMode === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardName.trim()) {
        toast.error('Please enter cardholder name');
        return;
      }
      if (cardExpiry.length < 5) {
        toast.error('Please enter valid expiry date (MM/YY)');
        return;
      }
      if (cardCvv.length < 3) {
        toast.error('Please enter 3-digit CVV');
        return;
      }
    }

    setIsProcessing(true);

    const modeLabels: Record<PaymentMode, string> = {
      recommended: 'Recommended (Instant Payment)',
      cod: 'Cash on Delivery (COD)',
      upi: upiSubMode === 'scan' ? 'UPI (Scan & Pay)' : `UPI (${upiIdInput || 'UPI ID'})`,
      card: `Credit/Debit Card (${cardNetwork || 'Card'})`,
      netbanking: `Net Banking (${(otherBankSelect || selectedBank).toUpperCase()})`,
      wallet: `Wallet (${selectedWallet.toUpperCase()})`,
      paylater: 'Pay Later',
      emi: 'EMI (Credit/Debit Card)',
    };

    try {
      const orderItems = selectedItems.map((item) => ({
        productId: item.productId,
        title: item.product?.title || 'Teddy Backpack',
        primaryImage:
          item.product?.primary_image ||
          item.product?.images?.[0]?.url ||
          '',
        price: item.product?.price || 0,
        mrp: item.product?.mrp || item.product?.price || 0,
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
      }));

      const orderPayload = {
        items: orderItems,
        shippingAddress: {
          name: selectedAddress.name,
          mobile: selectedAddress.mobile,
          address: selectedAddress.address,
          locality: selectedAddress.locality || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          type: selectedAddress.type || 'HOME',
        },
        paymentMethod: modeLabels[effectiveMode],
        paymentDetails: {
          paymentMode: effectiveMode,
          upiSubMode: effectiveMode === 'upi' ? upiSubMode : undefined,
          upiId: effectiveMode === 'upi' && upiSubMode === 'vpa' ? upiIdInput : undefined,
          bank: effectiveMode === 'netbanking' ? (otherBankSelect || selectedBank) : undefined,
          wallet: effectiveMode === 'wallet' ? selectedWallet : undefined,
          cardNetwork: effectiveMode === 'card' ? cardNetwork : undefined,
          last4: effectiveMode === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
        },
        totalMrp,
        discountAmount: discountOnMrp,
        couponCode: 'BFF10',
        couponDiscount,
        shippingFee: 0,
        platformFee: 0,
        totalAmount: finalTotal,
        notes: giftingEnabled ? 'Gift wrap requested (+₹35)' : null,
      };

      const createdOrder = await createOrderMutation.mutateAsync(orderPayload);

      setIsProcessing(false);
      setIsQrModalOpen(false);

      // Clear Redux Cart
      dispatch(clearCart());
      toast.success('Order placed successfully! 🎉');

      // Navigate to dedicated Myntra-style confirmation page matching Reference 2 & 3
      navigate(`/checkout/confirm?orderid=${createdOrder.orderNumber}`, {
        state: { order: createdOrder },
        replace: true,
      });
    } catch (err: any) {
      setIsProcessing(false);
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      toast.error(msg);
    }
  };

  // Redirect if no items
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 rounded-full bg-[#FFF5EB] flex items-center justify-center text-[#D26900] mb-4 text-3xl">
          🛍️
        </div>
        <h2 className="text-xl font-bold text-[#282C3F] mb-2">No items in your bag</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6">
          Please add items to your bag before proceeding to payment.
        </p>
        <Link
          to="/products"
          className="px-6 py-2.5 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  // Sidebar Tabs Config
  const sidebarTabs: Array<{ id: PaymentMode; title: string; Icon: React.FC<{ className?: string }>; badge?: string }> = [
    { id: 'recommended', title: 'Recommended', Icon: StarIcon },
    { id: 'cod', title: 'Cash On Delivery', Icon: CashIcon },
    { id: 'upi', title: 'UPI (Pay via any App)', Icon: UpiIcon },
    { id: 'card', title: 'Credit/Debit Card', Icon: CardIcon, badge: '8 Offers' },
    { id: 'wallet', title: 'Wallets', Icon: WalletIcon },
    { id: 'paylater', title: 'Pay Later', Icon: PayLaterIcon },
    { id: 'emi', title: 'EMI', Icon: EmiIcon, badge: '1 Offer' },
    { id: 'netbanking', title: 'Net Banking', Icon: NetBankingIcon },
  ];

  return (
    <div className="min-h-screen bg-white text-[#282C3F] pb-24 lg:pb-16 font-sans">
      {/* ========================================================================= */}
      {/* MOBILE-ONLY VIEW (< lg): Matches Image 5 Reference Exactly                */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full">
        {/* 1. Coupons & Bank Offers Card (Image 5 Top) */}
        <div className="p-4 border-b border-[#EAEAEC] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#282C3F]">Coupons & Bank Offers</span>
            <button
              type="button"
              onClick={() => toast.info('Best coupon BFF10 is already applied!')}
              className="text-xs font-bold text-[#D26900] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              All offers <span className="text-sm font-bold">›</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>₹200 saved</span>
            </div>
            <div className="px-3 py-1 rounded-xs border border-dashed border-emerald-400 bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wider">
              BFF10
            </div>
          </div>
        </div>

        {/* 2. ONLINE PAYMENT OPTIONS Section Header Bar (Image 5) */}
        <div className="w-full bg-[#F5F5F6] px-4 py-2.5 border-b border-[#EAEAEC]">
          <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
            ONLINE PAYMENT OPTIONS
          </span>
        </div>

        {/* 3. Accordion List of Payment Modes (Image 5) */}
        <div className="divide-y divide-[#EAEAEC] bg-white border-b border-[#EAEAEC]">
          {/* ACCORDION: CASH ON DELIVERY */}
          <div className="w-full">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(mobileOpenAccordion === 'cod' ? null : 'cod')
              }
              className="w-full h-13 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <CashIcon className="text-gray-700" />
                </div>
                <span className="text-xs font-bold text-[#282C3F]">Cash On Delivery</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  mobileOpenAccordion === 'cod' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileOpenAccordion === 'cod' && (
              <div className="px-4 pb-5 pt-1 space-y-4 bg-[#FAFAFA] border-t border-gray-100">
                <div className="bg-[#FFF8F3] border border-[#FDE3CE] rounded-xs p-3 text-xs text-gray-700 space-y-1">
                  <p className="font-bold text-[#D26900]">Safe & Contactless Delivery</p>
                  <p className="text-[11px] text-gray-600">
                    Pay on delivery is available for your shipping address. You can pay via cash or UPI to courier agent.
                  </p>
                </div>

                {/* 4 Digit Captcha */}
                <div className="bg-white p-3 rounded-xs border border-gray-200 space-y-2">
                  <span className="text-[11px] font-semibold text-gray-600">
                    Enter the 4-digit code shown below:
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-900 text-white font-mono font-extrabold text-base tracking-[0.3em] px-3.5 py-1.5 rounded-xs select-none">
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCaptchaCode(generateCaptcha())}
                      className="text-xs text-[#D26900] font-bold hover:underline"
                    >
                      ↻ Refresh
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter code"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xs focus:outline-hidden focus:border-[#D26900]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handlePlaceOrder('cod')}
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs"
                >
                  {isProcessing ? 'Processing Order...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>

          {/* ACCORDION: UPI (PAY VIA ANY APP) */}
          <div className="w-full">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(mobileOpenAccordion === 'upi' ? null : 'upi')
              }
              className="w-full h-13 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <UpiIcon className="text-gray-700" />
                </div>
                <span className="text-xs font-bold text-[#282C3F]">UPI (Pay via any App)</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  mobileOpenAccordion === 'upi' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileOpenAccordion === 'upi' && (
              <div className="px-4 pb-5 pt-2 space-y-4 bg-[#FAFAFA] border-t border-gray-100">
                <span className="text-xs font-bold text-gray-900 block">Pay using UPI</span>

                {/* Scan & Pay Clean Row matching Image 2 */}
                <div
                  onClick={() => setUpiSubMode('scan')}
                  className="flex items-center gap-3 py-2 cursor-pointer select-none"
                >
                  <div className="w-4.5 h-4.5 rounded-full border border-[#D26900] flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D26900]" />
                  </div>

                  <div className="w-8 h-8 rounded-sm border border-gray-200 p-1 flex items-center justify-center bg-white shrink-0">
                    <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
                    </svg>
                  </div>

                  <span className="text-xs font-bold text-[#282C3F]">Scan & Pay</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs"
                >
                  PAY NOW
                </button>

                {/* Or Enter UPI ID */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <span className="text-[11px] font-bold text-gray-600 block">Or Enter UPI ID / VPA</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => {
                        setUpiIdInput(e.target.value);
                        setUpiSubMode('vpa');
                      }}
                      placeholder="mobileNumber@upi"
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xs focus:outline-hidden focus:border-[#D26900]"
                    />
                    <button
                      type="button"
                      onClick={() => handlePlaceOrder('upi')}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-[#D26900] text-white font-bold text-xs rounded-xs"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION: CREDIT/DEBIT CARD */}
          <div className="w-full">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(mobileOpenAccordion === 'card' ? null : 'card')
              }
              className="w-full h-13 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <CardIcon className="text-gray-700" />
                </div>
                <span className="text-xs font-bold text-[#282C3F]">Credit/Debit Card</span>
                <span className="text-[10px] font-extrabold text-[#03A685] bg-emerald-50 px-1.5 py-0.5 rounded-2xs">
                  8 Offers
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  mobileOpenAccordion === 'card' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileOpenAccordion === 'card' && (
              <div className="px-4 pb-5 pt-1 space-y-3.5 bg-[#FAFAFA] border-t border-gray-100">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="Card Number (16 Digits)"
                  className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xs bg-white focus:outline-hidden focus:border-[#D26900]"
                />
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Name on card"
                  className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xs bg-white focus:outline-hidden focus:border-[#D26900]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                    placeholder="Valid Thru (MM/YY)"
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xs bg-white focus:outline-hidden focus:border-[#D26900]"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="CVV"
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xs bg-white focus:outline-hidden focus:border-[#D26900]"
                  />
                </div>

                <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveCardRbi}
                    onChange={(e) => setSaveCardRbi(e.target.checked)}
                    className="rounded-xs text-[#D26900] focus:ring-[#D26900]"
                  />
                  <span>Save this card as per RBI guidelines</span>
                </label>

                <button
                  type="button"
                  onClick={() => handlePlaceOrder('card')}
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs"
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${finalTotal.toLocaleString('en-IN')}`}
                </button>
              </div>
            )}
          </div>

          {/* ACCORDION: WALLETS */}
          <div className="w-full">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(mobileOpenAccordion === 'wallet' ? null : 'wallet')
              }
              className="w-full h-13 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <WalletIcon className="text-gray-700" />
                </div>
                <span className="text-xs font-bold text-[#282C3F]">Wallets</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  mobileOpenAccordion === 'wallet' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileOpenAccordion === 'wallet' && (
              <div className="px-4 pb-5 pt-1 space-y-3 bg-[#FAFAFA] border-t border-gray-100">
                {['paytm', 'phonepe', 'amazonpay', 'mobikwik'].map((w) => (
                  <label
                    key={w}
                    className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-xs cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="mobileWallet"
                      checked={selectedWallet === w}
                      onChange={() => setSelectedWallet(w)}
                      className="text-[#D26900] focus:ring-[#D26900]"
                    />
                    <span className="text-xs font-bold uppercase text-gray-800">{w}</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => handlePlaceOrder('wallet')}
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs"
                >
                  Pay ₹{finalTotal.toLocaleString('en-IN')}
                </button>
              </div>
            )}
          </div>

          {/* ACCORDION: PAY LATER */}
          <div className="w-full">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(mobileOpenAccordion === 'paylater' ? null : 'paylater')
              }
              className="w-full h-13 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <PayLaterIcon className="text-gray-700" />
                </div>
                <span className="text-xs font-bold text-[#282C3F]">Pay Later</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  mobileOpenAccordion === 'paylater' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileOpenAccordion === 'paylater' && (
              <div className="px-4 pb-5 pt-1 space-y-3 bg-[#FAFAFA] border-t border-gray-100">
                <div className="p-3 bg-white border border-gray-200 rounded-xs text-xs text-gray-700 space-y-1">
                  <span className="font-bold text-[#282C3F]">Simpl / LazyPay</span>
                  <p className="text-[11px] text-gray-500">
                    Pay in 15 days with 0% interest and 1-tap checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlaceOrder('paylater')}
                  className="w-full py-3 bg-[#D26900] text-white font-bold text-xs uppercase tracking-widest rounded-xs"
                >
                  Continue with Pay Later
                </button>
              </div>
            )}
          </div>

          {/* ACCORDION: EMI */}
          <div className="w-full">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(mobileOpenAccordion === 'emi' ? null : 'emi')
              }
              className="w-full h-13 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <EmiIcon className="text-gray-700" />
                </div>
                <span className="text-xs font-bold text-[#282C3F]">EMI</span>
                <span className="text-[10px] font-extrabold text-[#03A685] bg-emerald-50 px-1.5 py-0.5 rounded-2xs">
                  1 Offer
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  mobileOpenAccordion === 'emi' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileOpenAccordion === 'emi' && (
              <div className="px-4 pb-5 pt-1 space-y-3 bg-[#FAFAFA] border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  No Cost EMI available on HDFC, ICICI and SBI credit cards starting from ₹
                  {Math.round(finalTotal / 3).toLocaleString('en-IN')}/mo.
                </p>
                <button
                  type="button"
                  onClick={() => handlePlaceOrder('emi')}
                  className="w-full py-3 bg-[#D26900] text-white font-bold text-xs uppercase tracking-widest rounded-xs"
                >
                  Select EMI Plan
                </button>
              </div>
            )}
          </div>

          {/* ACCORDION: NET BANKING */}
          <div className="w-full">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(mobileOpenAccordion === 'netbanking' ? null : 'netbanking')
              }
              className="w-full h-13 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <NetBankingIcon className="text-gray-700" />
                </div>
                <span className="text-xs font-bold text-[#282C3F]">Net Banking</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  mobileOpenAccordion === 'netbanking' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileOpenAccordion === 'netbanking' && (
              <div className="px-4 pb-5 pt-1 space-y-3 bg-[#FAFAFA] border-t border-gray-100">
                <span className="text-xs font-bold text-gray-900 block">Popular Banks</span>
                <div className="space-y-2">
                  {[
                    { id: 'axis', name: 'Axis Bank', Logo: AxisBankLogo },
                    { id: 'hdfc', name: 'HDFC Bank', Logo: HdfcBankLogo },
                    { id: 'icici', name: 'ICICI Bank', Logo: IciciBankLogo },
                    { id: 'kotak', name: 'Kotak', Logo: KotakBankLogo },
                    { id: 'sbi', name: 'SBI', Logo: SbiBankLogo },
                  ].map((bank) => (
                    <label
                      key={bank.id}
                      className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-xs cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mobileBank"
                        checked={selectedBank === bank.id}
                        onChange={() => setSelectedBank(bank.id)}
                        className="text-[#D26900] focus:ring-[#D26900]"
                      />
                      <bank.Logo />
                      <span className="text-xs font-bold text-[#282C3F]">{bank.name}</span>
                    </label>
                  ))}
                </div>

                <select
                  value={otherBankSelect}
                  onChange={(e) => {
                    setOtherBankSelect(e.target.value);
                    if (e.target.value) setSelectedBank(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xs bg-white text-gray-700 focus:border-[#D26900]"
                >
                  <option value="">Other Banks</option>
                  <option value="bob">Bank of Baroda</option>
                  <option value="pnb">Punjab National Bank</option>
                  <option value="canara">Canara Bank</option>
                  <option value="union">Union Bank of India</option>
                  <option value="indusind">IndusInd Bank</option>
                  <option value="yes">Yes Bank</option>
                  <option value="idbi">IDBI Bank</option>
                  <option value="federal">Federal Bank</option>
                </select>

                <button
                  type="button"
                  onClick={() => handlePlaceOrder('netbanking')}
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs"
                >
                  Pay ₹{finalTotal.toLocaleString('en-IN')}
                </button>
              </div>
            )}
          </div>

          {/* ACCORDION: HAVE A GIFT CARD? */}
          <div className="w-full">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(mobileOpenAccordion === 'giftcard' ? null : 'giftcard')
              }
              className="w-full h-13 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <GiftIcon className="text-gray-700" />
                </div>
                <span className="text-xs font-bold text-[#282C3F]">Have a Gift Card?</span>
              </div>
              <span className="text-xs font-bold text-[#D26900] uppercase tracking-wider">
                APPLY
              </span>
            </button>

            {mobileOpenAccordion === 'giftcard' && (
              <div className="px-4 pb-5 pt-1 space-y-3 bg-[#FAFAFA] border-t border-gray-100">
                <input
                  type="text"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  placeholder="Gift Card Number"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xs bg-white"
                />
                <input
                  type="password"
                  maxLength={6}
                  value={giftCardPin}
                  onChange={(e) => setGiftCardPin(e.target.value)}
                  placeholder="Card PIN"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xs bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (giftCardCode.length < 6) {
                      toast.error('Please enter a valid gift card number');
                    } else {
                      toast.success('Gift card applied successfully!');
                    }
                  }}
                  className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xs uppercase tracking-wider"
                >
                  Apply Gift Card
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer Note (Image 5 Bottom) */}
        <div className="p-4 text-[11px] text-gray-500 leading-relaxed text-center">
          By placing the order, you agree to YTeddybags's{' '}
          <Link to="/terms-of-use" className="text-[#D26900] font-bold hover:underline">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" className="text-[#D26900] font-bold hover:underline">
            Privacy Policy
          </Link>
        </div>

        {/* 4. Sticky Bottom Floating Price Drawer (Image 5 Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-xl">
          {/* Collapsed Bar */}
          <div
            onClick={() => setIsMobilePriceOpen(!isMobilePriceOpen)}
            className="px-4 py-3 flex items-center justify-between cursor-pointer active:bg-gray-50"
          >
            <div>
              <span className="text-xs font-bold text-[#282C3F]">
                Price Details ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Total Amount:</span>
              <span className="text-sm font-extrabold text-[#282C3F]">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                  isMobilePriceOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>

          {/* Expanded Drawer */}
          {isMobilePriceOpen && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-2 text-xs bg-[#FAFAFA]">
              <div className="flex justify-between text-gray-600">
                <span>Total MRP</span>
                <span>₹{totalMrp.toLocaleString('en-IN')}</span>
              </div>
              {discountOnMrp > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount on MRP</span>
                  <span>- ₹{discountOnMrp.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-600">
                <span>Coupon Discount (BFF10)</span>
                <span>- ₹{couponDiscount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-sm text-[#282C3F]">
                <span>Total Amount</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP-ONLY VIEW (lg+): Matches Image 1, 2, 3 Reference Exactly           */}
      {/* ========================================================================= */}
      <div className="hidden lg:block max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-0 items-start">
          {/* LEFT COLUMN: 7 / 12 */}
          <div className="col-span-7 pr-8 xl:pr-10 border-r border-[#EAEAEC] space-y-6 pb-12">
            {/* 1. Bank Offers Carousel */}
            <div className="border border-[#EAEAEC] rounded-xs p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-black text-gray-700">
                    %
                  </span>
                  <span className="text-xs font-bold text-[#282C3F]">
                    Offers ({offersList.length})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <button
                    type="button"
                    onClick={() => setOfferIndex((prev) => (prev > 0 ? prev - 1 : offersList.length - 1))}
                    className="w-6 h-6 flex items-center justify-center hover:text-black cursor-pointer font-bold text-base transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferIndex((prev) => (prev < offersList.length - 1 ? prev + 1 : 0))}
                    className="w-6 h-6 flex items-center justify-center hover:text-black cursor-pointer font-bold text-base transition-colors"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Offer Card Container */}
              <div className="border border-[#EAEAEC] rounded-xs p-3.5 bg-white flex items-center gap-3.5">
                <div className="w-14 h-9 rounded-xs bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-1.5 flex flex-col justify-between shrink-0 shadow-xs border border-neutral-700 select-none">
                  <div className="w-2.5 h-1.5 rounded-2xs bg-amber-400/90" />
                  <div className="flex items-center justify-between">
                    <span className="text-[6.5px] font-mono text-white/70 font-semibold tracking-wider">YTEDDY</span>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-90" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-[#282C3F]">
                      {offersList[offerIndex].title}
                    </span>
                    {offersList[offerIndex].badge && (
                      <span className="text-[9px] font-extrabold bg-[#D26900]/10 text-[#D26900] px-1.5 py-0.5 rounded-2xs uppercase tracking-wider">
                        {offersList[offerIndex].badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
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
                  />
                ))}
              </div>
            </div>

            {/* 2. Choose Payment Mode Tabbed Box (Images 1, 2, 3) */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#282C3F]">Choose Payment Mode</h2>

              <div className="border border-[#EAEAEC] rounded-xs bg-white overflow-hidden flex min-h-[420px]">
                {/* Left Sidebar Navigation Tabs */}
                <div className="w-[38%] bg-[#F5F5F6] border-r border-[#EAEAEC] shrink-0 flex flex-col">
                  {sidebarTabs.map((tab) => {
                    const isActive = activeMode === tab.id;
                    const IconComponent = tab.Icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveMode(tab.id)}
                        className={`w-full h-12 flex items-center gap-3 px-4 text-left transition-colors whitespace-nowrap cursor-pointer border-l-[3px] ${
                          isActive
                            ? 'bg-white border-[#D26900] text-[#D26900] font-bold'
                            : 'border-transparent text-[#282C3F] font-semibold hover:bg-[#EAEAEA]'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <IconComponent className={isActive ? 'text-[#D26900]' : 'text-gray-700'} />
                        </div>
                        <span className="text-xs truncate flex-1">{tab.title}</span>
                        {tab.badge && (
                          <span className="text-[9px] font-extrabold text-[#03A685] bg-emerald-50 px-1 py-0.5 rounded-2xs">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Content Panel */}
                <div className="flex-1 p-6 bg-white min-h-[380px] flex flex-col justify-between">
                  {/* TAB: NET BANKING (Matches Image 1 Reference) */}
                  {activeMode === 'netbanking' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-[#282C3F]">Net Banking</h3>

                      {/* Radio List of Banks (Axis, HDFC, ICICI, Kotak, SBI) */}
                      <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                        {[
                          { id: 'axis', name: 'Axis Bank', Logo: AxisBankLogo },
                          { id: 'hdfc', name: 'HDFC Bank', Logo: HdfcBankLogo },
                          { id: 'icici', name: 'ICICI Bank', Logo: IciciBankLogo },
                          { id: 'kotak', name: 'Kotak', Logo: KotakBankLogo },
                          { id: 'sbi', name: 'SBI', Logo: SbiBankLogo },
                        ].map((bank) => (
                          <label
                            key={bank.id}
                            className="flex items-center gap-4 py-3 cursor-pointer group hover:bg-gray-50/50 px-1 rounded-xs transition-colors"
                          >
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedBank === bank.id ? 'border-[#D26900]' : 'border-gray-400 group-hover:border-gray-600'
                              }`}
                            >
                              {selectedBank === bank.id && (
                                <div className="w-2 h-2 rounded-full bg-[#D26900]" />
                              )}
                            </div>

                            <bank.Logo />

                            <span className="text-xs font-semibold text-[#282C3F]">
                              {bank.name}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Other Banks Dropdown (Image 1 Bottom) */}
                      <div className="pt-1">
                        <select
                          value={otherBankSelect}
                          onChange={(e) => {
                            setOtherBankSelect(e.target.value);
                            if (e.target.value) setSelectedBank(e.target.value);
                          }}
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xs bg-white text-gray-700 hover:border-gray-400 focus:outline-hidden focus:border-[#D26900] cursor-pointer"
                        >
                          <option value="">Other Banks</option>
                          <option value="bob">Bank of Baroda</option>
                          <option value="pnb">Punjab National Bank</option>
                          <option value="canara">Canara Bank</option>
                          <option value="union">Union Bank of India</option>
                          <option value="indusind">IndusInd Bank</option>
                          <option value="yes">Yes Bank</option>
                          <option value="idbi">IDBI Bank</option>
                          <option value="federal">Federal Bank</option>
                          <option value="cbi">Central Bank of India</option>
                        </select>
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => handlePlaceOrder('netbanking')}
                          disabled={isProcessing}
                          className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs"
                        >
                          {isProcessing ? 'Connecting to Bank...' : `PAY ₹${finalTotal.toLocaleString('en-IN')}`}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB: UPI (Exact Matches Images 2 & 3 Reference) */}
                  {activeMode === 'upi' && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-[#282C3F]">Pay using UPI</h3>

                      {/* Clean Scan & Pay Radio Row matching Image 2 */}
                      <div
                        onClick={() => setUpiSubMode('scan')}
                        className="flex items-center gap-3.5 py-1 cursor-pointer select-none"
                      >
                        <div className="w-4.5 h-4.5 rounded-full border border-[#D26900] flex items-center justify-center shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#D26900]" />
                        </div>

                        {/* Clean QR code badge */}
                        <div className="w-8 h-8 rounded-sm border border-gray-200 p-1 flex items-center justify-center bg-white shrink-0">
                          <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
                          </svg>
                        </div>

                        <span className="text-xs font-bold text-[#282C3F]">Scan & Pay</span>
                      </div>

                      {/* Prominent Full-Width PAY NOW button matching Image 3 */}
                      <div className="pt-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => setIsQrModalOpen(true)}
                          className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs cursor-pointer"
                        >
                          PAY NOW
                        </button>
                        <p className="text-[11px] text-gray-500 text-center">
                          Scan the generated QR code using any UPI app (GPay, PhonePe, Paytm, BHIM).
                        </p>
                      </div>

                      {/* Optional Expandable UPI ID */}
                      <div className="pt-3 border-t border-gray-100">
                        <details className="group text-xs">
                          <summary className="font-semibold text-gray-600 hover:text-[#D26900] cursor-pointer list-none flex items-center justify-between">
                            <span>Or Pay via UPI ID (Google Pay, PhonePe, etc.)</span>
                            <span className="text-xs font-bold group-open:rotate-180 transition-transform">▾</span>
                          </summary>
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={upiIdInput}
                              onChange={(e) => {
                                setUpiIdInput(e.target.value);
                                setUpiSubMode('vpa');
                              }}
                              placeholder="e.g. mobileNumber@upi"
                              className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xs focus:outline-hidden focus:border-[#D26900]"
                            />
                            <button
                              type="button"
                              onClick={() => handlePlaceOrder('upi')}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs rounded-xs uppercase tracking-wider"
                            >
                              Pay
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>
                  )}

                  {/* TAB: CASH ON DELIVERY */}
                  {activeMode === 'cod' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Pay on Delivery (Cash / UPI)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Available
                        </span>
                      </div>

                      <div className="bg-[#FFF8F3] border border-[#FDE3CE] rounded-xs p-3.5 text-xs text-gray-700 space-y-1">
                        <p className="font-bold text-[#D26900]">Safe & Contactless Delivery</p>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          Pay on delivery is available for your shipping address. You can pay cash or scan the courier agent's QR code at delivery.
                        </p>
                      </div>

                      {/* 4 Digit Captcha */}
                      <div className="bg-[#FAFAFA] border border-gray-200 rounded-xs p-3.5 space-y-2.5">
                        <span className="text-[11px] font-semibold text-gray-600 block">
                          Enter the 4-digit code shown below to confirm your order:
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-900 text-white font-mono font-black text-lg tracking-[0.35em] px-4 py-1.5 rounded-xs select-none">
                            {captchaCode}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCaptchaCode(generateCaptcha())}
                            className="text-xs text-[#D26900] font-bold hover:underline cursor-pointer"
                          >
                            ↻ Refresh Code
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={4}
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 4-digit code"
                          className="w-full sm:w-48 px-3 py-2 text-xs border border-gray-300 rounded-xs focus:outline-hidden focus:border-[#D26900]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlaceOrder('cod')}
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs"
                      >
                        {isProcessing ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  )}

                  {/* TAB: CREDIT/DEBIT CARD */}
                  {activeMode === 'card' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Credit / Debit Card
                        </span>
                        {cardNetwork && (
                          <span className="text-[10px] font-black text-[#D26900] bg-orange-50 px-2 py-0.5 rounded-xs border border-orange-200">
                            {cardNetwork}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="Card Number (16 Digits)"
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xs bg-white focus:outline-hidden focus:border-[#D26900]"
                        />
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xs bg-white focus:outline-hidden focus:border-[#D26900]"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            placeholder="Valid Thru (MM/YY)"
                            className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xs bg-white focus:outline-hidden focus:border-[#D26900]"
                          />
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="CVV"
                            className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xs bg-white focus:outline-hidden focus:border-[#D26900]"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={saveCardRbi}
                            onChange={(e) => setSaveCardRbi(e.target.checked)}
                            className="rounded-xs text-[#D26900] focus:ring-[#D26900]"
                          />
                          <span>Save this card as per RBI guidelines</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlaceOrder('card')}
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs"
                      >
                        {isProcessing ? 'Processing Payment...' : `PAY ₹${finalTotal.toLocaleString('en-IN')}`}
                      </button>
                    </div>
                  )}

                  {/* TAB: WALLETS */}
                  {activeMode === 'wallet' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-[#282C3F]">Select Wallet</h3>
                      <div className="space-y-2">
                        {[
                          { id: 'paytm', name: 'Paytm Wallet' },
                          { id: 'phonepe', name: 'PhonePe Wallet' },
                          { id: 'amazonpay', name: 'Amazon Pay' },
                          { id: 'mobikwik', name: 'MobiKwik' },
                        ].map((w) => (
                          <label
                            key={w.id}
                            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xs cursor-pointer hover:border-gray-300"
                          >
                            <input
                              type="radio"
                              name="desktopWallet"
                              checked={selectedWallet === w.id}
                              onChange={() => setSelectedWallet(w.id)}
                              className="text-[#D26900] focus:ring-[#D26900]"
                            />
                            <span className="text-xs font-bold text-[#282C3F]">{w.name}</span>
                          </label>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlaceOrder('wallet')}
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs"
                      >
                        PAY ₹{finalTotal.toLocaleString('en-IN')}
                      </button>
                    </div>
                  )}

                  {/* TAB: RECOMMENDED / PAY LATER / EMI */}
                  {(activeMode === 'recommended' || activeMode === 'paylater' || activeMode === 'emi') && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-[#282C3F]">
                        {activeMode === 'recommended'
                          ? 'Recommended Option: UPI Scan & Pay'
                          : activeMode === 'paylater'
                          ? 'Pay Later'
                          : 'EMI on Credit / Debit Card'}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {activeMode === 'recommended'
                          ? 'Fastest checkout via instant UPI scan or Cash on Delivery.'
                          : activeMode === 'paylater'
                          ? 'Get up to 15 days interest-free credit with Simpl and LazyPay.'
                          : 'Flexible 3 to 12 month installments on top Indian bank cards.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handlePlaceOrder(activeMode)}
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs"
                      >
                        Continue with {activeMode.toUpperCase()}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Have a Gift Card? Module (Matches Image 2 Bottom) */}
            <div className="border border-[#EAEAEC] rounded-xs p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#282C3F]">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <GiftIcon className="text-gray-700" />
                  </div>
                  <span>Have a Gift Card?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGiftCardOpen(!isGiftCardOpen)}
                  className="text-xs font-bold text-[#D26900] hover:underline cursor-pointer uppercase tracking-wider"
                >
                  {isGiftCardOpen ? 'CANCEL' : 'APPLY GIFT CARD'}
                </button>
              </div>

              {isGiftCardOpen && (
                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    placeholder="Gift Card Number (16 Digits)"
                    className="px-3 py-2 text-xs border border-gray-300 rounded-xs focus:outline-hidden focus:border-[#D26900]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={6}
                      value={giftCardPin}
                      onChange={(e) => setGiftCardPin(e.target.value)}
                      placeholder="6-Digit PIN"
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xs focus:outline-hidden focus:border-[#D26900]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (giftCardCode.length < 6) {
                          toast.error('Please enter a valid gift card number');
                        } else {
                          toast.success('Gift card applied successfully!');
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 text-white font-bold text-xs uppercase tracking-wider rounded-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: 5 / 12 (Address Summary & Price Details) */}
          <div className="col-span-5 pl-8 xl:pl-10 space-y-6">
            {/* Delivery Address Summary Card */}
            {selectedAddress && (
              <div className="border border-[#EAEAEC] rounded-xs p-4 bg-[#FAFAFA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Deliver To:
                  </span>
                  <Link
                    to="/checkout/address"
                    className="text-xs font-bold text-[#D26900] hover:underline"
                  >
                    CHANGE
                  </Link>
                </div>
                <div className="text-xs text-gray-800 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#282C3F]">{selectedAddress.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500 text-teal-600 uppercase tracking-wide">
                      {selectedAddress.type || 'HOME'}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">
                    {selectedAddress.address}
                    {selectedAddress.locality ? `, ${selectedAddress.locality}` : ''}, {selectedAddress.city}, {selectedAddress.state} -{' '}
                    {selectedAddress.pincode}
                  </p>
                  <p className="text-gray-600">Mobile: {selectedAddress.mobile}</p>
                </div>
              </div>
            )}

            {/* Price Details Breakdown */}
            <div className="border border-[#EAEAEC] rounded-xs p-5 bg-white space-y-3.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                PRICE DETAILS ({selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'})
              </span>

              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Total MRP</span>
                  <span>₹{totalMrp.toLocaleString('en-IN')}</span>
                </div>
                {discountOnMrp > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount on MRP</span>
                    <span>- ₹{discountOnMrp.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount (BFF10)</span>
                  <span>- ₹{couponDiscount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    Platform Fee
                    <span className="text-[9px] font-bold text-[#D26900] bg-orange-50 px-1 py-0.2 rounded-2xs">
                      Offer
                    </span>
                  </span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
              </div>

              {/* Total Amount (Styled in #282C3F as in Reference Image 2) */}
              <div className="border-t border-[#EAEAEC] pt-3.5 flex justify-between items-center">
                <span className="text-sm font-bold text-[#282C3F]">Total Amount</span>
                <span className="text-lg font-black text-[#282C3F]">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-2 text-gray-400 text-xs">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#14958f]" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold text-gray-600">100% Genuine Products</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#14958f]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold text-gray-600">Easy 14-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DYNAMIC QR CODE SCAN & PAY MODAL (For UPI Scan Flow)                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-sm max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#D26900] uppercase tracking-wider">
                  Scan & Pay via any UPI App
                </span>
                <h3 className="text-lg font-extrabold text-[#282C3F]">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </h3>
              </div>

              {/* Dynamic Simulated QR Canvas */}
              <div className="p-4 bg-white border border-gray-200 rounded-sm inline-block shadow-inner mx-auto">
                <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#FFFFFF" />
                  <rect x="10" y="10" width="24" height="24" fill="#282C3F" />
                  <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" />
                  <rect x="18" y="18" width="8" height="8" fill="#282C3F" />
                  <rect x="66" y="10" width="24" height="24" fill="#282C3F" />
                  <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" />
                  <rect x="74" y="18" width="8" height="8" fill="#282C3F" />
                  <rect x="10" y="66" width="24" height="24" fill="#282C3F" />
                  <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" />
                  <rect x="18" y="74" width="8" height="8" fill="#282C3F" />
                  <rect x="42" y="12" width="6" height="6" fill="#D26900" />
                  <rect x="52" y="12" width="6" height="6" fill="#282C3F" />
                  <rect x="42" y="24" width="6" height="6" fill="#282C3F" />
                  <rect x="52" y="24" width="6" height="6" fill="#D26900" />
                  <rect x="12" y="42" width="6" height="6" fill="#282C3F" />
                  <rect x="24" y="42" width="6" height="6" fill="#D26900" />
                  <rect x="36" y="42" width="10" height="10" fill="#282C3F" />
                  <rect x="52" y="42" width="8" height="8" fill="#D26900" />
                  <rect x="66" y="42" width="8" height="8" fill="#282C3F" />
                  <rect x="80" y="42" width="6" height="6" fill="#282C3F" />
                  <rect x="42" y="56" width="6" height="6" fill="#282C3F" />
                  <rect x="56" y="56" width="8" height="8" fill="#D26900" />
                  <rect x="70" y="56" width="6" height="6" fill="#282C3F" />
                  <rect x="42" y="68" width="8" height="8" fill="#D26900" />
                  <rect x="56" y="68" width="6" height="6" fill="#282C3F" />
                  <rect x="70" y="68" width="8" height="8" fill="#D26900" />
                  <rect x="42" y="80" width="8" height="8" fill="#282C3F" />
                  <rect x="56" y="80" width="8" height="8" fill="#D26900" />
                  <rect x="70" y="80" width="12" height="12" fill="#282C3F" />
                </svg>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs text-gray-500 font-semibold">
                <span>Google Pay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM</span>
              </div>

              <button
                type="button"
                onClick={() => handlePlaceOrder('upi')}
                disabled={isProcessing}
                className="w-full py-3 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs"
              >
                {isProcessing ? 'Verifying Payment...' : 'I Have Paid'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
