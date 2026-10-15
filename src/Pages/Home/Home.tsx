import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { setCredentials, fetchCurrentUserAPI } from '../../redux/slices/authSlice';
import { useHomeBanner, defaultHomeSectionsLayout, type HomeSectionLayoutItem } from '../../Context/HomeBannerContext';
import HomeBanner from '../../Components/HomeBanner';
import HomeSubBanner from '../../Components/HomeSubBanner';
import HomeOccasionsSection from '../../Components/HomeOccasionsSection';
import HomeBestsellersSection from '../../Components/HomeBestsellersSection';
import HomeCustomCardsSection from '../../Components/HomeCustomCardsSection';
import HomePromoBannerSection from '../../Components/HomePromoBannerSection';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { sectionsLayout, fetchHomeDataOnDemand } = useHomeBanner();

  // On-demand load: only fetch home banners and layouts when user is actually on the Home page
  useEffect(() => {
    fetchHomeDataOnDemand();
  }, [fetchHomeDataOnDemand]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    if (token) {
      dispatch(
        setCredentials({
          accessToken: token,
          refreshToken: refreshToken || undefined,
        })
      );
      dispatch(fetchCurrentUserAPI());
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch]);

  const activeLayout = useMemo(() => {
    const list = Array.isArray(sectionsLayout) && sectionsLayout.length > 0 ? sectionsLayout : defaultHomeSectionsLayout;
    return list
      .filter((s) => s.is_enabled !== false)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [sectionsLayout]);

  const getDefaultPadding = (type: string): { top: number; bottom: number } => {
    switch (type) {
      case 'hero_banner':
        return { top: 0, bottom: 0 };
      case 'sub_banner':
        return { top: 0.5, bottom: 0.75 };
      case 'occasions':
        return { top: 1.5, bottom: 2.0 };
      case 'bestsellers':
        return { top: 2.0, bottom: 2.5 };
      case 'custom_cards':
        return { top: 2.0, bottom: 2.5 };
      case 'promo_banner':
        return { top: 1.5, bottom: 2.0 };
      default:
        return { top: 1.5, bottom: 2.0 };
    }
  };

  const renderSectionComponent = (section: HomeSectionLayoutItem, pTop?: number, pBottom?: number) => {
    switch (section.section_type) {
      case 'hero_banner':
        return (
          <HomeBanner
            sectionId={section.id}
            forcedTheme={section.theme}
            itemIds={section.item_ids}
            customItems={section.items}
            paddingTop={pTop}
            paddingBottom={pBottom}
          />
        );
      case 'sub_banner':
        return (
          <HomeSubBanner
            sectionId={section.id}
            titleOverride={section.section_title ?? section.settings?.section_title}
            itemIds={section.item_ids}
            customItems={section.items}
            paddingTop={pTop}
            paddingBottom={pBottom}
          />
        );
      case 'occasions':
        return (
          <HomeOccasionsSection
            sectionId={section.id}
            titleOverride={section.section_title ?? section.settings?.section_title}
            itemIds={section.item_ids}
            customItems={section.items}
            paddingTop={pTop}
            paddingBottom={pBottom}
          />
        );
      case 'bestsellers':
        return (
          <HomeBestsellersSection
            sectionId={section.id}
            titleOverride={section.section_title ?? section.settings?.section_title}
            subtitleOverride={section.section_subtitle ?? section.settings?.section_subtitle}
            cardThemeOverride={section.card_theme || section.theme || section.settings?.card_theme}
            cardsPerRowOverride={section.cards_per_row ? String(section.cards_per_row) : (section.settings?.cards_per_row ? String(section.settings.cards_per_row) : undefined)}
            bgModeOverride={(section.section_bg_mode || section.settings?.section_bg_mode) as any}
            bgColorOverride={section.section_bg_color || section.settings?.section_bg_color}
            itemIds={section.item_ids}
            customItems={section.items}
            viewAllUrlOverride={section.settings?.view_all_url || (section as any).view_all_url}
            viewAllTextOverride={section.settings?.view_all_text || (section as any).view_all_text}
            showViewAllOverride={section.settings?.show_view_all ?? (section as any).show_view_all}
            paddingTop={pTop}
            paddingBottom={pBottom}
          />
        );
      case 'custom_cards':
        return (
          <HomeCustomCardsSection
            sectionId={section.id}
            titleOverride={section.section_title ?? section.settings?.section_title}
            subtitleOverride={section.section_subtitle ?? section.settings?.section_subtitle}
            borderModeOverride={section.border_mode || section.settings?.global_border_mode}
            classicBorderOverride={section.classic_border_style || section.settings?.global_classic_border}
            aspectRatioOverride={section.card_aspect_ratio || section.settings?.card_aspect_ratio}
            cardsPerRowOverride={section.cards_per_row || section.settings?.cards_per_row}
            textPositionOverride={section.text_position || section.settings?.global_text_position}
            bgModeOverride={section.section_bg_mode || section.settings?.section_bg_mode}
            bgColorOverride={section.section_bg_color || section.settings?.section_bg_color}
            settingsOverride={section.settings}
            itemIds={section.item_ids}
            customItems={section.items}
            paddingTop={pTop}
            paddingBottom={pBottom}
          />
        );
      case 'promo_banner':
        return (
          <HomePromoBannerSection
            sectionId={section.id}
            heightOverride={section.banner_height || section.settings?.banner_height}
            radiusOverride={section.border_radius || section.settings?.border_radius}
            itemIds={section.item_ids}
            customItems={section.items}
            paddingTop={pTop}
            paddingBottom={pBottom}
          />
        );
      default:
        return null;
    }
  };

  const toRem = (val: number | undefined, defaultVal = 0): number => {
    if (val === undefined || val === null || isNaN(val)) return defaultVal;
    if (val > 6) return Number((val / 16).toFixed(3));
    return Number(val);
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {activeLayout.map((section) => {
        const mTop = toRem(section.margin_top, 0);
        const mBottom = toRem(section.margin_bottom, 0);
        const defaults = getDefaultPadding(section.section_type);
        const rawPTop = toRem(section.padding_top, defaults.top);
        const rawPBottom = toRem(section.padding_bottom, defaults.bottom);

        // For bestsellers & custom_cards, if saved as 0 due to previous bug, restore healthy default spacing
        const resolvedPTop =
          (section.section_type === 'bestsellers' || section.section_type === 'custom_cards') && rawPTop === 0
            ? defaults.top
            : rawPTop;
        const resolvedPBottom =
          (section.section_type === 'bestsellers' || section.section_type === 'custom_cards') && rawPBottom === 0
            ? defaults.bottom
            : rawPBottom;

        const rendered = renderSectionComponent(section, resolvedPTop, resolvedPBottom);
        if (!rendered) return null;

        return (
          <section
            key={section.id}
            id={`home-section-${section.id}`}
            className="w-full transition-all duration-200"
            style={{
              marginTop: `${mTop}rem`,
              marginBottom: `${mBottom}rem`,
              backgroundColor: section.bg_color && section.bg_color !== 'transparent' ? section.bg_color : undefined,
            }}
          >
            {rendered}
          </section>
        );
      })}
    </div>
  );
}
