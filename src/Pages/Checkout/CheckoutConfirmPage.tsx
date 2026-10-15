import { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMyOrdersQuery, type OrderRecord } from '../../hooks/useOrdersQuery';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

// Iconic Green Scalloped Badge with White Checkmark (Matches Myntra Reference Screenshot 2)
const ScallopedSuccessBadge = () => (
  <motion.div
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    className="inline-flex items-center justify-center relative"
  >
    <svg
      className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-xs"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 16-point scalloped seal */}
      <path
        d="M21.16 4.74a4.06 4.06 0 0 1 5.68 0l1.8 1.78a4.06 4.06 0 0 0 3.9 1.06l2.48-.52a4.06 4.06 0 0 1 4.74 3.12l.56 2.46a4.06 4.06 0 0 0 2.84 2.84l2.46.56a4.06 4.06 0 0 1 3.12 4.74l-.52 2.48a4.06 4.06 0 0 0 1.06 3.9l1.78 1.8a4.06 4.06 0 0 1 0 5.68l-1.78 1.8a4.06 4.06 0 0 0-1.06 3.9l.52 2.48a4.06 4.06 0 0 1-3.12 4.74l-2.46.56a4.06 4.06 0 0 0-2.84 2.84l-.56 2.46a4.06 4.06 0 0 1-4.74 3.12l-2.48-.52a4.06 4.06 0 0 0-3.9 1.06l-1.8 1.78a4.06 4.06 0 0 1-5.68 0l-1.8-1.78a4.06 4.06 0 0 0-3.9-1.06l-2.48.52a4.06 4.06 0 0 1-4.74-3.12l-.56-2.46a4.06 4.06 0 0 0-2.84-2.84l-2.46-.56a4.06 4.06 0 0 1-3.12-4.74l.52-2.48a4.06 4.06 0 0 0-1.06-3.9l-1.78-1.8a4.06 4.06 0 0 1 0-5.68l1.78-1.8a4.06 4.06 0 0 0 1.06-3.9l-.52-2.48a4.06 4.06 0 0 1 3.12-4.74l2.46-.56a4.06 4.06 0 0 0 2.84-2.84l.56-2.46a4.06 4.06 0 0 1 4.74-3.12l2.48.52a4.06 4.06 0 0 0 3.9-1.06l1.8-1.78z"
        fill="#00A572"
      />
      {/* White Checkmark */}
      <path
        d="M17 24.5L21.5 29L31 19.5"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </motion.div>
);

// Scooter Delivery Rider Illustration (Matches Myntra Reference Screenshot 2)
const ScooterDeliveryIllustration = () => (
  <div className="shrink-0 w-24 h-20 sm:w-28 sm:h-22 relative flex items-center justify-center">
    <svg viewBox="0 0 120 90" fill="none" className="w-full h-full drop-shadow-2xs">
      {/* Soft background glow */}
      <circle cx="65" cy="45" r="36" fill="#FEEFE7" opacity="0.6" />

      {/* Speed lines */}
      <path d="M12 55H28" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 63H32" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 47H22" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />

      {/* Back delivery box on scooter rack */}
      <rect x="36" y="32" width="22" height="20" rx="3" fill="#D26900" />
      <rect x="42" y="36" width="10" height="4" rx="1" fill="#FFFFFF" opacity="0.8" />

      {/* Scooter Chassis & Body */}
      <path
        d="M48 62L62 62C65 62 68 59 69 56L73 44C74 41 76 39 79 39H84"
        stroke="#1E40AF"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Front shield & headlight */}
      <path
        d="M78 38L74 54C73 57 75 60 78 61H88"
        stroke="#2563EB"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="83" cy="40" r="3" fill="#FBBF24" />

      {/* Scooter Wheels */}
      {/* Rear Wheel */}
      <circle cx="44" cy="64" r="10" fill="#334155" />
      <circle cx="44" cy="64" r="5" fill="#E2E8F0" />
      <circle cx="44" cy="64" r="2" fill="#334155" />

      {/* Front Wheel */}
      <circle cx="86" cy="64" r="10" fill="#334155" />
      <circle cx="86" cy="64" r="5" fill="#E2E8F0" />
      <circle cx="86" cy="64" r="2" fill="#334155" />

      {/* Delivery Rider */}
      {/* Torso & Shirt */}
      <path
        d="M58 40L64 30C66 28 69 28 71 31L76 43"
        stroke="#DC2626"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Arms to handlebar */}
      <path
        d="M66 32L78 38"
        stroke="#DC2626"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Delivery Helmet */}
      <circle cx="65" cy="20" r="7.5" fill="#DC2626" />
      <path
        d="M66 18H72C73 18 74 19 73 21L71 23H66"
        fill="#1E293B"
      />
      {/* Legs */}
      <path
        d="M63 43L66 52L72 54"
        stroke="#1E293B"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// Payment Flexibility Illustration (Matches Myntra Reference Screenshot 2 "Now pay at your convenience")
const PaymentIllustration = () => (
  <div className="shrink-0 w-20 h-16 sm:w-24 sm:h-18 relative flex items-center justify-center">
    <svg viewBox="0 0 100 80" fill="none" className="w-full h-full drop-shadow-2xs">
      {/* Girl portrait with phone & payment card */}
      {/* Hair */}
      <path
        d="M48 20C40 20 34 26 34 35C34 46 38 52 42 55H58C62 52 66 46 66 35C66 26 60 20 52 20H48Z"
        fill="#1E293B"
      />
      {/* Face & Neck */}
      <ellipse cx="50" cy="36" rx="9" ry="11" fill="#FBCFE8" />
      {/* Eyes & Smile */}
      <circle cx="47" cy="35" r="1" fill="#1E293B" />
      <circle cx="53" cy="35" r="1" fill="#1E293B" />
      <path d="M48 39C49 40 51 40 52 39" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
      {/* Dress */}
      <path
        d="M42 54L38 72H62L58 54C55 56 45 56 42 54Z"
        fill="#F43F5E"
      />
      {/* Payment Card in Hand */}
      <rect
        x="18"
        y="42"
        width="22"
        height="14"
        rx="2"
        fill="#FB7185"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        transform="rotate(-12 18 42)"
      />
      <rect
        x="22"
        y="47"
        width="7"
        height="3"
        rx="0.5"
        fill="#FDE047"
        transform="rotate(-12 22 47)"
      />
      {/* Floating Cash/Coins */}
      <rect
        x="64"
        y="45"
        width="16"
        height="9"
        rx="1.5"
        fill="#4ADE80"
        stroke="#FFFFFF"
        strokeWidth="1"
        transform="rotate(18 64 45)"
      />
      <circle cx="72" cy="50" r="1.5" fill="#15803D" />
      <circle cx="22" cy="62" r="3" fill="#FBBF24" />
    </svg>
  </div>
);

export default function CheckoutConfirmPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);
  const orderIdParam = searchParams.get('orderid');

  // Order passed via router navigation state
  const routerOrder = (location.state as any)?.order as OrderRecord | undefined;

  // Fallback: Fetch user's orders to resolve order details if opened directly with ?orderid=
  const { data: myOrders = [] } = useMyOrdersQuery();

  const activeOrder = useMemo(() => {
    if (routerOrder) return routerOrder;
    if (orderIdParam && myOrders.length > 0) {
      return (
        myOrders.find(
          (o) =>
            o.orderNumber === orderIdParam ||
            o.id === orderIdParam ||
            o.orderNumber?.toLowerCase() === orderIdParam.toLowerCase()
        ) || myOrders[0]
      );
    }
    return myOrders[0] || null;
  }, [routerOrder, orderIdParam, myOrders]);

  // Recipient info
  const recipientName =
    activeOrder?.shippingAddress?.name ||
    activeOrder?.customerName ||
    user?.name ||
    'Valued Customer';

  const recipientMobile =
    activeOrder?.shippingAddress?.mobile ||
    activeOrder?.customerPhone ||
    user?.phone ||
    '';

  const recipientAddress = useMemo(() => {
    if (!activeOrder?.shippingAddress) {
      return 'Address details attached to your registered account.';
    }
    const addr = activeOrder.shippingAddress;
    return [
      addr.address,
      addr.locality,
      addr.city,
      addr.state,
      addr.pincode ? `- ${addr.pincode}` : '',
    ]
      .filter(Boolean)
      .join(', ');
  }, [activeOrder]);

  const displayOrderId = activeOrder?.orderNumber || orderIdParam || 'YTEDDY-ORDER';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F6] py-6 sm:py-10 px-4 flex justify-center items-start font-sans">
      <div className="w-full max-w-[620px] space-y-4">
        {/* ========================================================================= */}
        {/* MAIN CARD: Order Confirmed (Matches Myntra Reference Screenshot 2 & 3)     */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#EAEAEC] rounded-xs shadow-2xs p-6 sm:p-10 text-center space-y-6">
          {/* Top Scalloped Green Seal Badge */}
          <div className="flex justify-center pt-1">
            <ScallopedSuccessBadge />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#00A572] tracking-tight">
              Order confirmed
            </h1>
            <p className="text-xs sm:text-[13px] text-[#535766] max-w-md mx-auto leading-relaxed">
              Your order is confirmed. You will receive an order confirmation email/SMS
              shortly with the expected delivery date for your items.
            </p>
          </div>

          {/* Delivering To Inner Box (Matches Myntra Screenshot 2 exactly) */}
          <div className="border border-[#EAEAEC] rounded-xs p-4 sm:p-5 text-left bg-white">
            <div className="flex items-start justify-between gap-3">
              {/* Left details */}
              <div className="space-y-1 flex-1 pr-2">
                <span className="text-[11px] text-[#696E79] font-medium block">
                  Delivering to:
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#282C3F]">
                  {recipientName} {recipientMobile && `| ${recipientMobile}`}
                </p>
                <p className="text-xs text-[#535766] leading-relaxed line-clamp-2 mt-0.5">
                  {recipientAddress}
                </p>

                {/* ORDER DETAILS > Button in Brand CTA Color (#D26900) */}
                <div className="pt-2">
                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D26900] border border-[#D26900] hover:bg-[#D26900] hover:text-white px-3 py-1 rounded-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>ORDER DETAILS</span>
                    <span className="text-xs font-black">›</span>
                  </Link>
                </div>
              </div>

              {/* Right Scooter Delivery Rider Graphic */}
              <ScooterDeliveryIllustration />
            </div>

            {/* Note at bottom of inner box with magic wand / spark icon */}
            <div className="border-t border-[#F0F0F0] pt-3 mt-4 flex items-center gap-2 text-[11px] text-[#696E79]">
              <span className="text-xs select-none">🪄</span>
              <span>You can Track/View/Modify order from orders page.</span>
            </div>
          </div>

          {/* Second Inner Card: Now pay at your convenience (Matches Myntra Screenshot 2 & 3) */}
          <div className="border border-[#EAEAEC] rounded-xs p-4 sm:p-5 text-left bg-white flex items-center justify-between gap-3">
            <div className="space-y-1 flex-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#282C3F]">
                  Now pay at your convenience
                </span>
                <span className="bg-[#03A685] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  New
                </span>
              </div>
              <p className="text-xs text-[#696E79] leading-relaxed max-w-sm mt-1">
                Now you can pay online using Pay Now option from orders or you can Pay on
                Delivery (Cash/UPI).
              </p>
              <Link
                to="/orders"
                className="inline-block text-xs font-bold text-[#D26900] hover:underline pt-1 cursor-pointer"
              >
                See How
              </Link>
            </div>

            {/* Right Payment Illustration */}
            <PaymentIllustration />
          </div>

          {/* Discreet Order ID reference */}
          <div className="pt-1 text-[11px] text-[#878B94]">
            Order Ref: <span className="font-mono font-semibold text-[#282C3F]">{displayOrderId}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BUTTONS (Matches Myntra Reference Screenshot 3)              */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {/* Left: CONTINUE SHOPPING Button */}
          <Link
            to="/products"
            className="w-full sm:w-1/2 py-3 px-4 bg-white border border-[#D4D5D9] hover:border-[#282C3F] text-[#282C3F] font-bold text-xs uppercase tracking-widest rounded-xs transition-colors flex items-center justify-center gap-2 text-center cursor-pointer shadow-2xs"
          >
            <span className="text-sm font-bold">‹</span>
            <span>CONTINUE SHOPPING</span>
          </Link>

          {/* Right: VIEW ORDER Button in Website's Brand CTA Color (#D26900) */}
          <Link
            to="/orders"
            className="w-full sm:w-1/2 py-3 px-4 bg-[#D26900] hover:bg-[#B85800] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 text-center cursor-pointer"
          >
            <span>VIEW ORDER</span>
            <span className="text-sm font-bold">›</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
