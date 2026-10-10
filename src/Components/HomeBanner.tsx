import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomeBanner, type HomeBannerItem } from '../Context/HomeBannerContext';

interface HomeBannerProps {
  sectionId?: string;
  forcedTheme?: string;
  isDashboardPreview?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  itemIds?: string[];
  customItems?: HomeBannerItem[];
}

export default function HomeBanner({
  sectionId,
  forcedTheme,
  isDashboardPreview: _isDashboardPreview = false,
  paddingTop,
  paddingBottom,
  itemIds,
  customItems,
}: HomeBannerProps = {}) {
  const { banners: allBanners, loading, activeTheme } = useHomeBanner();
  const banners = React.useMemo(() => {
    // 1. If customItems has active items, always use them
    if (Array.isArray(customItems) && customItems.length > 0) {
      const active = customItems.filter((b) => b.is_active !== false);
      if (active.length > 0) return active;
    }

    // 2. If it's a NEW section (not hero_banner_1), it must start blank
    if (sectionId && sectionId !== 'hero_banner_1') {
      return [];
    }

    // 3. For default hero_banner_1: ALWAYS fall back to DB banners (allBanners)
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      const filtered = allBanners.filter((b) => itemIds.includes(b.id) && b.is_active !== false);
      return filtered.length > 0 ? filtered : allBanners;
    }
    return allBanners;
  }, [allBanners, itemIds, customItems, sectionId]);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Selected theme (supports forcedTheme for admin preview or global activeTheme)
  const currentTheme = forcedTheme || activeTheme || 'peek-carousel';

  // Auto-play interval (5 seconds per slide)
  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, banners.length, nextSlide]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (loading && banners.length === 0) {
    return (
      <div className="w-full h-[88vw] min-h-[350px] sm:h-[52vw] sm:min-h-[400px] md:h-[500px] lg:h-[580px] max-h-[640px] bg-neutral-900 animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner: HomeBannerItem = banners[currentIndex] || banners[0];
  const prevBanner: HomeBannerItem = banners[(currentIndex - 1 + banners.length) % banners.length];
  const nextBanner: HomeBannerItem = banners[(currentIndex + 1) % banners.length];

  const handleBannerClick = (banner: HomeBannerItem) => {
    if (!banner.link_url) return;
    if (banner.link_url.startsWith('http://') || banner.link_url.startsWith('https://')) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(banner.link_url);
    }
  };

  // Reusable Content Text Overlay renderer (border-free buttons, responsive typography)
  const renderOverlayContent = (banner: HomeBannerItem, isCompact = false) => {
    if (!banner.show_overlay || (!banner.title && !banner.button_text)) return null;

    return (
      <div
        className={`absolute inset-0 z-10 flex items-center pointer-events-none ${
          isCompact ? 'px-4 sm:px-8 md:px-12' : 'px-3 sm:px-8 md:px-16 lg:px-24'
        }`}
      >
        <div
          className={`w-full text-white ${
            banner.overlay_position === 'right'
              ? 'max-w-[64%] sm:max-w-[55%] md:max-w-xl ml-auto text-right flex flex-col items-end'
              : banner.overlay_position === 'left'
              ? 'max-w-[64%] sm:max-w-[55%] md:max-w-xl mr-auto text-left flex flex-col items-start'
              : 'max-w-[92%] sm:max-w-[75%] md:max-w-2xl mx-auto text-center flex flex-col items-center'
          }`}
        >
          {banner.title && (
            <motion.h2
              key={`title-${banner.id || currentIndex}`}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{
                color: banner.title_color || '#FFFFFF',
                fontFamily: banner.font_family ? `"${banner.font_family}", sans-serif` : undefined,
              }}
              className="text-xs xs:text-sm sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] drop-shadow-md break-words"
            >
              {banner.title}
            </motion.h2>
          )}

          {banner.subtitle && (
            <motion.p
              key={`sub-${banner.id || currentIndex}`}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              style={{
                color: banner.subtitle_color || '#F3F4F6',
                fontFamily: banner.font_family ? `"${banner.font_family}", sans-serif` : undefined,
              }}
              className="mt-1 sm:mt-2.5 md:mt-4 text-[9px] xs:text-[11px] sm:text-xs md:text-base font-medium max-w-lg leading-snug sm:leading-relaxed drop-shadow-sm line-clamp-2 sm:line-clamp-none"
            >
              {banner.subtitle}
            </motion.p>
          )}

          {banner.button_text && (
            <motion.div
              key={`btn-${banner.id || currentIndex}`}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-2 sm:mt-4 md:mt-6 pointer-events-auto"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick(banner);
                }}
                style={{
                  backgroundColor: banner.button_bg_color || '#D26900',
                  color: banner.button_text_color || '#FFFFFF',
                  fontFamily: banner.font_family ? `"${banner.font_family}", sans-serif` : undefined,
                }}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 md:px-8 py-1.5 sm:py-2.5 md:py-3 hover:brightness-110 active:scale-95 font-extrabold text-[10px] sm:text-xs md:text-sm tracking-wider uppercase rounded-xl shadow-xl transition-all duration-200 cursor-pointer border-0"
              >
                <span>{banner.button_text}</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // THEME 2: Side-Peek Rounded Showcase (3D Layered Deck - Sata Kar / Elevated Center)
  // Center card elevated on top (z-20, -translate-y, shadow-2xl), with left & right
  // cards tucked directly behind (z-10, negative margins - no gaps), and circular CTA nav buttons.
  // --------------------------------------------------------------------------
  if (currentTheme === 'peek-carousel') {
    return (
      <div
        className="w-full relative overflow-hidden select-none flex items-center justify-center"
        style={{
          paddingTop: paddingTop ? `${paddingTop}rem` : undefined,
          paddingBottom: paddingBottom ? `${paddingBottom}rem` : undefined,
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Peeking Slide (Tucked directly behind center card on left edge, sata kar, NO gap) */}
        {banners.length > 1 && (
          <div
            onClick={prevSlide}
            title="Previous Banner"
            className="w-[18%] xs:w-[19%] sm:w-[18%] md:w-[17%] lg:w-[16%] h-[180px] xs:h-[220px] sm:h-[295px] md:h-[365px] lg:h-[420px] -mr-3 xs:-mr-5 sm:-mr-8 md:-mr-12 shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:opacity-95 z-10 bg-neutral-900 border-0 group relative brightness-90 hover:brightness-100"
          >
            {prevBanner.media_type === 'video' ? (
              <video src={prevBanner.media_url} muted playsInline className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <img src={prevBanner.media_url} alt="Previous banner" className="w-full h-full object-cover pointer-events-none" />
            )}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
          </div>
        )}

        {/* Center Active Banner Card (Elevated on top z-20, prominent 3D shadow, raised vertically, NO borders) */}
        <div
          className="w-[78%] xs:w-[78%] sm:w-[80%] md:w-[80%] lg:w-[78%] h-[200px] xs:h-[240px] sm:h-[320px] md:h-[390px] lg:h-[450px] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.38)] relative bg-neutral-950 cursor-pointer border-0 z-20 -translate-y-1 sm:-translate-y-1.5"
          onClick={() => handleBannerClick(currentBanner)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentBanner.id || currentIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Center Banner Media */}
              {currentBanner.media_type === 'video' ? (
                <video
                  src={currentBanner.media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center pointer-events-none"
                />
              ) : (
                <img
                  src={currentBanner.media_url}
                  alt={currentBanner.title || 'Home Banner'}
                  className="w-full h-full object-cover object-center pointer-events-none"
                  loading="eager"
                />
              )}

              {/* Subtle gradient overlay */}
              {currentBanner.show_overlay && (
                <div
                  className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                    currentBanner.overlay_position === 'right'
                      ? 'bg-gradient-to-l from-black/60 via-black/30 to-transparent'
                      : currentBanner.overlay_position === 'left'
                      ? 'bg-gradient-to-r from-black/65 via-black/30 to-transparent'
                      : 'bg-gradient-to-t from-black/60 via-black/25 to-black/10'
                  }`}
                />
              )}

              {/* Text & CTA Overlay */}
              {renderOverlayContent(currentBanner, true)}
            </motion.div>
          </AnimatePresence>

          {/* Slider Pagination Dots (Matching website theme) */}
          {banners.length > 1 && (
            <div className="absolute bottom-2.5 sm:bottom-4 inset-x-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md shadow-lg border-0">
                {banners.map((b, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={b.id || idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`pointer-events-auto transition-all duration-300 ease-out cursor-pointer ${
                        isActive
                          ? 'w-6 sm:w-9 h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-[#D26900] to-[#E65100] shadow-md shadow-[#D26900]/60 ring-1 ring-[#D26900]/40'
                          : 'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/70 hover:bg-white shadow-xs hover:scale-110'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Peeking Slide (Tucked directly behind center card on right edge, sata kar, NO gap) */}
        {banners.length > 1 && (
          <div
            onClick={nextSlide}
            title="Next Banner"
            className="w-[18%] xs:w-[19%] sm:w-[18%] md:w-[17%] lg:w-[16%] h-[180px] xs:h-[220px] sm:h-[295px] md:h-[365px] lg:h-[420px] -ml-3 xs:-ml-5 sm:-ml-8 md:-ml-12 shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:opacity-95 z-10 bg-neutral-900 border-0 group relative brightness-90 hover:brightness-100"
          >
            {nextBanner.media_type === 'video' ? (
              <video src={nextBanner.media_url} muted playsInline className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <img src={nextBanner.media_url} alt="Next banner" className="w-full h-full object-cover pointer-events-none" />
            )}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
          </div>
        )}

        {/* Floating Circular Navigation Buttons on the left and right sides (z-30) */}
        {banners.length > 1 && (
          <>
            {/* Previous Button (<) on the left */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous Slide"
              className="absolute left-[3%] xs:left-[4%] sm:left-[6%] md:left-[8%] lg:left-[9%] top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white text-[#D26900] shadow-xl hover:bg-gradient-to-r hover:from-[#D26900] hover:to-[#E65100] hover:text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border-0 ring-1 ring-black/5"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button (>) on the right */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next Slide"
              className="absolute right-[3%] xs:right-[4%] sm:right-[6%] md:right-[8%] lg:right-[9%] top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white text-[#D26900] shadow-xl hover:bg-gradient-to-r hover:from-[#D26900] hover:to-[#E65100] hover:text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border-0 ring-1 ring-black/5"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // THEME 3: Modern Split Showcase (NO Left-Right Empty Space, NO Borders, Website CTA Colors)
  // Full-width edge-aligned layout without giant whitespace margins
  // --------------------------------------------------------------------------
  if (currentTheme === 'split-showcase') {
    return (
      <div
        className="w-full px-0 sm:px-1.5 md:px-2 py-0 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 md:gap-4 min-h-[380px] md:min-h-[460px] lg:min-h-[520px]">
          {/* Left Editorial Card (NO BORDERS, Website CTA Colors) */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-between p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-neutral-900 shadow-2xl relative overflow-hidden backdrop-blur-xl border-0">
            {/* Ambient Background Radial Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D26900]/20 rounded-full filter blur-3xl pointer-events-none" />

            {/* Top Badge with CTA color icon */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D26900] animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D26900] bg-[#D26900]/15 px-3 py-1 rounded-full flex items-center gap-1.5 border-0">
                <svg className="w-3.5 h-3.5 text-[#D26900]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
                </svg>
                <span>Featured Showcase</span>
              </span>
            </div>

            {/* Middle Title & Description */}
            <div className="my-6 space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`split-content-${currentBanner.id || currentIndex}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2
                    style={{
                      color: currentBanner.title_color || '#FFFFFF',
                      fontFamily: currentBanner.font_family ? `"${currentBanner.font_family}", sans-serif` : undefined,
                    }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]"
                  >
                    {currentBanner.title || 'Luxury Companions'}
                  </h2>
                  {currentBanner.subtitle && (
                    <p
                      style={{
                        color: currentBanner.subtitle_color || '#D1D5DB',
                        fontFamily: currentBanner.font_family ? `"${currentBanner.font_family}", sans-serif` : undefined,
                      }}
                      className="mt-3 text-xs sm:text-sm md:text-base font-medium leading-relaxed"
                    >
                      {currentBanner.subtitle}
                    </p>
                  )}
                  {currentBanner.button_text && (
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => handleBannerClick(currentBanner)}
                        style={{
                          backgroundColor: currentBanner.button_bg_color || '#D26900',
                          color: currentBanner.button_text_color || '#FFFFFF',
                          fontFamily: currentBanner.font_family ? `"${currentBanner.font_family}", sans-serif` : undefined,
                        }}
                        className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer border-0"
                      >
                        <span>{currentBanner.button_text}</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Controls & Slider Dots (CTA colors) */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs font-mono font-bold text-gray-400">
                <span className="text-[#D26900]">0{currentIndex + 1}</span> / 0{banners.length}
              </span>
              <div className="flex items-center gap-2">
                {banners.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-7 h-2 rounded-full bg-gradient-to-r from-[#D26900] to-[#E65100] shadow-sm shadow-[#D26900]/50'
                        : 'w-2 h-2 rounded-full bg-white/40 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Visual Showcase Box (NO BORDERS, clean shadow) */}
          <div
            onClick={() => handleBannerClick(currentBanner)}
            className="col-span-12 md:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative group cursor-pointer border-0 min-h-[260px] md:min-h-full bg-neutral-950"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`split-media-${currentBanner.id || currentIndex}`}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
              >
                {currentBanner.media_type === 'video' ? (
                  <video src={currentBanner.media_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={currentBanner.media_url} alt={currentBanner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
                {/* Floating Authentic Chip with CTA star icon */}
                <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold tracking-wider text-white shadow-lg flex items-center gap-1.5 border-0">
                  <svg className="w-3.5 h-3.5 text-[#D26900]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span>100% Handcrafted</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // THEME 4: Floating Framed Luxury (NO Borders on cards, Website CTA styling)
  // --------------------------------------------------------------------------
  if (currentTheme === 'framed-luxury') {
    return (
      <div
        className="w-full px-2 sm:px-4 md:px-6 py-0 relative select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Soft Ambient Background Glow */}
        <div className="absolute -inset-3 bg-gradient-to-r from-amber-600/15 via-orange-600/10 to-amber-600/15 filter blur-3xl opacity-70 pointer-events-none" />

        {/* Framed Container (NO BORDER) */}
        <div
          className="relative w-full h-[82vw] min-h-[340px] sm:h-[50vw] sm:min-h-[400px] md:h-[500px] lg:h-[560px] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden bg-neutral-950 cursor-pointer border-0"
          onClick={() => handleBannerClick(currentBanner)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id || currentIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full"
            >
              {currentBanner.media_type === 'video' ? (
                <video src={currentBanner.media_url} autoPlay loop muted playsInline className="w-full h-full object-cover object-center pointer-events-none" />
              ) : (
                <img src={currentBanner.media_url} alt={currentBanner.title} className="w-full h-full object-cover object-center pointer-events-none" />
              )}

              {/* Overlay */}
              {currentBanner.show_overlay && (
                <div
                  className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                    currentBanner.overlay_position === 'right'
                      ? 'bg-gradient-to-l from-black/60 via-black/30 to-transparent'
                      : currentBanner.overlay_position === 'left'
                      ? 'bg-gradient-to-r from-black/65 via-black/30 to-transparent'
                      : 'bg-gradient-to-t from-black/60 via-black/25 to-black/10'
                  }`}
                />
              )}

              {renderOverlayContent(currentBanner, true)}
            </motion.div>
          </AnimatePresence>

          {/* Floating Frosted Glass Control Dock (CTA Styled) */}
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <div className="flex items-center gap-3 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-black/60 backdrop-blur-xl shadow-2xl border-0">
              <span className="text-[11px] font-mono font-bold text-white/80">
                <span className="text-[#D26900]">0{currentIndex + 1}</span> / 0{banners.length}
              </span>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                {banners.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-6 h-2 rounded-full bg-gradient-to-r from-[#D26900] to-[#E65100] shadow-xs'
                        : 'w-2 h-2 rounded-full bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // THEME 5: Minimalist Editorial Magazine (NO Borders, Website CTA Colors)
  // --------------------------------------------------------------------------
  if (currentTheme === 'minimal-editorial') {
    return (
      <div
        className="w-full relative overflow-hidden bg-neutral-950 select-none group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full h-[88vw] min-h-[350px] sm:h-[50vw] sm:min-h-[400px] md:h-[500px] lg:h-[580px] max-h-[640px] overflow-hidden cursor-pointer"
          onClick={() => handleBannerClick(currentBanner)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id || currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full"
            >
              {currentBanner.media_type === 'video' ? (
                <video src={currentBanner.media_url} autoPlay loop muted playsInline className="w-full h-full object-cover object-center" />
              ) : (
                <img src={currentBanner.media_url} alt={currentBanner.title} className="w-full h-full object-cover object-center" />
              )}
              {currentBanner.show_overlay && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
              )}
              {renderOverlayContent(currentBanner)}
            </motion.div>
          </AnimatePresence>

          {/* Minimalist Slide Counter (Top Right with CTA color) */}
          <div className="absolute top-4 right-4 sm:top-7 sm:right-8 z-20 pointer-events-none text-white/90 text-xs sm:text-sm font-light tracking-widest uppercase">
            <span className="font-bold text-[#D26900]">0{currentIndex + 1}</span> — 0{banners.length}
          </div>

          {/* Animated Continuous Progress Bar Timer in Website CTA Gradient */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-30">
            <motion.div
              key={`progress-${currentIndex}`}
              initial={{ width: '0%' }}
              animate={{ width: isPaused ? '100%' : '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-[#D26900] to-[#E65100]"
            />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // THEME 1 (Default): Full-Width Hero Classic
  // Edge-to-edge full bleed hero banner with custom overlays and active pill indicators
  // --------------------------------------------------------------------------
  return (
    <div
      className="w-full relative overflow-hidden select-none group bg-neutral-950"
      style={{
        paddingTop: paddingTop ? `${paddingTop}rem` : undefined,
        paddingBottom: paddingBottom ? `${paddingBottom}rem` : undefined,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Viewport (Fixed consistent height across all slides, no borders, no jumping) */}
      <div className="relative w-full h-[88vw] min-h-[350px] sm:h-[52vw] sm:min-h-[400px] md:h-[500px] lg:h-[580px] max-h-[640px] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={() => handleBannerClick(currentBanner)}
          >
            {/* Background Media: Video or Image */}
            {currentBanner.media_type === 'video' ? (
              <video
                src={currentBanner.media_url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center pointer-events-none"
              />
            ) : (
              <img
                src={currentBanner.media_url}
                alt={currentBanner.title || 'Home Hero Banner'}
                className="w-full h-full object-cover object-center pointer-events-none"
                loading="eager"
              />
            )}

            {/* Subtle Gradient Overlay for Text Legibility (if overlay enabled) */}
            {currentBanner.show_overlay && (
              <div
                className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                  currentBanner.overlay_position === 'right'
                    ? 'bg-gradient-to-l from-black/60 via-black/30 to-transparent'
                    : currentBanner.overlay_position === 'left'
                    ? 'bg-gradient-to-r from-black/65 via-black/30 to-transparent'
                    : 'bg-gradient-to-t from-black/60 via-black/25 to-black/10'
                }`}
              />
            )}

            {/* Content Text Overlay */}
            {renderOverlayContent(currentBanner)}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Chevron Arrows with CTA colors */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous Slide"
              className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white text-[#D26900] hover:bg-gradient-to-r hover:from-[#D26900] hover:to-[#E65100] hover:text-white shadow-xl items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-[#D26900]/25"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next Slide"
              className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white text-[#D26900] hover:bg-gradient-to-r hover:from-[#D26900] hover:to-[#E65100] hover:text-white shadow-xl items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-[#D26900]/25"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Slider Pagination Indicator Dots / Pills matching website CTA design */}
        {banners.length > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-4 md:bottom-5 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md shadow-lg border-0">
              {banners.map((b, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`pointer-events-auto transition-all duration-300 ease-out cursor-pointer ${
                      isActive
                        ? 'w-6 sm:w-9 h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-[#D26900] to-[#E65100] shadow-md shadow-[#D26900]/60 ring-1 ring-[#D26900]/40'
                        : 'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/70 hover:bg-white shadow-xs hover:scale-110'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
