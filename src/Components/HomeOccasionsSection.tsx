import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeBanner, type HomeOccasionItem } from '../Context/HomeBannerContext';

// Formats date badge e.g. "3RD OCT" with superscript suffix matching reference image
function formatBadgeText(badge: string) {
  const trimmed = badge.trim();
  const match = trimmed.match(/^(\d+)(st|nd|rd|th)?\s*(.*)$/i);
  if (match) {
    const [, num, suffix, rest] = match;
    return (
      <span className="inline-flex items-baseline font-black tracking-wider leading-none">
        <span className="text-[11px] sm:text-xs font-black">{num}</span>
        {suffix && (
          <span className="text-[7.5px] sm:text-[8.5px] font-bold uppercase relative -top-[3px] ml-[1px] mr-[2px]">
            {suffix}
          </span>
        )}
        {rest && <span className="text-[10px] sm:text-[11px] font-black">{rest.toUpperCase()}</span>}
      </span>
    );
  }
  return <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">{trimmed}</span>;
}

export interface HomeOccasionsSectionProps {
  sectionId?: string;
  paddingTop?: number;
  paddingBottom?: number;
  titleOverride?: string;
  itemIds?: string[];
  customItems?: HomeOccasionItem[];
}

export default function HomeOccasionsSection({
  sectionId,
  paddingTop = 1.5,
  paddingBottom = 2.0,
  titleOverride,
  itemIds,
  customItems,
}: HomeOccasionsSectionProps = {}) {
  const { occasions: allOccasions, occasionsSettings, occasionsLoading } = useHomeBanner();
  const occasions = (function() {
    if (Array.isArray(customItems) && customItems.length > 0) {
      const active = customItems.filter((o) => o.is_active !== false);
      if (active.length > 0) return active;
    }
    if (sectionId && sectionId !== 'occasions_1') {
      return [];
    }
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      const filtered = allOccasions.filter((o) => itemIds.includes(o.id) && o.is_active !== false);
      return filtered.length > 0 ? filtered : allOccasions;
    }
    return allOccasions;
  })();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll positions for chevron visibility with safe overflow tolerance
  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Check if cards actually overflow the viewport width
    const hasOverflow = Math.ceil(el.scrollWidth) > Math.ceil(el.clientWidth) + 16;
    if (!hasOverflow) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 15);
    setCanScrollRight(Math.ceil(el.scrollLeft + el.clientWidth) < Math.floor(el.scrollWidth) - 15);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollContainerRef.current;
    if (!el) return;

    // Observe size changes of container and its children to accurately detect overflow
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateScrollButtons();
      });
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer?.observe(child));
    }

    // Settling timers to ensure correct state after webfonts/images load
    const rafId = requestAnimationFrame(updateScrollButtons);
    const timer1 = setTimeout(updateScrollButtons, 120);
    const timer2 = setTimeout(updateScrollButtons, 400);

    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      observer?.disconnect();
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [occasions, updateScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // If disabled or empty, return null
  const isEnabled = customItems !== undefined ? true : (occasionsSettings.is_enabled !== false);
  if (!isEnabled || (occasions.length === 0 && !occasionsLoading)) {
    return null;
  }

  const handleCardClick = (item: HomeOccasionItem) => {
    if (!item.link_url) return;
    if (item.link_url.startsWith('http://') || item.link_url.startsWith('https://')) {
      window.open(item.link_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.link_url);
    }
  };

  const sectionTitle = titleOverride || occasionsSettings.section_title || 'Gifts For Every Occasion';

  return (
    <div
      className="w-full relative select-none bg-transparent"
      style={{
        paddingTop: `${paddingTop}rem`,
        paddingBottom: `${paddingBottom}rem`,
      }}
    >
      {/* Container expands smoothly on wide monitors (up to 1880px) to eliminate excessive side margins */}
      <div className="relative w-full max-w-[1880px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        {/* Section Heading */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-4.5 px-0.5">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[26px] font-bold text-gray-900 tracking-tight">
            {sectionTitle}
          </h2>
        </div>

        {/* Relative wrapper for cards & floating desktop scroll buttons */}
        <div className="relative group/wrapper">
          {/* Left Scroll Button (Only visible when actual overflow exists and scrolled right) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll Left"
              className="hidden md:flex absolute -left-3 lg:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 text-gray-700 hover:text-black shadow-lg hover:shadow-xl border border-gray-200/90 items-center justify-center transition-all cursor-pointer active:scale-95 hover:bg-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Cards Horizontal Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="w-full flex items-stretch gap-3 sm:gap-3.5 md:gap-4 lg:gap-4.5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-0.5"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {occasions.map((item) => {
              const bgColor = item.bg_color || '#F9D3B4';
              const hasImage = Boolean(item.image_url && item.image_url.trim() !== '');

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  /* Completely stable positioning: NO translateY on hover to prevent jumping/jitter */
                  className="group relative shrink-0 cursor-pointer rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md border-2 border-transparent hover:border-white/90 transition-all duration-200"
                  style={{
                    backgroundColor: bgColor,
                    /* Responsive sizing: compact on laptop (~240-270px), naturally expands on large screens (~310-340px) */
                    flex: '1 0 clamp(210px, 17.5vw, 340px)',
                    maxWidth: '350px',
                    height: 'clamp(152px, 14vw, 202px)',
                  }}
                >
                  {/* Subtle inner soft gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/5 pointer-events-none rounded-2xl" />

                  {/* Hanging Date Tag attached to top edge (matching reference Image 2) */}
                  {item.date_badge && item.date_badge.trim() !== '' && (
                    <div className="absolute -top-[2px] right-4 sm:right-5 md:right-6 z-20 px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-white/85 backdrop-blur-xs rounded-b-xl text-[#18181b] shadow-2xs pointer-events-none select-none flex items-center justify-center border-b border-x border-white/60">
                      {formatBadgeText(item.date_badge)}
                    </div>
                  )}

                  {/* Card Header: Occasion Title with Right Arrow */}
                  <div className="relative z-10 flex items-start justify-between gap-2 w-full">
                    <div className="flex items-center gap-1 text-gray-900 group-hover:text-black font-semibold sm:font-bold text-sm sm:text-base md:text-[17px] tracking-tight max-w-[65%] sm:max-w-[70%]">
                      <span>{item.title}</span>
                      <span className="text-gray-600 group-hover:text-black text-sm sm:text-base">
                        ›
                      </span>
                    </div>
                  </div>

                  {/* Optional Card Image: positioned and zoomed according to admin setting */}
                  {hasImage ? (
                    (() => {
                      const pos = item.image_position || 'bottom-right';
                      const scaleRaw = Number(item.image_scale);
                      const scale = !isNaN(scaleRaw) && scaleRaw > 0 ? (scaleRaw > 10 ? scaleRaw / 100 : scaleRaw) : 1.0;
                      
                      let posClass = 'bottom-0 right-0 sm:right-1 md:right-2 justify-end items-end';
                      let origin = 'bottom right';
                      if (pos === 'bottom-center') {
                        posClass = 'bottom-0 left-1/2 -translate-x-1/2 justify-center items-end';
                        origin = 'bottom center';
                      } else if (pos === 'center-right') {
                        posClass = 'top-1/2 -translate-y-1/2 right-1 sm:right-2 justify-end items-center';
                        origin = 'center right';
                      }

                      return (
                        <div className={`absolute ${posClass} h-[82%] sm:h-[86%] md:h-[90%] max-w-[65%] sm:max-w-[70%] flex pointer-events-none z-0 overflow-visible`}>
                          <img
                            src={item.image_url!}
                            alt={item.title}
                            style={{
                              transform: `scale(${scale})`,
                              transformOrigin: origin,
                            }}
                            className="max-h-full max-w-full object-contain drop-shadow-sm pointer-events-none transition-transform duration-200"
                            loading="lazy"
                            onLoad={updateScrollButtons}
                          />
                        </div>
                      );
                    })()
                  ) : (
                    /* Subtle decorative graphic when card has no image */
                    <div className="relative z-0 flex items-end justify-end text-black/10 select-none pointer-events-none self-end mt-auto">
                      <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Scroll Button (Only visible when actual overflow exists and more cards to scroll) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll Right"
              className="hidden md:flex absolute -right-3 lg:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 text-gray-700 hover:text-black shadow-lg hover:shadow-xl border border-gray-200/90 items-center justify-center transition-all cursor-pointer active:scale-95 hover:bg-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
