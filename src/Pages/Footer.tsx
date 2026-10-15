import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useHeaderNavigation } from '../Context/HeaderNavigationContext';

export default function Footer() {
  const { headerItems } = useHeaderNavigation();
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shopping: false,
    policies: false,
    contact: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubscribed(true);
    setEmailInput('');
    toast.success('🎉 Welcome to the YTeddy Club! Use code TEDDY15 for 15% off your first order.');
  };

  const scrollToTop = () => {
    const scrollContainer = document.getElementById('app-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resolve dynamic categories from Header Navigation (first 7 active items)
  const dynamicCategories = (headerItems || [])
    .filter((it) => it.is_active !== false)
    .slice(0, 7);

  // Fallback categories if none configured
  const fallbackCategories = [
    { title: 'Teddy Backpacks', path: '/category/teddy-bags' },
    { title: 'Kids School Bags', path: '/category/school-bags' },
    { title: 'Soft Toys & Plushies', path: '/category/soft-toys' },
    { title: 'Personalised Gifts', path: '/category/personalised' },
    { title: 'Bestseller Collections', path: '/category/bestsellers' },
    { title: 'All Products', path: '/products' },
  ];

  const displayedCategories =
    dynamicCategories.length > 0
      ? dynamicCategories.map((c) => ({ title: c.title, path: c.path }))
      : fallbackCategories;

  const popularSearches = [
    'Teddy Bags',
    'Soft Toys',
    'Kids School Bags',
    'Plush Backpacks',
    'Unicorn Bags',
    'Giant Teddy Bear',
    'Kindergarten Bag',
    'Personalised Gifts',
    'Cute Plushies',
    'Travel Trolley For Kids',
    'Nursery Bag',
    'Soft Dolls',
    'Birthday Gifts For Kids',
    'Kawaii Bags',
    'Stuffed Animals',
    'Animal Backpacks',
    'Plush Sling Bags',
    'Teddy Backpacks For Girls',
    'Baby Pillow Toys',
    'Cartoon Bags',
  ];

  return (
    <footer className="w-full bg-[#FAFBFC] text-[#282C3F] mt-auto border-t border-[#EAEAEC] select-none z-10 font-sans">
      {/* 1. Top Offer & VIP Newsletter Strip (Light Luxury Style) */}
      <div className="w-full border-b border-[#EAEAEC] bg-[#F5F5F6]/70">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-7">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-8">
            {/* Offer Text */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#D26900]/10 text-[#D26900] border border-[#D26900]/25">
                  Exclusive Offer
                </span>
                <span className="text-xs text-[#696E79] font-medium hidden sm:inline">
                  • Instant 15% off on your first purchase
                </span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#282C3F] tracking-tight">
                Subscribe &amp; Get <span className="text-[#D26900] font-extrabold">15% OFF</span> On Your First Order
              </h3>
              <p className="text-xs text-[#696E79] mt-0.5">
                Join our club to get secret discount codes, new plush releases &amp; seasonal gift guides.
              </p>
            </div>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2 max-w-md">
              <div className="relative w-full sm:w-72">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full h-10 px-3.5 text-xs text-[#282C3F] bg-white border border-[#D4D5D9] focus:border-[#D26900] rounded-sm outline-none transition-colors placeholder:text-[#94969F]"
                  aria-label="Email address for discounts"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto h-10 px-5 bg-[#D26900] hover:bg-[#b85b00] active:scale-98 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-150 cursor-pointer shrink-0 shadow-2xs"
              >
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Main Multi-Column Content Area (Exact Layout & Spacing of Header) */}
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: ONLINE SHOPPING & USEFUL LINKS */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <button
                type="button"
                onClick={() => toggleSection('shopping')}
                className="w-full flex items-center justify-between md:cursor-default"
              >
                <h4 className="text-xs font-extrabold text-[#282C3F] uppercase tracking-wider">
                  ONLINE SHOPPING
                </h4>
                <span className="md:hidden text-gray-500">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openSections.shopping ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <ul
                className={`mt-3.5 space-y-2 text-xs text-[#696E79] ${
                  openSections.shopping ? 'block' : 'hidden md:block'
                }`}
              >
                {displayedCategories.map((cat, idx) => (
                  <li key={cat.path + idx}>
                    <Link to={cat.path} className="hover:text-[#282C3F] transition-colors block py-0.5">
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* USEFUL LINKS */}
            <div className="hidden md:block pt-2 border-t border-[#EAEAEC]">
              <h4 className="text-xs font-extrabold text-[#282C3F] uppercase tracking-wider mb-3">
                USEFUL LINKS
              </h4>
              <ul className="space-y-2 text-xs text-[#696E79]">
                <li>
                  <Link to="/get-help" className="hover:text-[#282C3F] transition-colors block py-0.5">
                    Blog &amp; Gifting Guides
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="hover:text-[#282C3F] transition-colors block py-0.5">
                    Track Your Orders
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="hover:text-[#282C3F] transition-colors block py-0.5">
                    My Account
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@yteddybags.com?subject=Bulk%20Order%20Enquiry"
                    className="hover:text-[#282C3F] transition-colors block py-0.5"
                  >
                    Bulk &amp; Corporate Gifting
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: CUSTOMER POLICIES */}
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => toggleSection('policies')}
              className="w-full flex items-center justify-between md:cursor-default"
            >
              <h4 className="text-xs font-extrabold text-[#282C3F] uppercase tracking-wider">
                CUSTOMER POLICIES
              </h4>
              <span className="md:hidden text-gray-500">
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${openSections.policies ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            <ul
              className={`mt-3.5 space-y-2 text-xs text-[#696E79] ${
                openSections.policies ? 'block' : 'hidden md:block'
              }`}
            >
              <li>
                <Link to="/get-help" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/get-help" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  FAQ &amp; Support Desk
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  T&amp;C (Terms &amp; Conditions)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  Terms Of Use
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/get-help" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/get-help" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  Cancellation &amp; Returns
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/get-help" className="hover:text-[#282C3F] transition-colors block py-0.5">
                  Grievance Officer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CUSTOMER SUPPORT & KEEP IN TOUCH */}
          <div className="lg:col-span-3 space-y-4">
            {/* Customer Support Heading & Details */}
            <div>
              <h4 className="text-xs font-extrabold text-[#282C3F] uppercase tracking-wider mb-2">
                CUSTOMER SUPPORT
              </h4>
              <p className="text-xs text-[#696E79] leading-relaxed">
                In case of any concerns or questions regarding your order, our dedicated team is here to help.
              </p>
            </div>

            {/* Helpline Contact Card */}
            <div className="text-xs text-[#696E79] space-y-1.5 p-3.5 rounded-sm bg-[#F5F5F6] border border-[#EAEAEC]">
              <span className="block text-[10.5px] font-bold text-[#94969F] uppercase tracking-wider">
                Helpline &amp; Support:
              </span>
              <a
                href="tel:+919876543210"
                className="block text-sm font-bold text-[#282C3F] hover:text-[#D26900] transition-colors"
              >
                +91 98765 43210
              </a>
              <span className="block text-[11px] text-[#696E79]">
                (Mon - Sat, 9:00 AM - 7:00 PM IST)
              </span>
              <div className="pt-2 border-t border-[#EAEAEC] space-y-1">
                <a
                  href="mailto:support@yteddybags.com"
                  className="block text-xs text-[#696E79] hover:text-[#D26900] transition-colors"
                >
                  <span className="text-[#94969F]">Email:</span> support@yteddybags.com
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:text-emerald-800 transition-colors pt-0.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* KEEP IN TOUCH: Flat Minimalist Social Icons (Exact Image 2 Style - No Shiny Glow) */}
            <div className="pt-1">
              <h4 className="text-xs font-extrabold text-[#282C3F] uppercase tracking-wider mb-2.5">
                KEEP IN TOUCH
              </h4>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-sm bg-[#F5F5F6] hover:bg-[#EAEAEC] text-[#696E79] hover:text-[#282C3F] flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-sm bg-[#F5F5F6] hover:bg-[#EAEAEC] text-[#696E79] hover:text-[#282C3F] flex items-center justify-center transition-colors"
                  aria-label="Twitter / X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-sm bg-[#F5F5F6] hover:bg-[#EAEAEC] text-[#696E79] hover:text-[#282C3F] flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-sm bg-[#F5F5F6] hover:bg-[#EAEAEC] text-[#696E79] hover:text-[#282C3F] flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: 3 LINE-ART TRUST GUARANTEES (Exact Image 2 Style - Clean Minimal Line Art) */}
          <div className="lg:col-span-3 space-y-6 pt-2 lg:pt-0">
            {/* Guarantee 1: 100% ORIGINAL */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 text-[#282C3F] flex items-center justify-center">
                {/* Stamp / Seal Line-Art Icon */}
                <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M24 4l3.5 4.5 5.5-1.5 1.5 5.5 5.5 1.5-1 5.5 4 4-3 5 2 5.5-5 2.5-.5 5.5-5.5.5-2.5 5-5-2.5-5 2.5-2.5-5-5.5-.5-.5-5.5-5-2.5 2-5.5-3-5 4-4-1-5.5 5.5-1.5 1.5-5.5 5.5 1.5L24 4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 24l5 5 11-11" />
                </svg>
              </div>
              <div className="text-xs text-[#696E79] leading-tight pt-0.5">
                <span className="font-bold text-[#282C3F] block text-xs tracking-tight">100% ORIGINAL guarantee</span>
                <span className="block mt-0.5">for all products at yteddybags.com</span>
              </div>
            </div>

            {/* Guarantee 2: Return within 7 days */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 text-[#282C3F] flex items-center justify-center">
                {/* 7 Days Circular Return Arrow Icon */}
                <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="8" y="10" width="32" height="28" rx="4" />
                  <path strokeLinecap="round" d="M14 6v8M34 6v8" />
                  <text x="24" y="30" fontSize="13" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">7</text>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 32l-3-3 3-3" />
                  <path strokeLinecap="round" d="M15 29h7a4 4 0 0 1 4 4" />
                </svg>
              </div>
              <div className="text-xs text-[#696E79] leading-tight pt-0.5">
                <span className="font-bold text-[#282C3F] block text-xs tracking-tight">Return within 7 days</span>
                <span className="block mt-0.5">of receiving your order</span>
              </div>
            </div>

            {/* Guarantee 3: Free delivery */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 text-[#282C3F] flex items-center justify-center">
                {/* Clean Truck Line-Art Icon */}
                <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h24v18H6zM30 20h8l6 6v6h-14v-12z" />
                  <circle cx="14" cy="34" r="4" />
                  <circle cx="36" cy="34" r="4" />
                  <path strokeLinecap="round" d="M2 18h2M0 24h3" />
                </svg>
              </div>
              <div className="text-xs text-[#696E79] leading-tight pt-0.5">
                <span className="font-bold text-[#282C3F] block text-xs tracking-tight">Get free delivery</span>
                <span className="block mt-0.5">for every order above ₹499</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Popular Searches Strip (Exact Myntra Image 2 Inline Style) */}
        <div className="pt-8 mt-6 border-t border-[#EAEAEC]">
          <div className="flex flex-col sm:flex-row items-baseline gap-2 mb-2">
            <h4 className="text-xs font-bold text-[#282C3F] uppercase tracking-wider shrink-0">
              POPULAR SEARCHES
            </h4>
            <div className="w-full h-px bg-[#EAEAEC] hidden sm:block" />
          </div>
          <div className="text-[11px] sm:text-[12px] text-[#696E79] leading-relaxed flex flex-wrap items-center">
            {popularSearches.map((term, index) => (
              <React.Fragment key={term}>
                <Link
                  to={`/products?search=${encodeURIComponent(term)}`}
                  className="hover:text-[#282C3F] hover:underline transition-colors"
                >
                  {term}
                </Link>
                {index < popularSearches.length - 1 && (
                  <span className="text-[#D4D5D9] mx-2 font-normal">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 4. Bottom Legal / Copyright Bar */}
        <div className="pt-8 mt-8 border-t border-[#EAEAEC] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#94969F]">
          {/* Left: Contact prompt */}
          <div className="flex items-center gap-1.5">
            <span>In case of any concerns?</span>
            <Link to="/get-help" className="text-[#D26900] font-bold hover:underline">
              Contact Us
            </Link>
          </div>

          {/* Center: Copyright */}
          <div className="text-center">
            <span>&copy; {new Date().getFullYear()} www.yteddybags.com. All rights reserved.</span>
          </div>

          {/* Right: Brand affiliation & Back to top button */}
          <div className="flex items-center gap-4">
            <span className="text-[#696E79] font-medium hidden sm:inline">
              A YTeddybags brand
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#696E79] hover:text-[#282C3F] bg-white border border-[#D4D5D9] hover:border-[#696E79] rounded-sm transition-colors cursor-pointer select-none"
              title="Scroll to top"
            >
              <span>Top</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
