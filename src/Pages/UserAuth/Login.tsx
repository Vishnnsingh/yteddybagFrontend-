import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../Utils/apiClient';
import { loginUserAPI } from '../../redux/slices/authSlice';
import { syncWishlistOnLogin } from '../../redux/slices/wishlistSlice';
import { useHeaderNavigation } from '../../Context/HeaderNavigationContext';
import type { AppDispatch, RootState } from '../../redux/store';

export default function Login() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showTermsPrompt, setShowTermsPrompt] = useState(false);
  const [termsPromptMessage, setTermsPromptMessage] = useState('Please agree and tick the checkbox to continue');
  const [termsShakeKey, setTermsShakeKey] = useState(0);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'help' | null>(null);

  const termsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const { loginBanner, sitePages, refreshSitePages, refreshLoginBanner } = useHeaderNavigation();

  // Fetch login banner strictly on-demand when Login page opens
  useEffect(() => {
    refreshLoginBanner();
  }, [refreshLoginBanner]);

  // Call API on-demand only when user clicks Terms of Use, Privacy Policy, or Get help
  const _handleOpenModal = (modalType: 'terms' | 'privacy' | 'help') => {
    refreshSitePages();
    setActiveModal(modalType);
  };
  void _handleOpenModal;

  // Helper to trigger professional shake animation & show in-page popup aligned with login card
  const triggerTermsAnimation = (message = 'Please agree and tick the checkbox to continue') => {
    setTermsPromptMessage(message);
    setShowTermsPrompt(true);
    setTermsShakeKey((prev) => prev + 1);
    const checkboxEl = document.getElementById('termsCheckbox');
    if (checkboxEl) {
      checkboxEl.focus();
    }
    if (termsTimerRef.current) {
      clearTimeout(termsTimerRef.current);
    }
    termsTimerRef.current = setTimeout(() => {
      setShowTermsPrompt(false);
    }, 4500);
  };

  // Continue button enabled ONLY when terms checkbox is checked and input has value
  const isContinueEnabled = isTermsAgreed && phoneOrEmail.trim().length > 0 && !loading;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTermsAgreed) {
      triggerTermsAnimation('Please agree and tick the checkbox to continue');
      return;
    }
    if (!phoneOrEmail.trim()) {
      toast.error('Please enter your mobile number or email');
      return;
    }
    if (loading) return;

    const cleanInput = phoneOrEmail.trim();
    // If user enters a 10-digit phone number, format as email identifier for backend
    const identifier = cleanInput.includes('@')
      ? cleanInput
      : `${cleanInput.replace(/\D/g, '')}@yteddybags.com`;

    try {
      const resultAction = await dispatch(loginUserAPI(identifier));
      if (loginUserAPI.fulfilled.match(resultAction)) {
        toast.success('Signed in successfully!');
        // Sync guest wishlist items to logged-in user profile
        try {
          const rawWish = localStorage.getItem('yteddy_wishlist_items');
          if (rawWish) {
            const parsed = JSON.parse(rawWish);
            const pids = Array.isArray(parsed) ? parsed.map((p: any) => p.id) : [];
            if (pids.length > 0) {
              dispatch(syncWishlistOnLogin(pids));
            }
          }
        } catch (_) {}
        navigate('/');
      } else {
        toast.error((resultAction.payload as string) || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error during login');
    }
  };

  const handleGoogleLoginClick = async () => {
    if (!isTermsAgreed) {
      triggerTermsAnimation('Please agree and tick the checkbox to continue with Google');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const currentOrigin = encodeURIComponent(window.location.origin);
      const response = await fetch(`${API_BASE_URL}/auth/google/url?origin=${currentOrigin}`);
      const data = await response.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        toast.error('Failed to initialize Google Login');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to backend');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-8 px-4">
      {/* Column Container: Pop and Login Card aligned in exact same line */}
      <div className="w-full max-w-[420px] flex flex-col items-center mx-auto">
        {/* In-Page Notification Popup - Same width & in exact same line with login card */}
        <AnimatePresence>
          {showTermsPrompt && !isTermsAgreed && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full mb-3 flex items-center justify-between gap-2.5 px-4 py-2.5 bg-[#FFF9F5] text-[#282C3F] border border-[#D26900]/40 rounded-lg shadow-sm font-medium text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D26900]/15 text-[#D26900] shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <span className="font-semibold text-[#8C3C00] truncate">
                  {termsPromptMessage}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsPrompt(false)}
                className="text-[#8C3C00]/60 hover:text-[#8C3C00] p-1 rounded-xs transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Centered Login Card matching Myntra Style */}
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
          {/* ======================================================== */}
          {/* Top Offer Banner Section (Configurable from Dashboard)    */}
          {/* ======================================================== */}
          {loginBanner?.is_active !== false && (
            <div
              className="relative w-full h-[165px] sm:h-[175px] overflow-hidden flex items-stretch border-b border-gray-100 select-none"
              style={{ backgroundColor: loginBanner?.bg_color || '#FEEFEA' }}
            >
              {/* Left Column: Offer Texts and Coupon */}
              <div className="w-[58%] sm:w-[60%] p-4 sm:p-5 flex flex-col justify-between z-10">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#D26900] font-black text-xs sm:text-sm tracking-wider uppercase">
                      FLAT
                    </span>
                    <svg className="w-3.5 h-3.5 text-[#D26900] animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>

                  <h1 className="text-2xl sm:text-[26px] font-black text-[#D26900] leading-none mt-0.5 tracking-tight">
                    {loginBanner?.heading || 'FLAT ₹300 OFF'}
                  </h1>

                  <p className="text-[10px] sm:text-[11px] font-bold text-[#D26900] leading-tight mt-1 uppercase tracking-tight">
                    {loginBanner?.subheading || 'ON YOUR 1ST ORDER + EXCITING OFFERS*'}
                  </p>
                </div>

                <div>
                  {/* Coupon Pill with Ticket Cutout */}
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white px-2.5 py-1 rounded-sm shadow-xs mt-1">
                    <span className="text-[9px] font-bold tracking-wider">CODE:</span>
                    <span className="text-[11px] font-black tracking-widest uppercase">
                      {loginBanner?.coupon_code || 'YTEDDY300'}
                    </span>
                  </div>

                  <p className="text-[8px] sm:text-[9px] text-gray-500 font-medium mt-1 truncate">
                    {loginBanner?.terms_text || '*T&C Applied | Limited Time Offer'}
                  </p>
                </div>
              </div>

              {/* Right Column: Teddy Bags & Toys Model Image */}
              <div className="w-[42%] sm:w-[40%] relative overflow-hidden flex items-end justify-center">
                <img
                  src={loginBanner?.image_url || '/images/login-banner-teddy.jpg'}
                  alt="Special Offer"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/login-banner-teddy.jpg';
                  }}
                />

                {/* Tag / Badge Ribbon in top right corner */}
                {loginBanner?.badge_text && (
                  <div className="absolute top-0 right-0 bg-[#D26900] text-white px-2.5 py-1 text-[10px] sm:text-[11px] font-black uppercase rounded-bl-lg shadow-sm">
                    {loginBanner.badge_text}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* Form Body: Login / Signup                                 */}
          {/* ======================================================== */}
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#282C3F] tracking-tight">
                Login <span className="text-base font-normal text-[#535766]">or</span> Signup
              </h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Input with +91 Prefix like Myntra */}
              <div>
                <div className="flex items-center border border-gray-300 rounded-xs focus-within:border-[#D26900] focus-within:ring-1 focus-within:ring-[#D26900] transition-all overflow-hidden bg-white">
                  <span className="px-3 py-3 text-sm text-[#535766] font-medium border-r border-gray-200 select-none bg-gray-50/60 shrink-0">
                    +91
                  </span>
                  <input
                    type="text"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="Mobile Number or Email*"
                    className="w-full px-3.5 py-3 text-sm text-[#282C3F] placeholder-gray-400 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Terms of Use & Privacy Policy Checkbox - Highlight on checkbox only */}
              <div className="flex items-start gap-2.5 pt-1">
                <motion.div
                  key={termsShakeKey}
                  animate={showTermsPrompt && !isTermsAgreed ? { scale: [1, 1.25, 1, 1.2, 1], x: [-3, 3, -3, 3, 0] } : { scale: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="shrink-0"
                >
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    checked={isTermsAgreed}
                    onChange={(e) => {
                      setIsTermsAgreed(e.target.checked);
                      if (e.target.checked) {
                        setShowTermsPrompt(false);
                      }
                    }}
                    className={`mt-0.5 w-4 h-4 rounded text-[#D26900] accent-[#D26900] focus:ring-[#D26900] cursor-pointer transition-all ${showTermsPrompt && !isTermsAgreed
                        ? 'ring-3 ring-[#D26900] ring-offset-2 scale-110 shadow-sm'
                        : ''
                      }`}
                  />
                </motion.div>
                <label
                  htmlFor="termsCheckbox"
                  className="text-xs text-[#535766] leading-relaxed cursor-pointer select-none"
                >
                  By continuing, I agree to the{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#D26900] hover:underline cursor-pointer"
                  >
                    Terms of Use
                  </Link>{' '}
                  &amp;{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#D26900] hover:underline cursor-pointer"
                  >
                    Privacy Policy
                  </Link>{' '}
                  and I am above 18 years old.
                </label>
              </div>

              {/* CONTINUE Button - Enabled ONLY when Checkbox is Checked */}
              <div
                className="pt-2"
                onClick={() => {
                  if (!isTermsAgreed) {
                    triggerTermsAnimation('Please agree and tick the checkbox to continue');
                  } else if (!phoneOrEmail.trim()) {
                    toast.error('Please enter your mobile number or email');
                  }
                }}
              >
                <button
                  type="submit"
                  disabled={!isContinueEnabled}
                  className={`w-full py-3.5 px-4 rounded-xs text-sm font-bold tracking-widest uppercase transition-all shadow-xs ${isContinueEnabled
                      ? 'bg-[#D26900] hover:bg-[#B45309] text-white cursor-pointer active:scale-[0.99]'
                      : 'bg-[#94969F] text-white cursor-not-allowed opacity-85 pointer-events-none'
                    }`}
                  title={!isTermsAgreed ? 'Please check the box to agree to Terms & Privacy Policy' : ''}
                >
                  {loading ? 'Please wait...' : 'CONTINUE'}
                </button>
              </div>
            </form>

            {/* Social Google Login Divider & Button */}
            <div className="pt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-[#6B7280]">or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLoginClick}
                disabled={isGoogleLoading}
                type="button"
                className={`mt-4 w-full flex items-center justify-center py-2.5 px-4 border rounded-sm text-sm font-semibold transition-all cursor-pointer gap-2.5 shadow-2xs ${isTermsAgreed
                    ? 'border-gray-200 text-[#282C3F] bg-white hover:bg-gray-50 active:scale-[0.99]'
                    : 'border-gray-200 text-[#282C3F] bg-white hover:bg-orange-50/20 active:scale-[0.99]'
                  }`}
                title={
                  !isTermsAgreed
                    ? 'Please tick the checkbox to agree to Terms & Privacy Policy'
                    : 'Continue with Google'
                }
              >
                <img
                  className="h-4 w-4"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                />
                <span>{isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* Get Help - placed below Continue with Google as requested */}
              <div className="text-xs text-[#535766] pt-3.5 text-center">
                Have trouble logging in?{' '}
                <Link
                  to="/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#D26900] hover:underline cursor-pointer"
                >
                  Get help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Informational Centered Modals (Terms, Privacy, Help)      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[#111827]">
                  {activeModal === 'terms' && (sitePages['terms-of-use']?.title || 'Terms of Use')}
                  {activeModal === 'privacy' && (sitePages['privacy-policy']?.title || 'Privacy Policy')}
                  {activeModal === 'help' && (sitePages['get-help']?.title || 'Need Help Logging In?')}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 text-xs text-[#535766] space-y-3 leading-relaxed whitespace-pre-line">
                {activeModal === 'terms' && (
                  sitePages['terms-of-use']?.description ? (
                    <p>{sitePages['terms-of-use'].description}</p>
                  ) : (
                    <>
                      <p>
                        Welcome to <strong>YTeddybags</strong>. By continuing to register or login, you agree to comply with and be bound by the following terms and conditions.
                      </p>
                      <p>1. You must be at least 18 years of age to purchase products and maintain an account on our platform.</p>
                      <p>2. All content, images, designs, and brand logos on YTeddybags are protected intellectual property.</p>
                    </>
                  )
                )}

                {activeModal === 'privacy' && (
                  sitePages['privacy-policy']?.description ? (
                    <p>{sitePages['privacy-policy'].description}</p>
                  ) : (
                    <>
                      <p>
                        At <strong>YTeddybags</strong>, your privacy and data security are our top priorities.
                      </p>
                      <p>1. We collect your mobile number, email, and delivery details exclusively to process your orders, updates, and customer support.</p>
                      <p>2. We never sell or share your personal data with unauthorized third parties.</p>
                    </>
                  )
                )}

                {activeModal === 'help' && (
                  sitePages['get-help']?.description ? (
                    <p>{sitePages['get-help'].description}</p>
                  ) : (
                    <>
                      <p>Having trouble logging into your YTeddybags account? We are here to help!</p>
                      <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-lg p-3 text-[#D26900] font-medium space-y-1">
                        <p>• Make sure you have entered a valid 10-digit mobile number or active email address.</p>
                        <p>• You can also use the one-click <strong>&quot;Continue with Google&quot;</strong> button below.</p>
                        <p>• For urgent assistance, contact our support team at <strong>support@yteddybags.com</strong>.</p>
                      </div>
                    </>
                  )
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={
                    activeModal === 'terms'
                      ? '/terms'
                      : activeModal === 'privacy'
                        ? '/privacy'
                        : '/help'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#D26900] hover:underline flex items-center gap-1"
                >
                  <span>Open Dedicated Page with Header</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 bg-[#D26900] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
