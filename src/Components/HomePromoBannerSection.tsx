import { useState, useEffect, useRef } from 'react';
import { useHomeBanner } from '../Context/HomeBannerContext';

export interface HomePromoBannerSectionProps {
  sectionId?: string;
  paddingTop?: number;
  paddingBottom?: number;
  heightOverride?: 'compact' | 'standard' | 'tall';
  radiusOverride?: string;
  itemIds?: string[];
  customItems?: any[];
}

export default function HomePromoBannerSection({
  sectionId,
  paddingTop = 1.5,
  paddingBottom = 2.0,
  heightOverride,
  radiusOverride,
  itemIds,
  customItems,
}: HomePromoBannerSectionProps = {}) {
  const { promoBanners: allPromoBanners, promoBannerSettings, promoBannerLoading } = useHomeBanner();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeBanners = (function() {
    if (Array.isArray(customItems) && customItems.length > 0) {
      const active = customItems.filter((b) => b.is_active !== false);
      if (active.length > 0) return active;
    }
    if (sectionId && sectionId !== 'promo_banner_1') {
      return [];
    }
    let list = allPromoBanners.filter((b) => b.is_active !== false);
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      list = list.filter((b) => itemIds.includes(b.id));
    }
    return list;
  })();
  const totalSlides = activeBanners.length;

  // Autoplay slideshow for multiple banners
  useEffect(() => {
    if (totalSlides <= 1 || !promoBannerSettings.autoplay || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const intervalTime = Math.max(2000, promoBannerSettings.autoplay_interval || 4000);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, intervalTime);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalSlides, promoBannerSettings.autoplay, promoBannerSettings.autoplay_interval, isPaused]);

  // Reset index if out of bounds after slide deletion
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalSlides]);

  // If disabled or empty, do not render
  const isEnabled = customItems !== undefined ? true : (promoBannerSettings.is_enabled !== false);
  if (!isEnabled || (totalSlides === 0 && !promoBannerLoading)) {
    return null;
  }

  // Resolve Height Class (Supports instance override)
  const getHeightClasses = (): string => {
    const height = heightOverride || promoBannerSettings.banner_height;
    switch (height) {
      case 'compact':
        return 'h-[160px] sm:h-[190px] md:h-[220px] lg:h-[240px]';
      case 'tall':
        return 'h-[240px] sm:h-[300px] md:h-[360px] lg:h-[420px]';
      case 'standard':
      default:
        return 'h-[190px] sm:h-[240px] md:h-[280px] lg:h-[320px]';
    }
  };

  // Resolve Border Radius (Supports instance override)
  const getRadiusClass = (): string => {
    return radiusOverride || promoBannerSettings.border_radius || 'rounded-2xl';
  };

  return (
    <div
      className="w-full relative select-none"
      style={{
        paddingTop: `${paddingTop}rem`,
        paddingBottom: `${paddingBottom}rem`,
      }}
    >
      {/* Container aligned with other home sections */}
      <div className="relative w-full max-w-[1880px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        {/* Banner Strip Container - Strictly Non-Clickable Display Only */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`relative w-full overflow-hidden ${getHeightClasses()} ${getRadiusClass()} shadow-md transition-all duration-300 pointer-events-auto cursor-default`}
        >
          {/* Slides Loop */}
          {activeBanners.map((slide, idx) => {
            const isActive = idx === currentIndex;
            const textPos = slide.text_position || 'left';

            // Resolve text alignment container classes
            let alignmentClasses = 'items-center justify-start text-left pl-6 sm:pl-10 md:pl-14 lg:pl-20 pr-6';
            if (textPos === 'center') {
              alignmentClasses = 'items-center justify-center text-center px-6';
            } else if (textPos === 'right') {
              alignmentClasses = 'items-center justify-end text-right pr-6 sm:pr-10 md:pr-14 lg:pr-20 pl-6';
            }

            return (
              <div
                key={slide.id || idx}
                aria-hidden={!isActive}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image */}
                <img
                  src={slide.image_url}
                  alt={slide.title || 'Special Promotion Banner'}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Subtle Readability Gradient Overlay */}
                <div
                  className={`absolute inset-0 ${
                    textPos === 'left'
                      ? 'bg-gradient-to-r from-black/40 via-black/15 to-transparent'
                      : textPos === 'right'
                      ? 'bg-gradient-to-l from-black/40 via-black/15 to-transparent'
                      : 'bg-black/20'
                  }`}
                />

                {/* Overlay Typography (If text_position is not 'none') */}
                {textPos !== 'none' && (slide.title || slide.subtitle) && (
                  <div className={`absolute inset-0 flex ${alignmentClasses}`}>
                    <div className="max-w-2xl drop-shadow-sm flex flex-col gap-0.5 sm:gap-1.5 md:gap-2">
                      {/* Top Line (e.g. 'Joyful Gifts To') */}
                      {slide.title && slide.title.trim() !== '' && (
                        <h2
                          className="font-extrabold tracking-tight leading-none text-2xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-md transition-colors"
                          style={{ color: slide.title_color || '#FFFFFF' }}
                        >
                          {slide.title}
                        </h2>
                      )}

                      {/* Bottom Line (e.g. 'Make It Special') */}
                      {slide.subtitle && slide.subtitle.trim() !== '' && (
                        <h3
                          className="font-black tracking-tight leading-none text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-md transition-colors"
                          style={{ color: slide.subtitle_color || '#111827' }}
                        >
                          {slide.subtitle}
                        </h3>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Autoplay Slide Indicators / Dots (Only shown if > 1 slide and show_dots is true) */}
          {totalSlides > 1 && promoBannerSettings.show_dots !== false && (
            <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-sm">
              {activeBanners.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === currentIndex
                      ? 'w-6 sm:w-7 bg-white shadow-sm'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
