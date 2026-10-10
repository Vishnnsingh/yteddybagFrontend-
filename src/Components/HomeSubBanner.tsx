import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeBanner, type HomeSubBannerItem } from '../Context/HomeBannerContext';

export interface HomeSubBannerProps {
  sectionId?: string;
  paddingTop?: number;
  paddingBottom?: number;
  titleOverride?: string;
  itemIds?: string[];
  customItems?: HomeSubBannerItem[];
}

export default function HomeSubBanner({
  sectionId,
  paddingTop = 0.5,
  paddingBottom = 0.75,
  titleOverride,
  itemIds,
  customItems,
}: HomeSubBannerProps = {}) {
  const { subBanners: allSubBanners, subBannerSettings, subBannerLoading } = useHomeBanner();
  const subBanners = (function() {
    if (Array.isArray(customItems) && customItems.length > 0) {
      const active = customItems.filter((b) => b.is_active !== false);
      if (active.length > 0) return active;
    }
    if (sectionId && sectionId !== 'sub_banner_1') {
      return [];
    }
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      const filtered = allSubBanners.filter((b) => itemIds.includes(b.id) && b.is_active !== false);
      return filtered.length > 0 ? filtered : allSubBanners;
    }
    return allSubBanners;
  })();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Check scroll positions with safe overflow tolerance to prevent false navigation arrows on refresh
  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
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

    // Settling timers for DOM font/image load
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
  }, [subBanners, updateScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.7;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // If master toggle is inactive or no items, hide the strip completely
  const isEnabled = customItems !== undefined ? true : (subBannerSettings.is_enabled !== false);
  if (!isEnabled || (subBanners.length === 0 && !subBannerLoading)) {
    return null;
  }

  const handleItemClick = (item: HomeSubBannerItem) => {
    if (!item.link_url) return;
    if (item.link_url.startsWith('http://') || item.link_url.startsWith('https://')) {
      window.open(item.link_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.link_url);
    }
  };

  return (
    <div
      className="w-full relative select-none bg-white/65 backdrop-blur-xs border-b border-black/5"
      style={{
        paddingTop: `${paddingTop}rem`,
        paddingBottom: `${paddingBottom}rem`,
      }}
    >
      {titleOverride && (
        <div className="w-full max-w-[1880px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10 mb-2">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">{titleOverride}</h2>
        </div>
      )}
      {/* Container expands smoothly on wide monitors (up to 1880px) matching occasion section */}
      <div className="relative w-full max-w-[1880px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        {/* Left Scroll Button (Only visible when actual overflow exists) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll Left"
            className="hidden md:flex absolute -left-1 lg:left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:text-[#D26900] shadow-md hover:shadow-lg border border-gray-200/90 items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable Container (Smooth spacing across laptops and large screens) */}
        <div
          ref={scrollContainerRef}
          className="w-full flex items-center justify-start lg:justify-between gap-3 sm:gap-5 md:gap-7 lg:gap-10 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {subBanners.map((item) => {
            const isHovered = hoveredItemId === item.id;
            const hoverBg = item.hover_bg_color || subBannerSettings.default_hover_bg || '#FFF7ED';

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                /* Rock solid item container: NO transform scale on hover to eliminate jump */
                className="flex flex-col items-center justify-center group cursor-pointer shrink-0"
                style={{ minWidth: '76px', maxWidth: '125px' }}
              >
                {/* Icon Container with Circular Hover Disc */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-26 lg:h-26 rounded-full flex items-center justify-center overflow-hidden">
                  {/* Circular Hover Disc - clean opacity fade without scaling jump */}
                  <div
                    className={`absolute inset-0 rounded-full transition-opacity duration-200 pointer-events-none ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      backgroundColor: hoverBg,
                    }}
                  />

                  {/* Icon / Image - stable positioning without scale jump */}
                  <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-15 md:h-15 lg:w-17 lg:h-17 flex items-center justify-center pointer-events-none">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
                      loading="lazy"
                      onLoad={updateScrollButtons}
                    />
                  </div>
                </div>

                {/* Text Label Below Icon */}
                <span className="mt-1.5 text-[11px] sm:text-xs md:text-sm font-bold text-gray-800 group-hover:text-[#D26900] text-center tracking-tight truncate w-full transition-colors duration-150">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button (Only visible when actual overflow exists) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll Right"
            className="hidden md:flex absolute -right-1 lg:right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:text-[#D26900] shadow-md hover:shadow-lg border border-gray-200/90 items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
