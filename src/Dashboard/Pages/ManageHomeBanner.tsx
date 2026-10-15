import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useHomeBanner, type HomeBannerItem, type HomeSubBannerItem, type HomeOccasionCard, type HomeBestsellerItem, type HomePromoBannerItem } from '../../Context/HomeBannerContext';
import { useHeaderNavigation } from '../../Context/HeaderNavigationContext';
import AdminConfirmModal from '../Components/AdminConfirmModal';
import HomeBanner from '../../Components/HomeBanner';
import HomeSubBanner from '../../Components/HomeSubBanner';
import HomeOccasions from '../../Components/HomeOccasions';
import AdminCustomCardsTab from '../Components/AdminCustomCardsTab';
import AdminSectionsLayoutTab from '../Components/AdminSectionsLayoutTab';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { fetchAdminProducts, type ProductItem } from '../../redux/slices/productSlice';
import AdminSectionInstanceSelector from '../Components/AdminSectionInstanceSelector';

export interface BannerFontOption {
  name: string;
  label: string;
  category: string;
  preview: string;
}

export const BANNER_FONT_OPTIONS: BannerFontOption[] = [
  { name: 'Inter', label: 'Inter', category: 'Modern Clean Sans', preview: 'Modern & Clean Everywhere' },
  { name: 'Poppins', label: 'Poppins', category: 'Geometric & Friendly', preview: 'Geometric & Friendly Spirit' },
  { name: 'Playfair Display', label: 'Playfair Display', category: 'Luxury Editorial Serif', preview: 'Luxury & Elegant Craftsmanship' },
  { name: 'Montserrat', label: 'Montserrat', category: 'Urban Contemporary', preview: 'Contemporary Urban Chic' },
  { name: 'Outfit', label: 'Outfit', category: 'Premium Brand Sans', preview: 'Brand Contemporary Style' },
  { name: 'Cinzel', label: 'Cinzel', category: 'Royal Classical Serif', preview: 'CLASSICAL ROYAL HERITAGE' },
  { name: 'Bebas Neue', label: 'Bebas Neue', category: 'Bold Impact Headline', preview: 'BOLD IMPACT HEADLINES' },
  { name: 'Lora', label: 'Lora', category: 'Literary Contemporary', preview: 'Literary Elegance & Warmth' },
  { name: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Refined Tech Modern', preview: 'Refined Modern Aesthetics' },
  { name: 'Merriweather', label: 'Merriweather', category: 'Warm Editorial Serif', preview: 'Warm & Legible Editorial' },
  { name: 'Oswald', label: 'Oswald', category: 'Tall Compressed Display', preview: 'TALL & POWERFUL TITLES' },
  { name: 'Raleway', label: 'Raleway', category: 'Sophisticated Clean Sans', preview: 'Sophisticated Delicate Luxury' },
  { name: 'Caveat', label: 'Caveat', category: 'Playful Handwritten Script', preview: 'Handcrafted with Love & Care' },
  { name: 'Pacifico', label: 'Pacifico', category: 'Fun Coastal Brush', preview: 'Fun Coastal Sunshine Vibes' },
  { name: 'Dancing Script', label: 'Dancing Script', category: 'Charming Cursive Script', preview: 'Charming & Graceful Flow' },
  { name: 'Great Vibes', label: 'Great Vibes', category: 'Formal Calligraphy', preview: 'Calligraphic Touch of Elegance' },
  { name: 'Lobster', label: 'Lobster', category: 'Retro Bold Script', preview: 'Bold Retro Playful Energy' },
  { name: 'Righteous', label: 'Righteous', category: 'Futuristic Neo-Grotesque', preview: 'FUTURISTIC RETRO WAVE' },
  { name: 'Abril Fatface', label: 'Abril Fatface', category: 'High-Fashion Titling', preview: 'High Fashion Glamour' },
  { name: 'DM Sans', label: 'DM Sans', category: 'Minimalist Scandinavian', preview: 'Minimalist Clarity & Precision' },
];

interface BannerModalForm {
  id?: string;
  title: string;
  subtitle: string;
  button_text: string;
  media_type: 'image' | 'video';
  media_url: string;
  link_url: string;
  link_type: 'header' | 'dropdown';
  target_header_id?: string;
  target_dropdown_id?: string;
  show_overlay: boolean;
  overlay_position: 'left' | 'center' | 'right';
  title_color: string;
  subtitle_color: string;
  button_bg_color: string;
  button_text_color: string;
  font_family: string;
  is_active: boolean;
}

const emptyForm: BannerModalForm = {
  title: '',
  subtitle: '',
  button_text: 'SHOP NOW',
  media_type: 'image',
  media_url: '',
  link_url: '/',
  link_type: 'header',
  target_header_id: '',
  target_dropdown_id: '',
  show_overlay: true,
  overlay_position: 'right',
  title_color: '#FFFFFF',
  subtitle_color: '#F3F4F6',
  button_bg_color: '#8B2500',
  button_text_color: '#FFFFFF',
  font_family: 'Inter',
  is_active: true,
};

interface SubBannerModalForm {
  id?: string;
  title: string;
  image_url: string;
  link_url: string;
  link_type: 'header' | 'dropdown';
  target_header_id?: string;
  target_dropdown_id?: string;
  hover_bg_color: string;
  is_active: boolean;
}

const emptySubBannerForm: SubBannerModalForm = {
  title: '',
  image_url: '',
  link_url: '/',
  link_type: 'header',
  target_header_id: '',
  target_dropdown_id: '',
  hover_bg_color: '#FFF7ED',
  is_active: true,
};

export const HOVER_BG_PRESETS = [
  { name: 'Warm Cream (Default)', color: '#FFF7ED' },
  { name: 'Crisp Gray (Clean)', color: '#F3F4F6' },
  { name: 'Soft Gold / Amber', color: '#FEF3C7' },
  { name: 'Blush Rose', color: '#FFE4E6' },
  { name: 'Gentle Mint', color: '#ECFDF5' },
  { name: 'Sky Breeze', color: '#EFF6FF' },
  { name: 'Soft Lavender', color: '#FAF5FF' },
  { name: 'Pure White Card', color: '#FFFFFF' },
];

export interface OccasionModalForm {
  id?: string;
  title: string;
  date_badge: string;
  image_url: string;
  image_scale: number;
  image_position: 'bottom-right' | 'bottom-center' | 'center-right';
  bg_color: string;
  link_type: 'header' | 'dropdown';
  target_header_id?: string;
  target_dropdown_id?: string;
  link_url: string;
  is_active: boolean;
}

export const emptyOccasionForm: OccasionModalForm = {
  title: '',
  date_badge: '',
  image_url: '',
  image_scale: 1.0,
  image_position: 'bottom-right',
  bg_color: '#F9D3B4',
  link_type: 'header',
  target_header_id: '',
  target_dropdown_id: '',
  link_url: '/',
  is_active: true,
};

export const OCCASION_BG_PRESETS = [
  { name: 'Warm Peach (Birthday)', color: '#F9D3B4' },
  { name: 'Blush Pink (Boyfriend Day)', color: '#FAD2D8' },
  { name: 'Sky Blue (Congratulations)', color: '#ADCBE3' },
  { name: 'Soft Rose (Anniversary)', color: '#F8C3CD' },
  { name: 'Pastel Mint', color: '#D1F2D9' },
  { name: 'Soft Lilac / Lavender', color: '#E8DAEF' },
  { name: 'Butter Cream', color: '#FCF3CF' },
  { name: 'Clean White', color: '#FFFFFF' },
];

export interface BestsellerModalForm {
  id?: string;
  product_id?: string;
  source_mode?: 'catalog' | 'custom';
  title: string;
  subtitle: string;
  price: string;
  original_price: string;
  discount_badge: string;
  badge_text?: string;
  badge_style: 'discount' | 'luxe' | 'custom';
  rating?: number | string;
  reviews_count?: number | string;
  image_url: string;
  images?: string[];
  link_type: 'header' | 'dropdown';
  target_header_id?: string;
  target_dropdown_id?: string;
  link_url: string;
  is_active: boolean;
}

export const emptyBestsellerForm: BestsellerModalForm = {
  product_id: '',
  source_mode: 'catalog',
  title: '',
  subtitle: '',
  price: 'Rs. 1299',
  original_price: 'Rs. 1999',
  discount_badge: '35% OFF',
  badge_text: 'BESTSELLER',
  badge_style: 'discount',
  rating: 4.9,
  reviews_count: 95,
  image_url: '',
  images: [],
  link_type: 'header',
  target_header_id: '',
  target_dropdown_id: '',
  link_url: '/',
  is_active: true,
};

export const formatBestsellerPrice = (price?: string | number | null): string => {
  if (price === undefined || price === null || price === '') return '';
  const str = String(price).trim();
  if (/^Rs\.?\s*/i.test(str)) {
    return str.replace(/^Rs\.?\s*/i, 'Rs. ');
  }
  if (str.startsWith('₹')) {
    return `Rs. ${str.slice(1).trim()}`;
  }
  return `Rs. ${str}`;
};

export const formatBestsellerDiscount = (badge?: string | null): string => {
  if (!badge || badge.trim() === '') return '';
  const trimmed = badge.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return trimmed;
  return `(${trimmed})`;
};

export const BESTSELLER_CARD_THEMES = [
  { id: 'classic-clean', name: 'Classic Clean', desc: 'Standard clean rounded card with soft hover shadow' },
  { id: 'modern-card', name: 'Modern Rounded 3XL', desc: 'Ultra-rounded contemporary floating card style' },
  { id: 'glass-translucent', name: 'Frosted Glass', desc: 'Glassmorphic frosted border with subtle blur' },
  { id: 'bordered-elevated', name: 'Luxury Bordered', desc: 'Crisp bordered luxury aesthetic with amber accent' },
];

export const BESTSELLER_BG_MODES = [
  { id: 'white', name: 'Pure White (Default)', desc: 'Clean white background for all cards' },
  { id: 'color', name: 'Custom Accent Color', desc: 'Specify custom tint/color for cards' },
  { id: 'glass', name: 'Translucent Glass', desc: 'Glassy backdrop with blur' },
  { id: 'home-bg', name: 'Blend With Home Wallpaper', desc: 'Transparent so homepage background shows through' },
];

export const BESTSELLER_BG_COLOR_PRESETS = [
  { name: 'Pure White', color: '#FFFFFF' },
  { name: 'Warm Cream', color: '#FFFBF5' },
  { name: 'Soft Peach', color: '#FFF5F0' },
  { name: 'Gentle Rose', color: '#FFF1F2' },
  { name: 'Soft Amber', color: '#FEF9C3' },
  { name: 'Cool Slate', color: '#F8FAFC' },
  { name: 'Light Mint', color: '#F0FDF4' },
  { name: 'Light Lavender', color: '#FAF5FF' },
];

export const BESTSELLER_SECTION_BG_PRESETS = [
  { name: 'Transparent (Home Wallpaper)', color: 'transparent' },
  { name: 'Pure White', color: '#FFFFFF' },
  { name: 'Warm Cream', color: '#FFFBF5' },
  { name: 'Soft Peach', color: '#FFF5F0' },
  { name: 'Gentle Rose', color: '#FFF1F2' },
  { name: 'Light Mint', color: '#F0FDF4' },
  { name: 'Soft Lilac', color: '#FAF5FF' },
  { name: 'Cool Slate', color: '#F8FAFC' },
  { name: 'Dark Luxe Charcoal', color: '#18181B' },
];

export const BESTSELLER_CARDS_PER_ROW_OPTIONS = [
  { id: '2', name: '2 Cards Per Row', badge: 'Ultra Showcase', desc: 'Extra large prominent card spotlight' },
  { id: '3', name: '3 Cards Per Row', badge: 'Featured Look', desc: 'Spacious 3-column display' },
  { id: '4', name: '4 Cards Per Row (Default)', badge: 'Recommended', desc: 'Standard 4-column balanced grid' },
  { id: '5', name: '5 Cards Per Row', badge: 'Compact Luxury', desc: 'Showcase 5 items simultaneously on desktop' },
  { id: '6', name: '6 Cards Per Row', badge: 'Max Density', desc: 'Compact high-density catalog row' },
  { id: 'scroll', name: 'Fluid Horizontal Carousel', badge: 'Swipe / Scroll', desc: 'Smooth touch scroll with peek preview' },
];

export interface PromoBannerModalForm {
  title: string;
  subtitle: string;
  title_color: string;
  subtitle_color: string;
  text_position: 'left' | 'center' | 'right' | 'none';
  font_size: 'small' | 'medium' | 'large';
  image_url: string;
  is_active: boolean;
}

export const PROMO_ROTATION_SPEED_OPTIONS = [
  { val: 3000, name: '3 Seconds (Fast)', desc: 'Dynamic quick rotation between slides' },
  { val: 4000, name: '4 Seconds (Standard)', desc: 'Balanced smooth reading pace (Recommended)' },
  { val: 5000, name: '5 Seconds (Relaxed)', desc: 'Leisurely pace for image viewing' },
  { val: 7000, name: '7 Seconds (Slow)', desc: 'Cinematic slow transition' },
];

export const PROMO_HEIGHT_OPTIONS = [
  { id: 'compact', name: 'Compact Height (~220px)', desc: 'Sleek low-profile horizontal banner' },
  { id: 'standard', name: 'Standard Height (~280px)', desc: 'Balanced FNP reference display (Recommended)' },
  { id: 'tall', name: 'Tall Cinematic (~360px)', desc: 'Immersive high-impact billboard showcase' },
];

export const PROMO_RADIUS_OPTIONS = [
  { id: 'rounded-xl', name: 'Rounded-XL (12px)', desc: 'Modern soft rounded corners' },
  { id: 'rounded-2xl', name: 'Rounded-2XL (16px)', desc: 'Standard smooth curve (Recommended)' },
  { id: 'rounded-3xl', name: 'Rounded-3XL (24px)', desc: 'Ultra-curved boutique capsule frame' },
  { id: 'rounded-none', name: 'Sharp Corners (0px)', desc: 'Edge-to-edge sleek architectural border' },
];

export const emptyPromoBannerForm: PromoBannerModalForm = {
  title: 'Joyful Gifts To',
  subtitle: 'Make It Special',
  title_color: '#FFFFFF',
  subtitle_color: '#111827',
  text_position: 'left',
  font_size: 'medium',
  image_url: '',
  is_active: true,
};

export const BestsellerPreviewImageCarousel: React.FC<{
  images?: string[];
  imageUrl?: string;
  title: string;
  badgeText?: string;
  rating?: number | string;
  reviewsCount?: number | string;
}> = ({ images: rawImages, imageUrl, title, badgeText, rating, reviewsCount }) => {
  const images = useMemo(() => {
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      const filtered = rawImages.filter((u) => typeof u === 'string' && u.trim() !== '');
      if (filtered.length > 0) return filtered;
    }
    return imageUrl && imageUrl.trim() !== '' ? [imageUrl.trim()] : [];
  }, [rawImages, imageUrl]);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setActiveIdx(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full aspect-[4/4.5] bg-gray-100 overflow-hidden flex items-center justify-center">
      {images.length > 0 ? (
        images.map((imgUrl, idx) => (
          <img
            key={imgUrl + idx}
            src={imgUrl}
            alt={`${title} - ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              idx === activeIdx ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          />
        ))
      ) : (
        <span className="text-3xl text-gray-300">🎒</span>
      )}

      {/* Top-Left Orange Badge (BESTSELLER) */}
      <div className="absolute top-0 left-0 z-10 pointer-events-none">
        <span className="inline-block bg-[#D26900] text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 tracking-wider uppercase rounded-tl-xl rounded-br-lg shadow-xs">
          {badgeText || 'BESTSELLER'}
        </span>
      </div>

      {/* Rating Overlay Pill */}
      {(rating || reviewsCount) && (
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-xs border border-gray-100 text-[10px] pointer-events-none">
          <span className="font-bold text-gray-900 leading-none">
            {typeof rating === 'number' ? rating.toFixed(1) : rating || 4.9}
          </span>
          <span className="text-amber-500 leading-none text-xs">★</span>
          <span className="text-gray-300 leading-none">|</span>
          <span className="text-gray-500 font-medium text-[9px] leading-none">
            {reviewsCount || 95}
          </span>
        </div>
      )}

      {/* Indicator Dots for Multiple Images */}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(dotIdx);
                }}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  activeIdx === dotIdx ? 'w-3.5 bg-[#D26900]' : 'w-1.5 bg-white/70 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ManageHomeBanner() {
  // Primary Tab ('layout' | 'banners' | 'sub-banners' | 'occasions' | 'bestsellers' | 'promo-banner' | 'custom-cards')
  const [activeTab, setActiveTab] = useState<'layout' | 'banners' | 'sub-banners' | 'occasions' | 'bestsellers' | 'promo-banner' | 'custom-cards'>('banners');

  const {
    adminBanners,
    adminLoading,
    activeTheme,
    availableThemes,
    setActiveTheme,
    fetchAdminBanners,
    uploadBannerMedia,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,

    // Sub-banners
    adminSubBanners,
    subBannerSettings,
    subBannerLoading,
    fetchAdminSubBanners,
    createSubBanner,
    updateSubBanner,
    deleteSubBanner,
    reorderSubBanners,
    updateSubBannerSettings,

    // Occasions
    adminOccasions,
    occasionsSettings,
    occasionsLoading,
    fetchAdminOccasions,
    createOccasion,
    updateOccasion,
    deleteOccasion,
    reorderOccasions,
    updateOccasionSettings,

    // Bestsellers
    adminBestsellers,
    bestsellerSettings,
    bestsellerLoading,
    fetchAdminBestsellers,
    createBestseller,
    updateBestseller,
    deleteBestseller,
    toggleBestsellerStatus,
    reorderBestsellers,
    updateBestsellerSettings,

    // Promo Banners
    adminPromoBanners,
    promoBannerSettings,
    createPromoBanner,
    updatePromoBanner,
    deletePromoBanner,
    reorderPromoBanners,
    updatePromoBannerSettings,

    // Custom Showcase Cards
    adminCustomCards,
    customCardsSettings,

    // Page Sections Layout & Spacing
    adminSectionsLayout,
    updateSectionsLayout,
    saveSingleSectionLayout,
    addSection,
    duplicateSection,
    deleteSection,
  } = useHomeBanner();

  const dispatch = useDispatch<AppDispatch>();
  const { adminProducts } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const [themeTargetHeroId, setThemeTargetHeroId] = useState<string>('all');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // 1. Hero Banners Multi-Instance Management
  const heroSections = useMemo(
    () => (adminSectionsLayout || []).filter((s) => s.section_type === 'hero_banner'),
    [adminSectionsLayout]
  );
  const heroSectionsInLayout = heroSections;
  const [activeHeroSectionId, setActiveHeroSectionId] = useState<string>('');
  const activeHeroSection = useMemo(() => {
    if (!heroSections.length) return null;
    return heroSections.find((s) => s.id === activeHeroSectionId) || heroSections[0];
  }, [heroSections, activeHeroSectionId]);
  const effectiveHeroBanners = useMemo(() => {
    if (activeHeroSection) {
      if (activeHeroSection.id !== 'hero_banner_1') {
        return Array.isArray(activeHeroSection.items) ? (activeHeroSection.items as HomeBannerItem[]) : [];
      }
      if (Array.isArray(activeHeroSection.items)) {
        return activeHeroSection.items as HomeBannerItem[];
      }
      return adminBanners;
    }
    return adminBanners;
  }, [activeHeroSection, adminBanners]);

  // 2. Sub-Banners (Categories) Multi-Instance Management
  const subSections = useMemo(
    () => (adminSectionsLayout || []).filter((s) => s.section_type === 'sub_banner'),
    [adminSectionsLayout]
  );
  const [activeSubSectionId, setActiveSubSectionId] = useState<string>('');
  const activeSubSection = useMemo(() => {
    if (!subSections.length) return null;
    return subSections.find((s) => s.id === activeSubSectionId) || subSections[0];
  }, [subSections, activeSubSectionId]);
  const effectiveSubBanners = useMemo(() => {
    if (activeSubSection) {
      if (activeSubSection.id !== 'sub_banner_1') {
        return Array.isArray(activeSubSection.items) ? (activeSubSection.items as HomeSubBannerItem[]) : [];
      }
      if (Array.isArray(activeSubSection.items)) {
        return activeSubSection.items as HomeSubBannerItem[];
      }
      return adminSubBanners;
    }
    return adminSubBanners;
  }, [activeSubSection, adminSubBanners]);

  // 3. Occasions Multi-Instance Management
  const occasionSections = useMemo(
    () => (adminSectionsLayout || []).filter((s) => s.section_type === 'occasions'),
    [adminSectionsLayout]
  );
  const [activeOccasionSectionId, setActiveOccasionSectionId] = useState<string>('');
  const activeOccasionSection = useMemo(() => {
    if (!occasionSections.length) return null;
    return occasionSections.find((s) => s.id === activeOccasionSectionId) || occasionSections[0];
  }, [occasionSections, activeOccasionSectionId]);
  const effectiveOccasions = useMemo(() => {
    if (activeOccasionSection) {
      if (activeOccasionSection.id !== 'occasions_1') {
        return Array.isArray(activeOccasionSection.items) ? (activeOccasionSection.items as HomeOccasionCard[]) : [];
      }
      if (Array.isArray(activeOccasionSection.items)) {
        return activeOccasionSection.items as HomeOccasionCard[];
      }
      return adminOccasions;
    }
    return adminOccasions;
  }, [activeOccasionSection, adminOccasions]);

  // 4. Bestsellers Multi-Instance Management
  const bestsellerSections = useMemo(
    () => (adminSectionsLayout || []).filter((s) => s.section_type === 'bestsellers'),
    [adminSectionsLayout]
  );
  const [activeBestsellerSectionId, setActiveBestsellerSectionId] = useState<string>('');
  const activeBestsellerSection = useMemo(() => {
    if (!bestsellerSections.length) return null;
    return bestsellerSections.find((s) => s.id === activeBestsellerSectionId) || bestsellerSections[0];
  }, [bestsellerSections, activeBestsellerSectionId]);
  const isFlowerDummy = (b: any) => {
    const t = (b?.title || '').toLowerCase();
    return (
      t.includes('pretty in pink') ||
      t.includes('sunflower symphony') ||
      t.includes('blush rose') ||
      t.includes('the muse') ||
      t.includes('white orchid') ||
      t.includes('floral vase')
    );
  };

  const effectiveBestsellers = useMemo(() => {
    if (activeBestsellerSection) {
      if (activeBestsellerSection.id !== 'bestsellers_1') {
        const customList = Array.isArray(activeBestsellerSection.items)
          ? (activeBestsellerSection.items as HomeBestsellerItem[]).filter((b) => !isFlowerDummy(b))
          : [];
        return customList.length > 0 ? customList : adminBestsellers.filter((b) => !isFlowerDummy(b));
      }
      if (Array.isArray(activeBestsellerSection.items)) {
        const cleaned = (activeBestsellerSection.items as HomeBestsellerItem[]).filter((b) => !isFlowerDummy(b));
        if (cleaned.length > 0) return cleaned;
      }
      return adminBestsellers.filter((b) => !isFlowerDummy(b));
    }
    return adminBestsellers.filter((b) => !isFlowerDummy(b));
  }, [activeBestsellerSection, adminBestsellers]);

  // 5. Promo Banners Multi-Instance Management
  const promoSections = useMemo(
    () => (adminSectionsLayout || []).filter((s) => s.section_type === 'promo_banner'),
    [adminSectionsLayout]
  );
  const [activePromoSectionId, setActivePromoSectionId] = useState<string>('');
  const activePromoSection = useMemo(() => {
    if (!promoSections.length) return null;
    return promoSections.find((s) => s.id === activePromoSectionId) || promoSections[0];
  }, [promoSections, activePromoSectionId]);
  const effectivePromoBanners = useMemo(() => {
    if (activePromoSection) {
      if (activePromoSection.id !== 'promo_banner_1') {
        return Array.isArray(activePromoSection.items) ? (activePromoSection.items as HomePromoBannerItem[]) : [];
      }
      if (Array.isArray(activePromoSection.items)) {
        return activePromoSection.items as HomePromoBannerItem[];
      }
      return adminPromoBanners;
    }
    return adminPromoBanners;
  }, [activePromoSection, adminPromoBanners]);

  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const effectiveTheme = previewTheme || activeTheme || 'peek-carousel';

  const { adminItems, refreshAdminItems } = useHeaderNavigation();

  // Banner Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BannerModalForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sub-Banner Modals state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isEditingSub, setIsEditingSub] = useState(false);
  const [subFormData, setSubFormData] = useState<SubBannerModalForm>(emptySubBannerForm);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  const [isUploadingSub, setIsUploadingSub] = useState(false);
  const subFileInputRef = useRef<HTMLInputElement | null>(null);

  // Occasions Section Modals state
  const [isOccasionModalOpen, setIsOccasionModalOpen] = useState(false);
  const [isEditingOccasion, setIsEditingOccasion] = useState(false);
  const [occasionFormData, setOccasionFormData] = useState<OccasionModalForm>(emptyOccasionForm);
  const [isSubmittingOccasion, setIsSubmittingOccasion] = useState(false);
  const [isUploadingOccasion, setIsUploadingOccasion] = useState(false);
  const occasionFileInputRef = useRef<HTMLInputElement | null>(null);

  // Bestsellers Section Modals state
  const [isBestsellerModalOpen, setIsBestsellerModalOpen] = useState(false);
  const [isEditingBestseller, setIsEditingBestseller] = useState(false);
  const [bestsellerFormData, setBestsellerFormData] = useState<BestsellerModalForm>(emptyBestsellerForm);
  const [isSubmittingBestseller, setIsSubmittingBestseller] = useState(false);
  const [isUploadingBestseller, setIsUploadingBestseller] = useState(false);
  const bestsellerFileInputRef = useRef<HTMLInputElement | null>(null);

  // Promo Banner Section Modals state
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isEditingPromo, setIsEditingPromo] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoFormData, setPromoFormData] = useState<PromoBannerModalForm>(emptyPromoBannerForm);
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);
  const promoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [deletePromoConfirm, setDeletePromoConfirm] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });
  const [isDeletingPromo, setIsDeletingPromo] = useState(false);

  // Promo Banner Settings state
  const [promoIsEnabled, setPromoIsEnabled] = useState(promoBannerSettings?.is_enabled !== false);
  const [promoAutoplay, setPromoAutoplay] = useState(promoBannerSettings?.autoplay !== false);
  const [promoAutoplayInterval, setPromoAutoplayInterval] = useState(promoBannerSettings?.autoplay_interval || 4000);
  const [promoBannerHeight, setPromoBannerHeight] = useState<'compact' | 'standard' | 'tall'>(promoBannerSettings?.banner_height || 'standard');
  const [promoShowDots, setPromoShowDots] = useState(promoBannerSettings?.show_dots !== false);
  const [promoBorderRadius, setPromoBorderRadius] = useState<'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-none'>(promoBannerSettings?.border_radius || 'rounded-2xl');
  const [isSavingPromoSettings, setIsSavingPromoSettings] = useState(false);

  useEffect(() => {
    if (activePromoSection) {
      const secSettings = activePromoSection.settings || {};
      setPromoIsEnabled(secSettings.is_enabled !== false && activePromoSection.is_enabled !== false);
      setPromoAutoplay(secSettings.autoplay !== false);
      setPromoAutoplayInterval(secSettings.autoplay_interval || 4000);
      setPromoBannerHeight((activePromoSection.banner_height as any) || secSettings.banner_height || 'standard');
      setPromoShowDots(secSettings.show_dots !== false);
      setPromoBorderRadius((activePromoSection.border_radius as any) || secSettings.border_radius || 'rounded-2xl');
    } else if (promoBannerSettings) {
      setPromoIsEnabled(promoBannerSettings.is_enabled !== false);
      setPromoAutoplay(promoBannerSettings.autoplay !== false);
      setPromoAutoplayInterval(promoBannerSettings.autoplay_interval || 4000);
      setPromoBannerHeight(promoBannerSettings.banner_height || 'standard');
      setPromoShowDots(promoBannerSettings.show_dots !== false);
      setPromoBorderRadius(promoBannerSettings.border_radius || 'rounded-2xl');
    }
  }, [activePromoSection, promoBannerSettings]);

  // Custom Dropdown Open States (Header Category, Sub-Item, and Font Style)
  const [openDropdown, setOpenDropdown] = useState<'header' | 'subitem' | 'font' | null>(null);
  const [subOpenDropdown, setSubOpenDropdown] = useState<'header' | 'subitem' | null>(null);
  const [occasionOpenDropdown, setOccasionOpenDropdown] = useState<'header' | 'subitem' | null>(null);
  const [bestsellerOpenDropdown, setBestsellerOpenDropdown] = useState<'header' | 'subitem' | null>(null);

  const [headerSearch, setHeaderSearch] = useState('');
  const [subitemSearch, setSubitemSearch] = useState('');
  const [fontSearch, setFontSearch] = useState('');
  const [subHeaderSearch, setSubHeaderSearch] = useState('');
  const [subItemSearch, setSubItemSearch] = useState('');
  const [occasionHeaderSearch, setOccasionHeaderSearch] = useState('');
  const [occasionSubItemSearch, setOccasionSubItemSearch] = useState('');
  const [bestsellerHeaderSearch, setBestsellerHeaderSearch] = useState('');
  const [bestsellerSubItemSearch, setBestsellerSubItemSearch] = useState('');

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const subDropdownRef = useRef<HTMLDivElement | null>(null);
  const occasionDropdownRef = useRef<HTMLDivElement | null>(null);
  const bestsellerDropdownRef = useRef<HTMLDivElement | null>(null);

  // Occasions section title editor state
  const [sectionTitleInput, setSectionTitleInput] = useState(occasionsSettings?.section_title || 'Gifts For Every Occasion');
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  useEffect(() => {
    if (activeOccasionSection) {
      setSectionTitleInput(activeOccasionSection.section_title || activeOccasionSection.custom_label || 'Gifts For Every Occasion');
    } else if (occasionsSettings?.section_title) {
      setSectionTitleInput(occasionsSettings.section_title);
    }
  }, [activeOccasionSection, occasionsSettings?.section_title]);

  // Bestsellers section settings state
  const [bestsellerTitleInput, setBestsellerTitleInput] = useState(bestsellerSettings?.section_title || 'Shop By Bestsellers');
  const [bestsellerSubtitleInput, setBestsellerSubtitleInput] = useState(bestsellerSettings?.section_subtitle || '');
  const [viewAllTextInput, setViewAllTextInput] = useState(bestsellerSettings?.view_all_text || 'View All Bestsellers');
  const [viewAllUrlInput, setViewAllUrlInput] = useState(bestsellerSettings?.view_all_url || '/category/bestsellers');
  const [showViewAllInput, setShowViewAllInput] = useState(bestsellerSettings?.show_view_all !== false);
  const [viewAllLinkTypeInput, setViewAllLinkTypeInput] = useState<'header' | 'dropdown'>(
    (bestsellerSettings?.view_all_link_type as any) || 'header'
  );
  const [viewAllTargetHeaderId, setViewAllTargetHeaderId] = useState<string>(
    bestsellerSettings?.view_all_target_header_id || ''
  );
  const [viewAllTargetDropdownId, setViewAllTargetDropdownId] = useState<string>(
    bestsellerSettings?.view_all_target_dropdown_id || ''
  );
  const [openViewAllDropdown, setOpenViewAllDropdown] = useState<'header' | 'dropdown' | null>(null);
  const [viewAllHeaderSearch, setViewAllHeaderSearch] = useState('');
  const [viewAllSubItemSearch, setViewAllSubItemSearch] = useState('');
  const viewAllDropdownRef = useRef<HTMLDivElement | null>(null);

  // Store product catalog search for auto-fill in Bestseller modal
  const [bestsellerProductSearch, setBestsellerProductSearch] = useState('');
  const [isBestsellerProductDropdownOpen, setIsBestsellerProductDropdownOpen] = useState(false);
  const bestsellerProductDropdownRef = useRef<HTMLDivElement | null>(null);

  const [sectionBgModeInput, setSectionBgModeInput] = useState<'transparent' | 'color'>((bestsellerSettings?.section_bg_mode as any) || 'transparent');
  const [sectionBgColorInput, setSectionBgColorInput] = useState(bestsellerSettings?.section_bg_color || '#FFFFFF');
  const [cardThemeInput, setCardThemeInput] = useState(bestsellerSettings?.card_theme || 'classic-clean');
  const [cardBgModeInput, setCardBgModeInput] = useState(bestsellerSettings?.card_bg_mode || 'white');
  const [cardBgColorInput, setCardBgColorInput] = useState(bestsellerSettings?.card_bg_color || '#FFFFFF');
  const [cardTransparencyInput, setCardTransparencyInput] = useState(typeof bestsellerSettings?.card_transparency === 'number' ? bestsellerSettings.card_transparency : 0);
  const [cardsPerRowInput, setCardsPerRowInput] = useState<string>(bestsellerSettings?.cards_per_row || '4');
  const [openStudioDropdown, setOpenStudioDropdown] = useState<string | null>(null);
  const studioDropdownRef = useRef<HTMLDivElement | null>(null);
  const [openPromoDropdown, setOpenPromoDropdown] = useState<'speed' | 'height' | 'radius' | null>(null);
  const promoDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isSavingBestsellerSettings, setIsSavingBestsellerSettings] = useState(false);

  useEffect(() => {
    if (activeBestsellerSection) {
      const secSettings = activeBestsellerSection.settings || {};
      setBestsellerTitleInput(activeBestsellerSection.section_title || secSettings.section_title || activeBestsellerSection.custom_label || 'Shop By Bestsellers');
      setBestsellerSubtitleInput(activeBestsellerSection.section_subtitle || secSettings.section_subtitle || '');
      setViewAllTextInput(secSettings.view_all_text || 'View All Bestsellers');
      setViewAllUrlInput(secSettings.view_all_url || '/category/bestsellers');
      setShowViewAllInput(secSettings.show_view_all !== false);
      setViewAllLinkTypeInput(
        secSettings.view_all_link_type ||
        (secSettings.view_all_target_dropdown_id ? 'dropdown' : 'header')
      );
      setViewAllTargetHeaderId(secSettings.view_all_target_header_id || '');
      setViewAllTargetDropdownId(secSettings.view_all_target_dropdown_id || '');
      setSectionBgModeInput((activeBestsellerSection.section_bg_mode as any) || secSettings.section_bg_mode || 'transparent');
      setSectionBgColorInput(activeBestsellerSection.section_bg_color || secSettings.section_bg_color || '#FFFFFF');
      setCardThemeInput(activeBestsellerSection.card_theme || secSettings.card_theme || 'classic-clean');
      setCardBgModeInput(secSettings.card_bg_mode || 'white');
      setCardBgColorInput(secSettings.card_bg_color || '#FFFFFF');
      setCardTransparencyInput(typeof secSettings.card_transparency === 'number' ? secSettings.card_transparency : 0);
      setCardsPerRowInput(String(activeBestsellerSection.cards_per_row || secSettings.cards_per_row || '4'));
    } else if (bestsellerSettings) {
      setBestsellerTitleInput(bestsellerSettings.section_title || 'Shop By Bestsellers');
      setBestsellerSubtitleInput(bestsellerSettings.section_subtitle || '');
      setViewAllTextInput(bestsellerSettings.view_all_text || 'View All Bestsellers');
      setViewAllUrlInput(bestsellerSettings.view_all_url || '/category/bestsellers');
      setShowViewAllInput(bestsellerSettings.show_view_all !== false);
      setViewAllLinkTypeInput(
        bestsellerSettings.view_all_link_type ||
        (bestsellerSettings.view_all_target_dropdown_id ? 'dropdown' : 'header')
      );
      setViewAllTargetHeaderId(bestsellerSettings.view_all_target_header_id || '');
      setViewAllTargetDropdownId(bestsellerSettings.view_all_target_dropdown_id || '');
      setSectionBgModeInput((bestsellerSettings.section_bg_mode as any) || 'transparent');
      setSectionBgColorInput(bestsellerSettings.section_bg_color || '#FFFFFF');
      setCardThemeInput(bestsellerSettings.card_theme || 'classic-clean');
      setCardBgModeInput(bestsellerSettings.card_bg_mode || 'white');
      setCardBgColorInput(bestsellerSettings.card_bg_color || '#FFFFFF');
      setCardTransparencyInput(typeof bestsellerSettings.card_transparency === 'number' ? bestsellerSettings.card_transparency : 0);
      setCardsPerRowInput(bestsellerSettings.cards_per_row || '4');
    }
  }, [activeBestsellerSection, bestsellerSettings]);

  // Close custom dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
      if (subDropdownRef.current && !subDropdownRef.current.contains(e.target as Node)) {
        setSubOpenDropdown(null);
      }
      if (occasionDropdownRef.current && !occasionDropdownRef.current.contains(e.target as Node)) {
        setOccasionOpenDropdown(null);
      }
      if (bestsellerDropdownRef.current && !bestsellerDropdownRef.current.contains(e.target as Node)) {
        setBestsellerOpenDropdown(null);
      }
      if (studioDropdownRef.current && !studioDropdownRef.current.contains(e.target as Node)) {
        setOpenStudioDropdown(null);
      }
      if (promoDropdownRef.current && !promoDropdownRef.current.contains(e.target as Node)) {
        setOpenPromoDropdown(null);
      }
      if (viewAllDropdownRef.current && !viewAllDropdownRef.current.contains(e.target as Node)) {
        setOpenViewAllDropdown(null);
      }
      if (bestsellerProductDropdownRef.current && !bestsellerProductDropdownRef.current.contains(e.target as Node)) {
        setIsBestsellerProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Delete Confirm Modal State (Banner)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    bannerId: string;
    bannerTitle: string;
  }>({
    isOpen: false,
    bannerId: '',
    bannerTitle: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete Confirm Modal State (Sub-Banner)
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });
  const [isDeletingSub, setIsDeletingSub] = useState(false);

  // Delete Confirm Modal State (Occasion)
  const [deleteOccasionConfirm, setDeleteOccasionConfirm] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });
  const [isDeletingOccasion, setIsDeletingOccasion] = useState(false);

  // Delete Confirm Modal State (Bestseller)
  const [deleteBestsellerConfirm, setDeleteBestsellerConfirm] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });
  const [isDeletingBestseller, setIsDeletingBestseller] = useState(false);

  // Fetch admin banners, sub-banners, occasions, bestsellers, and headers on mount
  useEffect(() => {
    fetchAdminBanners();
    fetchAdminSubBanners();
    fetchAdminOccasions();
    fetchAdminBestsellers();
    refreshAdminItems();
  }, [fetchAdminBanners, fetchAdminSubBanners, fetchAdminOccasions, fetchAdminBestsellers, refreshAdminItems]);

  // Extract all dropdown items flattened for easy selection
  const allDropdownOptions = useMemo(() => {
    const list: { id: string; headerTitle: string; title: string; path: string }[] = [];
    adminItems.forEach((h) => {
      (h.dropdown_items || []).forEach((d) => {
        list.push({
          id: d.id,
          headerTitle: h.title,
          title: d.title,
          path: d.path,
        });
      });
    });
    return list;
  }, [adminItems]);

  // Filtered lists for compact custom dropdowns
  const filteredHeaders = useMemo(() => {
    if (!headerSearch.trim()) return adminItems;
    const q = headerSearch.toLowerCase();
    return adminItems.filter((h) => h.title.toLowerCase().includes(q) || h.path.toLowerCase().includes(q));
  }, [adminItems, headerSearch]);

  const filteredSubitems = useMemo(() => {
    if (!subitemSearch.trim()) return allDropdownOptions;
    const q = subitemSearch.toLowerCase();
    return allDropdownOptions.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.headerTitle.toLowerCase().includes(q) ||
        d.path.toLowerCase().includes(q)
    );
  }, [allDropdownOptions, subitemSearch]);

  const filteredFonts = useMemo(() => {
    if (!fontSearch.trim()) return BANNER_FONT_OPTIONS;
    const q = fontSearch.toLowerCase();
    return BANNER_FONT_OPTIONS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.label.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [fontSearch]);

  const filteredSubHeaders = useMemo(() => {
    if (!subHeaderSearch.trim()) return adminItems;
    const q = subHeaderSearch.toLowerCase();
    return adminItems.filter((h) => h.title.toLowerCase().includes(q) || h.path.toLowerCase().includes(q));
  }, [adminItems, subHeaderSearch]);

  const filteredSubDropdowns = useMemo(() => {
    if (!subItemSearch.trim()) return allDropdownOptions;
    const q = subItemSearch.toLowerCase();
    return allDropdownOptions.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.headerTitle.toLowerCase().includes(q) ||
        d.path.toLowerCase().includes(q)
    );
  }, [allDropdownOptions, subItemSearch]);

  const filteredOccasionHeaders = useMemo(() => {
    if (!occasionHeaderSearch.trim()) return adminItems;
    const q = occasionHeaderSearch.toLowerCase();
    return adminItems.filter((h) => h.title.toLowerCase().includes(q) || h.path.toLowerCase().includes(q));
  }, [adminItems, occasionHeaderSearch]);

  const filteredOccasionDropdowns = useMemo(() => {
    if (!occasionSubItemSearch.trim()) return allDropdownOptions;
    const q = occasionSubItemSearch.toLowerCase();
    return allDropdownOptions.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.headerTitle.toLowerCase().includes(q) ||
        d.path.toLowerCase().includes(q)
    );
  }, [allDropdownOptions, occasionSubItemSearch]);

  const filteredBestsellerHeaders = useMemo(() => {
    if (!bestsellerHeaderSearch.trim()) return adminItems;
    const q = bestsellerHeaderSearch.toLowerCase();
    return adminItems.filter((h) => h.title.toLowerCase().includes(q) || h.path.toLowerCase().includes(q));
  }, [adminItems, bestsellerHeaderSearch]);

  const filteredBestsellerDropdowns = useMemo(() => {
    if (!bestsellerSubItemSearch.trim()) return allDropdownOptions;
    const q = bestsellerSubItemSearch.toLowerCase();
    return allDropdownOptions.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.headerTitle.toLowerCase().includes(q) ||
        d.path.toLowerCase().includes(q)
    );
  }, [allDropdownOptions, bestsellerSubItemSearch]);

  const filteredViewAllHeaders = useMemo(() => {
    if (!viewAllHeaderSearch.trim()) return adminItems;
    const q = viewAllHeaderSearch.toLowerCase();
    return adminItems.filter((h) => h.title.toLowerCase().includes(q) || h.path.toLowerCase().includes(q));
  }, [adminItems, viewAllHeaderSearch]);

  const filteredViewAllDropdowns = useMemo(() => {
    if (!viewAllSubItemSearch.trim()) return allDropdownOptions;
    const q = viewAllSubItemSearch.toLowerCase();
    return allDropdownOptions.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.headerTitle.toLowerCase().includes(q) ||
        d.path.toLowerCase().includes(q)
    );
  }, [allDropdownOptions, viewAllSubItemSearch]);

  const filteredCatalogProducts = useMemo(() => {
    if (!bestsellerProductSearch.trim()) return adminProducts;
    const q = bestsellerProductSearch.toLowerCase();
    return adminProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.header_title && p.header_title.toLowerCase().includes(q)) ||
        (p.dropdown_title && p.dropdown_title.toLowerCase().includes(q))
    );
  }, [adminProducts, bestsellerProductSearch]);

  const destinationProducts = useMemo(() => {
    return adminProducts.filter((p) => {
      if (bestsellerFormData.link_type === 'header') {
        return (
          Boolean(bestsellerFormData.target_header_id) &&
          p.target_header_id === bestsellerFormData.target_header_id
        );
      }
      if (bestsellerFormData.link_type === 'dropdown') {
        return (
          Boolean(bestsellerFormData.target_dropdown_id) &&
          p.target_dropdown_id === bestsellerFormData.target_dropdown_id
        );
      }
      return false;
    });
  }, [adminProducts, bestsellerFormData.link_type, bestsellerFormData.target_header_id, bestsellerFormData.target_dropdown_id]);

  const handleViewAllLinkTypeChange = (type: 'header' | 'dropdown') => {
    setViewAllLinkTypeInput(type);
    setOpenViewAllDropdown(null);
    if (type === 'header') {
      const match = adminItems.find((h) => h.id === viewAllTargetHeaderId) || adminItems[0];
      if (match) {
        setViewAllTargetHeaderId(match.id);
        setViewAllTargetDropdownId('');
        setViewAllUrlInput(match.path);
      }
    } else {
      const match = allDropdownOptions.find((d) => d.id === viewAllTargetDropdownId) || allDropdownOptions[0];
      if (match) {
        setViewAllTargetDropdownId(match.id);
        setViewAllTargetHeaderId('');
        setViewAllUrlInput(match.path);
      }
    }
  };

  const handleSelectCatalogProduct = (prod: ProductItem) => {
    const formattedPrice = `Rs. ${Number(prod.price || 0).toLocaleString('en-IN')}`;
    const formattedMrp = prod.mrp ? `Rs. ${Number(prod.mrp).toLocaleString('en-IN')}` : '';
    const discountText =
      prod.discount_percent > 0
        ? `${prod.discount_percent}% OFF`
        : prod.badge_text
        ? prod.badge_text
        : '';
    const prodImg = prod.primary_image || prod.images?.[0]?.url || '';
    const allProdImages: string[] = [];
    if (prod.primary_image) allProdImages.push(prod.primary_image);
    if (Array.isArray(prod.images)) {
      prod.images.forEach((img: any) => {
        const u = typeof img === 'string' ? img : img?.url;
        if (u && !allProdImages.includes(u)) allProdImages.push(u);
      });
    }
    const finalImages = allProdImages.length > 0 ? allProdImages : (prodImg ? [prodImg] : []);

    let effectiveLinkType: 'header' | 'dropdown' = prod.target_dropdown_id ? 'dropdown' : 'header';
    let targetHeaderId = prod.target_header_id || '';
    let targetDropdownId = prod.target_dropdown_id || '';
    let linkUrl = prod.dropdown_path || prod.header_path || `/product/${prod.slug}`;

    setBestsellerFormData((prev) => ({
      ...prev,
      product_id: prod.id,
      source_mode: 'catalog',
      title: prod.title,
      subtitle: prod.subtitle || prev.subtitle || '',
      price: formattedPrice,
      original_price: formattedMrp,
      discount_badge: discountText,
      badge_text: prod.badge_text || 'BESTSELLER',
      badge_style: 'discount',
      rating: prod.rating || 4.9,
      reviews_count: prod.reviews_count || 95,
      image_url: prodImg || prev.image_url,
      images: finalImages,
      link_type: effectiveLinkType,
      target_header_id: targetHeaderId,
      target_dropdown_id: targetDropdownId,
      link_url: linkUrl,
    }));
    setIsBestsellerProductDropdownOpen(false);
    toast.success(`Loaded details from "${prod.title}"!`);
  };

  const handleBestsellerLinkTypeChange = (type: 'header' | 'dropdown') => {
    setBestsellerOpenDropdown(null);
    if (type === 'header') {
      const first = adminItems[0];
      setBestsellerFormData((p) => ({
        ...p,
        link_type: 'header',
        target_header_id: first?.id || '',
        target_dropdown_id: '',
        link_url: first?.path || '/',
      }));
    } else {
      const first = allDropdownOptions[0];
      setBestsellerFormData((p) => ({
        ...p,
        link_type: 'dropdown',
        target_header_id: '',
        target_dropdown_id: first?.id || '',
        link_url: first?.path || '/',
      }));
    }
  };

  const handleOccasionLinkTypeChange = (type: 'header' | 'dropdown') => {
    setOccasionOpenDropdown(null);
    if (type === 'header') {
      const first = adminItems[0];
      setOccasionFormData((p) => ({
        ...p,
        link_type: 'header',
        target_header_id: first?.id || '',
        target_dropdown_id: '',
        link_url: first?.path || '/',
      }));
    } else {
      const first = allDropdownOptions[0];
      setOccasionFormData((p) => ({
        ...p,
        link_type: 'dropdown',
        target_header_id: '',
        target_dropdown_id: first?.id || '',
        link_url: first?.path || '/',
      }));
    }
  };

  const handleSubLinkTypeChange = (type: 'header' | 'dropdown') => {
    setSubOpenDropdown(null);
    if (type === 'header') {
      const first = adminItems[0];
      setSubFormData((p) => ({
        ...p,
        link_type: 'header',
        target_header_id: first?.id || '',
        target_dropdown_id: '',
        link_url: first?.path || '/',
      }));
    } else {
      const first = allDropdownOptions[0];
      setSubFormData((p) => ({
        ...p,
        link_type: 'dropdown',
        target_header_id: '',
        target_dropdown_id: first?.id || '',
        link_url: first?.path || '/',
      }));
    }
  };

  // Open modal for new banner
  const handleOpenAdd = () => {
    setIsEditing(false);
    setOpenDropdown(null);
    setHeaderSearch('');
    setSubitemSearch('');
    setFontSearch('');
    const firstHeader = adminItems[0];
    setFormData({
      ...emptyForm,
      link_type: 'header',
      target_header_id: firstHeader?.id || '',
      link_url: firstHeader?.path || '/',
      font_family: 'Inter',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing banner
  const handleOpenEdit = (b: HomeBannerItem) => {
    setIsEditing(true);
    setOpenDropdown(null);
    setHeaderSearch('');
    setSubitemSearch('');
    setFontSearch('');
    const effectiveLinkType: 'header' | 'dropdown' = b.link_type === 'dropdown' ? 'dropdown' : 'header';
    setFormData({
      id: b.id,
      title: b.title || '',
      subtitle: b.subtitle || '',
      button_text: b.button_text || 'SHOP NOW',
      media_type: b.media_type || 'image',
      media_url: b.media_url,
      link_url: b.link_url || '/',
      link_type: effectiveLinkType,
      target_header_id: b.target_header_id || '',
      target_dropdown_id: b.target_dropdown_id || '',
      show_overlay: b.show_overlay !== false,
      overlay_position: b.overlay_position || 'right',
      title_color: b.title_color || '#FFFFFF',
      subtitle_color: b.subtitle_color || '#F3F4F6',
      button_bg_color: b.button_bg_color || '#8B2500',
      button_text_color: b.button_text_color || '#FFFFFF',
      font_family: b.font_family || 'Inter',
      is_active: b.is_active !== false,
    });
    setIsModalOpen(true);
  };

  // Handle media file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadBannerMedia(file);
    setIsUploading(false);

    if (result) {
      setFormData((prev) => ({
        ...prev,
        media_url: result.url,
        media_type: result.mediaType,
      }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle destination link change (Header or Dropdown only)
  const handleLinkTypeChange = (type: 'header' | 'dropdown') => {
    if (type === 'header') {
      const selected = adminItems.find((h) => h.id === formData.target_header_id) || adminItems[0];
      setFormData((prev) => ({
        ...prev,
        link_type: 'header',
        target_header_id: selected?.id || '',
        target_dropdown_id: '',
        link_url: selected?.path || '/',
      }));
    } else {
      const selected =
        allDropdownOptions.find((d) => d.id === formData.target_dropdown_id) || allDropdownOptions[0];
      setFormData((prev) => ({
        ...prev,
        link_type: 'dropdown',
        target_dropdown_id: selected?.id || '',
        target_header_id: '',
        link_url: selected?.path || '/',
      }));
    }
  };

  const handleHeaderSelect = (headerId: string) => {
    const header = adminItems.find((h) => h.id === headerId);
    setFormData((prev) => ({
      ...prev,
      target_header_id: headerId,
      link_url: header?.path || '/',
    }));
  };

  const handleDropdownSelect = (dropdownId: string) => {
    const item = allDropdownOptions.find((d) => d.id === dropdownId);
    setFormData((prev) => ({
      ...prev,
      target_dropdown_id: dropdownId,
      link_url: item?.path || '/',
    }));
  };

  // Save Banner (Create or Update)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.media_url.trim()) {
      toast.error('Please upload an image or video for the banner');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeHeroSection) {
        const currentList =
          activeHeroSection.id !== 'hero_banner_1'
            ? (Array.isArray(activeHeroSection.items) ? (activeHeroSection.items as any[]) : [])
            : (Array.isArray(activeHeroSection.items) ? (activeHeroSection.items as any[]) : adminBanners);

        if (isEditing && formData.id) {
          const updated = currentList.map((item) =>
            item.id === formData.id ? { ...item, ...formData, updated_at: new Date().toISOString() } : item
          );
          await saveSingleSectionLayout(activeHeroSection.id, { items: updated });
        } else {
          const newId = `${activeHeroSection.id}_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const newItem: any = {
            id: newId,
            ...formData,
            order_index: (currentList.length || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const updated = [...currentList, newItem];
          await saveSingleSectionLayout(activeHeroSection.id, { items: updated });
        }
        setIsModalOpen(false);
        setFormData(emptyForm);
      } else {
        if (isEditing && formData.id) {
          await updateBanner(formData.id, formData);
        } else {
          await createBanner(formData);
        }
        setIsModalOpen(false);
        setFormData(emptyForm);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Banner with centered confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.bannerId) return;
    setIsDeleting(true);
    try {
      if (activeHeroSection) {
        const currentList =
          activeHeroSection.id !== 'hero_banner_1'
            ? (Array.isArray(activeHeroSection.items) ? (activeHeroSection.items as any[]) : [])
            : (Array.isArray(activeHeroSection.items) ? (activeHeroSection.items as any[]) : adminBanners);
        const updated = currentList.filter((b) => b.id !== deleteConfirm.bannerId);
        await saveSingleSectionLayout(activeHeroSection.id, { items: updated });
      } else {
        await deleteBanner(deleteConfirm.bannerId);
      }
      setDeleteConfirm({ isOpen: false, bannerId: '', bannerTitle: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Move banner Up or Down in order
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= effectiveHeroBanners.length) return;

    const reordered = [...effectiveHeroBanners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    if (activeHeroSection) {
      await saveSingleSectionLayout(activeHeroSection.id, { items: reordered });
    } else {
      await reorderBanners(reordered.map((b) => b.id));
    }
  };


  // Sub-banner Handlers
  const handleOpenAddSub = () => {
    setIsEditingSub(false);
    setSubOpenDropdown(null);
    setSubHeaderSearch('');
    setSubItemSearch('');
    const firstHeader = adminItems[0];
    setSubFormData({
      ...emptySubBannerForm,
      link_type: 'header',
      target_header_id: firstHeader?.id || '',
      link_url: firstHeader?.path || '/',
    });
    setIsSubModalOpen(true);
  };

  const handleOpenEditSub = (item: HomeSubBannerItem) => {
    setIsEditingSub(true);
    setSubOpenDropdown(null);
    setSubHeaderSearch('');
    setSubItemSearch('');
    const effectiveLinkType: 'header' | 'dropdown' = item.link_type === 'dropdown' ? 'dropdown' : 'header';
    let targetHeaderId = item.target_header_id || '';
    let linkUrl = item.link_url || '/';
    if (effectiveLinkType === 'header' && !targetHeaderId && adminItems.length > 0) {
      const match = adminItems.find((h) => h.path === linkUrl);
      targetHeaderId = match ? match.id : adminItems[0].id;
      if (!linkUrl || linkUrl === '/') {
        linkUrl = match ? match.path : adminItems[0].path;
      }
    }

    setSubFormData({
      id: item.id,
      title: item.title,
      image_url: item.image_url,
      link_url: linkUrl,
      link_type: effectiveLinkType,
      target_header_id: targetHeaderId,
      target_dropdown_id: item.target_dropdown_id || '',
      hover_bg_color: item.hover_bg_color || '#FFF7ED',
      is_active: item.is_active,
    });
    setIsSubModalOpen(true);
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.title.trim()) {
      toast.error('Please enter a title for the category item');
      return;
    }
    if (!subFormData.image_url.trim()) {
      toast.error('Please upload or provide an image/icon URL');
      return;
    }

    setIsSubmittingSub(true);
    try {
      if (activeSubSection) {
        const currentList =
          activeSubSection.id !== 'sub_banner_1'
            ? (Array.isArray(activeSubSection.items) ? (activeSubSection.items as any[]) : [])
            : (Array.isArray(activeSubSection.items) ? (activeSubSection.items as any[]) : adminSubBanners);

        if (isEditingSub && subFormData.id) {
          const updated = currentList.map((item) =>
            item.id === subFormData.id ? { ...item, ...subFormData, updated_at: new Date().toISOString() } : item
          );
          await saveSingleSectionLayout(activeSubSection.id, { items: updated });
        } else {
          const newId = `${activeSubSection.id}_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const newItem: any = {
            id: newId,
            ...subFormData,
            order_index: (currentList.length || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const updated = [...currentList, newItem];
          await saveSingleSectionLayout(activeSubSection.id, { items: updated });
        }
        setIsSubModalOpen(false);
        setSubFormData(emptySubBannerForm);
      } else {
        if (isEditingSub && subFormData.id) {
          await updateSubBanner(subFormData.id, subFormData);
        } else {
          await createSubBanner(subFormData);
        }
        setIsSubModalOpen(false);
        setSubFormData(emptySubBannerForm);
      }
    } finally {
      setIsSubmittingSub(false);
    }
  };

  const handleConfirmDeleteSub = async () => {
    if (!deleteSubConfirm.id) return;
    setIsDeletingSub(true);
    try {
      if (activeSubSection) {
        const currentList =
          activeSubSection.id !== 'sub_banner_1'
            ? (Array.isArray(activeSubSection.items) ? (activeSubSection.items as any[]) : [])
            : (Array.isArray(activeSubSection.items) ? (activeSubSection.items as any[]) : adminSubBanners);
        const updated = currentList.filter((b) => b.id !== deleteSubConfirm.id);
        await saveSingleSectionLayout(activeSubSection.id, { items: updated });
      } else {
        await deleteSubBanner(deleteSubConfirm.id);
      }
      setDeleteSubConfirm({ isOpen: false, id: '', title: '' });
    } finally {
      setIsDeletingSub(false);
    }
  };

  const handleMoveSubOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= effectiveSubBanners.length) return;

    const reordered = [...effectiveSubBanners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    if (activeSubSection) {
      await saveSingleSectionLayout(activeSubSection.id, { items: reordered });
    } else {
      await reorderSubBanners(reordered.map((b) => b.id));
    }
  };

  const handleUploadSubFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSub(true);
    const result = await uploadBannerMedia(file);
    setIsUploadingSub(false);
    if (result?.url) {
      setSubFormData((p) => ({ ...p, image_url: result.url }));
    }
    if (subFileInputRef.current) {
      subFileInputRef.current.value = '';
    }
  };

  // Occasions Section Handlers
  const handleOpenAddOccasion = () => {
    setIsEditingOccasion(false);
    setOccasionOpenDropdown(null);
    setOccasionHeaderSearch('');
    setOccasionSubItemSearch('');
    const firstHeader = adminItems[0];
    setOccasionFormData({
      ...emptyOccasionForm,
      link_type: 'header',
      target_header_id: firstHeader?.id || '',
      link_url: firstHeader?.path || '/',
    });
    setIsOccasionModalOpen(true);
  };

  const handleOpenEditOccasion = (item: HomeOccasionCard) => {
    setIsEditingOccasion(true);
    setOccasionOpenDropdown(null);
    setOccasionHeaderSearch('');
    setOccasionSubItemSearch('');
    const effectiveLinkType: 'header' | 'dropdown' = item.link_type === 'dropdown' ? 'dropdown' : 'header';
    let targetHeaderId = item.target_header_id || '';
    let linkUrl = item.link_url || '/';
    if (effectiveLinkType === 'header' && !targetHeaderId && adminItems.length > 0) {
      const match = adminItems.find((h) => h.path === linkUrl);
      targetHeaderId = match ? match.id : adminItems[0].id;
      if (!linkUrl || linkUrl === '/') {
        linkUrl = match ? match.path : adminItems[0].path;
      }
    }

    const rawScale = Number(item.image_scale);
    const scale = !isNaN(rawScale) && rawScale > 0 ? (rawScale > 10 ? rawScale / 100 : rawScale) : 1.0;

    setOccasionFormData({
      id: item.id,
      title: item.title,
      date_badge: item.date_badge || '',
      image_url: item.image_url || '',
      image_scale: scale,
      image_position: (item.image_position as any) || 'bottom-right',
      bg_color: item.bg_color || '#F9D3B4',
      link_type: effectiveLinkType,
      target_header_id: targetHeaderId,
      target_dropdown_id: item.target_dropdown_id || '',
      link_url: linkUrl,
      is_active: item.is_active,
    });
    setIsOccasionModalOpen(true);
  };

  const handleOccasionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasionFormData.title.trim()) {
      toast.error('Please enter a title for the occasion card');
      return;
    }

    setIsSubmittingOccasion(true);
    const payload = {
      ...occasionFormData,
      date_badge: occasionFormData.date_badge.trim() ? occasionFormData.date_badge.trim() : null,
      image_url: occasionFormData.image_url.trim() ? occasionFormData.image_url.trim() : null,
      image_scale: Number(occasionFormData.image_scale) || 1.0,
      image_position: occasionFormData.image_position || 'bottom-right',
    };

    try {
      if (activeOccasionSection) {
        const currentList =
          activeOccasionSection.id !== 'occasions_1'
            ? (Array.isArray(activeOccasionSection.items) ? (activeOccasionSection.items as any[]) : [])
            : (Array.isArray(activeOccasionSection.items) ? (activeOccasionSection.items as any[]) : adminOccasions);

        if (isEditingOccasion && occasionFormData.id) {
          const updated = currentList.map((item) =>
            item.id === occasionFormData.id ? { ...item, ...payload, updated_at: new Date().toISOString() } : item
          );
          await saveSingleSectionLayout(activeOccasionSection.id, { items: updated });
        } else {
          const newId = `${activeOccasionSection.id}_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const newItem: any = {
            id: newId,
            ...payload,
            order_index: (currentList.length || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const updated = [...currentList, newItem];
          await saveSingleSectionLayout(activeOccasionSection.id, { items: updated });
        }
        setIsOccasionModalOpen(false);
        setOccasionFormData(emptyOccasionForm);
      } else {
        if (isEditingOccasion && occasionFormData.id) {
          await updateOccasion(occasionFormData.id, payload);
        } else {
          await createOccasion(payload);
        }
        setIsOccasionModalOpen(false);
        setOccasionFormData(emptyOccasionForm);
      }
    } finally {
      setIsSubmittingOccasion(false);
    }
  };

  const handleConfirmDeleteOccasion = async () => {
    if (!deleteOccasionConfirm.id) return;
    setIsDeletingOccasion(true);
    try {
      if (activeOccasionSection) {
        const currentList =
          activeOccasionSection.id !== 'occasions_1'
            ? (Array.isArray(activeOccasionSection.items) ? (activeOccasionSection.items as any[]) : [])
            : (Array.isArray(activeOccasionSection.items) ? (activeOccasionSection.items as any[]) : adminOccasions);
        const updated = currentList.filter((b) => b.id !== deleteOccasionConfirm.id);
        await saveSingleSectionLayout(activeOccasionSection.id, { items: updated });
      } else {
        await deleteOccasion(deleteOccasionConfirm.id);
      }
      setDeleteOccasionConfirm({ isOpen: false, id: '', title: '' });
    } finally {
      setIsDeletingOccasion(false);
    }
  };

  const handleMoveOccasionOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= effectiveOccasions.length) return;

    const reordered = [...effectiveOccasions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    if (activeOccasionSection) {
      await saveSingleSectionLayout(activeOccasionSection.id, { items: reordered });
    } else {
      await reorderOccasions(reordered.map((b) => b.id));
    }
  };

  const handleUploadOccasionFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingOccasion(true);
    const result = await uploadBannerMedia(file);
    setIsUploadingOccasion(false);
    if (result?.url) {
      setOccasionFormData((p) => ({ ...p, image_url: result.url }));
    }
    if (occasionFileInputRef.current) {
      occasionFileInputRef.current.value = '';
    }
  };

  const handleSaveSectionTitle = async () => {
    if (!sectionTitleInput.trim()) {
      toast.error('Please enter a section title');
      return;
    }
    setIsSavingTitle(true);
    try {
      if (activeOccasionSection) {
        await saveSingleSectionLayout(activeOccasionSection.id, {
          section_title: sectionTitleInput.trim(),
          custom_label: sectionTitleInput.trim(),
          settings: {
            ...(activeOccasionSection.settings || {}),
            section_title: sectionTitleInput.trim(),
          },
        });
        if (occasionSections.length === 1 && activeOccasionSection.id === 'occasions_1') {
          await updateOccasionSettings({ section_title: sectionTitleInput.trim() });
        }
      } else {
        await updateOccasionSettings({ section_title: sectionTitleInput.trim() });
      }
    } finally {
      setIsSavingTitle(false);
    }
  };

  // Bestsellers Section Handlers
  const handleOpenAddBestseller = () => {
    setIsEditingBestseller(false);
    setBestsellerOpenDropdown(null);
    setBestsellerHeaderSearch('');
    setBestsellerSubItemSearch('');
    const firstHeader = adminItems[0];
    setBestsellerFormData({
      ...emptyBestsellerForm,
      link_type: 'header',
      target_header_id: firstHeader?.id || '',
      link_url: firstHeader?.path || '/',
    });
    setIsBestsellerModalOpen(true);
  };

  const handleOpenEditBestseller = (item: HomeBestsellerItem) => {
    setIsEditingBestseller(true);
    setBestsellerOpenDropdown(null);
    setBestsellerHeaderSearch('');
    setBestsellerSubItemSearch('');
    const effectiveLinkType: 'header' | 'dropdown' = item.link_type === 'dropdown' ? 'dropdown' : 'header';
    let targetHeaderId = item.target_header_id || '';
    let linkUrl = item.link_url || '/';
    if (effectiveLinkType === 'header' && !targetHeaderId && adminItems.length > 0) {
      const match = adminItems.find((h) => h.path === linkUrl);
      targetHeaderId = match ? match.id : adminItems[0].id;
      if (!linkUrl || linkUrl === '/') {
        linkUrl = match ? match.path : adminItems[0].path;
      }
    }

    const itemImages = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image_url ? [item.image_url] : []);

    setBestsellerFormData({
      id: item.id,
      product_id: item.product_id || '',
      source_mode: item.source_mode || (item.product_id ? 'catalog' : 'custom'),
      title: item.title,
      subtitle: item.subtitle || '',
      price: formatBestsellerPrice(item.price || 'Rs. 1299'),
      original_price: item.original_price ? formatBestsellerPrice(item.original_price) : '',
      discount_badge: item.discount_badge || '',
      badge_text: item.badge_text || 'BESTSELLER',
      badge_style: item.badge_style || 'discount',
      rating: item.rating !== undefined && item.rating !== null ? item.rating : 4.9,
      reviews_count: item.reviews_count !== undefined && item.reviews_count !== null ? item.reviews_count : 95,
      image_url: item.image_url || '',
      images: itemImages,
      link_type: effectiveLinkType,
      target_header_id: targetHeaderId,
      target_dropdown_id: item.target_dropdown_id || '',
      link_url: linkUrl,
      is_active: item.is_active,
    });
    setIsBestsellerModalOpen(true);
  };

  const handleBestsellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bestsellerFormData.title.trim()) {
      toast.error('Please enter a title for the bestseller card');
      return;
    }
    if (!bestsellerFormData.price.trim()) {
      toast.error('Please enter a selling price');
      return;
    }

    setIsSubmittingBestseller(true);
    const payload = {
      ...bestsellerFormData,
      product_id: bestsellerFormData.product_id || null,
      source_mode: bestsellerFormData.source_mode || 'catalog',
      price: formatBestsellerPrice(bestsellerFormData.price.trim()),
      subtitle: bestsellerFormData.subtitle.trim() ? bestsellerFormData.subtitle.trim() : null,
      original_price: bestsellerFormData.original_price.trim() ? formatBestsellerPrice(bestsellerFormData.original_price.trim()) : null,
      discount_badge: bestsellerFormData.discount_badge.trim() ? bestsellerFormData.discount_badge.trim() : null,
      badge_text: bestsellerFormData.badge_text ? bestsellerFormData.badge_text.trim() : 'BESTSELLER',
      badge_style: bestsellerFormData.badge_style || 'discount',
      rating: bestsellerFormData.rating !== undefined && bestsellerFormData.rating !== '' ? Number(bestsellerFormData.rating) : 4.9,
      reviews_count: bestsellerFormData.reviews_count !== undefined && bestsellerFormData.reviews_count !== '' ? Number(bestsellerFormData.reviews_count) : 95,
      image_url: bestsellerFormData.image_url.trim() ? bestsellerFormData.image_url.trim() : null,
      images: Array.isArray(bestsellerFormData.images) && bestsellerFormData.images.length > 0 ? bestsellerFormData.images : undefined,
    };

    try {
      if (activeBestsellerSection) {
        const rawList =
          activeBestsellerSection.id !== 'bestsellers_1'
            ? (Array.isArray(activeBestsellerSection.items) ? (activeBestsellerSection.items as any[]) : [])
            : (Array.isArray(activeBestsellerSection.items) ? (activeBestsellerSection.items as any[]) : adminBestsellers);
        const currentList = rawList.filter((b) => !isFlowerDummy(b));

        if (isEditingBestseller && bestsellerFormData.id) {
          const updated = currentList.map((item) =>
            item.id === bestsellerFormData.id ? { ...item, ...payload, updated_at: new Date().toISOString() } : item
          );
          await saveSingleSectionLayout(activeBestsellerSection.id, { items: updated });
        } else {
          const newId = `${activeBestsellerSection.id}_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const newItem: any = {
            id: newId,
            ...payload,
            order_index: (currentList.length || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const updated = [...currentList, newItem];
          await saveSingleSectionLayout(activeBestsellerSection.id, { items: updated });
        }
        setIsBestsellerModalOpen(false);
        setBestsellerFormData(emptyBestsellerForm);
      } else {
        if (isEditingBestseller && bestsellerFormData.id) {
          await updateBestseller(bestsellerFormData.id, payload);
        } else {
          await createBestseller(payload);
        }
        setIsBestsellerModalOpen(false);
        setBestsellerFormData(emptyBestsellerForm);
      }
    } finally {
      setIsSubmittingBestseller(false);
    }
  };

  const handleConfirmDeleteBestseller = async () => {
    if (!deleteBestsellerConfirm.id) return;
    setIsDeletingBestseller(true);
    try {
      if (activeBestsellerSection) {
        const rawList =
          activeBestsellerSection.id !== 'bestsellers_1'
            ? (Array.isArray(activeBestsellerSection.items) ? (activeBestsellerSection.items as any[]) : [])
            : (Array.isArray(activeBestsellerSection.items) ? (activeBestsellerSection.items as any[]) : adminBestsellers);
        const currentList = rawList.filter((b) => !isFlowerDummy(b));
        const updated = currentList.filter((b) => b.id !== deleteBestsellerConfirm.id);
        await saveSingleSectionLayout(activeBestsellerSection.id, { items: updated });
      } else {
        await deleteBestseller(deleteBestsellerConfirm.id);
      }
      setDeleteBestsellerConfirm({ isOpen: false, id: '', title: '' });
    } finally {
      setIsDeletingBestseller(false);
    }
  };

  const handleMoveBestsellerOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= effectiveBestsellers.length) return;

    const reordered = [...effectiveBestsellers];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    if (activeBestsellerSection) {
      await saveSingleSectionLayout(activeBestsellerSection.id, { items: reordered });
    } else {
      await reorderBestsellers(reordered.map((b) => b.id));
    }
  };

  const handleUploadBestsellerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBestseller(true);
    const result = await uploadBannerMedia(file);
    setIsUploadingBestseller(false);
    if (result?.url) {
      setBestsellerFormData((p) => {
        const currentImgs = Array.isArray(p.images) ? p.images : [];
        const nextImgs = [result.url, ...currentImgs.filter((u) => u !== result.url)];
        return { ...p, image_url: result.url, images: nextImgs };
      });
    }
    if (bestsellerFileInputRef.current) {
      bestsellerFileInputRef.current.value = '';
    }
  };

  const getPreviewThemeClasses = (theme: string) => {
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

  const getPreviewCardStyle = (mode: string, color: string, transparency: number): React.CSSProperties => {
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
      const baseColor = color || '#FFFFFF';
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

    if (transparency > 0) {
      return {
        backgroundColor: `rgba(255, 255, 255, ${opacityFraction})`,
        backdropFilter: transparency > 20 ? 'blur(8px)' : undefined,
      };
    }

    return { backgroundColor: '#FFFFFF' };
  };

  const handleSaveBestsellerSettings = async () => {
    if (!bestsellerTitleInput.trim()) {
      toast.error('Please enter a section title');
      return;
    }
    setIsSavingBestsellerSettings(true);
    try {
      if (activeBestsellerSection) {
        await saveSingleSectionLayout(activeBestsellerSection.id, {
          section_title: bestsellerTitleInput.trim(),
          section_subtitle: bestsellerSubtitleInput.trim(),
          custom_label: bestsellerTitleInput.trim() || activeBestsellerSection.custom_label,
          card_theme: cardThemeInput,
          cards_per_row: cardsPerRowInput,
          section_bg_mode: sectionBgModeInput,
          section_bg_color: sectionBgColorInput,
          view_all_text: viewAllTextInput.trim(),
          view_all_url: viewAllUrlInput.trim(),
          view_all_link_type: viewAllLinkTypeInput,
          view_all_target_header_id: viewAllTargetHeaderId || null,
          view_all_target_dropdown_id: viewAllTargetDropdownId || null,
          show_view_all: showViewAllInput,
          settings: {
            ...(activeBestsellerSection.settings || {}),
            section_title: bestsellerTitleInput.trim(),
            section_subtitle: bestsellerSubtitleInput.trim(),
            view_all_text: viewAllTextInput.trim(),
            view_all_url: viewAllUrlInput.trim(),
            view_all_link_type: viewAllLinkTypeInput,
            view_all_target_header_id: viewAllTargetHeaderId || null,
            view_all_target_dropdown_id: viewAllTargetDropdownId || null,
            show_view_all: showViewAllInput,
            section_bg_mode: sectionBgModeInput,
            section_bg_color: sectionBgColorInput,
            card_theme: cardThemeInput,
            card_bg_mode: cardBgModeInput,
            card_bg_color: cardBgColorInput,
            card_transparency: cardTransparencyInput,
            cards_per_row: cardsPerRowInput,
          },
        });
        if (bestsellerSections.length === 1 && activeBestsellerSection.id === 'bestsellers_1') {
          await updateBestsellerSettings({
            section_title: bestsellerTitleInput.trim(),
            section_subtitle: bestsellerSubtitleInput.trim(),
            view_all_text: viewAllTextInput.trim(),
            view_all_url: viewAllUrlInput.trim(),
            view_all_link_type: viewAllLinkTypeInput,
            view_all_target_header_id: viewAllTargetHeaderId || null,
            view_all_target_dropdown_id: viewAllTargetDropdownId || null,
            show_view_all: showViewAllInput,
            section_bg_mode: sectionBgModeInput,
            section_bg_color: sectionBgColorInput,
            card_theme: cardThemeInput,
            card_bg_mode: cardBgModeInput,
            card_bg_color: cardBgColorInput,
            card_transparency: cardTransparencyInput,
            cards_per_row: cardsPerRowInput,
          });
        }
      } else {
        await updateBestsellerSettings({
          section_title: bestsellerTitleInput.trim(),
          section_subtitle: bestsellerSubtitleInput.trim(),
          view_all_text: viewAllTextInput.trim(),
          view_all_url: viewAllUrlInput.trim(),
          view_all_link_type: viewAllLinkTypeInput,
          view_all_target_header_id: viewAllTargetHeaderId || null,
          view_all_target_dropdown_id: viewAllTargetDropdownId || null,
          show_view_all: showViewAllInput,
          section_bg_mode: sectionBgModeInput,
          section_bg_color: sectionBgColorInput,
          card_theme: cardThemeInput,
          card_bg_mode: cardBgModeInput,
          card_bg_color: cardBgColorInput,
          card_transparency: cardTransparencyInput,
          cards_per_row: cardsPerRowInput,
        });
      }
    } finally {
      setIsSavingBestsellerSettings(false);
    }
  };

  const handlePromoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPromo(true);
      const res = await uploadBannerMedia(file);
      if (res?.url) {
        setPromoFormData((prev) => ({ ...prev, image_url: res.url }));
        toast.success('Promo banner image uploaded!');
      }
    } catch (err: any) {
      toast.error('Image upload failed');
    } finally {
      setIsUploadingPromo(false);
      if (promoFileInputRef.current) promoFileInputRef.current.value = '';
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoFormData.image_url) {
      toast.error('Please upload or provide a banner image URL');
      return;
    }
    setIsSubmittingPromo(true);
    try {
      if (activePromoSection) {
        const currentList =
          activePromoSection.id !== 'promo_banner_1'
            ? (Array.isArray(activePromoSection.items) ? (activePromoSection.items as any[]) : [])
            : (Array.isArray(activePromoSection.items) ? (activePromoSection.items as any[]) : adminPromoBanners);

        if (isEditingPromo && editingPromoId) {
          const updated = currentList.map((item) =>
            item.id === editingPromoId ? { ...item, ...promoFormData, updated_at: new Date().toISOString() } : item
          );
          await saveSingleSectionLayout(activePromoSection.id, { items: updated });
        } else {
          const newId = `${activePromoSection.id}_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const newItem: any = {
            id: newId,
            ...promoFormData,
            order_index: (currentList.length || 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const updated = [...currentList, newItem];
          await saveSingleSectionLayout(activePromoSection.id, { items: updated });
        }
        setIsPromoModalOpen(false);
        setIsEditingPromo(false);
        setEditingPromoId(null);
        setPromoFormData(emptyPromoBannerForm);
      } else {
        if (isEditingPromo && editingPromoId) {
          const success = await updatePromoBanner(editingPromoId, promoFormData);
          if (success) {
            setIsPromoModalOpen(false);
            setIsEditingPromo(false);
            setEditingPromoId(null);
            setPromoFormData(emptyPromoBannerForm);
          }
        } else {
          const success = await createPromoBanner(promoFormData);
          if (success) {
            setIsPromoModalOpen(false);
            setPromoFormData(emptyPromoBannerForm);
          }
        }
      }
    } finally {
      setIsSubmittingPromo(false);
    }
  };

  const handleConfirmDeletePromo = async () => {
    if (!deletePromoConfirm.id) return;
    setIsDeletingPromo(true);
    try {
      if (activePromoSection) {
        const currentList =
          activePromoSection.id !== 'promo_banner_1'
            ? (Array.isArray(activePromoSection.items) ? (activePromoSection.items as any[]) : [])
            : (Array.isArray(activePromoSection.items) ? (activePromoSection.items as any[]) : adminPromoBanners);
        const updated = currentList.filter((b) => b.id !== deletePromoConfirm.id);
        await saveSingleSectionLayout(activePromoSection.id, { items: updated });
      } else {
        await deletePromoBanner(deletePromoConfirm.id);
      }
      setDeletePromoConfirm({ isOpen: false, id: '', title: '' });
    } finally {
      setIsDeletingPromo(false);
    }
  };

  const handleSavePromoSettings = async () => {
    setIsSavingPromoSettings(true);
    try {
      if (activePromoSection) {
        await saveSingleSectionLayout(activePromoSection.id, {
          banner_height: promoBannerHeight,
          border_radius: promoBorderRadius,
          settings: {
            ...(activePromoSection.settings || {}),
            is_enabled: promoIsEnabled,
            autoplay: promoAutoplay,
            autoplay_interval: Number(promoAutoplayInterval),
            banner_height: promoBannerHeight,
            show_dots: promoShowDots,
            border_radius: promoBorderRadius,
          },
        });
        if (promoSections.length === 1 && activePromoSection.id === 'promo_banner_1') {
          await updatePromoBannerSettings({
            is_enabled: promoIsEnabled,
            autoplay: promoAutoplay,
            autoplay_interval: Number(promoAutoplayInterval),
            banner_height: promoBannerHeight,
            show_dots: promoShowDots,
            border_radius: promoBorderRadius,
          });
        }
      } else {
        await updatePromoBannerSettings({
          is_enabled: promoIsEnabled,
          autoplay: promoAutoplay,
          autoplay_interval: Number(promoAutoplayInterval),
          banner_height: promoBannerHeight,
          show_dots: promoShowDots,
          border_radius: promoBorderRadius,
        });
      }
    } finally {
      setIsSavingPromoSettings(false);
    }
  };

  const handlePromoMoveUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...effectivePromoBanners];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    if (activePromoSection) {
      await saveSingleSectionLayout(activePromoSection.id, { items: reordered });
    } else {
      await reorderPromoBanners(reordered.map((b) => b.id));
    }
  };

  const handlePromoMoveDown = async (index: number) => {
    if (index >= effectivePromoBanners.length - 1) return;
    const reordered = [...effectivePromoBanners];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    if (activePromoSection) {
      await saveSingleSectionLayout(activePromoSection.id, { items: reordered });
    } else {
      await reorderPromoBanners(reordered.map((b) => b.id));
    }
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16 font-sans">
      {/* Primary Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/90 rounded-2xl w-fit border border-gray-200/60 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'layout'
              ? 'bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span>Page Sections & Spacing</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
            {adminSectionsLayout?.length ?? 6} Sections
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Hero Banners & Themes</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF7ED] text-[#D26900]">
            {adminBanners.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sub-banners')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'sub-banners'
              ? 'bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Quick Categories (Sub-Banner)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              subBannerSettings.is_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {subBannerSettings.is_enabled ? `${adminSubBanners.filter((s) => s.is_active).length} Active` : 'Disabled'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('occasions')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'occasions'
              ? 'bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span>Occasion Gifts (Section)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              occasionsSettings.is_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {occasionsSettings.is_enabled ? `${adminOccasions.filter((o) => o.is_active).length} Active` : 'Disabled'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bestsellers')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'bestsellers'
              ? 'bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>Shop By Bestsellers</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              bestsellerSettings.is_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {bestsellerSettings.is_enabled ? `${adminBestsellers.filter((b) => b.is_active).length} Active` : 'Disabled'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promo-banner')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'promo-banner'
              ? 'bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>Special Promo Strip</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              promoBannerSettings.is_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {promoBannerSettings.is_enabled ? `${adminPromoBanners.filter((p) => p.is_active).length} Active` : 'Disabled'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom-cards')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'custom-cards'
              ? 'bg-white text-gray-900 shadow-sm shadow-black/5 ring-1 ring-black/5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span>Showcase Cards (Classic & Modern)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              customCardsSettings?.is_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {customCardsSettings?.is_enabled ? `${adminCustomCards.filter((c) => c.is_active).length} Active` : 'Disabled'}
          </span>
        </button>
      </div>

      {activeTab !== 'layout' && editingSectionId && (() => {
        const currentSec = (adminSectionsLayout || []).find((s) => s.id === editingSectionId);
        const secIdx = (adminSectionsLayout || []).findIndex((s) => s.id === editingSectionId);
        if (!currentSec) return null;
        return (
          <div className="bg-gradient-to-r from-amber-500 via-[#D26900] to-orange-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                🎯
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                    Editing Section #{secIdx + 1}
                  </span>
                  <span className="text-[10px] font-mono bg-black/20 px-2 py-0.5 rounded-md">
                    ID: {currentSec.id}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black mt-0.5">
                  {currentSec.custom_label || 'Section Content'}
                </h3>
                <p className="text-[11px] text-white/90">
                  Aap is specific section ke items customize kar rahe hain. Is section ki spacing aur position "Page Sections & Spacing" tab me control hoti hai.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('layout');
              }}
              className="px-4 py-2 bg-white text-[#D26900] hover:bg-amber-50 active:scale-95 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Sections Layout</span>
            </button>
          </div>
        );
      })()}

      {activeTab === 'layout' ? (
        <AdminSectionsLayoutTab
          onSwitchTab={(tab, targetSectionId) => {
            setActiveTab(tab);
            if (targetSectionId) {
              setEditingSectionId(targetSectionId);
              if (tab === 'banners') {
                setActiveHeroSectionId(targetSectionId);
                setThemeTargetHeroId(targetSectionId);
              } else if (tab === 'sub-banners') {
                setActiveSubSectionId(targetSectionId);
              } else if (tab === 'occasions') {
                setActiveOccasionSectionId(targetSectionId);
              } else if (tab === 'bestsellers') {
                setActiveBestsellerSectionId(targetSectionId);
              } else if (tab === 'promo-banner') {
                setActivePromoSectionId(targetSectionId);
              }
            } else {
              setEditingSectionId(null);
            }
          }}
        />
      ) : activeTab === 'banners' ? (
        <div className="space-y-7 animate-in fade-in duration-200">
          <AdminSectionInstanceSelector
            sectionType="hero_banner"
            typeTitle="Hero Banner"
            defaultLabel="Hero Banner"
            icon="🖼️"
            sections={heroSections}
            activeSection={activeHeroSection}
            onSelectSection={(id) => {
              setActiveHeroSectionId(id);
              setThemeTargetHeroId(id);
            }}
            onAddSection={async () => {
              const newId = await addSection('hero_banner', `Hero Banner #${heroSections.length + 1}`, []);
              if (newId) {
                setActiveHeroSectionId(newId);
                setThemeTargetHeroId(newId);
              }
            }}
            onDuplicateSection={async (id) => {
              const dupId = await duplicateSection(id);
              if (dupId) {
                setActiveHeroSectionId(dupId);
                setThemeTargetHeroId(dupId);
              }
            }}
            onDeleteSection={async (id) => {
              if (heroSections.length <= 1) {
                toast.error('At least one Hero Banner section must remain.');
                return;
              }
              const success = await deleteSection(id);
              if (success) {
                const remaining = heroSections.filter((s) => s.id !== id);
                if (remaining[0]) {
                  setActiveHeroSectionId(remaining[0].id);
                  setThemeTargetHeroId(remaining[0].id);
                }
              }
            }}
            onJumpToLayout={() => setActiveTab('layout')}
          />

          {/* Top Page Header */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Home Hero Banners {activeHeroSection?.custom_label ? `(${activeHeroSection.custom_label})` : ''}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
                  {effectiveHeroBanners.filter((b) => b.is_active).length} Active / {effectiveHeroBanners.length} Total
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Manage the full-width rotating hero slider appearing right below the header on the customer home page.
                Supports high-resolution images, videos, and direct page redirects.
              </p>
            </div>

            {/* CTA Button matching website theme */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Banner</span>
            </button>
          </div>

      {/* 🎨 Banner Themes & Layout Styles Selector */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-50 text-[#D26900]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </span>
              <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                Banner Layouts & Themes
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">
              Select your customer-facing home banner layout style. The active theme is saved in the database and applies across all devices.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Current Theme:</span>
            <span className="px-3 py-1 rounded-full font-extrabold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA] shadow-2xs">
              {availableThemes.find((t) => t.id === activeTheme)?.name || 'Side-Peek Showcase'}
            </span>
          </div>
        </div>

        {/* Multi-Hero Section Target Switcher */}
        {heroSectionsInLayout.length > 1 && (
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-gray-900 block">
                  Select Hero Section to Apply Theme:
                </span>
                <span className="text-[11px] text-gray-600">
                  Multiple Hero Banners page par hain. Har hero banner ka alag theme set kar sakte hain!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setThemeTargetHeroId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  themeTargetHeroId === 'all'
                    ? 'bg-[#D26900] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Hero Banners (Global)
              </button>
              {heroSectionsInLayout.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setThemeTargetHeroId(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    themeTargetHeroId === sec.id
                      ? 'bg-[#D26900] text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  #{idx + 1} {sec.custom_label || 'Hero Banner'} {sec.theme ? `(${sec.theme})` : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5 Theme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {availableThemes.map((theme) => {
            const targetSection = heroSectionsInLayout.find((s) => s.id === themeTargetHeroId);
            const currentTargetTheme =
              themeTargetHeroId !== 'all' && targetSection
                ? targetSection.theme || activeTheme
                : activeTheme;
            const isActive = currentTargetTheme === theme.id;
            const isPreviewing = previewTheme === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => setPreviewTheme(theme.id)}
                className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-[#D26900] bg-orange-50/20 shadow-md ring-2 ring-[#D26900]/20'
                    : isPreviewing
                    ? 'border-amber-400 bg-amber-50/15 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-neutral-100 text-gray-700 border border-gray-200">
                      {theme.badge}
                    </span>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active on Site
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900">{theme.name}</h3>
                  <p className="text-xs text-[#D26900] font-semibold mt-0.5">{theme.tagline}</p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTheme(theme.id);
                    }}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isPreviewing
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {isPreviewing ? '👁️ Viewing Preview' : '👁️ Preview Below'}
                  </button>

                  {isActive ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isApplyingTheme}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsApplyingTheme(true);
                        setPreviewTheme(null);
                        if (themeTargetHeroId !== 'all') {
                          const updated = (adminSectionsLayout || []).map((s) =>
                            s.id === themeTargetHeroId ? { ...s, theme: theme.id } : s
                          );
                          await updateSectionsLayout(updated);
                          toast.success(`Theme "${theme.name}" applied specifically to selected Hero section!`);
                        } else {
                          await setActiveTheme(theme.id);
                        }
                        setIsApplyingTheme(false);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Apply Theme
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Live Preview Slider (Customer Experience Simulation) */}
      {effectiveHeroBanners.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Live Customer Screen Preview
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-md font-bold bg-orange-50 text-[#D26900] border border-orange-200">
                Layout: {availableThemes.find((t) => t.id === effectiveTheme)?.name || effectiveTheme}
                {previewTheme && previewTheme !== activeTheme && ' (Previewing)'}
              </span>
            </div>

            {previewTheme && previewTheme !== activeTheme && (
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="text-xs text-gray-500 hover:text-gray-900 underline font-medium cursor-pointer"
              >
                Reset preview to active theme
              </button>
            )}
          </div>

          {/* Live Preview Display using HomeBanner Component with effective theme */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-neutral-950">
            <HomeBanner customItems={effectiveHeroBanners} forcedTheme={effectiveTheme} isDashboardPreview={true} />
          </div>
        </div>
      )}

      {/* Banners List Section (Clean card rows without slide toggle buttons) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Banner Indicating Which Hero Section Instance is being edited */}
        {activeHeroSection && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/60 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                Currently Editing Section:
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#D26900] text-white shadow-2xs">
                {activeHeroSection.custom_label || 'Hero Banner'} (Instance #{heroSections.findIndex((s) => s.id === activeHeroSection.id) + 1})
              </span>
              <span className="text-[11px] font-mono text-gray-500 bg-white/80 px-2 py-0.5 rounded border border-amber-100">
                ID: {activeHeroSection.id}
              </span>
            </div>
            {heroSections.length > 1 && (
              <span className="text-[11px] font-medium text-amber-800">
                🔒 All slides and edits here are 100% isolated to this section instance only.
              </span>
            )}
          </div>
        )}

        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Configured Banner Slides</h2>
            <p className="text-xs text-gray-500">
              Sequence order determines the slide order on the home page.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAdminBanners}
            className="text-xs font-semibold text-[#D26900] hover:underline cursor-pointer"
          >
            Refresh List
          </button>
        </div>

        {adminLoading && effectiveHeroBanners.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Loading home hero banners...</p>
          </div>
        ) : effectiveHeroBanners.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-[#D26900] flex items-center justify-center mx-auto mb-3 text-2xl font-bold shadow-2xs">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-800">No Banners Added Yet</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Add your first full-width promotional banner to engage visitors as soon as they land on the home page.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold rounded-xl shadow-sm hover:from-[#B45309] hover:to-[#D26900]"
            >
              + Create First Banner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {effectiveHeroBanners.map((b, idx) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-orange-50/20"
              >
                {/* Left: Reorder controls + Thumbnail + Details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, 'up')}
                      className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move slide up"
                    >
                      ▲
                    </button>
                    <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 rounded px-1.5 py-0.5">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === effectiveHeroBanners.length - 1}
                      onClick={() => handleMoveOrder(idx, 'down')}
                      className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move slide down"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-gray-200">
                    {b.media_type === 'video' ? (
                      <video src={b.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={b.media_url} alt={b.title} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-black/70 text-white backdrop-blur-2xs">
                      {b.media_type}
                    </span>
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {b.title || 'Untitled Banner'}
                      </h3>
                      {!b.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                          Draft
                        </span>
                      )}
                    </div>

                    {b.subtitle && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{b.subtitle}</p>
                    )}

                    {/* Target link pill */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/80 text-[11px] font-semibold text-[#D26900]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <span className="capitalize">{b.link_type}:</span>
                        <span className="font-mono text-gray-800">{b.link_url}</span>
                      </span>

                      {b.show_overlay && b.button_text && (
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-[11px] font-semibold text-gray-700">
                          Button: &quot;{b.button_text}&quot;
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Only Edit and Delete buttons, toggle button removed as requested) */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 text-gray-500 hover:text-[#D26900] hover:bg-orange-50 rounded-xl transition cursor-pointer"
                    title="Edit Banner"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm({
                        isOpen: true,
                        bannerId: b.id,
                        bannerTitle: b.title || 'Untitled Banner',
                      })
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Delete Banner"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      ) : activeTab === 'sub-banners' ? (
        <div className="space-y-7 animate-in fade-in duration-200">
          <AdminSectionInstanceSelector
            sectionType="sub_banner"
            typeTitle="Category Strip (Sub-Banner)"
            defaultLabel="Category Strip"
            icon="🏷️"
            sections={subSections}
            activeSection={activeSubSection}
            onSelectSection={(id) => setActiveSubSectionId(id)}
            onAddSection={async () => {
              const newId = await addSection('sub_banner', `Category Strip #${subSections.length + 1}`, []);
              if (newId) setActiveSubSectionId(newId);
            }}
            onDuplicateSection={async (id) => {
              const dupId = await duplicateSection(id);
              if (dupId) setActiveSubSectionId(dupId);
            }}
            onDeleteSection={async (id) => {
              if (subSections.length <= 1) {
                toast.error('At least one Category Strip section must remain.');
                return;
              }
              const success = await deleteSection(id);
              if (success) {
                const remaining = subSections.filter((s) => s.id !== id);
                if (remaining[0]) setActiveSubSectionId(remaining[0].id);
              }
            }}
            onJumpToLayout={() => setActiveTab('layout')}
          />

          {/* Sub-Banner Header & Master Switch Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Quick Categories (Sub-Banner Strip) {activeSubSection?.custom_label ? `(${activeSubSection.custom_label})` : ''}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    subBannerSettings.is_enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {subBannerSettings.is_enabled ? 'Active on Home Page' : 'Hidden on Home Page'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Configure the circular category icons strip displayed directly below the home hero banner.
                Supports custom redirection links, hover animation with custom background disc colors, and sequence ordering.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Master Toggle Button (Active / Inactive) */}
              {/* Modern Animated Toggle Switch for Sub-Banner Strip */}
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  {subBannerSettings.is_enabled ? 'Strip Enabled' : 'Strip Disabled'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={subBannerSettings.is_enabled}
                  onClick={() => updateSubBannerSettings({ is_enabled: !subBannerSettings.is_enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    subBannerSettings.is_enabled ? 'bg-[#D26900]' : 'bg-gray-300'
                  }`}
                  title={subBannerSettings.is_enabled ? 'Click to Disable Sub-Banner Strip' : 'Click to Enable Sub-Banner Strip'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      subBannerSettings.is_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Add New Category Button */}
              <button
                type="button"
                onClick={handleOpenAddSub}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Category Item</span>
              </button>
            </div>
          </div>

          {/* Live Customer Screen Preview with Interactive Hover Test */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-50 text-[#D26900]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  Live Customer Screen Preview
                </h3>
              </div>
              <span className="text-xs text-[#D26900] font-bold bg-[#FFF7ED] px-3 py-1 rounded-full border border-[#FED7AA]">
                Hover over icons below to test circular disc animation
              </span>
            </div>

            {!subBannerSettings.is_enabled && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>The sub-banner strip is currently set to <strong>Hidden</strong> in master settings. It will not show on the live home page until enabled.</span>
              </div>
            )}

            {/* Rendered Live Component */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white/20 backdrop-blur-md shadow-inner">
              <HomeSubBanner customItems={effectiveSubBanners} />
            </div>
          </div>

          {/* Configured Category Items List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Configured Category Items ({effectiveSubBanners.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Items are displayed in sequence left-to-right. Use up/down arrows to reorder.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAdminSubBanners}
                className="text-xs font-semibold text-[#D26900] hover:underline cursor-pointer"
              >
                Refresh List
              </button>
            </div>

            {subBannerLoading && effectiveSubBanners.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#D26900] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-500 font-medium">Loading category items...</p>
              </div>
            ) : effectiveSubBanners.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-[#D26900] flex items-center justify-center mx-auto mb-3 text-2xl font-bold shadow-2xs">
                  ✨
                </div>
                <h4 className="text-sm font-bold text-gray-800">No Category Items Yet</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Click the button below to add your first quick category item.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddSub}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 cursor-pointer"
                >
                  Add First Category
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {effectiveSubBanners.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition"
                  >
                    {/* Left: Reorder & Thumbnail & Info */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Sequence Reorder Controls */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSubOrder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                          title="Move Left/Earlier"
                        >
                          ▲
                        </button>
                        <span className="text-[11px] font-mono font-bold text-gray-400">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveSubOrder(idx, 'down')}
                          disabled={idx === effectiveSubBanners.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                          title="Move Right/Later"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Icon Preview with Hover Background Disc Effect */}
                      <div
                        className="relative w-14 h-14 rounded-full flex items-center justify-center shrink-0 border border-gray-200 transition-all duration-300 group cursor-pointer"
                        style={{
                          backgroundColor: item.hover_bg_color || '#FFF7ED',
                        }}
                        title={`Hover background: ${item.hover_bg_color}`}
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-8 h-8 object-contain drop-shadow-xs"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {item.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
                          {/* Link destination */}
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                            🔗 {item.link_url}
                          </span>

                          {/* Hover color swatch */}
                          <span className="inline-flex items-center gap-1.5 text-[11px] bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                            <span
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.hover_bg_color || '#FFF7ED' }}
                            />
                            <span>Hover Disc: {item.hover_bg_color || '#FFF7ED'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditSub(item)}
                        className="p-2 text-gray-500 hover:text-[#D26900] hover:bg-orange-50 rounded-xl transition cursor-pointer"
                        title="Edit Item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteSubConfirm({
                            isOpen: true,
                            id: item.id,
                            title: item.title,
                          })
                        }
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Delete Item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'occasions' ? (
        <div className="space-y-7 animate-in fade-in duration-200">
          <AdminSectionInstanceSelector
            sectionType="occasions"
            typeTitle="Occasions Gifts"
            defaultLabel="Occasion Gifts"
            icon="🎁"
            sections={occasionSections}
            activeSection={activeOccasionSection}
            onSelectSection={(id) => setActiveOccasionSectionId(id)}
            onAddSection={async () => {
              const newId = await addSection('occasions', `Occasion Gifts #${occasionSections.length + 1}`, []);
              if (newId) setActiveOccasionSectionId(newId);
            }}
            onDuplicateSection={async (id) => {
              const dupId = await duplicateSection(id);
              if (dupId) setActiveOccasionSectionId(dupId);
            }}
            onDeleteSection={async (id) => {
              if (occasionSections.length <= 1) {
                toast.error('At least one Occasion Gifts section must remain.');
                return;
              }
              const success = await deleteSection(id);
              if (success) {
                const remaining = occasionSections.filter((s) => s.id !== id);
                if (remaining[0]) setActiveOccasionSectionId(remaining[0].id);
              }
            }}
            onJumpToLayout={() => setActiveTab('layout')}
          />

          {/* Header Bar */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Occasion Gifts Section {activeOccasionSection?.custom_label ? `(${activeOccasionSection.custom_label})` : ''}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    occasionsSettings.is_enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {occasionsSettings.is_enabled ? 'Section Enabled' : 'Section Hidden'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Showcase curated occasion cards (Birthday, Anniversary, etc.) directly below the sub-banner with customizable pastel backgrounds, optional date badges, and images.
              </p>
            </div>

            {/* Controls: Master Strip Toggle & Add Occasion Card Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Master Strip Enable / Disable Switch */}
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  {occasionsSettings.is_enabled ? 'Section Active' : 'Section Inactive'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={occasionsSettings.is_enabled}
                  onClick={() => updateOccasionSettings({ is_enabled: !occasionsSettings.is_enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    occasionsSettings.is_enabled ? 'bg-[#D26900]' : 'bg-gray-300'
                  }`}
                  title={occasionsSettings.is_enabled ? 'Click to Disable Occasion Section' : 'Click to Enable Occasion Section'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      occasionsSettings.is_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Add New Occasion Button */}
              <button
                type="button"
                onClick={handleOpenAddOccasion}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Occasion Card</span>
              </button>
            </div>
          </div>

          {/* Section Title Inline Editor */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Section Display Title</span>
                  <span className="text-[10px] font-normal text-gray-400 lowercase">(shows above cards on customer homepage)</span>
                </label>
                <p className="text-xs text-gray-500">
                  Default: "Gifts For Every Occasion" — change to whatever title matches your campaign.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={sectionTitleInput}
                  onChange={(e) => setSectionTitleInput(e.target.value)}
                  placeholder="Gifts For Every Occasion"
                  className="w-full sm:w-80 text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 font-bold text-gray-800 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveSectionTitle}
                  disabled={isSavingTitle || sectionTitleInput.trim() === occasionsSettings.section_title}
                  className="px-4 py-2.5 bg-[#D26900] hover:bg-[#B45309] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {isSavingTitle ? 'Saving...' : 'Save Title'}
                </button>
              </div>
            </div>
          </div>

          {/* Live Customer Screen Preview */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-50 text-[#D26900]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  Live Customer Screen Preview
                </h3>
              </div>
              <span className="text-xs text-[#D26900] font-bold bg-[#FFF7ED] px-3 py-1 rounded-full border border-[#FED7AA]">
                Hover over cards to see soft white border animation & lift
              </span>
            </div>

            {!occasionsSettings.is_enabled && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>The Occasions section is currently set to <strong>Hidden</strong> in master settings. It will not show on the live home page until enabled.</span>
              </div>
            )}

            {/* Rendered Live Component */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white/20 backdrop-blur-md shadow-inner">
              <HomeOccasions customItems={effectiveOccasions} />
            </div>
          </div>

          {/* Configured Occasions Cards List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Configured Occasion Cards ({effectiveOccasions.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Cards are displayed in sequence left-to-right. Use up/down arrows to reorder.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAdminOccasions}
                className="text-xs font-semibold text-[#D26900] hover:underline cursor-pointer"
              >
                Refresh List
              </button>
            </div>

            {occasionsLoading && effectiveOccasions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#D26900] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-500 font-medium">Loading occasion cards...</p>
              </div>
            ) : effectiveOccasions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-[#D26900] flex items-center justify-center mx-auto mb-3 text-2xl font-bold shadow-2xs">
                  🎁
                </div>
                <h4 className="text-sm font-bold text-gray-800">No Occasion Cards Yet</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Click the button below to add your first occasion card (e.g. Birthday, Anniversary).
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddOccasion}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 cursor-pointer"
                >
                  Add First Occasion Card
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {effectiveOccasions.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition"
                  >
                    {/* Left: Reorder & Thumbnail & Info */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Sequence Reorder Controls */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveOccasionOrder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                          title="Move Left/Earlier"
                        >
                          ▲
                        </button>
                        <span className="text-[11px] font-mono font-bold text-gray-400">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveOccasionOrder(idx, 'down')}
                          disabled={idx === effectiveOccasions.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                          title="Move Right/Later"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Mini Card Preview with pastel bg & thumbnail */}
                      <div
                        className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl flex items-center justify-between p-2 shrink-0 border border-gray-200/80 shadow-2xs overflow-hidden"
                        style={{ backgroundColor: item.bg_color || '#F9D3B4' }}
                        title={`Color: ${item.bg_color}`}
                      >
                        <span className="text-[11px] font-bold text-gray-900 leading-tight truncate">
                          {item.title} ›
                        </span>
                        {item.image_url ? (
                          <div className="absolute bottom-0 right-1 h-[82%] max-w-[55%] flex items-end justify-end pointer-events-none overflow-visible">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              style={{
                                transform: `scale(${Number(item.image_scale) > 10 ? Number(item.image_scale) / 100 : Number(item.image_scale) || 1.0})`,
                                transformOrigin: 'bottom right',
                              }}
                              className="max-h-full max-w-full object-contain drop-shadow-2xs"
                            />
                          </div>
                        ) : null}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {item.title}
                          </h4>
                          {item.date_badge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white text-gray-800 border border-gray-200 shadow-2xs uppercase">
                              {item.date_badge}
                            </span>
                          )}
                          {item.image_scale && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {Math.round((Number(item.image_scale) > 10 ? Number(item.image_scale) / 100 : Number(item.image_scale) || 1.0) * 100)}% Zoom
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-gray-600 truncate max-w-xs">
                            <span className="text-gray-400">Path:</span>
                            {item.link_url}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-gray-300 shadow-2xs inline-block"
                              style={{ backgroundColor: item.bg_color || '#F9D3B4' }}
                            />
                            <span className="font-mono text-[11px] text-gray-500 uppercase">{item.bg_color}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions (NO ENABLE/DISABLE BUTTON AS STRICTLY REQUESTED!) */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditOccasion(item)}
                        className="p-2 text-gray-500 hover:text-[#D26900] hover:bg-orange-50 rounded-xl transition cursor-pointer"
                        title="Edit Occasion Card"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteOccasionConfirm({
                            isOpen: true,
                            id: item.id,
                            title: item.title,
                          })
                        }
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Delete Occasion Card"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'bestsellers' ? (
        <div className="space-y-7 animate-in fade-in duration-200">
          <AdminSectionInstanceSelector
            sectionType="bestsellers"
            typeTitle="Shop By Bestsellers"
            defaultLabel="Bestsellers Section"
            icon="⭐"
            sections={bestsellerSections}
            activeSection={activeBestsellerSection}
            onSelectSection={(id) => setActiveBestsellerSectionId(id)}
            onAddSection={async () => {
              const newId = await addSection('bestsellers', `Bestsellers #${bestsellerSections.length + 1}`, []);
              if (newId) setActiveBestsellerSectionId(newId);
            }}
            onDuplicateSection={async (id) => {
              const dupId = await duplicateSection(id);
              if (dupId) setActiveBestsellerSectionId(dupId);
            }}
            onDeleteSection={async (id) => {
              if (bestsellerSections.length <= 1) {
                toast.error('At least one Bestsellers section must remain.');
                return;
              }
              const success = await deleteSection(id);
              if (success) {
                const remaining = bestsellerSections.filter((s) => s.id !== id);
                if (remaining[0]) setActiveBestsellerSectionId(remaining[0].id);
              }
            }}
            onJumpToLayout={() => setActiveTab('layout')}
          />

          {/* Header Bar */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Shop By Bestsellers — Design & Theme Studio {activeBestsellerSection?.custom_label ? `(${activeBestsellerSection.custom_label})` : ''}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    bestsellerSettings.is_enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {bestsellerSettings.is_enabled ? 'Section Active' : 'Section Hidden'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
                  API Catalog Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Configure your bestsellers section layout and design. Customize the full section background, card theme style, card background color & transparency. Product images, titles, pricing, and discount badges will be loaded dynamically via your product API.
              </p>
            </div>

            {/* Controls: Master Strip Toggle, Add Card & Quick Save Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Master Strip Enable / Disable Switch */}
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  {bestsellerSettings.is_enabled ? 'Section Active' : 'Section Inactive'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={bestsellerSettings.is_enabled}
                  onClick={() => updateBestsellerSettings({ is_enabled: !bestsellerSettings.is_enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    bestsellerSettings.is_enabled ? 'bg-[#D26900]' : 'bg-gray-300'
                  }`}
                  title={bestsellerSettings.is_enabled ? 'Click to Disable Bestsellers Section' : 'Click to Enable Bestsellers Section'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      bestsellerSettings.is_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Add New Bestseller Card Button */}
              <button
                type="button"
                onClick={handleOpenAddBestseller}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Bestseller Card</span>
              </button>

              {/* Save All Settings Button */}
              <button
                type="button"
                onClick={handleSaveBestsellerSettings}
                disabled={isSavingBestsellerSettings}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{isSavingBestsellerSettings ? 'Saving...' : 'Save Design & Section'}</span>
              </button>
            </div>
          </div>

          {/* Section Headings & View All Button Settings */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="p-1 rounded-md bg-orange-50 text-[#D26900]">🏷️</span>
                  <span>Section Titles & "View All" Button Configuration</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure headings, subtitle, and bottom "View All" CTA button for the bestsellers strip.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Section Display Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  Section Title
                </label>
                <input
                  type="text"
                  value={bestsellerTitleInput}
                  onChange={(e) => setBestsellerTitleInput(e.target.value)}
                  placeholder="Shop By Bestsellers"
                  className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 font-bold text-gray-900 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 outline-none"
                />
              </div>

              {/* Section Subtitle */}
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={bestsellerSubtitleInput}
                  onChange={(e) => setBestsellerSubtitleInput(e.target.value)}
                  placeholder="Discover India's favourite gifting options, curated bestsellers that make every celebration extra special"
                  className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-700 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 outline-none"
                />
              </div>

              {/* View All Button Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  "View All" Button Text
                </label>
                <input
                  type="text"
                  value={viewAllTextInput}
                  onChange={(e) => setViewAllTextInput(e.target.value)}
                  placeholder="View All Bestsellers"
                  className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-900 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 outline-none"
                />
              </div>

              {/* View All Button Redirect Destination Selector (Header Category & Dropdown Item ONLY - NO freeform text input) */}
              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                    "View All" Click Destination (Redirect Target)
                  </label>
                  <span className="text-[10px] font-bold text-[#D26900] bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/70 font-mono">
                    Target: {viewAllUrlInput}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" ref={viewAllDropdownRef}>
                  {/* Tab Selector: Header Category vs Dropdown Item */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 block">Link Destination Type:</label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleViewAllLinkTypeChange('header')}
                        className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                          viewAllLinkTypeInput === 'header'
                            ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:text-[#D26900]'
                        }`}
                      >
                        Header Category
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewAllLinkTypeChange('dropdown')}
                        className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                          viewAllLinkTypeInput === 'dropdown'
                            ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:text-[#D26900]'
                        }`}
                      >
                        Dropdown Item
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 block">
                      {viewAllLinkTypeInput === 'header' ? 'Select Header Category:' : 'Select Sub-Header Dropdown Item:'}
                    </label>

                    {viewAllLinkTypeInput === 'header' ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenViewAllDropdown((p) => (p === 'header' ? null : 'header'))}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded-xl transition cursor-pointer hover:border-[#D26900] shadow-2xs"
                        >
                          <span className="truncate">
                            {adminItems.find((h) => h.id === viewAllTargetHeaderId)?.title ||
                              adminItems.find((h) => h.path === viewAllUrlInput)?.title ||
                              'Select Category'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono ml-2">
                            {viewAllUrlInput}
                          </span>
                        </button>

                        {openViewAllDropdown === 'header' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                              <input
                                type="text"
                                placeholder="Search header category..."
                                value={viewAllHeaderSearch}
                                onChange={(e) => setViewAllHeaderSearch(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredViewAllHeaders.map((h) => (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => {
                                    setViewAllTargetHeaderId(h.id);
                                    setViewAllTargetDropdownId('');
                                    setViewAllUrlInput(h.path);
                                    setOpenViewAllDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <span className="font-bold text-gray-800">{h.title}</span>
                                  <span className="text-[10px] font-mono text-gray-400">{h.path}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenViewAllDropdown((p) => (p === 'dropdown' ? null : 'dropdown'))}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded-xl transition cursor-pointer hover:border-[#D26900] shadow-2xs"
                        >
                          <span className="truncate">
                            {allDropdownOptions.find((d) => d.id === viewAllTargetDropdownId)?.title ||
                              allDropdownOptions.find((d) => d.path === viewAllUrlInput)?.title ||
                              'Select Sub-Item'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono ml-2">
                            {viewAllUrlInput}
                          </span>
                        </button>

                        {openViewAllDropdown === 'dropdown' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                              <input
                                type="text"
                                placeholder="Search sub-items..."
                                value={viewAllSubItemSearch}
                                onChange={(e) => setViewAllSubItemSearch(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredViewAllDropdowns.map((d) => (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => {
                                    setViewAllTargetDropdownId(d.id);
                                    setViewAllTargetHeaderId('');
                                    setViewAllUrlInput(d.path);
                                    setOpenViewAllDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="font-bold text-gray-800 block">{d.title}</span>
                                    <span className="text-[10px] text-gray-400">{d.headerTitle}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-400">{d.path}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Show/Hide View All Button */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  Bottom CTA Button Visibility
                </label>
                <div className="flex items-center gap-3 h-[42px] px-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="showViewAllCheckbox"
                    checked={showViewAllInput}
                    onChange={(e) => setShowViewAllInput(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D26900] accent-[#D26900] cursor-pointer"
                  />
                  <label htmlFor="showViewAllCheckbox" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                    Show "View All" Button Below Cards
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bestsellers Design, Colors & Layout Studio (Compact Multi-Column Dropdowns) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-6" ref={studioDropdownRef}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="p-1 rounded-md bg-orange-50 text-[#D26900]">🎨</span>
                  <span>Section Theme, Background & Layout Studio</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Customize card design styles, custom colors, wallpaper transparency, and cards per row using the compact dropdowns below.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
                  Theme: {BESTSELLER_CARD_THEMES.find((t) => t.id === cardThemeInput)?.name || 'Classic Clean'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#D26900] border border-orange-200">
                  {BESTSELLER_CARDS_PER_ROW_OPTIONS.find((c) => c.id === cardsPerRowInput)?.name.split(' ')[0] || '4'} Cards / Row
                </span>
              </div>
            </div>

            {/* 6 Studio Dropdowns in a Responsive Multi-Column Grid (Up to 3 Dropdowns Per Row!) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {/* 1. Pure Section Background Mode Dropdown */}
              <div className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🖼️</span>
                    <span>Section Background</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#D26900] border border-orange-200">
                    Full Strip BG
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenStudioDropdown(openStudioDropdown === 'section_bg_mode' ? null : 'section_bg_mode')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openStudioDropdown === 'section_bg_mode'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200/90 hover:border-[#FED7AA] hover:bg-orange-50/15 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-[#D26900]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {sectionBgModeInput === 'transparent' ? 'Transparent (Blend Wallpaper)' : 'Custom Background Color'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {sectionBgModeInput === 'transparent' ? 'Blends with homepage wallpaper' : `Color: ${sectionBgColorInput}`}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openStudioDropdown === 'section_bg_mode' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openStudioDropdown === 'section_bg_mode' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setSectionBgModeInput('transparent');
                        setOpenStudioDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition ${
                        sectionBgModeInput === 'transparent'
                          ? 'bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]'
                          : 'hover:bg-orange-50/50 text-gray-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">Transparent (Blend With Home Wallpaper)</p>
                        <p className="text-[11px] text-gray-500">Homepage background doodles & wallpapers show through</p>
                      </div>
                      {sectionBgModeInput === 'transparent' && (
                        <span className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSectionBgModeInput('color');
                        setOpenStudioDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition ${
                        sectionBgModeInput === 'color'
                          ? 'bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]'
                          : 'hover:bg-orange-50/50 text-gray-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">Custom Section Background Color</p>
                        <p className="text-[11px] text-gray-500">Apply a solid color or luxury tint across entire strip</p>
                      </div>
                      {sectionBgModeInput === 'color' && (
                        <span className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Section Background Color Dropdown & Palette */}
              <div className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎨</span>
                    <span>Section BG Color</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#D26900] border border-orange-200 uppercase">
                    {sectionBgColorInput}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenStudioDropdown(openStudioDropdown === 'section_bg_color' ? null : 'section_bg_color')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openStudioDropdown === 'section_bg_color'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200/90 hover:border-[#FED7AA] hover:bg-orange-50/15 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-8 h-8 rounded-lg border border-gray-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: sectionBgColorInput }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {BESTSELLER_SECTION_BG_PRESETS.find((p) => p.color.toLowerCase() === sectionBgColorInput.toLowerCase())?.name || 'Custom Hex'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate font-mono">
                        {sectionBgColorInput} {sectionBgModeInput === 'transparent' ? '(Wallpaper Active)' : ''}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openStudioDropdown === 'section_bg_color' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openStudioDropdown === 'section_bg_color' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Preset Colors</span>
                      {sectionBgModeInput === 'transparent' && (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                          Will switch to Custom Color
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {BESTSELLER_SECTION_BG_PRESETS.filter((p) => p.color !== 'transparent').map((p) => (
                        <button
                          key={p.color}
                          type="button"
                          onClick={() => {
                            setSectionBgColorInput(p.color);
                            setSectionBgModeInput('color');
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 cursor-pointer transition text-left ${
                            sectionBgColorInput.toLowerCase() === p.color.toLowerCase()
                              ? 'border-[#D26900] bg-[#FFF7ED] text-[#D26900] ring-1 ring-[#D26900]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-600">Hex:</span>
                        <input
                          type="text"
                          value={sectionBgColorInput}
                          onChange={(e) => {
                            setSectionBgColorInput(e.target.value);
                            setSectionBgModeInput('color');
                          }}
                          className="w-24 text-xs font-mono font-bold uppercase border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#D26900]"
                        />
                        <input
                          type="color"
                          value={sectionBgColorInput.startsWith('#') && (sectionBgColorInput.length === 7 || sectionBgColorInput.length === 4) ? sectionBgColorInput : '#FFFFFF'}
                          onChange={(e) => {
                            setSectionBgColorInput(e.target.value);
                            setSectionBgModeInput('color');
                          }}
                          className="w-7 h-7 rounded-md border border-gray-200 p-0.5 cursor-pointer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenStudioDropdown(null)}
                        className="px-3 py-1 bg-[#D26900] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#B45309]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Cards Display Per Row (Density) Dropdown */}
              <div className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📐</span>
                    <span>Cards Per Row (Density)</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
                    {BESTSELLER_CARDS_PER_ROW_OPTIONS.find((o) => o.id === cardsPerRowInput)?.badge || 'Custom Layout'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenStudioDropdown(openStudioDropdown === 'cards_per_row' ? null : 'cards_per_row')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openStudioDropdown === 'cards_per_row'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200/90 hover:border-[#FED7AA] hover:bg-orange-50/15 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-[#D26900]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {BESTSELLER_CARDS_PER_ROW_OPTIONS.find((o) => o.id === cardsPerRowInput)?.name || `${cardsPerRowInput} Cards Per Row`}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {BESTSELLER_CARDS_PER_ROW_OPTIONS.find((o) => o.id === cardsPerRowInput)?.desc || 'Density configuration'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openStudioDropdown === 'cards_per_row' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openStudioDropdown === 'cards_per_row' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {BESTSELLER_CARDS_PER_ROW_OPTIONS.map((opt) => {
                      const isSelected = cardsPerRowInput === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setCardsPerRowInput(opt.id);
                            setOpenStudioDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]'
                              : 'hover:bg-orange-50/50 text-gray-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold">{opt.name}</p>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-100/70 text-[#D26900]">
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Card Design Theme Style Dropdown */}
              <div className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Card Design Theme</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#D26900] border border-orange-200">
                    Universal Style
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenStudioDropdown(openStudioDropdown === 'card_theme' ? null : 'card_theme')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openStudioDropdown === 'card_theme'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200/90 hover:border-[#FED7AA] hover:bg-orange-50/15 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-[#D26900]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {BESTSELLER_CARD_THEMES.find((t) => t.id === cardThemeInput)?.name || 'Classic Clean'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {BESTSELLER_CARD_THEMES.find((t) => t.id === cardThemeInput)?.desc || 'Visual card borders & shadows'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openStudioDropdown === 'card_theme' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openStudioDropdown === 'card_theme' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {BESTSELLER_CARD_THEMES.map((theme) => {
                      const isSelected = cardThemeInput === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setCardThemeInput(theme.id);
                            setOpenStudioDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]'
                              : 'hover:bg-orange-50/50 text-gray-700'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{theme.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{theme.desc}</p>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Card Background Mode Dropdown */}
              <div className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🪟</span>
                    <span>Card Background Mode</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#D26900] border border-orange-200">
                    Card Style
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenStudioDropdown(openStudioDropdown === 'card_bg_mode' ? null : 'card_bg_mode')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openStudioDropdown === 'card_bg_mode'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200/90 hover:border-[#FED7AA] hover:bg-orange-50/15 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-[#D26900]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {BESTSELLER_BG_MODES.find((m) => m.id === cardBgModeInput)?.name || 'Pure White (Default)'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {BESTSELLER_BG_MODES.find((m) => m.id === cardBgModeInput)?.desc || 'Card fill styling'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openStudioDropdown === 'card_bg_mode' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openStudioDropdown === 'card_bg_mode' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {BESTSELLER_BG_MODES.map((mode) => {
                      const isSelected = cardBgModeInput === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setCardBgModeInput(mode.id);
                            setOpenStudioDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]'
                              : 'hover:bg-orange-50/50 text-gray-700'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{mode.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{mode.desc}</p>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. Card Custom Background Color Dropdown */}
              <div className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>Card Custom Accent Color</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#D26900] border border-orange-200 uppercase">
                    {cardBgColorInput}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenStudioDropdown(openStudioDropdown === 'card_bg_color' ? null : 'card_bg_color')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openStudioDropdown === 'card_bg_color'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200/90 hover:border-[#FED7AA] hover:bg-orange-50/15 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-8 h-8 rounded-lg border border-gray-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: cardBgColorInput }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {BESTSELLER_BG_COLOR_PRESETS.find((p) => p.color.toLowerCase() === cardBgColorInput.toLowerCase())?.name || 'Custom Hex'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate font-mono">
                        {cardBgColorInput} {cardBgModeInput !== 'color' ? `(${cardBgModeInput} active)` : ''}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openStudioDropdown === 'card_bg_color' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openStudioDropdown === 'card_bg_color' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Card Color Palette</span>
                      {cardBgModeInput !== 'color' && (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                          Will switch to Custom Accent Color
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {BESTSELLER_BG_COLOR_PRESETS.map((p) => (
                        <button
                          key={p.color}
                          type="button"
                          onClick={() => {
                            setCardBgColorInput(p.color);
                            setCardBgModeInput('color');
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 cursor-pointer transition text-left ${
                            cardBgColorInput.toLowerCase() === p.color.toLowerCase()
                              ? 'border-[#D26900] bg-[#FFF7ED] text-[#D26900] ring-1 ring-[#D26900]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-600">Hex:</span>
                        <input
                          type="text"
                          value={cardBgColorInput}
                          onChange={(e) => {
                            setCardBgColorInput(e.target.value);
                            setCardBgModeInput('color');
                          }}
                          className="w-24 text-xs font-mono font-bold uppercase border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#D26900]"
                        />
                        <input
                          type="color"
                          value={cardBgColorInput.startsWith('#') && (cardBgColorInput.length === 7 || cardBgColorInput.length === 4) ? cardBgColorInput : '#FFFFFF'}
                          onChange={(e) => {
                            setCardBgColorInput(e.target.value);
                            setCardBgModeInput('color');
                          }}
                          className="w-7 h-7 rounded-md border border-gray-200 p-0.5 cursor-pointer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenStudioDropdown(null)}
                        className="px-3 py-1 bg-[#D26900] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#B45309]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 7. Card Background Transparency / Opacity Slider */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                    Card Background Transparency / Opacity
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Controls how much of the customer home page wallpaper or background pattern shows through the cards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA] font-mono">
                    {cardTransparencyInput}% Transparent
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs text-gray-400 font-semibold shrink-0">0% (Solid)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={cardTransparencyInput}
                  onChange={(e) => setCardTransparencyInput(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D26900]"
                />
                <span className="text-xs text-gray-400 font-semibold shrink-0">100% (Glass / Clear)</span>
              </div>

              {/* Quick Opacity Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-gray-500">Quick Presets:</span>
                {[
                  { label: '0% Solid', val: 0 },
                  { label: '15% Subtle Glass', val: 15 },
                  { label: '35% Medium Tint', val: 35 },
                  { label: '60% Frosted', val: 60 },
                  { label: '100% Fully Clear', val: 100 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setCardTransparencyInput(item.val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                      cardTransparencyInput === item.val
                        ? 'bg-[#D26900] text-white border-[#D26900]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Interactive Multi-Card Section & Density Preview */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="p-1 rounded-md bg-orange-50 text-[#D26900]">👁️</span>
                  <span>Live Storefront Preview — Real-Time Theme & Layout ({BESTSELLER_CARDS_PER_ROW_OPTIONS.find((o) => o.id === cardsPerRowInput)?.name})</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  See how your background colors, card theme, transparency, and cards per row layout appear to customers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
                  {cardsPerRowInput === 'scroll' ? 'Scroll Carousel' : `${cardsPerRowInput} Cards / Row Active`}
                </span>
              </div>
            </div>

            {/* Simulated Section Container with chosen Section Background */}
            <div
              className="rounded-2xl p-5 sm:p-7 md:p-8 transition-colors duration-300 relative border border-gray-200/90 overflow-hidden"
              style={{
                backgroundColor: sectionBgModeInput === 'color' ? sectionBgColorInput : 'transparent',
                backgroundImage:
                  sectionBgModeInput === 'transparent'
                    ? 'radial-gradient(#d1d5db 1px, transparent 1px)'
                    : undefined,
                backgroundSize: '16px 16px',
              }}
            >
              {/* Section Title & Subtitle Preview */}
              <div className="mb-4 px-1">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[26px] font-bold text-gray-900 tracking-tight">
                  {bestsellerTitleInput || 'Shop By Bestsellers'}
                </h2>
                {bestsellerSubtitleInput && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 max-w-3xl">
                    {bestsellerSubtitleInput}
                  </p>
                )}
              </div>

              {/* Dynamic Sample Cards Display matching cards_per_row */}
              <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
                {(effectiveBestsellers.length > 0
                  ? effectiveBestsellers
                  : adminProducts.length > 0
                  ? adminProducts.slice(0, 8).map((p, i) => ({
                      id: p.id,
                      title: p.title,
                      subtitle: p.subtitle || '',
                      price: `₹${Number(p.price || 0).toLocaleString('en-IN')}`,
                      original_price: p.mrp ? `₹${Number(p.mrp).toLocaleString('en-IN')}` : '',
                      discount_badge: p.discount_percent > 0 ? `${p.discount_percent}% OFF` : (p.badge_text || ''),
                      badge_style: 'discount' as const,
                      image_url: p.primary_image || p.images?.[0]?.url || '',
                      link_type: 'header' as const,
                      target_header_id: p.target_header_id,
                      target_dropdown_id: p.target_dropdown_id,
                      link_url: p.dropdown_path || p.header_path || `/product/${p.slug}`,
                      order_index: i + 1,
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    }))
                  : []
                ).map((sample: any, idx: number) => {
                  // Resolve card width based on cardsPerRowInput
                  let cardWidthStyle: React.CSSProperties = {
                    flex: '1 0 clamp(200px, 18vw, 300px)',
                    maxWidth: '320px',
                  };
                  if (cardsPerRowInput === '2') {
                    cardWidthStyle = { flex: '0 0 calc((100% - 1rem) / 2)', width: 'calc((100% - 1rem) / 2)', minWidth: 'calc((100% - 1rem) / 2)' };
                  } else if (cardsPerRowInput === '3') {
                    cardWidthStyle = { flex: '0 0 calc((100% - 2rem) / 3)', width: 'calc((100% - 2rem) / 3)', minWidth: 'calc((100% - 2rem) / 3)' };
                  } else if (cardsPerRowInput === '4') {
                    cardWidthStyle = { flex: '0 0 calc((100% - 3rem) / 4)', width: 'calc((100% - 3rem) / 4)', minWidth: 'calc((100% - 3rem) / 4)' };
                  } else if (cardsPerRowInput === '5') {
                    cardWidthStyle = { flex: '0 0 calc((100% - 4rem) / 5)', width: 'calc((100% - 4rem) / 5)', minWidth: 'calc((100% - 4rem) / 5)' };
                  } else if (cardsPerRowInput === '6') {
                    cardWidthStyle = { flex: '0 0 calc((100% - 5rem) / 6)', width: 'calc((100% - 5rem) / 6)', minWidth: 'calc((100% - 5rem) / 6)' };
                  } else if (cardsPerRowInput === 'scroll') {
                    cardWidthStyle = { flex: '0 0 240px', width: '240px', maxWidth: '260px' };
                  }

                  const sampleImg = sample.image_url || sample.image;
                  const sampleBadge = sample.discount_badge || sample.discount;

                  return (
                    <div
                      key={sample.id || idx}
                      onClick={() => handleOpenEditBestseller(sample)}
                      className={`group relative overflow-hidden flex flex-col shrink-0 transition-all duration-300 cursor-pointer ${getPreviewThemeClasses(
                        cardThemeInput
                      )}`}
                      style={{
                        ...getPreviewCardStyle(cardBgModeInput, cardBgColorInput, cardTransparencyInput),
                        ...cardWidthStyle,
                      }}
                      title="Click to edit this card in modal"
                    >
                      {/* Thumbnail Showcase with Auto-Slide & Dots */}
                      <BestsellerPreviewImageCarousel
                        images={sample.images}
                        imageUrl={sampleImg}
                        title={sample.title}
                        badgeText={sample.badge_text || sampleBadge || 'BESTSELLER'}
                        rating={sample.rating}
                        reviewsCount={sample.reviews_count}
                      />

                      {/* Card Details */}
                      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-grow gap-1">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                            {sample.title}
                          </h4>
                          {sample.subtitle && (
                            <p className="text-[11px] text-gray-500 line-clamp-1">
                              {sample.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Price & Discount Row */}
                        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 pt-0.5">
                          <span className="text-sm sm:text-base font-extrabold text-gray-950">
                            {formatBestsellerPrice(sample.price)}
                          </span>
                          {sample.original_price && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatBestsellerPrice(sample.original_price)}
                            </span>
                          )}
                          {sampleBadge && (
                            <span className="text-[#D26900] font-bold text-xs">
                              {formatBestsellerDiscount(sampleBadge)}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                          <span>Card #{idx + 1}</span>
                          <span className="text-[#D26900] font-bold group-hover:underline">Edit Card ✏️</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section View All Button Preview */}
              {showViewAllInput && (
                <div className="mt-8 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-gray-800 text-gray-900 text-xs sm:text-sm font-bold bg-white/80 backdrop-blur-sm shadow-xs cursor-pointer hover:bg-black hover:text-white transition">
                    <span>{viewAllTextInput || 'View All Bestsellers'}</span>
                    <span>&gt;</span>
                  </div>
                </div>
              )}
            </div>

            {/* Architecture Explanatory Notice */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <span className="text-lg leading-none">💡</span>
              <div className="space-y-1">
                <p className="font-bold">
                  Card Manager & Product Catalog Connected
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Real store products can be picked directly from your catalog, or customized below. Each card's title, image, price, discount badge, and Header / Dropdown link destination are fully configurable.
                </p>
              </div>
            </div>
          </div>

          {/* Configured Bestseller Cards List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Configured Bestseller Cards ({effectiveBestsellers.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Manage individual cards, prices, discount badges, and navigation destinations. Cards display left-to-right on storefront.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchAdminBestsellers}
                  className="text-xs font-semibold text-[#D26900] hover:underline cursor-pointer"
                >
                  Refresh List
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddBestseller}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Bestseller Card</span>
                </button>
              </div>
            </div>

            {bestsellerLoading && effectiveBestsellers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#D26900] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-500 font-medium">Loading bestseller cards...</p>
              </div>
            ) : effectiveBestsellers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-[#D26900] flex items-center justify-center mx-auto mb-3 text-2xl font-bold shadow-2xs">
                  ⭐
                </div>
                <h4 className="text-sm font-bold text-gray-800">No Bestseller Cards Yet</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Click the button below to add your first bestseller card with real product details and navigation link.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddBestseller}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 cursor-pointer"
                >
                  Add First Bestseller Card
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {effectiveBestsellers.map((item, idx) => {
                  const targetHeader = adminItems.find((h) => h.id === item.target_header_id);
                  const targetDropdown = allDropdownOptions.find((d) => d.id === item.target_dropdown_id);
                  const destLabel =
                    item.link_type === 'dropdown'
                      ? targetDropdown
                        ? `${targetDropdown.headerTitle} › ${targetDropdown.title}`
                        : item.link_url
                      : targetHeader
                      ? targetHeader.title
                      : item.link_url || 'Homepage';

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition"
                    >
                      {/* Left: Reorder & Thumbnail & Info */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Sequence Reorder Controls */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBestsellerOrder(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                            title="Move Earlier"
                          >
                            ▲
                          </button>
                          <span className="text-[11px] font-mono font-bold text-gray-400">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveBestsellerOrder(idx, 'down')}
                            disabled={idx === effectiveBestsellers.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                            title="Move Later"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-2xs flex items-center justify-center">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🎒</span>
                          )}
                          {item.discount_badge && (
                            <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#D26900] text-white">
                              {item.discount_badge}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900 truncate">
                              {item.title}
                            </h4>
                            <span className="text-xs font-extrabold text-[#D26900]">
                              {formatBestsellerPrice(item.price)}
                            </span>
                            {item.original_price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatBestsellerPrice(item.original_price)}
                              </span>
                            )}
                            {item.discount_badge && (
                              <span className="text-[11px] font-bold text-[#D26900]">
                                {formatBestsellerDiscount(item.discount_badge)}
                              </span>
                            )}
                          </div>

                          {item.subtitle && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {item.subtitle}
                            </p>
                          )}

                          {/* Attributes & Navigation Destination Indicator */}
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {/* Rating badge */}
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold">
                              <span>⭐</span>
                              <span>{item.rating || 4.9}</span>
                              <span className="text-gray-400">({item.reviews_count || 95})</span>
                            </span>

                            {/* Source Mode */}
                            {item.product_id ? (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                                ⚡ Store Catalog
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                                ✏️ Custom
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-[#D26900] border border-orange-200/80">
                              <span>🔗</span>
                              <span>{item.link_type === 'dropdown' ? 'Dropdown Item:' : 'Category:'}</span>
                              <strong className="truncate max-w-[150px]">{destLabel}</strong>
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 truncate max-w-[140px]">
                              {item.link_url}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Active Toggle Switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.is_active}
                          onClick={async () => {
                            if (activeBestsellerSection) {
                              const currentList = Array.isArray(activeBestsellerSection.items) ? (activeBestsellerSection.items as any[]) : adminBestsellers;
                              const updated = currentList.map((b) => b.id === item.id ? { ...b, is_active: !b.is_active, updated_at: new Date().toISOString() } : b);
                              await saveSingleSectionLayout(activeBestsellerSection.id, { items: updated });
                            } else {
                              await toggleBestsellerStatus(item.id, !item.is_active);
                            }
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            item.is_active ? 'bg-[#D26900]' : 'bg-gray-300'
                          }`}
                          title={item.is_active ? 'Active on store' : 'Hidden from store'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              item.is_active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditBestseller(item)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 text-xs font-bold text-gray-700 hover:text-[#D26900] transition cursor-pointer"
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteBestsellerConfirm({ isOpen: true, id: item.id, title: item.title })}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Card"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Save Action Button */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Ready to publish changes?</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Saving will instantly update the theme, card background, transparency, and section styling across the storefront.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveBestsellerSettings}
              disabled={isSavingBestsellerSettings}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{isSavingBestsellerSettings ? 'Saving Settings...' : 'Save Design & Section Settings'}</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'promo-banner' ? (
        <div className="space-y-7 animate-in fade-in duration-200">
          <AdminSectionInstanceSelector
            sectionType="promo_banner"
            typeTitle="Promo Banner Strip"
            defaultLabel="Promo Strip"
            icon="📢"
            sections={promoSections}
            activeSection={activePromoSection}
            onSelectSection={(id) => setActivePromoSectionId(id)}
            onAddSection={async () => {
              const newId = await addSection('promo_banner', `Promo Strip #${promoSections.length + 1}`, []);
              if (newId) setActivePromoSectionId(newId);
            }}
            onDuplicateSection={async (id) => {
              const dupId = await duplicateSection(id);
              if (dupId) setActivePromoSectionId(dupId);
            }}
            onDeleteSection={async (id) => {
              if (promoSections.length <= 1) {
                toast.error('At least one Promo Banner section must remain.');
                return;
              }
              const success = await deleteSection(id);
              if (success) {
                const remaining = promoSections.filter((s) => s.id !== id);
                if (remaining[0]) setActivePromoSectionId(remaining[0].id);
              }
            }}
            onJumpToLayout={() => setActiveTab('layout')}
          />

          {/* Top Page Header */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Special Promo Strip Banner {activePromoSection?.custom_label ? `(${activePromoSection.custom_label})` : ''}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]">
                  {effectivePromoBanners.filter((b) => b.is_active).length} Active / {effectivePromoBanners.length} Total
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    promoIsEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {promoIsEnabled ? 'Section Live on Home' : 'Section Hidden'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Manage the full-width promotional strip appearing directly below "Shop By Bestsellers" on the customer storefront.
                Upload single or multiple banners with auto-slideshow, custom typography colors, and non-clickable visual showcase.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingPromoId(null);
                  setIsEditingPromo(false);
                  setPromoFormData(emptyPromoBannerForm);
                  setIsPromoModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Promo Slide</span>
              </button>
            </div>
          </div>

          {/* Master Settings & Slideshow Behavior Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="p-1 rounded-md bg-orange-50 text-[#D26900]">⚙️</span>
                  <span>Section Settings & Slideshow Controls</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure display visibility on the homepage, slideshow auto-transition speed, banner height, and corner rounding.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSavePromoSettings}
                disabled={isSavingPromoSettings}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{isSavingPromoSettings ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            <div ref={promoDropdownRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Enable/Disable Toggle */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-900 block">Show Section on Home</label>
                  <p className="text-[11px] text-gray-500 mt-0.5">Enable or hide the strip on storefront</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoIsEnabled(!promoIsEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    promoIsEnabled ? 'bg-[#D26900]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      promoIsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2. Autoplay Toggle */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-900 block">Auto-Slideshow Transition</label>
                  <p className="text-[11px] text-gray-500 mt-0.5">Auto-rotate multiple slides (ek ek krke)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoAutoplay(!promoAutoplay)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    promoAutoplay ? 'bg-[#D26900]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      promoAutoplay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 3. Autoplay Interval Custom Dropdown */}
              <div className="relative p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⏱️</span>
                    <span>Slideshow Rotation Speed</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#D26900] border border-orange-200">
                    Auto-Slide
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenPromoDropdown(openPromoDropdown === 'speed' ? null : 'speed')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openPromoDropdown === 'speed'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200 hover:border-[#FED7AA] hover:bg-orange-50/20 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-[#D26900]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {PROMO_ROTATION_SPEED_OPTIONS.find((s) => s.val === promoAutoplayInterval)?.name || '4 Seconds (Standard)'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {PROMO_ROTATION_SPEED_OPTIONS.find((s) => s.val === promoAutoplayInterval)?.desc || 'Rotation speed'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openPromoDropdown === 'speed' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openPromoDropdown === 'speed' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {PROMO_ROTATION_SPEED_OPTIONS.map((opt) => {
                      const isSelected = promoAutoplayInterval === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            setPromoAutoplayInterval(opt.val);
                            setOpenPromoDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]'
                              : 'hover:bg-orange-50/50 text-gray-700'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{opt.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Banner Height Profile Custom Dropdown */}
              <div className="relative p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📐</span>
                    <span>Banner Height Profile</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#D26900] border border-orange-200">
                    Height
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenPromoDropdown(openPromoDropdown === 'height' ? null : 'height')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openPromoDropdown === 'height'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200 hover:border-[#FED7AA] hover:bg-orange-50/20 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-[#D26900]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {PROMO_HEIGHT_OPTIONS.find((h) => h.id === promoBannerHeight)?.name || 'Standard Height (~280px)'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {PROMO_HEIGHT_OPTIONS.find((h) => h.id === promoBannerHeight)?.desc || 'Display height'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openPromoDropdown === 'height' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openPromoDropdown === 'height' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {PROMO_HEIGHT_OPTIONS.map((opt) => {
                      const isSelected = promoBannerHeight === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setPromoBannerHeight(opt.id as any);
                            setOpenPromoDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]'
                              : 'hover:bg-orange-50/50 text-gray-700'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{opt.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Show Dots Toggle */}
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-900 block">Pagination Dots</label>
                  <p className="text-[11px] text-gray-500 mt-0.5">Show slide indicator dots</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoShowDots(!promoShowDots)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    promoShowDots ? 'bg-[#D26900]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      promoShowDots ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 6. Border Corner Radius Custom Dropdown */}
              <div className="relative p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔲</span>
                    <span>Border Corner Radius</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#D26900] border border-orange-200">
                    Radius
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenPromoDropdown(openPromoDropdown === 'radius' ? null : 'radius')}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left cursor-pointer bg-white ${
                    openPromoDropdown === 'radius'
                      ? 'border-[#D26900] ring-2 ring-[#D26900]/20 shadow-xs'
                      : 'border-gray-200 hover:border-[#FED7AA] hover:bg-orange-50/20 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-[#D26900]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {PROMO_RADIUS_OPTIONS.find((r) => r.id === promoBorderRadius)?.name || 'Rounded-2XL (16px)'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {PROMO_RADIUS_OPTIONS.find((r) => r.id === promoBorderRadius)?.desc || 'Corner curve'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      openPromoDropdown === 'radius' ? 'rotate-180 text-[#D26900]' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openPromoDropdown === 'radius' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-orange-950/10 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    {PROMO_RADIUS_OPTIONS.map((opt) => {
                      const isSelected = promoBorderRadius === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setPromoBorderRadius(opt.id as any);
                            setOpenPromoDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#FFF7ED] text-[#D26900] border border-[#FED7AA]'
                              : 'hover:bg-orange-50/50 text-gray-700'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{opt.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#D26900] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Storefront Preview */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>👁️</span>
                <span>Live Storefront Preview — Real-Time Slideshow & Typography</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Non-Clickable Display Strip
              </span>
            </div>

            {/* Simulated Banner Container */}
            <div className={`relative w-full overflow-hidden ${promoBorderRadius} shadow-md transition-all duration-300 bg-gray-100 ${
              promoBannerHeight === 'compact' ? 'h-[200px]' : promoBannerHeight === 'tall' ? 'h-[320px]' : 'h-[260px]'
            }`}>
              {effectivePromoBanners.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* First active slide preview */}
                  {(() => {
                    const previewSlide = effectivePromoBanners[0];
                    const pos = previewSlide.text_position || 'left';
                    let align = 'items-center justify-start text-left pl-10 pr-6';
                    if (pos === 'center') align = 'items-center justify-center text-center px-6';
                    if (pos === 'right') align = 'items-center justify-end text-right pr-10 pl-6';

                    return (
                      <>
                        <img
                          src={previewSlide.image_url}
                          alt={previewSlide.title}
                          className="w-full h-full object-cover object-center"
                        />
                        <div
                          className={`absolute inset-0 ${
                            pos === 'left'
                              ? 'bg-gradient-to-r from-black/40 via-black/15 to-transparent'
                              : pos === 'right'
                              ? 'bg-gradient-to-l from-black/40 via-black/15 to-transparent'
                              : 'bg-black/20'
                          }`}
                        />
                        {pos !== 'none' && (
                          <div className={`absolute inset-0 flex ${align}`}>
                            <div className="max-w-xl flex flex-col gap-1">
                              {previewSlide.title && (
                                <h2
                                  className="font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none drop-shadow-md"
                                  style={{ color: previewSlide.title_color || '#FFFFFF' }}
                                >
                                  {previewSlide.title}
                                </h2>
                              )}
                              {previewSlide.subtitle && (
                                <h3
                                  className="font-black text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none drop-shadow-md"
                                  style={{ color: previewSlide.subtitle_color || '#111827' }}
                                >
                                  {previewSlide.subtitle}
                                </h3>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {promoShowDots && effectivePromoBanners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-sm">
                      {effectivePromoBanners.map((_, i) => (
                        <span
                          key={i}
                          className={`h-2 rounded-full ${i === 0 ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <span className="text-3xl">🖼️</span>
                  <span className="text-xs font-semibold">No promo slides uploaded yet. Click "+ Add Promo Slide" above.</span>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Slides Management List */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>📑</span>
                <span>Uploaded Promo Slides ({effectivePromoBanners.length})</span>
              </h3>
              <p className="text-xs text-gray-500">
                Drag or use arrows to change order. If multiple slides are active, they will rotate automatically.
              </p>
            </div>

            {effectivePromoBanners.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-gray-200 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-orange-50 text-[#D26900] flex items-center justify-center mx-auto text-xl">
                  🎁
                </div>
                <h4 className="text-sm font-bold text-gray-900">No Promo Slides Yet</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Add your first promotional banner slide with custom text, colors, and high-res image.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPromoId(null);
                    setIsEditingPromo(false);
                    setPromoFormData(emptyPromoBannerForm);
                    setIsPromoModalOpen(true);
                  }}
                  className="px-5 py-2 bg-[#D26900] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#B45309] transition cursor-pointer"
                >
                  + Add First Slide
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {effectivePromoBanners.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="p-4 rounded-xl border border-gray-200/80 hover:border-gray-300 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Order and Move Buttons */}
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handlePromoMoveUp(idx)}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                        >
                          ▲
                        </button>
                        <span className="text-[10px] font-bold text-gray-500">#{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handlePromoMoveDown(idx)}
                          disabled={idx === effectivePromoBanners.length - 1}
                          title="Move Down"
                          className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="w-28 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50 relative">
                        <img
                          src={slide.image_url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details & Color Badges */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-gray-900 truncate">
                            {slide.title || 'Untitled Line 1'}
                          </span>
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs shrink-0"
                            style={{ backgroundColor: slide.title_color || '#FFFFFF' }}
                            title={`Top text color: ${slide.title_color}`}
                          />
                          <span className="text-gray-300">/</span>
                          <span className="text-xs font-extrabold text-gray-700 truncate">
                            {slide.subtitle || 'Untitled Line 2'}
                          </span>
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs shrink-0"
                            style={{ backgroundColor: slide.subtitle_color || '#111827' }}
                            title={`Bottom text color: ${slide.subtitle_color}`}
                          />
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold uppercase text-[10px]">
                            Position: {slide.text_position || 'left'}
                          </span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#D26900] font-bold text-[10px]">
                            Slide #{idx + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit, Delete (Toggle removed as requested) */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPromoId(slide.id);
                          setIsEditingPromo(true);
                          setPromoFormData({
                            title: slide.title || '',
                            subtitle: slide.subtitle || '',
                            title_color: slide.title_color || '#FFFFFF',
                            subtitle_color: slide.subtitle_color || '#111827',
                            text_position: slide.text_position || 'left',
                            font_size: slide.font_size || 'medium',
                            image_url: slide.image_url || '',
                            is_active: true,
                          });
                          setIsPromoModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:text-black transition cursor-pointer"
                      >
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletePromoConfirm({ isOpen: true, id: slide.id, title: slide.title || 'Promo Slide' })}
                        className="p-1.5 rounded-lg border border-red-200 hover:border-red-300 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                        title="Delete Slide"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'custom-cards' ? (
        <AdminCustomCardsTab
          targetSectionId={editingSectionId || undefined}
          onJumpToLayout={() => setActiveTab('layout')}
        />
      ) : null}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden my-8 flex flex-col max-h-[92vh] relative"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D26900] via-[#E65100] to-[#B45309]" />

              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center font-bold text-lg shadow-2xs">
                    <svg className="w-5 h-5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900 leading-tight">
                        {isEditing ? 'Edit Home Hero Banner' : 'Create New Home Hero Banner'}
                      </h3>
                      {activeHeroSection && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          {activeHeroSection.custom_label || 'Hero Banner'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Configure high-res media, click redirect destination, and overlay styling.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveBanner} className="p-5 overflow-y-auto space-y-6 flex-1">
                {/* 1. Media Upload (Image or Video) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Banner Visual Media</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">
                      Supports JPG, PNG, WebP & MP4, WebM (Max 50MB)
                    </span>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/mov"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {/* Media Preview / Dropzone */}
                  {formData.media_url ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-neutral-900 h-52 group">
                      {formData.media_type === 'video' ? (
                        <video
                          src={formData.media_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={formData.media_url}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold shadow hover:bg-gray-100 cursor-pointer"
                        >
                          Change Media
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, media_url: '' }))}
                          className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow hover:bg-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white uppercase backdrop-blur-2xs">
                        {formData.media_type}
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-[#D26900] bg-gray-50/70 hover:bg-[#FFF7ED]/30 rounded-xl p-8 text-center cursor-pointer transition-all"
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs font-bold text-gray-700">Uploading Media to Cloud Storage...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center shadow-2xs">
                            <svg className="w-6 h-6 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">
                              Click to Upload Image or Video
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Recommended resolution: 1920x800 for optimal desktop & mobile display
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Or Manual URL Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium shrink-0">Or Media URL:</span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or cloud video URL"
                      value={formData.media_url}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isVid = /\.(mp4|webm|mov)(\?.*)?$/i.test(val);
                        setFormData((p) => ({
                          ...p,
                          media_url: val,
                          media_type: isVid ? 'video' : 'image',
                        }));
                      }}
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 font-mono focus:border-[#D26900] outline-none"
                    />
                  </div>
                </div>

                {/* 2. Destination Redirect Link Selector (CTA Branded Tabs & Dropdowns) */}
                <div className="space-y-3.5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Click Redirect Destination</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#D26900] font-semibold">
                      Where the user goes when clicking banner
                    </span>
                  </div>

                  {/* Destination Option Tabs styled like website CTA */}
                  <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-neutral-100/80 rounded-2xl border border-gray-200/80">
                    <button
                      type="button"
                      onClick={() => handleLinkTypeChange('header')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${formData.link_type === 'header'
                          ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-md shadow-[#D26900]/25 scale-[1.01]'
                          : 'bg-white text-gray-700 hover:text-[#D26900] hover:bg-orange-50/50 border border-gray-200/70 shadow-2xs'
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${formData.link_type === 'header'
                            ? 'bg-white/20 text-white'
                            : 'bg-orange-50 text-[#D26900]'
                          }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <span>Header Category</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLinkTypeChange('dropdown')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${formData.link_type === 'dropdown'
                          ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-md shadow-[#D26900]/25 scale-[1.01]'
                          : 'bg-white text-gray-700 hover:text-[#D26900] hover:bg-orange-50/50 border border-gray-200/70 shadow-2xs'
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${formData.link_type === 'dropdown'
                            ? 'bg-white/20 text-white'
                            : 'bg-orange-50 text-[#D26900]'
                          }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span>Dropdown Sub-Item</span>
                    </button>
                  </div>

                  {/* Dropdown 1: Header Category Selection with Custom Compact Dropdown */}
                  {formData.link_type === 'header' && (
                    <div className="space-y-1.5 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/20 p-3 rounded-xl border border-orange-200/70">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-800 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#D26900]" />
                          <span>Select Top Header Category:</span>
                        </label>
                        <span className="text-[10px] font-bold text-[#D26900] bg-orange-100/70 px-2 py-0.5 rounded-md border border-orange-200/80">
                          {adminItems.length} Categories Available
                        </span>
                      </div>

                      {/* Custom Compact Dropdown */}
                      <div className="relative" ref={openDropdown === 'header' ? dropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setOpenDropdown((prev) => (prev === 'header' ? null : 'header'))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white hover:bg-orange-50/20 border border-orange-200/90 hover:border-[#D26900] focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                              </svg>
                            </div>
                            <span className="truncate">
                              {adminItems.find((h) => h.id === formData.target_header_id)?.title || 'Select Header Category'}
                            </span>
                            {formData.target_header_id && (
                              <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                                {adminItems.find((h) => h.id === formData.target_header_id)?.path}
                              </span>
                            )}
                          </div>
                          <svg
                            className={`w-4 h-4 text-[#D26900] shrink-0 transition-transform duration-200 ${openDropdown === 'header' ? 'rotate-180' : ''
                              }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Custom Dropdown Menu */}
                        {openDropdown === 'header' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            {adminItems.length > 5 && (
                              <div className="p-2 border-b border-gray-100 bg-gray-50/70 sticky top-0 z-10">
                                <input
                                  type="text"
                                  placeholder="Search categories..."
                                  value={headerSearch}
                                  onChange={(e) => setHeaderSearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                                  autoFocus
                                />
                              </div>
                            )}
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredHeaders.map((h) => {
                                const isSelected = formData.target_header_id === h.id;
                                return (
                                  <div
                                    key={h.id}
                                    onClick={() => {
                                      handleHeaderSelect(h.id);
                                      setOpenDropdown(null);
                                      setHeaderSearch('');
                                    }}
                                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                        ? 'bg-orange-50 text-[#D26900] font-bold'
                                        : 'text-gray-700 hover:bg-orange-50/60 hover:text-[#D26900]'
                                      }`}
                                  >
                                    <span className="truncate">{h.title}</span>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                      <span className="font-mono text-[10px] text-gray-400">{h.path}</span>
                                      {isSelected && (
                                        <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dropdown 2: Sub-Category Dropdown Item Selection with Custom Compact Dropdown */}
                  {formData.link_type === 'dropdown' && (
                    <div className="space-y-1.5 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/20 p-3 rounded-xl border border-orange-200/70">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-800 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#D26900]" />
                          <span>Select Sub-Category Dropdown Item:</span>
                        </label>
                        <span className="text-[10px] font-bold text-[#D26900] bg-orange-100/70 px-2 py-0.5 rounded-md border border-orange-200/80">
                          {allDropdownOptions.length} Sub-Items Available
                        </span>
                      </div>

                      {/* Custom Compact Dropdown */}
                      <div className="relative" ref={openDropdown === 'subitem' ? dropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setOpenDropdown((prev) => (prev === 'subitem' ? null : 'subitem'))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white hover:bg-orange-50/20 border border-orange-200/90 hover:border-[#D26900] focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                            <div className="truncate text-left">
                              {(() => {
                                const selected = allDropdownOptions.find((d) => d.id === formData.target_dropdown_id);
                                if (selected) {
                                  return (
                                    <span>
                                      <span className="text-gray-400 font-normal mr-1">{selected.headerTitle} ›</span>
                                      <span>{selected.title}</span>
                                    </span>
                                  );
                                }
                                return <span>Select Sub-Category Item</span>;
                              })()}
                            </div>
                            {formData.target_dropdown_id && (
                              <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline-block">
                                {allDropdownOptions.find((d) => d.id === formData.target_dropdown_id)?.path}
                              </span>
                            )}
                          </div>
                          <svg
                            className={`w-4 h-4 text-[#D26900] shrink-0 transition-transform duration-200 ${openDropdown === 'subitem' ? 'rotate-180' : ''
                              }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Custom Dropdown Menu with Mini Search & Max-Height */}
                        {openDropdown === 'subitem' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70 sticky top-0 z-10">
                              <input
                                type="text"
                                placeholder="Filter 26 sub-categories..."
                                value={subitemSearch}
                                onChange={(e) => setSubitemSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                                autoFocus
                              />
                            </div>

                            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                              {filteredSubitems.length === 0 ? (
                                <div className="p-3 text-center text-xs text-gray-400">No matching sub-items found</div>
                              ) : (
                                filteredSubitems.map((d) => {
                                  const isSelected = formData.target_dropdown_id === d.id;
                                  return (
                                    <div
                                      key={d.id}
                                      onClick={() => {
                                        handleDropdownSelect(d.id);
                                        setOpenDropdown(null);
                                        setSubitemSearch('');
                                      }}
                                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                          ? 'bg-orange-50 text-[#D26900] font-bold'
                                          : 'text-gray-700 hover:bg-orange-50/60 hover:text-[#D26900]'
                                        }`}
                                    >
                                      <div className="truncate">
                                        <span className="text-gray-400 font-normal mr-1">{d.headerTitle} ›</span>
                                        <span>{d.title}</span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="font-mono text-[10px] text-gray-400">{d.path}</span>
                                        {isSelected && (
                                          <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Destination preview indicator with CTA styling */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-orange-50/80 border border-orange-200/90 flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-[#D26900]/10 text-[#D26900] flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <span className="text-gray-600 font-semibold truncate">Target Navigation URL:</span>
                    </div>
                    <span className="font-mono font-bold text-[#D26900] bg-white px-2.5 py-1 rounded-lg border border-orange-200/80 shadow-2xs truncate max-w-xs">
                      {formData.link_url || '/'}
                    </span>
                  </div>
                </div>

                {/* 3. Text & CTA Overlay Settings (Zouk Style) */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                        Text & Button Overlay (Zouk Style)
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Display headline text and clickable CTA button on top of the banner
                      </span>
                    </div>

                    {/* Smooth Modern iOS Toggle Button */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-bold text-gray-700">
                        {formData.show_overlay ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formData.show_overlay}
                        onClick={() =>
                          setFormData((p) => ({ ...p, show_overlay: !p.show_overlay }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.show_overlay ? 'bg-[#D26900]' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${formData.show_overlay ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {formData.show_overlay && (
                    <div className="space-y-4 bg-gray-50/80 p-4 rounded-xl border border-gray-200/80">
                      {/* Headline Title */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Headline Title:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Your work-to-wherever satchel."
                          value={formData.title}
                          onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                          style={{ fontFamily: formData.font_family ? `"${formData.font_family}", sans-serif` : undefined }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white font-medium focus:border-[#D26900] outline-none"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Subtitle (Optional):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Handcrafted luxury backpacks & bags for your journey."
                          value={formData.subtitle}
                          onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))}
                          style={{ fontFamily: formData.font_family ? `"${formData.font_family}", sans-serif` : undefined }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:border-[#D26900] outline-none"
                        />
                      </div>

                      {/* Button Label & Text Alignment */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Button CTA Label:
                          </label>
                          <input
                            type="text"
                            placeholder="SHOP NOW"
                            value={formData.button_text}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, button_text: e.target.value }))
                            }
                            style={{ fontFamily: formData.font_family ? `"${formData.font_family}", sans-serif` : undefined }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white font-bold uppercase focus:border-[#D26900] outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Text Alignment:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-200/70 rounded-lg">
                            {(['left', 'center', 'right'] as const).map((pos) => (
                              <button
                                key={pos}
                                type="button"
                                onClick={() => setFormData((p) => ({ ...p, overlay_position: pos }))}
                                className={`py-1 text-xs font-semibold capitalize rounded transition cursor-pointer ${formData.overlay_position === pos
                                    ? 'bg-white text-[#D26900] shadow-2xs font-bold'
                                    : 'text-gray-600'
                                  }`}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Text Font Style (Typography) Custom Dropdown - 20 Curated Google Fonts */}
                      <div className="space-y-1.5 pt-1 border-t border-gray-200/70">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#D26900]" />
                            <span>Text Font Style (Typography):</span>
                          </label>
                          <span className="text-[10px] font-bold text-[#D26900] bg-orange-100/70 px-2 py-0.5 rounded-md border border-orange-200/80">
                            20 Font Styles Available
                          </span>
                        </div>

                        <div className="relative" ref={openDropdown === 'font' ? dropdownRef : undefined}>
                          <button
                            type="button"
                            onClick={() => setOpenDropdown((prev) => (prev === 'font' ? null : 'font'))}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white hover:bg-orange-50/20 border border-orange-200/90 hover:border-[#D26900] focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 rounded-xl transition cursor-pointer shadow-2xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center shrink-0 font-serif font-black text-xs">
                                F
                              </div>
                              <span className="font-bold text-gray-900">{formData.font_family || 'Inter'}</span>
                              <span
                                style={{ fontFamily: `"${formData.font_family || 'Inter'}", sans-serif` }}
                                className="text-xs text-[#D26900] font-medium truncate ml-1 hidden sm:inline-block"
                              >
                                — Live Preview: {formData.title || 'Your satchel & bags'}
                              </span>
                            </div>
                            <svg
                              className={`w-4 h-4 text-[#D26900] shrink-0 transition-transform duration-200 ${openDropdown === 'font' ? 'rotate-180' : ''
                                }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Font Styles Menu (20 Options with live font rendering & mini search) */}
                          {openDropdown === 'font' && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                              <div className="p-2 border-b border-gray-100 bg-gray-50/70 sticky top-0 z-10">
                                <input
                                  type="text"
                                  placeholder="Search 20 fonts (e.g. Playfair, Poppins, Script)..."
                                  value={fontSearch}
                                  onChange={(e) => setFontSearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                                  autoFocus
                                />
                              </div>

                              <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                                {filteredFonts.map((f) => {
                                  const isSelected = (formData.font_family || 'Inter') === f.name;
                                  return (
                                    <div
                                      key={f.name}
                                      onClick={() => {
                                        setFormData((p) => ({ ...p, font_family: f.name }));
                                        setOpenDropdown(null);
                                        setFontSearch('');
                                      }}
                                      className={`px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                          ? 'bg-orange-50 text-[#D26900] font-bold'
                                          : 'text-gray-800 hover:bg-orange-50/60 hover:text-[#D26900]'
                                        }`}
                                    >
                                      <div className="flex flex-col min-w-0 pr-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-xs">{f.label}</span>
                                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500 font-sans font-medium">
                                            {f.category}
                                          </span>
                                        </div>
                                        <span
                                          style={{ fontFamily: `"${f.name}", sans-serif` }}
                                          className="text-sm text-gray-600 mt-0.5 truncate"
                                        >
                                          {f.preview}
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <svg
                                          className="w-4 h-4 text-[#D26900] shrink-0 ml-2"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Overlay Colors Customization with Website CTA Brand Styling */}
                      <div className="pt-3.5 border-t border-gray-200">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center shadow-2xs shrink-0">
                            <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                              Text & Button Colors
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              Match typography and CTA button colors with your brand
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* 1. Title Color */}
                          <div className="bg-white p-3 rounded-xl border border-gray-200/90 shadow-2xs hover:border-orange-300 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-orange-50 text-[#D26900] flex items-center justify-center shrink-0 border border-orange-200/70 font-black text-[10px]">
                                H
                              </div>
                              <span className="text-xs font-bold text-gray-800">
                                Headline Text Color
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative w-9 h-9 rounded-xl border-2 border-gray-200 overflow-hidden shadow-2xs cursor-pointer shrink-0">
                                <input
                                  type="color"
                                  value={formData.title_color}
                                  onChange={(e) =>
                                    setFormData((p) => ({ ...p, title_color: e.target.value }))
                                  }
                                  className="absolute -inset-2 w-14 h-14 cursor-pointer border-0"
                                />
                              </div>
                              <input
                                type="text"
                                value={formData.title_color}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, title_color: e.target.value }))
                                }
                                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/10 outline-none uppercase bg-gray-50/50"
                              />
                            </div>
                          </div>

                          {/* 2. Subtitle Color */}
                          <div className="bg-white p-3 rounded-xl border border-gray-200/90 shadow-2xs hover:border-orange-300 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-orange-50 text-[#D26900] flex items-center justify-center shrink-0 border border-orange-200/70">
                                <svg className="w-3 h-3 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10" />
                                </svg>
                              </div>
                              <span className="text-xs font-bold text-gray-800">
                                Subtitle Text Color
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative w-9 h-9 rounded-xl border-2 border-gray-200 overflow-hidden shadow-2xs cursor-pointer shrink-0">
                                <input
                                  type="color"
                                  value={formData.subtitle_color}
                                  onChange={(e) =>
                                    setFormData((p) => ({ ...p, subtitle_color: e.target.value }))
                                  }
                                  className="absolute -inset-2 w-14 h-14 cursor-pointer border-0"
                                />
                              </div>
                              <input
                                type="text"
                                value={formData.subtitle_color}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, subtitle_color: e.target.value }))
                                }
                                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/10 outline-none uppercase bg-gray-50/50"
                              />
                            </div>
                          </div>

                          {/* 3. Button Background Color */}
                          <div className="bg-white p-3 rounded-xl border border-gray-200/90 shadow-2xs hover:border-orange-300 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-orange-50 text-[#D26900] flex items-center justify-center shrink-0 border border-orange-200/70">
                                <svg className="w-3 h-3 text-[#D26900]" fill="currentColor" viewBox="0 0 20 20">
                                  <rect x="2" y="5" width="16" height="10" rx="3" />
                                </svg>
                              </div>
                              <span className="text-xs font-bold text-gray-800">
                                Button Background Color
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative w-9 h-9 rounded-xl border-2 border-gray-200 overflow-hidden shadow-2xs cursor-pointer shrink-0">
                                <input
                                  type="color"
                                  value={formData.button_bg_color}
                                  onChange={(e) =>
                                    setFormData((p) => ({ ...p, button_bg_color: e.target.value }))
                                  }
                                  className="absolute -inset-2 w-14 h-14 cursor-pointer border-0"
                                />
                              </div>
                              <input
                                type="text"
                                value={formData.button_bg_color}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, button_bg_color: e.target.value }))
                                }
                                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/10 outline-none uppercase bg-gray-50/50"
                              />
                            </div>
                          </div>

                          {/* 4. Button Text Color */}
                          <div className="bg-white p-3 rounded-xl border border-gray-200/90 shadow-2xs hover:border-orange-300 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-orange-50 text-[#D26900] flex items-center justify-center shrink-0 border border-orange-200/70">
                                <svg className="w-3 h-3 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </div>
                              <span className="text-xs font-bold text-gray-800">
                                Button Text Color
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative w-9 h-9 rounded-xl border-2 border-gray-200 overflow-hidden shadow-2xs cursor-pointer shrink-0">
                                <input
                                  type="color"
                                  value={formData.button_text_color}
                                  onChange={(e) =>
                                    setFormData((p) => ({ ...p, button_text_color: e.target.value }))
                                  }
                                  className="absolute -inset-2 w-14 h-14 cursor-pointer border-0"
                                />
                              </div>
                              <input
                                type="text"
                                value={formData.button_text_color}
                                onChange={(e) =>
                                  setFormData((p) => ({ ...p, button_text_color: e.target.value }))
                                }
                                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/10 outline-none uppercase bg-gray-50/50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Active Checkbox */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Banner Active Status</span>
                    <span className="text-[11px] text-gray-500">
                      When enabled, this banner will automatically show in the home hero carousel.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-5 h-5 rounded text-[#D26900] accent-[#D26900] cursor-pointer"
                  />
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? 'Saving Banner...'
                      : isEditing
                        ? 'Save Changes'
                        : 'Create Banner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (Centered AdminConfirmModal with CTA Theme) */}
      <AdminConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, bannerId: '', bannerTitle: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Home Hero Banner?"
        message="Are you sure you want to permanently delete this banner from the home carousel and cloud storage?"
        itemName={deleteConfirm.bannerTitle}
        warningNote="This action cannot be undone and will remove the banner from customer display."
        confirmText="Yes, Delete Banner"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Sub-Banner / Quick Category Add & Edit Modal */}
      <AnimatePresence>
        {isSubModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden my-8 flex flex-col max-h-[92vh] relative"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D26900] via-[#E65100] to-[#B45309]" />

              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center font-bold text-lg shadow-2xs">
                    <svg className="w-5 h-5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {isEditingSub ? 'Edit Quick Category Item' : 'Add New Quick Category Item'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Icon, label, redirection link, and custom hover background disc color.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSubSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
                {/* 1. Category Name / Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Category Name / Title</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">e.g. Same Day, Flowers, Cakes, Bags</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter category name..."
                    value={subFormData.title}
                    onChange={(e) => setSubFormData((p) => ({ ...p, title: e.target.value }))}
                    className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 font-medium text-gray-800 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 outline-none"
                  />
                </div>

                {/* 2. Visual Icon / Image Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Category Icon / Image</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">PNG / WebP / SVG recommended</span>
                  </div>

                  <input
                    ref={subFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadSubFile}
                  />

                  {/* Upload button or current preview */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50/70 border border-gray-200 rounded-2xl">
                    {/* Live Icon Box with Hover Color preview */}
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 border border-gray-200 shadow-2xs transition-all duration-300"
                      style={{ backgroundColor: subFormData.hover_bg_color || '#FFF7ED' }}
                    >
                      {subFormData.image_url ? (
                        <img
                          src={subFormData.image_url}
                          alt={subFormData.title || 'Preview'}
                          className="w-10 h-10 object-contain drop-shadow-xs"
                        />
                      ) : (
                        <span className="text-2xl">🧸</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => subFileInputRef.current?.click()}
                        disabled={isUploadingSub}
                        className="px-3.5 py-2 bg-white hover:bg-orange-50 border border-gray-300 hover:border-[#D26900] text-gray-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingSub ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <span>Uploading Icon...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>{subFormData.image_url ? 'Replace Image' : 'Upload Category Image'}</span>
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-gray-400 truncate">
                        {subFormData.image_url || 'No file selected yet'}
                      </p>
                    </div>
                  </div>

                  {/* Manual URL input fallback */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium shrink-0">Or Image URL:</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={subFormData.image_url}
                      onChange={(e) => setSubFormData((p) => ({ ...p, image_url: e.target.value }))}
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 font-mono text-gray-700 focus:border-[#D26900] outline-none"
                    />
                  </div>
                </div>

                {/* 3. Click Redirection Destination */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Click Redirect Destination</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#D26900] font-semibold">
                      Where the user goes on click
                    </span>
                  </div>

                  {/* Type Tabs: Header Category, Dropdown Sub-Item */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleSubLinkTypeChange('header')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                        subFormData.link_type === 'header'
                          ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:text-[#D26900]'
                      }`}
                    >
                      Header Category
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubLinkTypeChange('dropdown')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                        subFormData.link_type === 'dropdown'
                          ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:text-[#D26900]'
                      }`}
                    >
                      Dropdown Item
                    </button>
                  </div>

                  {/* Selection based on link_type */}
                  {subFormData.link_type === 'header' && (
                    <div className="space-y-1.5 bg-orange-50/30 p-3 rounded-xl border border-orange-200/70">
                      <label className="text-xs text-gray-800 font-bold block">
                        Select Top Header Category:
                      </label>
                      <div className="relative" ref={subOpenDropdown === 'header' ? subDropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setSubOpenDropdown((p) => (p === 'header' ? null : 'header'))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-orange-200 rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          <span className="truncate">
                            {adminItems.find((h) => h.id === subFormData.target_header_id)?.title || 'Select Category'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {adminItems.find((h) => h.id === subFormData.target_header_id)?.path}
                          </span>
                        </button>

                        {subOpenDropdown === 'header' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                              <input
                                type="text"
                                placeholder="Search header categories..."
                                value={subHeaderSearch}
                                onChange={(e) => setSubHeaderSearch(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredSubHeaders.map((h) => (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => {
                                    setSubFormData((p) => ({
                                      ...p,
                                      target_header_id: h.id,
                                      link_url: h.path,
                                    }));
                                    setSubOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <span className="font-bold text-gray-800">{h.title}</span>
                                  <span className="text-[10px] font-mono text-gray-400">{h.path}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {subFormData.link_type === 'dropdown' && (
                    <div className="space-y-1.5 bg-orange-50/30 p-3 rounded-xl border border-orange-200/70">
                      <label className="text-xs text-gray-800 font-bold block">
                        Select Dropdown Sub-Item:
                      </label>
                      <div className="relative" ref={subOpenDropdown === 'subitem' ? subDropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setSubOpenDropdown((p) => (p === 'subitem' ? null : 'subitem'))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-orange-200 rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          <span className="truncate">
                            {allDropdownOptions.find((d) => d.id === subFormData.target_dropdown_id)?.title || 'Select Dropdown Sub-Item'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {allDropdownOptions.find((d) => d.id === subFormData.target_dropdown_id)?.path}
                          </span>
                        </button>

                        {subOpenDropdown === 'subitem' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                              <input
                                type="text"
                                placeholder="Search sub-items..."
                                value={subItemSearch}
                                onChange={(e) => setSubItemSearch(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredSubDropdowns.map((d) => (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => {
                                    setSubFormData((p) => ({
                                      ...p,
                                      target_dropdown_id: d.id,
                                      link_url: d.path,
                                    }));
                                    setSubOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="font-bold text-gray-800 block">{d.title}</span>
                                    <span className="text-[10px] text-gray-400">{d.headerTitle}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-400">{d.path}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* 4. Hover Background Disc Color (User's Image 2 requirement!) */}
                <div className="space-y-2.5 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Hover Background Disc Color</span>
                    </label>
                    <span className="text-[11px] text-gray-400">
                      Circular background color appearing on hover (Image 2)
                    </span>
                  </div>

                  {/* Preset Color Swatches */}
                  <div className="grid grid-cols-4 gap-2">
                    {HOVER_BG_PRESETS.map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setSubFormData((p) => ({ ...p, hover_bg_color: preset.color }))}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          subFormData.hover_bg_color.toLowerCase() === preset.color.toLowerCase()
                            ? 'border-[#D26900] ring-2 ring-[#D26900]/20 bg-orange-50/30'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-[10px] font-bold text-gray-700 truncate">
                          {preset.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex Picker */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <div className="relative w-9 h-9 rounded-xl border-2 border-gray-300 overflow-hidden shadow-2xs cursor-pointer shrink-0">
                      <input
                        type="color"
                        value={subFormData.hover_bg_color}
                        onChange={(e) => setSubFormData((p) => ({ ...p, hover_bg_color: e.target.value }))}
                        className="absolute -inset-2 w-14 h-14 cursor-pointer border-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-gray-600 block">Custom Hex Color:</span>
                      <input
                        type="text"
                        value={subFormData.hover_bg_color}
                        onChange={(e) => setSubFormData((p) => ({ ...p, hover_bg_color: e.target.value }))}
                        className="w-full text-xs font-mono font-bold uppercase border border-gray-200 rounded-lg px-2.5 py-1 bg-white focus:border-[#D26900] outline-none"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Current Disc</span>
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300 mx-auto shadow-2xs"
                        style={{ backgroundColor: subFormData.hover_bg_color || '#FFF7ED' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Active Status Toggle */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Category Active Status</span>
                    <span className="text-[11px] text-gray-500">
                      When enabled, this category item will display in the quick category strip.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={subFormData.is_active}
                    onChange={(e) => setSubFormData((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-5 h-5 rounded text-[#D26900] accent-[#D26900] cursor-pointer"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsSubModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSub || isUploadingSub}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingSub
                      ? 'Saving Category...'
                      : isEditingSub
                        ? 'Save Changes'
                        : 'Create Category Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (Sub-Banner) */}
      <AdminConfirmModal
        isOpen={deleteSubConfirm.isOpen}
        onClose={() => setDeleteSubConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={handleConfirmDeleteSub}
        title="Delete Quick Category Item?"
        message="Are you sure you want to permanently delete this category item from the sub-banner strip?"
        itemName={deleteSubConfirm.title}
        warningNote="This action cannot be undone and will remove the item from customer display."
        confirmText="Yes, Delete Category"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingSub}
      />

      {/* Occasions Add & Edit Modal */}
      <AnimatePresence>
        {isOccasionModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden my-8 flex flex-col max-h-[92vh] relative"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D26900] via-[#E65100] to-[#B45309]" />

              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center font-bold text-lg shadow-2xs">
                    <svg className="w-5 h-5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {isEditingOccasion ? 'Edit Occasion Card' : 'Add New Occasion Card'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Title, optional date badge, optional image, link destination, and pastel background.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOccasionModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleOccasionSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
                {/* Live Card Preview Box */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Card Visual Preview
                  </label>
                  <div
                    className="relative w-full h-36 rounded-2xl p-4 flex flex-col justify-between overflow-hidden border border-white/60 shadow-md transition-all"
                    style={{ backgroundColor: occasionFormData.bg_color || '#F9D3B4' }}
                  >
                    <div className="relative z-10 flex items-start justify-between gap-2 w-full">
                      <span className="font-bold text-gray-900 text-base">
                        {occasionFormData.title || 'Occasion Name'} ›
                      </span>
                      {occasionFormData.date_badge.trim() ? (
                        <span className="px-2 py-0.5 bg-white text-gray-800 text-[10px] font-extrabold uppercase rounded shadow-xs">
                          {occasionFormData.date_badge.trim()}
                        </span>
                      ) : null}
                    </div>

                    {occasionFormData.image_url ? (
                      (() => {
                        const pos = occasionFormData.image_position || 'bottom-right';
                        const scale = Number(occasionFormData.image_scale) || 1.0;
                        let posClass = 'bottom-0 right-2 justify-end items-end';
                        let origin = 'bottom right';
                        if (pos === 'bottom-center') {
                          posClass = 'bottom-0 left-1/2 -translate-x-1/2 justify-center items-end';
                          origin = 'bottom center';
                        } else if (pos === 'center-right') {
                          posClass = 'top-1/2 -translate-y-1/2 right-2 justify-end items-center';
                          origin = 'center right';
                        }
                        return (
                          <div className={`absolute ${posClass} h-[85%] max-w-[65%] flex pointer-events-none overflow-visible`}>
                            <img
                              src={occasionFormData.image_url}
                              alt="Card Preview"
                              style={{
                                transform: `scale(${scale})`,
                                transformOrigin: origin,
                              }}
                              className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-150"
                            />
                          </div>
                        );
                      })()
                    ) : (
                      <div className="relative self-end text-black/10 text-xs italic">
                        (No image selected)
                      </div>
                    )}
                  </div>
                </div>

                {/* 1. Occasion Title & Date Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Occasion Title</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Birthday, Boyfriend Day..."
                      value={occasionFormData.title}
                      onChange={(e) => setOccasionFormData((p) => ({ ...p, title: e.target.value }))}
                      className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 font-medium text-gray-800 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Date Badge (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3RD OCT, TODAY..."
                      value={occasionFormData.date_badge}
                      onChange={(e) => setOccasionFormData((p) => ({ ...p, date_badge: e.target.value }))}
                      className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 font-medium text-gray-800 focus:border-[#D26900] focus:ring-2 focus:ring-[#D26900]/15 outline-none"
                    />
                  </div>
                </div>

                {/* 2. Visual Card Image (Optional, with Cloudflare R2 automatic deletion) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Card Image (Optional)</span>
                    </label>
                    <span className="text-[11px] text-gray-400">Can leave empty or upload PNG/WebP</span>
                  </div>

                  <input
                    ref={occasionFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadOccasionFile}
                  />

                  {/* Upload button or current preview */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50/70 border border-gray-200 rounded-2xl">
                    <div
                      className="relative w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border border-gray-200 shadow-2xs overflow-hidden"
                      style={{ backgroundColor: occasionFormData.bg_color || '#F9D3B4' }}
                    >
                      {occasionFormData.image_url ? (
                        <img
                          src={occasionFormData.image_url}
                          alt="Preview"
                          className="w-12 h-12 object-contain drop-shadow-xs"
                        />
                      ) : (
                        <span className="text-2xl">🎁</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => occasionFileInputRef.current?.click()}
                          disabled={isUploadingOccasion}
                          className="px-3.5 py-2 bg-white hover:bg-orange-50 border border-gray-300 hover:border-[#D26900] text-gray-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isUploadingOccasion ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              <span>Uploading to Cloud...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span>{occasionFormData.image_url ? 'Replace Image' : 'Upload Card Image'}</span>
                            </>
                          )}
                        </button>

                        {occasionFormData.image_url && (
                          <button
                            type="button"
                            onClick={() => setOccasionFormData((p) => ({ ...p, image_url: '' }))}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition cursor-pointer"
                            title="Remove image from card"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">
                        {occasionFormData.image_url || 'No image attached — text-only card will be used'}
                      </p>
                    </div>
                  </div>

                  {/* Manual URL input fallback */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium shrink-0">Or Image URL:</span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or cloud image URL"
                      value={occasionFormData.image_url}
                      onChange={(e) => setOccasionFormData((p) => ({ ...p, image_url: e.target.value }))}
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 font-mono text-gray-700 focus:border-[#D26900] outline-none"
                    />
                  </div>

                  {/* Image Zoom & Card Arrangement Control (Only visible when image is attached) */}
                  {occasionFormData.image_url && (
                    <div className="p-4 bg-orange-50/40 border border-orange-200/80 rounded-2xl space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Card Image Zoom & Size (Arrange)
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#D26900] text-white shadow-2xs">
                          {Math.round((occasionFormData.image_scale || 1.0) * 100)}% Zoom
                        </span>
                      </div>

                      {/* Slider & Quick +/- Steppers */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setOccasionFormData((p) => ({
                              ...p,
                              image_scale: Math.max(0.5, Math.round(((p.image_scale || 1.0) - 0.1) * 100) / 100),
                            }))
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:border-[#D26900] text-gray-700 font-black text-sm flex items-center justify-center shadow-2xs hover:bg-orange-50 transition cursor-pointer"
                          title="Zoom Out (-10%)"
                        >
                          −
                        </button>

                        <div className="flex-1 relative flex items-center">
                          <input
                            type="range"
                            min="0.5"
                            max="2.5"
                            step="0.05"
                            value={occasionFormData.image_scale || 1.0}
                            onChange={(e) =>
                              setOccasionFormData((p) => ({
                                ...p,
                                image_scale: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D26900]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setOccasionFormData((p) => ({
                              ...p,
                              image_scale: Math.min(2.5, Math.round(((p.image_scale || 1.0) + 0.1) * 100) / 100),
                            }))
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:border-[#D26900] text-gray-700 font-black text-sm flex items-center justify-center shadow-2xs hover:bg-orange-50 transition cursor-pointer"
                          title="Zoom In (+10%)"
                        >
                          +
                        </button>
                      </div>

                      {/* Preset Pills for fast 1-click arrange */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-semibold text-gray-500 mr-1">Presets:</span>
                        {[
                          { label: '80% (Compact)', val: 0.8 },
                          { label: '100% (Default)', val: 1.0 },
                          { label: '125% (Large)', val: 1.25 },
                          { label: '150% (XL)', val: 1.5 },
                          { label: '180% (Hero Fill)', val: 1.8 },
                          { label: '210% (Max)', val: 2.1 },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() =>
                              setOccasionFormData((p) => ({
                                ...p,
                                image_scale: preset.val,
                              }))
                            }
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              Math.abs((occasionFormData.image_scale || 1.0) - preset.val) < 0.04
                                ? 'bg-[#D26900] text-white shadow-2xs'
                                : 'bg-white hover:bg-orange-50 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Alignment / Position Selector */}
                      <div className="pt-2 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-gray-700">Image Alignment:</span>
                        <div className="flex items-center gap-1.5">
                          {[
                            { id: 'bottom-right', label: 'Bottom Right (Standard)' },
                            { id: 'bottom-center', label: 'Bottom Center' },
                            { id: 'center-right', label: 'Center Right' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() =>
                                setOccasionFormData((p) => ({
                                  ...p,
                                  image_position: pos.id as any,
                                }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                (occasionFormData.image_position || 'bottom-right') === pos.id
                                  ? 'bg-neutral-800 text-white'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Click Redirection Destination (ONLY Header Category or Dropdown Item — NO Custom URL) */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Click Redirect Destination</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#D26900] font-semibold">
                      Where the user goes on click
                    </span>
                  </div>

                  {/* Type Tabs: Header Category, Dropdown Sub-Item ONLY */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleOccasionLinkTypeChange('header')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                        occasionFormData.link_type === 'header'
                          ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:text-[#D26900]'
                      }`}
                    >
                      Header Category
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOccasionLinkTypeChange('dropdown')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                        occasionFormData.link_type === 'dropdown'
                          ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:text-[#D26900]'
                      }`}
                    >
                      Dropdown Item
                    </button>
                  </div>

                  {/* Selection based on link_type */}
                  {occasionFormData.link_type === 'header' && (
                    <div className="space-y-1.5 bg-orange-50/30 p-3 rounded-xl border border-orange-200/70">
                      <label className="text-xs text-gray-800 font-bold block">
                        Select Top Header Category:
                      </label>
                      <div className="relative" ref={occasionOpenDropdown === 'header' ? occasionDropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setOccasionOpenDropdown((p) => (p === 'header' ? null : 'header'))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-orange-200 rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          <span className="truncate">
                            {adminItems.find((h) => h.id === occasionFormData.target_header_id)?.title || 'Select Category'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {adminItems.find((h) => h.id === occasionFormData.target_header_id)?.path}
                          </span>
                        </button>

                        {occasionOpenDropdown === 'header' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                              <input
                                type="text"
                                placeholder="Search header categories..."
                                value={occasionHeaderSearch}
                                onChange={(e) => setOccasionHeaderSearch(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredOccasionHeaders.map((h) => (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => {
                                    setOccasionFormData((p) => ({
                                      ...p,
                                      target_header_id: h.id,
                                      link_url: h.path,
                                    }));
                                    setOccasionOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <span className="font-bold text-gray-800">{h.title}</span>
                                  <span className="text-[10px] font-mono text-gray-400">{h.path}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {occasionFormData.link_type === 'dropdown' && (
                    <div className="space-y-1.5 bg-orange-50/30 p-3 rounded-xl border border-orange-200/70">
                      <label className="text-xs text-gray-800 font-bold block">
                        Select Dropdown Sub-Item:
                      </label>
                      <div className="relative" ref={occasionOpenDropdown === 'subitem' ? occasionDropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setOccasionOpenDropdown((p) => (p === 'subitem' ? null : 'subitem'))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-orange-200 rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          <span className="truncate">
                            {allDropdownOptions.find((d) => d.id === occasionFormData.target_dropdown_id)?.title || 'Select Dropdown Sub-Item'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {allDropdownOptions.find((d) => d.id === occasionFormData.target_dropdown_id)?.path}
                          </span>
                        </button>

                        {occasionOpenDropdown === 'subitem' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                              <input
                                type="text"
                                placeholder="Search sub-items..."
                                value={occasionSubItemSearch}
                                onChange={(e) => setOccasionSubItemSearch(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredOccasionDropdowns.map((d) => (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => {
                                    setOccasionFormData((p) => ({
                                      ...p,
                                      target_dropdown_id: d.id,
                                      link_url: d.path,
                                    }));
                                    setOccasionOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="font-bold text-gray-800 block">{d.title}</span>
                                    <span className="text-[10px] text-gray-400">{d.headerTitle}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-400">{d.path}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Destination preview indicator with CTA styling */}
                  <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/70 flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-semibold truncate">Target Navigation URL:</span>
                    <span className="font-mono font-bold text-[#D26900] bg-white px-2 py-0.5 rounded border border-orange-200/80 truncate max-w-xs">
                      {occasionFormData.link_url || '/'}
                    </span>
                  </div>
                </div>

                {/* 4. Pastel Card Background Color */}
                <div className="space-y-2.5 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Pastel Card Background Color
                    </label>
                    <span className="text-[11px] text-gray-400">
                      Matches reference card color palette
                    </span>
                  </div>

                  {/* Preset Color Swatches */}
                  <div className="grid grid-cols-4 gap-2">
                    {OCCASION_BG_PRESETS.map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setOccasionFormData((p) => ({ ...p, bg_color: preset.color }))}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          occasionFormData.bg_color.toLowerCase() === preset.color.toLowerCase()
                            ? 'border-[#D26900] ring-2 ring-[#D26900]/20 bg-orange-50/30'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-[10px] font-bold text-gray-700 truncate">
                          {preset.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex Picker */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <div className="relative w-9 h-9 rounded-xl border-2 border-gray-300 overflow-hidden shadow-2xs cursor-pointer shrink-0">
                      <input
                        type="color"
                        value={occasionFormData.bg_color}
                        onChange={(e) => setOccasionFormData((p) => ({ ...p, bg_color: e.target.value }))}
                        className="absolute -inset-2 w-14 h-14 cursor-pointer border-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-gray-600 block">Custom Hex Color:</span>
                      <input
                        type="text"
                        value={occasionFormData.bg_color}
                        onChange={(e) => setOccasionFormData((p) => ({ ...p, bg_color: e.target.value }))}
                        className="w-full text-xs font-mono font-bold uppercase border border-gray-200 rounded-lg px-2.5 py-1 bg-white focus:border-[#D26900] outline-none"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Current Color</span>
                      <div
                        className="w-8 h-8 rounded-xl border border-gray-300 mx-auto shadow-2xs"
                        style={{ backgroundColor: occasionFormData.bg_color || '#F9D3B4' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Active Status Toggle */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Occasion Card Status</span>
                    <span className="text-[11px] text-gray-500">
                      When active, this card appears in the Gifts For Every Occasion section.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={occasionFormData.is_active}
                    onChange={(e) => setOccasionFormData((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-5 h-5 rounded text-[#D26900] accent-[#D26900] cursor-pointer"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsOccasionModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOccasion || isUploadingOccasion}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingOccasion
                      ? 'Saving Card...'
                      : isEditingOccasion
                        ? 'Save Changes'
                        : 'Create Occasion Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Promo Banner Slide Modal */}
        {isPromoModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden my-8 flex flex-col max-h-[92vh] relative"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D26900] via-[#E65100] to-[#B45309]" />

              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center font-bold text-lg shadow-2xs">
                    <svg className="w-5 h-5 text-[#D26900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {isEditingPromo ? 'Edit Special Promo Slide' : 'Add Special Promo Slide'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Upload promotional strip image, customize typography colors & alignment. Non-clickable display only.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handlePromoSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
                {/* 1. Media Upload (Image) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Banner Background Image</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">
                      Recommended: 1600x400 or 1920x450 (JPG, PNG, WebP)
                    </span>
                  </div>

                  <input
                    ref={promoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePromoFileChange}
                  />

                  {promoFormData.image_url ? (
                    <div className="space-y-3">
                      {/* Image Preview Container */}
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-neutral-900 h-44 shadow-inner">
                        <img
                          src={promoFormData.image_url}
                          alt="Promo Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        {isUploadingPromo && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-10">
                            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-bold">Uploading new replacement image...</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                          Current Banner Preview
                        </span>
                      </div>

                      {/* Prominent Action Controls: Replace / Upload New & Remove */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => promoFileInputRef.current?.click()}
                          disabled={isUploadingPromo}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#D26900]/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>{isUploadingPromo ? 'Uploading Image...' : '🔄 Replace Image (Upload New)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPromoFormData((p) => ({ ...p, image_url: '' }))}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Direct URL input with helper text */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-500 block">
                          Or update direct image URL (saving will clean up previous file):
                        </span>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={promoFormData.image_url}
                          onChange={(e) => setPromoFormData((p) => ({ ...p, image_url: e.target.value }))}
                          className="w-full text-xs font-mono border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#D26900] bg-gray-50/50"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div
                        onClick={() => promoFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-[#D26900] bg-gray-50/70 hover:bg-[#FFF7ED]/30 rounded-xl p-6 text-center cursor-pointer transition-all"
                      >
                        {isUploadingPromo ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-bold text-gray-700">Uploading Image to Cloud Storage...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-100/80 text-[#D26900] flex items-center justify-center">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-gray-800">
                              Click to Choose & Upload Banner Image
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Supports JPG, PNG, WebP (Recommended: 1600x400)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Direct URL input */}
                      <div>
                        <input
                          type="url"
                          placeholder="Or paste direct image URL (https://...)"
                          value={promoFormData.image_url}
                          onChange={(e) => setPromoFormData((p) => ({ ...p, image_url: e.target.value }))}
                          className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#D26900]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Top Line Heading & Color */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                      Heading Line 1 (e.g. "Joyful Gifts To")
                    </label>
                    <span className="text-[11px] text-gray-400">Leave blank if no line 1 text</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Joyful Gifts To"
                    value={promoFormData.title}
                    onChange={(e) => setPromoFormData((p) => ({ ...p, title: e.target.value }))}
                    className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#D26900]"
                  />

                  {/* Line 1 Color Picker & Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-600 block">Line 1 Text Color:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { name: 'White', color: '#FFFFFF' },
                        { name: 'Charcoal', color: '#111827' },
                        { name: 'Warm Terracotta', color: '#D26900' },
                        { name: 'Gold', color: '#FBBF24' },
                        { name: 'Blush Rose', color: '#FB7185' },
                        { name: 'Emerald', color: '#10B981' },
                        { name: 'Sky Blue', color: '#38BDF8' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => setPromoFormData((p) => ({ ...p, title_color: preset.color }))}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                            promoFormData.title_color.toLowerCase() === preset.color.toLowerCase()
                              ? 'border-[#D26900] bg-orange-50 text-[#D26900] ring-1 ring-[#D26900]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      ))}

                      {/* Custom Color Input */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <input
                          type="color"
                          value={promoFormData.title_color.startsWith('#') ? promoFormData.title_color : '#FFFFFF'}
                          onChange={(e) => setPromoFormData((p) => ({ ...p, title_color: e.target.value }))}
                          className="w-7 h-7 rounded-md border border-gray-200 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={promoFormData.title_color}
                          onChange={(e) => setPromoFormData((p) => ({ ...p, title_color: e.target.value }))}
                          className="w-20 text-xs font-mono font-bold uppercase border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#D26900]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Line Heading & Color */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                      Heading Line 2 (e.g. "Make It Special")
                    </label>
                    <span className="text-[11px] text-gray-400">Leave blank if no line 2 text</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Make It Special"
                    value={promoFormData.subtitle}
                    onChange={(e) => setPromoFormData((p) => ({ ...p, subtitle: e.target.value }))}
                    className="w-full text-sm font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#D26900]"
                  />

                  {/* Line 2 Color Picker & Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gray-600 block">Line 2 Text Color:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { name: 'Charcoal Black', color: '#111827' },
                        { name: 'Pure White', color: '#FFFFFF' },
                        { name: 'Amber Earth', color: '#78350F' },
                        { name: 'Warm Terracotta', color: '#D26900' },
                        { name: 'Deep Crimson', color: '#881337' },
                        { name: 'Navy Blue', color: '#1E3A8A' },
                        { name: 'Dark Teal', color: '#134E4A' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => setPromoFormData((p) => ({ ...p, subtitle_color: preset.color }))}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                            promoFormData.subtitle_color.toLowerCase() === preset.color.toLowerCase()
                              ? 'border-[#D26900] bg-orange-50 text-[#D26900] ring-1 ring-[#D26900]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      ))}

                      {/* Custom Color Input */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <input
                          type="color"
                          value={promoFormData.subtitle_color.startsWith('#') ? promoFormData.subtitle_color : '#111827'}
                          onChange={(e) => setPromoFormData((p) => ({ ...p, subtitle_color: e.target.value }))}
                          className="w-7 h-7 rounded-md border border-gray-200 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={promoFormData.subtitle_color}
                          onChange={(e) => setPromoFormData((p) => ({ ...p, subtitle_color: e.target.value }))}
                          className="w-20 text-xs font-mono font-bold uppercase border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#D26900]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Text Position / Alignment */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                    Text Placement on Banner
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'left', label: 'Left Aligned (FNP Style)', icon: '⫷' },
                      { id: 'center', label: 'Centered', icon: '☰' },
                      { id: 'right', label: 'Right Aligned', icon: '⫸' },
                      { id: 'none', label: 'None (Image Only)', icon: '🚫' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPromoFormData((p) => ({ ...p, text_position: pos.id as any }))}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                          promoFormData.text_position === pos.id
                            ? 'border-[#D26900] bg-orange-50/50 text-[#D26900] ring-2 ring-[#D26900]/20 font-bold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm">{pos.icon}</span>
                        <span className="text-[11px] truncate w-full">{pos.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Live Modal Mini Preview */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Slide Appearance Preview
                    </label>
                    <span className="text-[11px] text-gray-400">Strictly Non-Clickable Display Only</span>
                  </div>
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-300 bg-gray-900 shadow-inner">
                    {promoFormData.image_url ? (
                      <img
                        src={promoFormData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        Upload or enter an image URL to preview
                      </div>
                    )}

                    {promoFormData.text_position !== 'none' && (promoFormData.title || promoFormData.subtitle) && (
                      <div
                        className={`absolute inset-0 flex p-5 ${
                          promoFormData.text_position === 'center'
                            ? 'items-center justify-center text-center'
                            : promoFormData.text_position === 'right'
                            ? 'items-center justify-end text-right'
                            : 'items-center justify-start text-left'
                        }`}
                      >
                        <div className="max-w-md drop-shadow-md">
                          {promoFormData.title && (
                            <div
                              className="font-extrabold text-base leading-tight drop-shadow"
                              style={{ color: promoFormData.title_color || '#FFFFFF' }}
                            >
                              {promoFormData.title}
                            </div>
                          )}
                          {promoFormData.subtitle && (
                            <div
                              className="font-black text-xl leading-tight drop-shadow"
                              style={{ color: promoFormData.subtitle_color || '#111827' }}
                            >
                              {promoFormData.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsPromoModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPromo || isUploadingPromo}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPromo
                      ? 'Saving Slide...'
                      : isEditingPromo
                        ? 'Save Changes'
                        : 'Create Promo Slide'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Bestseller Card Add & Edit Modal */}
        {isBestsellerModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden my-8 flex flex-col max-h-[92vh] relative"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D26900] via-[#E65100] to-[#B45309]" />

              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border border-[#FED7AA] text-[#D26900] flex items-center justify-center font-bold text-lg shadow-2xs">
                    ⭐
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {isEditingBestseller ? 'Edit Bestseller Card' : 'Add New Bestseller Card'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Configure card details, pricing, discount badges, and navigation destination.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBestsellerModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleBestsellerSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
                {/* 1. Mode Switcher: Dynamic Product vs Custom Card */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setBestsellerFormData((p) => ({ ...p, source_mode: 'catalog' }))}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      bestsellerFormData.source_mode !== 'custom'
                        ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:text-[#D26900]'
                    }`}
                  >
                    <span>⚡ Dynamic Store Product</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBestsellerFormData((p) => ({ ...p, source_mode: 'custom' }))}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      bestsellerFormData.source_mode === 'custom'
                        ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:text-[#D26900]'
                    }`}
                  >
                    <span>✏️ Custom Card Details</span>
                  </button>
                </div>

                {/* 2. Live Card Preview (Storefront Style matching Image 2) */}
                <div className="p-4 bg-gradient-to-b from-gray-50 to-orange-50/20 rounded-2xl border border-gray-200/90 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <span>👁️</span>
                    <span>Live Card Preview (Exact Storefront Style)</span>
                  </span>

                  <div className="w-56 bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-md flex flex-col">
                    <BestsellerPreviewImageCarousel
                      images={bestsellerFormData.images}
                      imageUrl={bestsellerFormData.image_url}
                      title={bestsellerFormData.title || 'Product Title'}
                      badgeText={bestsellerFormData.badge_text || 'BESTSELLER'}
                      rating={bestsellerFormData.rating || 4.9}
                      reviewsCount={bestsellerFormData.reviews_count || 95}
                    />

                    <div className="p-3 flex flex-col justify-between flex-grow gap-1">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {bestsellerFormData.title || 'Product Title'}
                        </h4>
                        <p className="text-[10px] text-gray-500 truncate">
                          {bestsellerFormData.subtitle || 'Product Subtitle'}
                        </p>
                      </div>

                      <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 pt-0.5">
                        <span className="text-xs font-extrabold text-gray-950">
                          {formatBestsellerPrice(bestsellerFormData.price || 'Rs. 1299')}
                        </span>
                        {bestsellerFormData.original_price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatBestsellerPrice(bestsellerFormData.original_price)}
                          </span>
                        )}
                        {bestsellerFormData.discount_badge && (
                          <span className="text-[#D26900] font-bold text-[10px]">
                            {formatBestsellerDiscount(bestsellerFormData.discount_badge)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Quick Auto-Fill from Store Product Catalog */}
                <div className="p-3.5 bg-gradient-to-br from-orange-50/70 to-amber-50/40 rounded-xl border border-orange-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Quick Auto-Fill from Store Product Catalog</span>
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {adminProducts.length} Products Available
                    </span>
                  </div>

                  <div className="relative" ref={bestsellerProductDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsBestsellerProductDropdownOpen((p) => !p)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 bg-white border border-orange-200 rounded-xl transition cursor-pointer hover:border-[#D26900] shadow-2xs"
                    >
                      <span className="truncate">
                        {bestsellerFormData.title ? `Selected: ${bestsellerFormData.title}` : 'Pick a product to auto-fill title, image, price & link...'}
                      </span>
                      <span className="text-xs text-[#D26900] font-bold shrink-0 ml-2">Browse Catalog ▾</span>
                    </button>

                    {isBestsellerProductDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-orange-200 overflow-hidden">
                        <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                          <input
                            type="text"
                            placeholder="Search store products by name, category..."
                            value={bestsellerProductSearch}
                            onChange={(e) => setBestsellerProductSearch(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                          {filteredCatalogProducts.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-400">
                              No matching store products found
                            </div>
                          ) : (
                            filteredCatalogProducts.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectCatalogProduct(p)}
                                className="w-full text-left p-2.5 hover:bg-orange-50 text-xs flex items-center gap-3 cursor-pointer transition"
                              >
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                                  {p.primary_image || p.images?.[0]?.url ? (
                                    <img
                                      src={p.primary_image || p.images?.[0]?.url}
                                      alt={p.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>🎒</span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-gray-900 truncate">{p.title}</h5>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <span className="font-bold text-[#D26900]">Rs. {Number(p.price || 0).toLocaleString('en-IN')}</span>
                                    {p.mrp && <span className="line-through">Rs. {Number(p.mrp).toLocaleString('en-IN')}</span>}
                                    {p.discount_percent > 0 && <span className="font-bold text-emerald-600">{p.discount_percent}% OFF</span>}
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-[#D26900] shrink-0">Select ↵</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Media Upload & Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Card Image</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">Recommended: Square or 4:5 Portrait (JPG, PNG, WebP)</span>
                  </div>

                  <input
                    ref={bestsellerFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadBestsellerFile}
                  />

                  {bestsellerFormData.image_url ? (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-neutral-900 h-44 shadow-inner flex items-center justify-center">
                        <img
                          src={bestsellerFormData.image_url}
                          alt="Bestseller Preview"
                          className="w-full h-full object-cover"
                        />
                        {isUploadingBestseller && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-10">
                            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-bold">Uploading new image to cloud...</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                          Current Card Photo
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => bestsellerFileInputRef.current?.click()}
                          disabled={isUploadingBestseller}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>{isUploadingBestseller ? 'Uploading...' : '🔄 Replace Image (Upload New)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBestsellerFormData((p) => ({ ...p, image_url: '', images: [] }))}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Multi-Image Strip if Available */}
                      {bestsellerFormData.images && bestsellerFormData.images.length > 1 && (
                        <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-800">
                            <span className="flex items-center gap-1.5">
                              <span>📸</span>
                              <span>Auto-Slide Images ({bestsellerFormData.images.length})</span>
                            </span>
                            <span className="text-[10px] text-[#D26900] bg-white px-2 py-0.5 rounded-full border border-orange-200 font-semibold">
                              Slides with Dots
                            </span>
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {bestsellerFormData.images.map((img, i) => (
                              <div
                                key={i}
                                onClick={() => setBestsellerFormData((p) => ({ ...p, image_url: img }))}
                                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                                  bestsellerFormData.image_url === img
                                    ? 'border-[#D26900] shadow-xs ring-2 ring-orange-300'
                                    : 'border-gray-200 opacity-70 hover:opacity-100'
                                }`}
                                title="Click to view/select this image"
                              >
                                <img src={img} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                                  #{i + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-500 block">
                          Or direct image URL:
                        </span>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={bestsellerFormData.image_url}
                          onChange={(e) => setBestsellerFormData((p) => ({ ...p, image_url: e.target.value }))}
                          className="w-full text-xs font-mono border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#D26900] bg-gray-50/50"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div
                        onClick={() => bestsellerFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-[#D26900] bg-gray-50/70 hover:bg-[#FFF7ED]/30 rounded-xl p-6 text-center cursor-pointer transition-all"
                      >
                        {isUploadingBestseller ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-bold text-gray-700">Uploading Image to Cloud Storage...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-100/80 text-[#D26900] flex items-center justify-center">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-gray-800">
                              Click to Choose & Upload Card Photo
                            </p>
                            <p className="text-[11px] text-gray-500">Supports JPG, PNG, WebP (Square or Portrait)</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <input
                          type="url"
                          placeholder="Or paste direct image URL (https://...)"
                          value={bestsellerFormData.image_url}
                          onChange={(e) => setBestsellerFormData((p) => ({ ...p, image_url: e.target.value }))}
                          className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#D26900]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Card Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Product Card Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sweet Teddy Backpack"
                      value={bestsellerFormData.title}
                      onChange={(e) => setBestsellerFormData((p) => ({ ...p, title: e.target.value }))}
                      className="w-full text-xs sm:text-sm font-bold border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#D26900]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Subtitle / Brief Description
                    </label>
                    <input
                      type="text"
                      placeholder="Handcrafted velvet companion with ergonomic straps"
                      value={bestsellerFormData.subtitle}
                      onChange={(e) => setBestsellerFormData((p) => ({ ...p, subtitle: e.target.value }))}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#D26900]"
                    />
                  </div>
                </div>

                {/* 4. Pricing & Discount Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Selling Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Rs. 1299"
                      value={bestsellerFormData.price}
                      onChange={(e) => setBestsellerFormData((p) => ({ ...p, price: e.target.value }))}
                      className="w-full text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#D26900]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Original Price / MRP
                    </label>
                    <input
                      type="text"
                      placeholder="Rs. 1999"
                      value={bestsellerFormData.original_price}
                      onChange={(e) => setBestsellerFormData((p) => ({ ...p, original_price: e.target.value }))}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#D26900]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Discount Badge
                    </label>
                    <input
                      type="text"
                      placeholder="35% OFF"
                      value={bestsellerFormData.discount_badge}
                      onChange={(e) => setBestsellerFormData((p) => ({ ...p, discount_badge: e.target.value }))}
                      className="w-full text-xs font-bold text-[#D26900] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#D26900]"
                    />
                  </div>
                </div>

                {/* 5. Rating, Reviews & Badge Text (Storefront Social Proof) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Badge Text (Top Left)
                    </label>
                    <input
                      type="text"
                      placeholder="BESTSELLER"
                      value={bestsellerFormData.badge_text || ''}
                      onChange={(e) => setBestsellerFormData((p) => ({ ...p, badge_text: e.target.value }))}
                      className="w-full text-xs font-bold text-[#D26900] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#D26900]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Rating (e.g. 4.9)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      placeholder="4.9"
                      value={bestsellerFormData.rating ?? 4.9}
                      onChange={(e) => setBestsellerFormData((p) => ({ ...p, rating: e.target.value }))}
                      className="w-full text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#D26900]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Reviews Count (e.g. 95)
                    </label>
                    <input
                      type="number"
                      placeholder="95"
                      value={bestsellerFormData.reviews_count ?? 95}
                      onChange={(e) => setBestsellerFormData((p) => ({ ...p, reviews_count: e.target.value }))}
                      className="w-full text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#D26900]"
                    />
                  </div>
                </div>

                {/* 6. Destination Link (Header Category & Dropdown Item ONLY) */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🔗</span>
                      <span>Card Click Redirect Destination</span>
                    </label>
                    <span className="text-[11px] text-[#D26900] font-semibold">
                      Where the user goes on click
                    </span>
                  </div>

                  {/* Type Tabs: Header Category, Dropdown Sub-Item ONLY */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleBestsellerLinkTypeChange('header')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                        bestsellerFormData.link_type === 'header'
                          ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:text-[#D26900]'
                      }`}
                    >
                      Header Category
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBestsellerLinkTypeChange('dropdown')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer truncate ${
                        bestsellerFormData.link_type === 'dropdown'
                          ? 'bg-gradient-to-r from-[#D26900] to-[#E65100] text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:text-[#D26900]'
                      }`}
                    >
                      Dropdown Item
                    </button>
                  </div>

                  {/* Selection based on link_type */}
                  {bestsellerFormData.link_type === 'header' && (
                    <div className="space-y-1.5 bg-orange-50/30 p-3 rounded-xl border border-orange-200/70">
                      <label className="text-xs text-gray-800 font-bold block">
                        Select Top Header Category:
                      </label>
                      <div className="relative" ref={bestsellerOpenDropdown === 'header' ? bestsellerDropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setBestsellerOpenDropdown((p) => (p === 'header' ? null : 'header'))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-orange-200 rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          <span className="truncate">
                            {adminItems.find((h) => h.id === bestsellerFormData.target_header_id)?.title || 'Select Category'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {adminItems.find((h) => h.id === bestsellerFormData.target_header_id)?.path}
                          </span>
                        </button>

                        {bestsellerOpenDropdown === 'header' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                              <input
                                type="text"
                                placeholder="Search header categories..."
                                value={bestsellerHeaderSearch}
                                onChange={(e) => setBestsellerHeaderSearch(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredBestsellerHeaders.map((h) => (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => {
                                    setBestsellerFormData((p) => ({
                                      ...p,
                                      target_header_id: h.id,
                                      link_url: h.path,
                                    }));
                                    setBestsellerOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <span className="font-bold text-gray-800">{h.title}</span>
                                  <span className="text-[10px] font-mono text-gray-400">{h.path}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {bestsellerFormData.link_type === 'dropdown' && (
                    <div className="space-y-1.5 bg-orange-50/30 p-3 rounded-xl border border-orange-200/70">
                      <label className="text-xs text-gray-800 font-bold block">
                        Select Dropdown Sub-Item:
                      </label>
                      <div className="relative" ref={bestsellerOpenDropdown === 'subitem' ? bestsellerDropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setBestsellerOpenDropdown((p) => (p === 'subitem' ? null : 'subitem'))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-orange-200 rounded-xl transition cursor-pointer shadow-2xs"
                        >
                          <span className="truncate">
                            {allDropdownOptions.find((d) => d.id === bestsellerFormData.target_dropdown_id)?.title || 'Select Dropdown Sub-Item'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {allDropdownOptions.find((d) => d.id === bestsellerFormData.target_dropdown_id)?.path}
                          </span>
                        </button>

                        {bestsellerOpenDropdown === 'subitem' && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                              <input
                                type="text"
                                placeholder="Search sub-items..."
                                value={bestsellerSubItemSearch}
                                onChange={(e) => setBestsellerSubItemSearch(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#D26900]"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredBestsellerDropdowns.map((d) => (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => {
                                    setBestsellerFormData((p) => ({
                                      ...p,
                                      target_dropdown_id: d.id,
                                      link_url: d.path,
                                    }));
                                    setBestsellerOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-orange-50 text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="font-bold text-gray-800 block">{d.title}</span>
                                    <span className="text-[10px] text-gray-400">{d.headerTitle}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-400">{d.path}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Destination preview indicator with CTA styling */}
                  <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/70 flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-semibold truncate">Target Navigation URL:</span>
                    <span className="font-mono font-bold text-[#D26900] bg-white px-2 py-0.5 rounded border border-orange-200/80 truncate max-w-xs">
                      {bestsellerFormData.link_url || '/'}
                    </span>
                  </div>

                  {/* Dynamic Destination Products Quick Picker */}
                  {destinationProducts.length > 0 && (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>📦</span>
                          <span>Products in this Destination ({destinationProducts.length})</span>
                        </span>
                        <span className="text-[10px] text-amber-800 font-semibold">
                          Click to populate card
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {destinationProducts.map((p) => {
                          const isSelected = bestsellerFormData.product_id === p.id;
                          const pImg = p.primary_image || p.images?.[0]?.url;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectCatalogProduct(p)}
                              className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-100 border-[#D26900] ring-1 ring-[#D26900]'
                                  : 'bg-white border-amber-200/70 hover:border-[#D26900] hover:bg-orange-50/50'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                                {pImg ? (
                                  <img src={pImg} alt={p.title} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs">🎒</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-bold text-gray-900 truncate">{p.title}</h5>
                                {p.subtitle && (
                                  <p className="text-[10px] text-gray-500 truncate">{p.subtitle}</p>
                                )}
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="font-extrabold text-[#D26900]">
                                    Rs. {Number(p.price || 0).toLocaleString('en-IN')}
                                  </span>
                                  {p.mrp && (
                                    <span className="text-gray-400 line-through">
                                      Rs. {Number(p.mrp).toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected ? (
                                <span className="text-[10px] font-bold text-[#D26900] bg-orange-100 px-1.5 py-0.5 rounded shrink-0">
                                  ✓ Selected
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-500 hover:text-[#D26900] shrink-0">
                                  Select ↵
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Active Status Toggle */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Card Active Status</span>
                    <span className="text-[11px] text-gray-500">
                      When active, this card will appear on the storefront under Bestsellers.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={bestsellerFormData.is_active}
                    onChange={(e) => setBestsellerFormData((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-5 h-5 rounded text-[#D26900] accent-[#D26900] cursor-pointer"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsBestsellerModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBestseller || isUploadingBestseller}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D26900] to-[#E65100] hover:from-[#B45309] hover:to-[#D26900] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#D26900]/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingBestseller
                      ? 'Saving Card...'
                      : isEditingBestseller
                      ? 'Save Changes'
                      : 'Create Bestseller Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (Occasion Card) */}
      <AdminConfirmModal
        isOpen={deleteOccasionConfirm.isOpen}
        onClose={() => setDeleteOccasionConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={handleConfirmDeleteOccasion}
        title="Delete Occasion Card?"
        message="Are you sure you want to permanently delete this occasion card? Any associated image stored in cloud storage will also be cleaned up."
        itemName={deleteOccasionConfirm.title}
        warningNote="This action cannot be undone and will immediately remove the card from customer view."
        confirmText="Yes, Delete Card"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingOccasion}
      />

      {/* Delete Confirmation Modal (Promo Banner Slide) */}
      <AdminConfirmModal
        isOpen={deletePromoConfirm.isOpen}
        onClose={() => setDeletePromoConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={handleConfirmDeletePromo}
        title="Delete Special Promo Slide?"
        message="Are you sure you want to permanently delete this promotional strip banner slide? Any associated image stored in cloud storage will also be cleaned up."
        itemName={deletePromoConfirm.title}
        warningNote="This action cannot be undone and will immediately remove this slide from the storefront slideshow."
        confirmText="Yes, Delete Slide"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingPromo}
      />

      {/* Delete Confirmation Modal (Bestseller Card) */}
      <AdminConfirmModal
        isOpen={deleteBestsellerConfirm.isOpen}
        onClose={() => setDeleteBestsellerConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={handleConfirmDeleteBestseller}
        title="Delete Bestseller Card?"
        message="Are you sure you want to permanently delete this bestseller card? Any associated image stored in cloud storage will also be cleaned up."
        itemName={deleteBestsellerConfirm.title}
        warningNote="This action cannot be undone and will immediately remove this card from the customer storefront."
        confirmText="Yes, Delete Card"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingBestseller}
      />
    </div>
  );
}

