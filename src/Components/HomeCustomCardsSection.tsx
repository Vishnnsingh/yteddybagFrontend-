import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeBanner, type HomeCustomCardItem } from '../Context/HomeBannerContext';
import ClassicBorderFrame from './ClassicBorderFrames';

export interface HomeCustomCardsSectionProps {
  sectionId?: string;
  paddingTop?: number;
  paddingBottom?: number;
  titleOverride?: string;
  subtitleOverride?: string;
  borderModeOverride?: 'none' | 'modern' | 'classic' | 'custom_image';
  classicBorderOverride?: string;
  aspectRatioOverride?: 'square' | 'tall' | 'standard';
  cardsPerRowOverride?: string | number;
  textPositionOverride?: string;
  bgModeOverride?: 'transparent' | 'color' | 'gradient';
  bgColorOverride?: string;
  settingsOverride?: any;
  itemIds?: string[];
  customItems?: HomeCustomCardItem[];
}

export default function HomeCustomCardsSection({
  sectionId,
  paddingTop = 2.0,
  paddingBottom = 2.5,
  titleOverride,
  subtitleOverride,
  borderModeOverride,
  classicBorderOverride,
  aspectRatioOverride,
  cardsPerRowOverride,
  textPositionOverride,
  bgModeOverride,
  bgColorOverride,
  settingsOverride,
  itemIds,
  customItems,
}: HomeCustomCardsSectionProps = {}) {
  const { customCards: allCustomCards, customCardsSettings, customCardsLoading } = useHomeBanner();

  const secSettings = {
    ...(customCardsSettings || {}),
    ...(settingsOverride || {}),
  };

  const customCards = (function() {
    if (Array.isArray(customItems)) {
      return customItems.filter((c) => c.is_active !== false);
    }
    if (sectionId && sectionId !== 'custom_cards_1') {
      return [];
    }
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      const filtered = allCustomCards.filter((c) => itemIds.includes(c.id) && c.is_active !== false);
      return filtered.length > 0 ? filtered : allCustomCards;
    }
    return allCustomCards;
  })();
  const navigate = useNavigate();

  // If section is disabled or there are no active cards and not loading, render nothing
  const isEnabled = customItems !== undefined ? true : (secSettings.is_enabled !== false);
  if (!isEnabled || (customCards.length === 0 && !customCardsLoading)) {
    return null;
  }

  // Handle card click navigation
  const handleCardClick = (card: HomeCustomCardItem) => {
    if (!card.link_url) return;
    if (card.link_url.startsWith('http://') || card.link_url.startsWith('https://')) {
      window.open(card.link_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(card.link_url);
    }
  };

  // Compute section background styling (Supports instance override)
  const effectiveBgMode = bgModeOverride || secSettings.section_bg_mode;
  const effectiveBgColor = bgColorOverride || secSettings.section_bg_color;
  const getSectionBgStyle = (): React.CSSProperties => {
    if (effectiveBgMode === 'color') {
      return { backgroundColor: effectiveBgColor || '#FFFFFF' };
    }
    if (effectiveBgMode === 'gradient') {
      return { background: secSettings.section_gradient || 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)' };
    }
    // 'transparent' uses home original background
    return {};
  };

  // Determine grid columns classes (Supports instance override)
  const effectiveCols = cardsPerRowOverride ? Number(cardsPerRowOverride) : Number(secSettings.cards_per_row || 5);
  const getGridColsClass = (): string => {
    switch (effectiveCols) {
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      case 5:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 4:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
    }
  };

  // Determine aspect ratio class (Supports instance override)
  const effectiveRatio = aspectRatioOverride || secSettings.card_aspect_ratio || 'tall';
  const getAspectRatioClass = (): string => {
    switch (effectiveRatio) {
      case 'square':
        return 'aspect-square';
      case 'tall':
        return 'aspect-[3/4] sm:aspect-[4/5]';
      case 'standard':
        return 'aspect-[4/3]';
      default:
        return 'aspect-[3/4]';
    }
  };

  const effectiveTitle =
    titleOverride !== undefined && titleOverride !== null
      ? titleOverride
      : (secSettings.section_title !== undefined
          ? secSettings.section_title
          : (sectionId === 'custom_cards_1' ? 'Gifts for Every Feeling' : ''));
  const effectiveSubtitle =
    subtitleOverride !== undefined && subtitleOverride !== null
      ? subtitleOverride
      : (secSettings.section_subtitle || '');

  return (
    <div
      className={`w-full transition-colors duration-300 relative select-none ${
        effectiveBgMode === 'transparent' ? 'bg-transparent' : ''
      }`}
      style={{
        ...getSectionBgStyle(),
        paddingTop: `${paddingTop}rem`,
        paddingBottom: `${paddingBottom}rem`,
      }}
    >
      <div className="w-full max-w-[1880px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Section Header: Title & Subtitle (Optional, configurable alignment) */}
        {(effectiveTitle || effectiveSubtitle) && (
          <div
            className={`mb-6 sm:mb-8 md:mb-10 ${
              secSettings.title_align === 'center'
                ? 'text-center'
                : secSettings.title_align === 'right'
                ? 'text-right'
                : 'text-left'
            }`}
          >
            {effectiveTitle && (
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold tracking-tight"
                style={{ color: secSettings.title_color || '#111827' }}
              >
                {effectiveTitle}
              </h2>
            )}
            {effectiveSubtitle && (
              <p
                className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base max-w-2xl font-normal leading-relaxed opacity-90 inline-block"
                style={{ color: secSettings.subtitle_color || '#6B7280' }}
              >
                {effectiveSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Dynamic Cards Grid */}
        <div className={`grid ${getGridColsClass()} gap-3.5 sm:gap-5 md:gap-6 lg:gap-7`}>
          {customCards.map((card) => {
            // Effective values (card override or fallback to section default)
            const effectiveRadius = card.card_radius ?? secSettings.global_card_radius ?? 16;
            const effectiveBorderMode =
              borderModeOverride ||
              (card.border_mode && card.border_mode !== 'classic'
                ? card.border_mode
                : card.border_mode || secSettings.global_border_mode || 'classic');
            const effectiveClassicStyle =
              classicBorderOverride ||
              card.classic_border_style ||
              secSettings.global_classic_border ||
              'victorian-ornate';
            const effectiveBorderColor =
              card.border_color || secSettings.global_border_color || '#D26900';
            const effectiveTextPosition =
              textPositionOverride ||
              card.text_position ||
              secSettings.global_text_position ||
              'below';
            const hoverEffect = secSettings.card_hover_effect || 'none';

            // Modern frame border styles
            const isModernBorder = effectiveBorderMode === 'modern';
            const borderSameAll = card.border_same_all !== false;
            const modernBorderStyle: React.CSSProperties = isModernBorder
              ? borderSameAll
                ? {
                    border: `${card.border_width || 1}px ${card.border_style || 'solid'} ${effectiveBorderColor}`,
                  }
                : {
                    borderTop: `${card.border_top_width || 0}px ${card.border_style || 'solid'} ${effectiveBorderColor}`,
                    borderRight: `${card.border_right_width || 0}px ${card.border_style || 'solid'} ${effectiveBorderColor}`,
                    borderBottom: `${card.border_bottom_width || 0}px ${card.border_style || 'solid'} ${effectiveBorderColor}`,
                    borderLeft: `${card.border_left_width || 0}px ${card.border_style || 'solid'} ${effectiveBorderColor}`,
                  }
              : {};

            // Alignment helper classes
            const getTextAlignClass = () => {
              if (card.content_align === 'left') return 'text-left items-start';
              if (card.content_align === 'right') return 'text-right items-end';
              return 'text-center items-center';
            };

            const getVerticalAlignClass = () => {
              if (card.vertical_align === 'top') return 'justify-start';
              if (card.vertical_align === 'bottom') return 'justify-end';
              return 'justify-center';
            };

            // Rock-solid hover classes (Card aur image bilkul nahi hilegi - completely stationary)
            const getCardHoverClass = () => {
              if (hoverEffect === 'glow') return 'transition-shadow duration-300 hover:shadow-md hover:shadow-orange-500/10';
              return ''; // Completely rock-solid, card stays 100% stationary!
            };

            const getImageHoverClass = () => {
              return ''; // Inner image stays completely stationary, no shake or movement!
            };

            // Reusable text block for 'above' and 'below' positions
            const renderTextBlock = (placement: 'above' | 'below') => (
              <div
                className={`${placement === 'above' ? 'mb-2.5 sm:mb-3' : 'mt-2.5 sm:mt-3'} flex flex-col px-1 ${getTextAlignClass()}`}
              >
                {/* Title */}
                {card.title && (
                  <h3
                    className="text-xs sm:text-sm md:text-base font-semibold tracking-tight transition-colors group-hover:text-[#D26900]"
                    style={{
                      color: card.title_color || '#111827',
                      fontFamily: card.font_family || 'Inter',
                      fontWeight:
                        card.font_weight === 'bold'
                          ? 700
                          : card.font_weight === 'normal'
                          ? 400
                          : card.font_weight === 'medium'
                          ? 500
                          : 600,
                    }}
                  >
                    {card.title}
                  </h3>
                )}

                {/* Badge / Offer (e.g. UP TO 80% OFF) */}
                {card.badge_text && (
                  <span
                    className="mt-0.5 text-xs sm:text-sm font-extrabold tracking-tight uppercase"
                    style={{ color: card.badge_color || '#D26900' }}
                  >
                    {card.badge_text}
                  </span>
                )}

                {/* Subtitle */}
                {card.subtitle && (
                  <p
                    className="mt-0.5 text-[11px] sm:text-xs line-clamp-1 leading-normal"
                    style={{ color: card.subtitle_color || '#4B5563' }}
                  >
                    {card.subtitle}
                  </p>
                )}

                {/* Action Button / Link Text (e.g. Shop Now) */}
                {card.button_text && (
                  <span
                    className="mt-1 text-xs sm:text-sm font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                    style={{
                      color: card.button_color || '#D26900',
                      textDecorationColor: card.button_color || '#D26900',
                    }}
                  >
                    {card.button_text}
                  </span>
                )}
              </div>
            );

            const effectiveCardPadding =
              card.card_padding !== undefined && card.card_padding !== null
                ? Number(card.card_padding)
                : Number(secSettings.card_padding ?? 8);

            const effectiveImagePadding =
              card.image_padding !== undefined && card.image_padding !== null
                ? Number(card.image_padding)
                : Number(secSettings.image_padding ?? 0);

            const hasImage = Boolean(card.image_url && card.image_url.trim());
            const cardBgColor = card.bg_color && card.bg_color !== 'transparent' ? card.bg_color : '#FFFFFF';
            const innerFrameRadius = Math.max(0, effectiveRadius - effectiveCardPadding);
            const innerImageRadius = Math.max(0, innerFrameRadius - effectiveImagePadding);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`group flex flex-col cursor-pointer focus:outline-hidden ${getCardHoverClass()}`}
              >
                {/* 1. Above Card Text (when text_position is 'above') */}
                {effectiveTextPosition === 'above' && renderTextBlock('above')}

                {/* 2. Visual Card Media Container (with in-card space / border se bahar space) */}
                <div
                  className={`relative w-full overflow-hidden transition-all duration-300 ${getAspectRatioClass()}`}
                  style={{
                    borderRadius: `${effectiveRadius}px`,
                    backgroundColor: cardBgColor,
                    padding: `${effectiveCardPadding}px`,
                  }}
                >
                  {/* Framed Content Area (Border & Image sit inside here) */}
                  <div
                    className="relative w-full h-full overflow-hidden flex items-center justify-center"
                    style={{
                      borderRadius: `${innerFrameRadius}px`,
                      ...modernBorderStyle,
                    }}
                  >
                    {/* Inner Image (with image padding inside the frame) */}
                    {hasImage ? (
                      <div
                        className="w-full h-full overflow-hidden"
                        style={{
                          padding: `${effectiveImagePadding}px`,
                        }}
                      >
                        <img
                          src={card.image_url!}
                          alt={card.title || 'Showcase'}
                          className={`w-full h-full object-cover ${getImageHoverClass()}`}
                          style={{
                            borderRadius: `${innerImageRadius}px`,
                          }}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      // Solid / Color Background card when no image is uploaded
                      <div
                        className="w-full h-full flex flex-col items-center justify-center p-4 transition-colors"
                        style={{
                          backgroundColor: cardBgColor,
                          borderRadius: `${innerFrameRadius}px`,
                        }}
                      >
                        {/* If text is not inside, show a subtle elegant accent */}
                        {!effectiveTextPosition.startsWith('inside') && (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black/5 text-[#D26900] opacity-80">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Classic Ornate SVG Border Frame (Image 5 style) */}
                    {effectiveBorderMode === 'classic' && (
                      <ClassicBorderFrame
                        styleId={effectiveClassicStyle}
                        color={effectiveBorderColor}
                        radius={innerFrameRadius}
                        borderWidth={card.border_width || secSettings.global_border_width || 1}
                      />
                    )}

                    {/* Custom Uploaded Border Image Frame */}
                    {effectiveBorderMode === 'custom_image' && card.border_image_url && (
                      <div
                        className="absolute inset-0 pointer-events-none z-10 bg-contain bg-no-repeat bg-center"
                        style={{
                          backgroundImage: `url(${card.border_image_url})`,
                          borderRadius: `${innerFrameRadius}px`,
                        }}
                      />
                    )}

                  {/* 3. Inside Clean Text: Bina Overlay & Bina Shadow (User requested: bina over lay ka bina shadow) */}
                  {effectiveTextPosition === 'inside_clean' && (
                    <div
                      className={`absolute inset-0 z-20 flex flex-col p-4 sm:p-5 ${getVerticalAlignClass()} ${getTextAlignClass()} pointer-events-none`}
                    >
                      {card.badge_text && (
                        <span
                          className="inline-block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1"
                          style={{ color: card.badge_color || '#D26900' }}
                        >
                          {card.badge_text}
                        </span>
                      )}
                      {card.title && (
                        <h3
                          className="text-sm sm:text-base md:text-lg font-bold tracking-tight"
                          style={{
                            color: card.title_color || '#111827',
                            fontFamily: card.font_family || 'Inter',
                            fontWeight: card.font_weight === 'bold' ? 700 : card.font_weight === 'medium' ? 500 : 600,
                          }}
                        >
                          {card.title}
                        </h3>
                      )}
                      {card.subtitle && (
                        <p
                          className="mt-1 text-xs line-clamp-2 max-w-xs"
                          style={{ color: card.subtitle_color || '#4B5563' }}
                        >
                          {card.subtitle}
                        </p>
                      )}
                      {card.button_text && (
                        <span
                          className="mt-3 inline-flex items-center text-xs font-bold underline underline-offset-4 pointer-events-auto"
                          style={{
                            color: card.button_color || '#D26900',
                            textDecorationColor: card.button_color || '#D26900',
                          }}
                        >
                          {card.button_text}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 4. Inside Overlay Text with readable gradient (for inside_bottom, inside_center, inside_top) */}
                  {['inside_bottom', 'inside_center', 'inside_top'].includes(effectiveTextPosition) && (
                    <div
                      className={`absolute inset-0 z-20 flex flex-col p-3 sm:p-4 ${
                        effectiveTextPosition === 'inside_bottom'
                          ? 'justify-end bg-gradient-to-t from-black/85 via-black/35 to-transparent'
                          : effectiveTextPosition === 'inside_top'
                          ? 'justify-start bg-gradient-to-b from-black/85 via-black/35 to-transparent'
                          : `bg-black/45 ${getVerticalAlignClass()}`
                      } ${getTextAlignClass()}`}
                    >
                      {card.title && (
                        <h3
                          className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white drop-shadow-sm"
                          style={{
                            color: card.title_color && card.title_color !== '#111827' ? card.title_color : '#FFFFFF',
                            fontFamily: card.font_family || 'Inter',
                            fontWeight: card.font_weight === 'bold' ? 700 : card.font_weight === 'medium' ? 500 : 600,
                          }}
                        >
                          {card.title}
                        </h3>
                      )}
                      {card.badge_text && (
                        <span
                          className="mt-1 inline-block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider drop-shadow-xs"
                          style={{
                            color: card.badge_color && card.badge_color !== '#D26900' ? card.badge_color : '#FDE047',
                          }}
                        >
                          {card.badge_text}
                        </span>
                      )}
                      {card.subtitle && (
                        <p
                          className="mt-0.5 text-[10px] sm:text-xs line-clamp-1"
                          style={{
                            color: card.subtitle_color && card.subtitle_color !== '#4B5563' ? card.subtitle_color : '#E5E7EB',
                          }}
                        >
                          {card.subtitle}
                        </p>
                      )}
                      {card.button_text && (
                        <span
                          className="mt-2 inline-flex items-center text-xs font-bold underline underline-offset-4"
                          style={{
                            color: card.button_color || '#FFFFFF',
                            textDecorationColor: card.button_color || '#FDE047',
                          }}
                        >
                          {card.button_text}
                        </span>
                      )}
                    </div>
                  )}
                  </div>
                </div>

                {/* 5. Below Card Text (when text_position is 'below') */}
                {effectiveTextPosition === 'below' && renderTextBlock('below')}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
