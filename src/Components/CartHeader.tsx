import { Link, useLocation } from 'react-router-dom';

export default function CartHeader() {
  const location = useLocation();
  const isAddressStep = location.pathname.includes('/address');
  const isConfirmStep = location.pathname.includes('/confirm');
  const isPaymentStep = location.pathname.includes('/payment') || isConfirmStep;

  return (
    <header className="w-full bg-white border-b border-[#EAEAEC] z-30 shadow-xs">
      {/* Desktop Header View (md+) */}
      <div className="hidden md:flex w-full px-6 md:px-12 lg:px-16 h-14 sm:h-16 items-center justify-between relative">
        {/* Brand Logo Link */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            className="text-lg sm:text-xl font-bold text-[#D26900] tracking-tight hover:opacity-95 transition-opacity"
          >
            YTeddybags
          </Link>
        </div>

        {/* Checkout Steps Indicator - Desktop Centered */}
        <div className="flex items-center gap-2.5 md:gap-4 text-xs font-bold tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          <Link
            to="/cart"
            className={`${
              !isAddressStep && !isPaymentStep
                ? 'text-[#D26900] border-b-2 border-[#D26900] pb-0.5'
                : 'text-gray-700 hover:text-[#D26900] transition-colors'
            }`}
          >
            BAG
          </Link>
          <span className="text-gray-300 select-none">----------</span>
          {isPaymentStep ? (
            <Link
              to="/checkout/address"
              className="text-gray-700 hover:text-[#D26900] transition-colors"
            >
              ADDRESS
            </Link>
          ) : (
            <span
              className={`${
                isAddressStep
                  ? 'text-[#D26900] border-b-2 border-[#D26900] pb-0.5'
                  : 'text-gray-400'
              }`}
            >
              ADDRESS
            </span>
          )}
          <span className="text-gray-300 select-none">----------</span>
          <span
            className={`${
              isPaymentStep
                ? 'text-[#D26900] border-b-2 border-[#D26900] pb-0.5'
                : 'text-gray-400'
            }`}
          >
            PAYMENT
          </span>
        </div>

        {/* 100% Secure Badge */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#14958f] tracking-wide uppercase shrink-0">
          <svg
            className="w-4.5 h-4.5 text-[#14958f] fill-current shrink-0"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
              clipRule="evenodd"
            />
          </svg>
          <span>100% SECURE</span>
        </div>
      </div>

      {/* Mobile Header View (< md) Matching Image 5 Reference: [←  PAYMENT       STEP 3/3] */}
      <div className="md:hidden w-full h-13 px-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <Link
            to={isConfirmStep ? '/orders' : isPaymentStep ? '/checkout/address' : isAddressStep ? '/cart' : '/'}
            className="text-gray-800 hover:text-black p-1 -ml-1 transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.4}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <span className="text-sm font-extrabold uppercase tracking-wide text-[#282C3F]">
            {isConfirmStep ? 'ORDER CONFIRMED' : isPaymentStep ? 'PAYMENT' : isAddressStep ? 'ADDRESS' : 'BAG'}
          </span>
        </div>
        <div className="text-[11px] font-bold text-gray-500 tracking-wider">
          {isConfirmStep ? 'SUCCESS' : isPaymentStep ? 'STEP 3/3' : isAddressStep ? 'STEP 2/3' : 'STEP 1/3'}
        </div>
      </div>
    </header>
  );
}
