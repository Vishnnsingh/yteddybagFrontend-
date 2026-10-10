import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeBanner, type HomeBestsellerItem } from '../Context/HomeBannerContext';

const BESTSELLER_RESPONSIVE_STYLES = `
  .bestseller-carousel {
    --b-gap: 0.875rem;
    gap: var(--b-gap);
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  @media (min-width: 640px) {
    .bestseller-carousel {
      --b-gap: 1rem;
    }
  }
  @media (min-width: 768px) {
    .bestseller-carousel {
      --b-gap: 1.25rem;
    }
  }

  .bestseller-item {
    scroll-snap-align: start;
    scroll-snap-stop: normal;
  }

  /* 4 Cards Per Row Mode (Default) - Fits EXACTLY 4 cards edge-to-edge on desktop */
  .bestseller-cols-4 .bestseller-item {
    flex: 0 0 calc((100% - var(--b-gap)) / 1.35) !important;
    width: calc((100% - var(--b-gap)) / 1.35) !important;
    min-width: 0 !important;
  }
  @media (min-width: 640px) {
    .bestseller-cols-4 .bestseller-item {
      flex: 0 0 calc((100% - var(--b-gap)) / 2.3) !important;
      width: calc((100% - var(--b-gap)) / 2.3) !important;
    }
  }
  @media (min-width: 768px) {
    .bestseller-cols-4 .bestseller-item {
      flex: 0 0 calc((100% - 2 * var(--b-gap)) / 3) !important;
      width: calc((100% - 2 * var(--b-gap)) / 3) !important;
    }
  }
  @media (min-width: 1024px) {
    .bestseller-cols-4 .bestseller-item {
      flex: 0 0 calc((100% - 3 * var(--b-gap)) / 4) !important;
      width: calc((100% - 3 * var(--b-gap)) / 4) !important;
      min-width: calc((100% - 3 * var(--b-gap)) / 4) !important;
      max-width: calc((100% - 3 * var(--b-gap)) / 4) !important;
    }
  }

  /* 5 Cards Per Row Mode - Fits EXACTLY 5 cards edge-to-edge on desktop */
  .bestseller-cols-5 .bestseller-item {
    flex: 0 0 calc((100% - var(--b-gap)) / 1.35) !important;
    width: calc((100% - var(--b-gap)) / 1.35) !important;
    min-width: 0 !important;
  }
  @media (min-width: 640px) {
    .bestseller-cols-5 .bestseller-item {
      flex: 0 0 calc((100% - var(--b-gap)) / 2.3) !important;
      width: calc((100% - var(--b-gap)) / 2.3) !important;
    }
  }
  @media (min-width: 768px) {
    .bestseller-cols-5 .bestseller-item {
      flex: 0 0 calc((100% - 2 * var(--b-gap)) / 3) !important;
      width: calc((100% - 2 * var(--b-gap)) / 3) !important;
    }
  }
  @media (min-width: 1024px) {
    .bestseller-cols-5 .bestseller-item {
      flex: 0 0 calc((100% - 4 * var(--b-gap)) / 5) !important;
      width: calc((100% - 4 * var(--b-gap)) / 5) !important;
      min-width: calc((100% - 4 * var(--b-gap)) / 5) !important;
      max-width: calc((100% - 4 * var(--b-gap)) / 5) !important;
    }
  }

  /* 2 Cards Per Row Mode */
  .bestseller-cols-2 .bestseller-item {
    flex: 0 0 calc((100% - var(--b-gap)) / 1.2) !important;
    width: calc((100% - var(--b-gap)) / 1.2) !important;
    min-width: 0 !important;
  }
  @media (min-width: 768px) {
    .bestseller-cols-2 .bestseller-item {
      flex: 0 0 calc((100% - var(--b-gap)) / 2) !important;
      width: calc((100% - var(--b-gap)) / 2) !important;
      min-width: calc((100% - var(--b-gap)) / 2) !important;
      max-width: calc((100% - var(--b-gap)) / 2) !important;
    }
  }

  /* 3 Cards Per Row Mode */
  .bestseller-cols-3 .bestseller-item {
    flex: 0 0 calc((100% - var(--b-gap)) / 1.35) !important;
    width: calc((100% - var(--b-gap)) / 1.35) !important;
    min-width: 0 !important;
  }
  @media (min-width: 640px) {
    .bestseller-cols-3 .bestseller-item {
      flex: 0 0 calc((100% - var(--b-gap)) / 2) !important;
      width: calc((100% - var(--b-gap)) / 2) !important;
    }
  }
  @media (min-width: 1024px) {
    .bestseller-cols-3 .bestseller-item {
      flex: 0 0 calc((100% - 2 * var(--b-gap)) / 3) !important;
      width: calc((100% - 2 * var(--b-gap)) / 3) !important;
      min-width: calc((100% - 2 * var(--b-gap)) / 3) !important;
      max-width: calc((100% - 2 * var(--b-gap)) / 3) !important;
    }
  }

  /* 6 Cards Per Row Mode */
  .bestseller-cols-6 .bestseller-item {
    flex: 0 0 calc((100% - var(--b-gap)) / 1.35) !important;
    width: calc((100% - var(--b-gap)) / 1.35) !important;
    min-width: 0 !important;
  }
  @media (min-width: 640px) {
    .bestseller-cols-6 .bestseller-item {
      flex: 0 0 calc((100% - 2 * var(--b-gap)) / 3) !important;
      width: calc((100% - 2 * var(--b-gap)) / 3) !important;
    }
  }
  @media (min-width: 1024px) {
    .bestseller-cols-6 .bestseller-item {
      flex: 0 0 calc((100% - 5 * var(--b-gap)) / 6) !important;
      width: calc((100% - 5 * var(--b-gap)) / 6) !important;
      min-width: calc((100% - 5 * var(--b-gap)) / 6) !important;
      max-width: calc((100% - 5 * var(--b-gap)) / 6) !important;
    }
  }

  /* Fluid Scroll Carousel */
  .bestseller-cols-scroll .bestseller-item {
    flex: 0 0 260px !important;
    width: 260px !important;
    min-width: 240px !important;
    max-width: 320px !important;
  }
  @media (min-width: 640px) {
    .bestseller-cols-scroll .bestseller-item {
      flex: 0 0 280px !important;
      width: 280px !important;
    }
  }
  @media (min-width: 1024px) {
    .bestseller-cols-scroll .bestseller-item {
      flex: 0 0 300px !important;
      width: 300px !important;
    }
  }
`;

export interface HomeBestsellersSectionProps {
  sectionId?: string;
  paddingTop?: number;
  paddingBottom?: number;
  titleOverride?: string;
  subtitleOverride?: string;
  cardThemeOverride?: string;
  cardsPerRowOverride?: string;
  bgModeOverride?: 'transparent' | 'color';
  bgColorOverride?: string;
  itemIds?: string[];
  customItems?: HomeBestsellerItem[];
  viewAllUrlOverride?: string;
  viewAllTextOverride?: string;
  showViewAllOverride?: boolean;
}

const isFlowerDummyItem = (b: HomeBestsellerItem) => {
  const t = (b.title || '').toLowerCase();
  return (
    t.includes('pretty in pink') ||
    t.includes('sunflower symphony') ||
    t.includes('blush rose') ||
    t.includes('the muse') ||
    t.includes('white orchid') ||
    t.includes('floral vase')
  );
};

interface BestsellerProductCardProps {
  item: HomeBestsellerItem;
  onCardClick: (item: HomeBestsellerItem) => void;
  cardThemeClasses: string;
  cardStyle: React.CSSProperties;
  onImageLoad?: () => void;
  formatPriceDisplay: (priceStr?: string | null) => string;
  formatDiscountDisplay: (badge?: string | null) => string;
}

const BestsellerProductCard: React.FC<BestsellerProductCardProps> = ({
  item,
  onCardClick,
  cardThemeClasses,
  cardStyle,
  onImageLoad,
  formatPriceDisplay,
  formatDiscountDisplay,
}) => {
  // Extract all valid images from item
  const images = React.useMemo(() => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images.filter(Boolean);
    }
    if (item.image_url && item.image_url.trim() !== '') {
      return [item.image_url.trim()];
    }
    return [];
  }, [item.images, item.image_url]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Auto-slide through images every 2.8 seconds when multiple images exist
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % images.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      onClick={() => onCardClick(item)}
      /* Completely stable positioning: NO translateY on hover to avoid jitter */
      className={`group relative shrink-0 cursor-pointer overflow-hidden flex flex-col transition-all duration-200 bestseller-item ${cardThemeClasses}`}
      style={cardStyle}
    >
      {/* Top Image Showcase with Auto-Slide & Dots */}
      <div className="relative w-full aspect-[4/4.5] bg-gray-50/70 overflow-hidden flex items-center justify-center">
        {images.length > 0 ? (
          images.map((imgUrl, imgIdx) => (
            <img
              key={imgUrl + imgIdx}
              src={imgUrl}
              alt={`${item.title} - ${imgIdx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                imgIdx === activeImgIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              } transition-transform duration-300 group-hover:scale-103`}
              loading="lazy"
              onLoad={onImageLoad}
            />
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        )}

        {/* Top-Left Orange Badge (BESTSELLER) */}
        {(item.badge_text || item.badge_style === 'discount' || (!item.badge_style && item.badge_style !== 'luxe')) && (
          <div className="absolute top-0 left-0 z-10 pointer-events-none">
            <span className="inline-block bg-[#D26900] text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 tracking-wider uppercase rounded-tl-2xl rounded-br-lg shadow-xs">
              {item.badge_text || 'BESTSELLER'}
            </span>
          </div>
        )}

        {/* Rating Overlay Pill on Bottom-Left (e.g. 4.9 ★ | 95) */}
        {(item.rating || item.reviews_count) && (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs border border-gray-100 text-[11px] sm:text-xs pointer-events-none">
            <span className="font-bold text-gray-900 leading-none">
              {typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating || '4.9'}
            </span>
            <span className="text-amber-500 leading-none text-xs">★</span>
            <span className="text-gray-300 leading-none">|</span>
            <span className="text-gray-500 font-medium text-[10px] sm:text-[11px] leading-none">
              {item.reviews_count || '95'}
            </span>
          </div>
        )}

        {/* Indicator Dots for Multiple Images with Capsule Background */}
        {images.length > 1 && (
          <div
            className="absolute bottom-2 inset-x-0 z-20 flex items-center justify-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 bg-black/35 backdrop-blur-xs px-2 py-1 rounded-full shadow-xs">
              {images.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  aria-label={`Slide ${dotIdx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex(dotIdx);
                  }}
                  className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                    activeImgIndex === dotIdx
                      ? 'w-3.5 bg-[#D26900]'
                      : 'w-1.5 bg-white/70 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Card Content: Title, Subtitle, Price Row */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-grow gap-1.5">
        <div>
          {/* Product Title */}
          <h3 className="text-gray-900 group-hover:text-[#D26900] font-bold text-xs sm:text-sm line-clamp-1 leading-snug transition-colors">
            {item.title}
          </h3>

          {/* Subtitle / Description */}
          {item.subtitle && item.subtitle.trim() !== '' && (
            <p className="text-gray-500 text-[11px] sm:text-xs leading-tight line-clamp-1 mt-0.5 font-normal">
              {item.subtitle}
            </p>
          )}
        </div>

        {/* Price & Discount Row: Exact format: Rs. 1299  Rs. 1999  (35% OFF) */}
        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mt-auto pt-1">
          {/* Selling Price */}
          <span className="text-gray-950 font-bold text-sm sm:text-base tracking-tight">
            {formatPriceDisplay(item.price)}
          </span>

          {/* Original Strike-Through Price */}
          {item.original_price && item.original_price.trim() !== '' && (
            <span className="text-gray-400 line-through text-xs sm:text-[13px] font-normal">
              {formatPriceDisplay(item.original_price)}
            </span>
          )}

          {/* Percentage / Discount Badge (Orange) */}
          {item.discount_badge && item.discount_badge.trim() !== '' && (
            <span className="text-[#D26900] font-bold text-xs sm:text-[13px]">
              {formatDiscountDisplay(item.discount_badge)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HomeBestsellersSection({
  sectionId: _sectionId,
  paddingTop = 2.0,
  paddingBottom = 2.5,
  titleOverride,
  subtitleOverride,
  cardThemeOverride,
  cardsPerRowOverride,
  bgModeOverride,
  bgColorOverride,
  itemIds,
  customItems,
  viewAllUrlOverride,
  viewAllTextOverride,
  showViewAllOverride,
}: HomeBestsellersSectionProps = {}) {
  const { bestsellers: allBestsellers, bestsellerSettings, bestsellerLoading } = useHomeBanner();
  const bestsellers = (function() {
    if (Array.isArray(customItems) && customItems.length > 0) {
      const active = customItems.filter((b) => !isFlowerDummyItem(b) && b.is_active !== false);
      if (active.length > 0) return active;
    }
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      const filtered = allBestsellers.filter((b) => itemIds.includes(b.id) && !isFlowerDummyItem(b) && b.is_active !== false);
      if (filtered.length > 0) return filtered;
    }
    return allBestsellers.filter((b) => !isFlowerDummyItem(b) && b.is_active !== false);
  })();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll positions for chevron visibility with safe overflow tolerance
  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const hasOverflow = maxScroll > 8;
    if (!hasOverflow) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollContainerRef.current;
    if (!el) return;

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateScrollButtons();
      });
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer?.observe(child));
    }

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
  }, [bestsellers, updateScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cards = Array.from(el.children).filter(
      (c) => c instanceof HTMLElement && c.classList.contains('bestseller-item')
    ) as HTMLElement[];

    const containerWidth = el.clientWidth;
    const currentScroll = el.scrollLeft;

    if (direction === 'right') {
      // Find the first card starting at or beyond the current right edge
      const nextCard = cards.find((card) => card.offsetLeft >= currentScroll + containerWidth - 15);
      if (nextCard) {
        el.scrollTo({ left: nextCard.offsetLeft, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: containerWidth, behavior: 'smooth' });
      }
    } else {
      // Find the previous card aligned before the current view
      const prevCard = [...cards].reverse().find((card) => card.offsetLeft <= currentScroll - containerWidth + 15);
      if (prevCard) {
        el.scrollTo({ left: Math.max(0, prevCard.offsetLeft), behavior: 'smooth' });
      } else {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
  };

  // If disabled or empty, return null
  const isEnabled = customItems !== undefined ? true : (bestsellerSettings.is_enabled !== false);
  if (!isEnabled || (bestsellers.length === 0 && !bestsellerLoading)) {
    return null;
  }

  const handleCardClick = (item: HomeBestsellerItem) => {
    if (!item.link_url) return;
    if (item.link_url.startsWith('http://') || item.link_url.startsWith('https://')) {
      window.open(item.link_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.link_url);
    }
  };

  const handleViewAllClick = () => {
    const url = viewAllUrlOverride || bestsellerSettings.view_all_url || '/category/bestsellers';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  const sectionTitle = titleOverride || bestsellerSettings.section_title || 'Shop By Bestsellers';
  const sectionSubtitle =
    subtitleOverride !== undefined
      ? subtitleOverride
      : (bestsellerSettings.section_subtitle ||
        "Discover India's favourite gifting options, curated bestsellers that make every celebration extra special");
  const viewAllText = viewAllTextOverride || bestsellerSettings.view_all_text || 'View All Bestsellers';
  const showViewAll = showViewAllOverride !== undefined ? showViewAllOverride : (bestsellerSettings.show_view_all !== false);

  // Resolve Card Background and Transparency Styles
  const getCardStyle = (): React.CSSProperties => {
    const mode = bestsellerSettings.card_bg_mode || 'white';
    const transparency = typeof bestsellerSettings.card_transparency === 'number' ? bestsellerSettings.card_transparency : 0;
    const opacityFraction = Math.max(0, Math.min(1, 1 - transparency / 100));

    if (mode === 'home-bg') {
      return {
        backgroundColor: transparency > 0 ? `rgba(255, 255, 255, ${opacityFraction})` : 'transparent',
        backdropFilter: transparency > 20 ? 'blur(8px)' : undefined,
      };
    }

    if (mode === 'glass') {
      const alpha = Math.max(0.2, opacityFraction);
      return {
        backgroundColor: `rgba(255, 255, 255, ${alpha})`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      };
    }

    if (mode === 'color') {
      const baseColor = bestsellerSettings.card_bg_color || '#FFFFFF';
      if (transparency > 0 && baseColor.startsWith('#') && (baseColor.length === 7 || baseColor.length === 4)) {
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
        const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
        const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
        return {
          backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacityFraction})`,
          backdropFilter: transparency > 20 ? 'blur(8px)' : undefined,
        };
      }
      return { backgroundColor: baseColor };
    }

    // Default 'white' mode with optional transparency
    if (transparency > 0) {
      return {
        backgroundColor: `rgba(255, 255, 255, ${opacityFraction})`,
        backdropFilter: transparency > 20 ? 'blur(8px)' : undefined,
      };
    }

    return { backgroundColor: '#FFFFFF' };
  };

  // Resolve Card Theme Styling (Supports instance override)
  const getCardThemeClasses = (): string => {
    const theme = cardThemeOverride || bestsellerSettings.card_theme || 'classic-clean';
    switch (theme) {
      case 'modern-card':
        return 'rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg';
      case 'glass-translucent':
        return 'rounded-2xl border border-white/60 shadow-sm hover:shadow-md';
      case 'bordered-elevated':
        return 'rounded-xl border-2 border-gray-200/90 shadow-sm hover:shadow-md hover:border-[#D26900]/40';
      case 'classic-clean':
      default:
        return 'rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-[#D26900]/30';
    }
  };

  // Section background styling (Supports instance override)
  const effectiveBgMode = bgModeOverride || bestsellerSettings.section_bg_mode;
  const effectiveBgColor = bgColorOverride || bestsellerSettings.section_bg_color;
  const sectionBgStyle: React.CSSProperties = {
    backgroundColor:
      effectiveBgMode === 'color' && effectiveBgColor
        ? effectiveBgColor
        : 'transparent',
  };

  const colMode = cardsPerRowOverride || bestsellerSettings.cards_per_row || '4';
  const colClass = `bestseller-cols-${colMode}`;

  // Price & Discount display formatters matching Image 2 style
  const formatPriceDisplay = (priceStr?: string | null): string => {
    if (!priceStr || priceStr.trim() === '') return '';
    const trimmed = priceStr.trim();
    if (/^Rs\.?\s*/i.test(trimmed)) {
      return trimmed.replace(/^Rs\.?\s*/i, 'Rs. ');
    }
    if (trimmed.startsWith('₹')) {
      return `Rs. ${trimmed.slice(1).trim()}`;
    }
    return `Rs. ${trimmed}`;
  };

  const formatDiscountDisplay = (badge?: string | null): string => {
    if (!badge || badge.trim() === '') return '';
    const trimmed = badge.trim();
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) return trimmed;
    return `(${trimmed})`;
  };

  return (
    <div
      className="w-full relative select-none transition-colors duration-300"
      style={{
        ...sectionBgStyle,
        paddingTop: `${paddingTop}rem`,
        paddingBottom: `${paddingBottom}rem`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: BESTSELLER_RESPONSIVE_STYLES }} />

      {/* Container expands smoothly on wide monitors (up to 1880px) */}
      <div className="relative w-full max-w-[1880px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        {/* Section Heading & Subtitle */}
        <div className="mb-3 sm:mb-4 md:mb-4.5 px-0.5">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[26px] font-bold text-gray-900 tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && sectionSubtitle.trim() !== '' && (
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-[15px] text-gray-500 font-normal leading-relaxed max-w-3xl">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Relative wrapper for cards & floating desktop scroll buttons */}
        <div className="relative group/wrapper">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll Left"
              className="hidden md:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 text-gray-700 hover:text-black shadow-lg hover:shadow-xl border border-gray-200/90 items-center justify-center transition-all cursor-pointer active:scale-95 hover:bg-white focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Cards Horizontal Scroll Container */}
          <div
            ref={scrollContainerRef}
            className={`w-full flex items-stretch bestseller-carousel ${colClass} overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-0.5`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {bestsellers.map((item) => (
              <BestsellerProductCard
                key={item.id}
                item={item}
                onCardClick={handleCardClick}
                cardThemeClasses={getCardThemeClasses()}
                cardStyle={getCardStyle()}
                onImageLoad={updateScrollButtons}
                formatPriceDisplay={formatPriceDisplay}
                formatDiscountDisplay={formatDiscountDisplay}
              />
            ))}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll Right"
              className="hidden md:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 text-gray-700 hover:text-black shadow-lg hover:shadow-xl border border-gray-200/90 items-center justify-center transition-all cursor-pointer active:scale-95 hover:bg-white focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* View All Bestsellers CTA Button at Bottom */}
        {showViewAll && (
          <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleViewAllClick}
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl border border-gray-300 hover:border-[#D26900] bg-white text-gray-800 hover:text-[#D26900] font-semibold text-xs sm:text-sm tracking-wide shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
            >
              <span>{viewAllText}</span>
              <svg
                className="w-4 h-4 text-gray-500 group-hover:text-[#D26900] transition-colors group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
