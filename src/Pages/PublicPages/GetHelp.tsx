import React, { useEffect } from 'react';
import { useHeaderNavigation } from '../../Context/HeaderNavigationContext';

const GetHelp: React.FC = () => {
  const { sitePages, pagesLoading, refreshSitePages } = useHeaderNavigation();
  const pageData = sitePages['get-help'] || {
    title: 'Customer Help & Support',
    description: `Need assistance with your YTeddybags account or recent orders? We are here to help you every step of the way.\n\n1. Having Trouble Logging In?\n• Mobile Number: Ensure your 10-digit mobile number is entered correctly without extra spaces or symbols.\n• Google Sign-in: You can use the convenient "Continue with Google" button for instant one-click login. Make sure you have agreed to the Terms of Use and Privacy Policy.\n• Account Verification: If you do not receive an OTP or login link, ensure your network connection is stable.\n\n2. Order Tracking & Shipping:\n• Once your order is dispatched, a tracking number and courier link will be sent to your registered email and SMS.\n• Standard delivery takes 3 to 7 business days across India.\n\n3. Returns & Replacements:\n• We offer a hassle-free 7-day return and exchange policy for defective or damaged items.\n• To initiate a return, visit your order history or contact our support desk.\n\n4. Contact Support Desk:\n• Email Support: support@yteddybags.com\n• Helpline: +91 98765 43210 (Mon-Sat, 9:00 AM - 7:00 PM IST)\n• WhatsApp Support: Available for quick order status queries.`,
    updated_at: new Date().toISOString(),
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    refreshSitePages();
    document.title = `YTEDDYBAGS: ${pageData.title ? pageData.title.toUpperCase() : 'CUSTOMER HELP & SUPPORT'}`;
  }, [pageData.title, refreshSitePages]);

  const rawDescription = pageData.description || '';
  const paragraphs = rawDescription.split('\n\n').filter((p) => p.trim().length > 0);

  const displayTitle = pageData.title
    ? pageData.title.toUpperCase().startsWith('YTEDDYBAGS')
      ? pageData.title.toUpperCase()
      : `YTEDDYBAGS: ${pageData.title.toUpperCase()}`
    : 'YTEDDYBAGS: CUSTOMER HELP & SUPPORT';

  return (
    <div className="bg-white min-h-screen text-[#282C3F] py-8 sm:py-12 px-4 sm:px-8 lg:px-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Language selector & top bar (Exact Myntra aesthetic) */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-gray-300 rounded text-xs text-[#282C3F] font-medium bg-white shadow-2xs">
            <svg className="w-3.5 h-3.5 text-[#535766]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>English</span>
            <span className="text-[10px] text-gray-500">▼</span>
          </div>
        </div>

        {/* Centered Main Title */}
        <h1 className="text-lg sm:text-xl font-bold text-[#282C3F] tracking-wide text-center uppercase mb-8">
          {displayTitle}
        </h1>

        {/* Disclaimer */}
        <div className="mb-6">
          <h4 className="font-bold text-xs sm:text-[13px] text-[#282C3F] mb-1">Help &amp; Support Assistance</h4>
          <p className="text-xs sm:text-[12px] text-[#696E79] leading-relaxed">
            Our 24/7 customer care team is dedicated to providing you with the smoothest shopping experience.
          </p>
        </div>

        {/* Main Content Body */}
        {pagesLoading && paragraphs.length === 0 ? (
          <div className="space-y-4 py-8">
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-4/5 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
          </div>
        ) : (
          <div className="text-xs sm:text-[13px] text-[#3E4152] leading-relaxed space-y-4">
            {paragraphs.map((p, idx) => {
              const trimmed = p.trim();
              const match = trimmed.match(/^([0-9]+\.\s+[^:\n]+:?)([\s\S]*)$/);
              if (match) {
                const heading = match[1];
                const rest = match[2];
                return (
                  <div key={idx} className="pt-2">
                    <h2 className="font-bold text-xs sm:text-[13.5px] text-[#282C3F] mb-1">
                      {heading}
                    </h2>
                    {rest.trim() && (
                      <p className="text-xs sm:text-[13px] text-[#3E4152] leading-relaxed whitespace-pre-line">
                        {rest.trim()}
                      </p>
                    )}
                  </div>
                );
              }
              return (
                <p key={idx} className="whitespace-pre-line text-xs sm:text-[13px] text-[#3E4152] leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetHelp;
