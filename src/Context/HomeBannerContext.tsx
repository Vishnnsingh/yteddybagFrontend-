import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import apiClient, { adminApiClient } from '../Utils/apiClient';

export interface HomeBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  button_text?: string;
  media_type: 'image' | 'video';
  media_url: string;
  link_url: string;
  link_type: 'header' | 'dropdown' | 'custom';
  target_header_id?: string | null;
  target_dropdown_id?: string | null;
  show_overlay: boolean;
  overlay_position?: 'left' | 'center' | 'right';
  title_color?: string;
  subtitle_color?: string;
  button_bg_color?: string;
  button_text_color?: string;
  font_family?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadMediaResult {
  url: string;
  mediaType: 'image' | 'video';
  originalName: string;
}

export interface BannerThemeOption {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  accentColor: string;
  icon: string;
}

export const BANNER_THEMES: BannerThemeOption[] = [
  {
    id: 'peek-carousel',
    name: 'Side-Peek Rounded Showcase',
    badge: 'User Screenshot Style',
    tagline: 'Rounded center card with dynamic side preview of previous & next slides',
    description: 'Modern rounded-2xl hero card with subtle peek of neighboring slides, floating circular chevrons, and smooth carousel navigation.',
    accentColor: '#D26900',
    icon: 'carousel',
  },
  {
    id: 'hero-edge',
    name: 'Full-Width Hero Classic',
    badge: 'Luxury Full Bleed',
    tagline: 'Immersive edge-to-edge cinematic banner with rich contrast overlay',
    description: 'Seamless full-width display with 0px margins, responsive typography, and glowing active capsule pagination indicators.',
    accentColor: '#E65100',
    icon: 'maximize',
  },
  {
    id: 'split-showcase',
    name: 'Modern Split Showcase',
    badge: 'Dual-Card Layout',
    tagline: 'High-conversion split layout with editorial panel & floating chips',
    description: 'Split design pairing a feature badge & typography card on one side with high-resolution visual media on the other.',
    accentColor: '#B45309',
    icon: 'columns',
  },
  {
    id: 'framed-luxury',
    name: 'Floating Framed Luxury',
    badge: 'Boutique Premium',
    tagline: 'Padded container with rounded-3xl corners and floating glass dock',
    description: 'Floating boutique frame with soft ambient backdrop glow, rounded-3xl borders, and an illuminated glassmorphism control pill.',
    accentColor: '#9A3412',
    icon: 'frame',
  },
  {
    id: 'minimal-editorial',
    name: 'Minimalist Editorial',
    badge: 'High Fashion Magazine',
    tagline: 'Sophisticated magazine layout with animated progress bar timer',
    description: 'Editorial typography, slide countdown counter (e.g. 01 / 03), and an animated continuous timer bar indicating the next slide.',
    accentColor: '#78350F',
    icon: 'book-open',
  },
];

export interface HomeSubBannerItem {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  link_type: 'header' | 'dropdown' | 'custom';
  target_header_id?: string | null;
  target_dropdown_id?: string | null;
  hover_bg_color: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubBannerSettings {
  is_enabled: boolean;
  default_hover_bg: string;
}

export interface HomeOccasionItem {
  id: string;
  title: string;
  date_badge?: string | null;
  image_url?: string | null;
  image_scale?: number | null;
  image_position?: string | null;
  bg_color: string;
  link_type: 'header' | 'dropdown';
  target_header_id?: string | null;
  target_dropdown_id?: string | null;
  link_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type HomeOccasionCard = HomeOccasionItem;

export interface OccasionSettings {
  is_enabled: boolean;
  section_title: string;
}

export interface HomeBestsellerItem {
  id: string;
  product_id?: string | null;
  title: string;
  subtitle?: string | null;
  price: string;
  original_price?: string | null;
  discount_badge?: string | null;
  badge_text?: string | null;
  badge_style: 'discount' | 'luxe' | 'custom';
  rating?: number | string | null;
  reviews_count?: number | string | null;
  image_url?: string | null;
  images?: string[];
  link_type: 'header' | 'dropdown';
  target_header_id?: string | null;
  target_dropdown_id?: string | null;
  link_url: string;
  source_mode?: 'catalog' | 'custom';
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BestsellerSettings {
  is_enabled: boolean;
  section_title: string;
  section_subtitle: string;
  view_all_text: string;
  view_all_url: string;
  show_view_all: boolean;
  card_theme: string;
  card_bg_mode: string; // 'white' | 'color' | 'glass' | 'home-bg'
  card_bg_color: string;
  card_transparency: number;
  section_bg_mode?: string; // 'transparent' | 'color'
  section_bg_color?: string;
  cards_per_row?: string; // '2' | '3' | '4' | '5' | '6' | 'scroll'
  view_all_target_header_id?: string | null;
  view_all_target_dropdown_id?: string | null;
  view_all_link_type?: 'header' | 'dropdown';
}

export interface HomePromoBannerItem {
  id: string;
  title: string;
  subtitle: string;
  title_color: string;
  subtitle_color: string;
  text_position: 'left' | 'center' | 'right' | 'none';
  font_size: 'small' | 'medium' | 'large';
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoBannerSettings {
  is_enabled: boolean;
  autoplay: boolean;
  autoplay_interval: number;
  banner_height: 'compact' | 'standard' | 'tall';
  show_dots: boolean;
  border_radius: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-none';
}

export interface HomeCustomCardItem {
  id: string;
  title: string;
  subtitle?: string;
  badge_text?: string;
  button_text?: string;
  image_url?: string | null;

  // Card Layout & Positioning
  text_position: 'above' | 'below' | 'inside_clean' | 'inside_bottom' | 'inside_center' | 'inside_top';
  content_align: 'left' | 'center' | 'right';
  vertical_align: 'top' | 'center' | 'bottom';

  // Card Specific Styling
  bg_color: string;
  card_radius: number;
  card_padding?: number | null; // In-card space outside frame (border se bahar space)
  image_padding?: number | null; // Space inside frame around image (border ke andar image space)

  // Border Configuration
  border_mode: 'none' | 'modern' | 'classic' | 'custom_image';
  border_same_all: boolean;
  border_width: number;
  border_top_width: number;
  border_right_width: number;
  border_bottom_width: number;
  border_left_width: number;
  border_style: string;
  border_color: string;

  // Classic Border Selection (10+ options)
  classic_border_style: string;

  // Custom Border Image
  border_image_url?: string | null;

  // Text Styling
  title_color: string;
  subtitle_color: string;
  badge_color: string;
  button_color?: string;
  font_family: string;
  font_weight: string;

  // Navigation Link
  link_type: 'header' | 'dropdown';
  target_header_id?: string | null;
  target_dropdown_id?: string | null;
  link_url: string;

  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomCardsSettings {
  is_enabled: boolean;
  section_title: string;
  section_subtitle: string;
  title_align: 'left' | 'center' | 'right';
  title_color: string;
  subtitle_color: string;
  section_bg_mode: 'transparent' | 'color' | 'gradient';
  section_bg_color: string;
  section_gradient: string;
  cards_per_row: number; // 3, 4, 5, 6
  card_aspect_ratio: 'square' | 'tall' | 'standard' | 'auto';
  global_card_radius: number;
  global_border_mode: 'none' | 'modern' | 'classic' | 'custom_image';
  global_classic_border: string;
  global_border_color: string;
  global_border_width: number;
  global_text_position: 'above' | 'below' | 'inside_clean' | 'inside_bottom' | 'inside_center';
  card_padding: number; // In-card space around frame (border se bahar space)
  image_padding: number; // Space inside frame around image (border ke andar image space)
  card_hover_effect: 'none' | 'glow' | 'lift' | 'zoom';
  card_bg_color: string;
}

export type HomeSectionType =
  | 'hero_banner'
  | 'sub_banner'
  | 'occasions'
  | 'bestsellers'
  | 'custom_cards'
  | 'promo_banner';

export interface HomeSectionLayoutItem {
  id: string; // Unique instance ID, e.g. "hero_banner_1", "promo_banner_top", "custom_cards_1"
  section_type: HomeSectionType;
  custom_label: string;
  is_enabled: boolean;
  order_index: number;

  // In-section space (Inner Padding rem)
  padding_top: number;
  padding_bottom: number;

  // Outer section space (Outer Margin rem)
  margin_top: number;
  margin_bottom: number;

  // Background color override
  bg_color?: string;

  // Instance-specific overrides (allows different themes, titles & settings when repeated)
  theme?: string;
  section_title?: string;
  section_subtitle?: string;
  cards_per_row?: string | number;
  card_theme?: string;
  border_mode?: 'none' | 'modern' | 'classic' | 'custom_image';
  classic_border_style?: string;
  card_aspect_ratio?: 'square' | 'tall' | 'standard';
  text_position?: string;
  section_bg_mode?: 'transparent' | 'color' | 'gradient';
  section_bg_color?: string;
  banner_height?: 'compact' | 'standard' | 'tall';
  border_radius?: string;
  item_ids?: string[]; // Specific items assigned to this section
  items?: any[]; // Full independent item objects for this section!
  settings?: Record<string, any>;
  view_all_text?: string;
  view_all_url?: string;
  view_all_link_type?: string;
  view_all_target_header_id?: string | null;
  view_all_target_dropdown_id?: string | null;
  show_view_all?: boolean;
}

export const toRemNumber = (val: any, fallback = 0): number => {
  const num = typeof val === 'number' && !isNaN(val) ? val : parseFloat(val);
  if (isNaN(num)) return fallback;
  if (num > 6) return Number((num / 16).toFixed(3));
  return Number(Math.max(0, num).toFixed(3));
};

export const getSectionDefaultPadding = (type: string): { top: number; bottom: number } => {
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

export const defaultHomeSectionsLayout: HomeSectionLayoutItem[] = [
  {
    id: 'hero_banner_1',
    section_type: 'hero_banner',
    custom_label: 'Hero Banner Carousel',
    is_enabled: true,
    order_index: 1,
    padding_top: 0.0,
    padding_bottom: 0.0,
    margin_top: 0.0,
    margin_bottom: 0.0,
    bg_color: 'transparent',
  },
  {
    id: 'sub_banner_1',
    section_type: 'sub_banner',
    custom_label: 'Quick Categories (Sub-Banner)',
    is_enabled: true,
    order_index: 2,
    padding_top: 0.5,
    padding_bottom: 0.75,
    margin_top: 0.0,
    margin_bottom: 0.0,
    bg_color: 'transparent',
  },
  {
    id: 'occasions_1',
    section_type: 'occasions',
    custom_label: 'Gifts For Every Occasion',
    is_enabled: true,
    order_index: 3,
    padding_top: 1.5,
    padding_bottom: 2.0,
    margin_top: 0.0,
    margin_bottom: 0.0,
    bg_color: 'transparent',
  },
  {
    id: 'bestsellers_1',
    section_type: 'bestsellers',
    custom_label: 'Shop By Bestsellers',
    is_enabled: true,
    order_index: 4,
    padding_top: 2.0,
    padding_bottom: 2.5,
    margin_top: 0.0,
    margin_bottom: 0.0,
    bg_color: 'transparent',
  },
  {
    id: 'custom_cards_1',
    section_type: 'custom_cards',
    custom_label: 'Showcase Cards (Gifts for Every Feeling)',
    is_enabled: true,
    order_index: 5,
    padding_top: 2.0,
    padding_bottom: 2.5,
    margin_top: 0.0,
    margin_bottom: 0.0,
    bg_color: 'transparent',
  },
  {
    id: 'promo_banner_1',
    section_type: 'promo_banner',
    custom_label: 'Special Promo Strip Banner',
    is_enabled: true,
    order_index: 6,
    padding_top: 1.5,
    padding_bottom: 2.0,
    margin_top: 0.0,
    margin_bottom: 0.0,
    bg_color: 'transparent',
  },
];

interface HomeBannerContextType {
  banners: HomeBannerItem[];
  adminBanners: HomeBannerItem[];
  loading: boolean;
  adminLoading: boolean;
  activeTheme: string;
  availableThemes: BannerThemeOption[];
  setActiveTheme: (themeId: string) => Promise<boolean>;
  fetchPublicBanners: (force?: boolean) => Promise<void>;
  fetchBannerTheme: (force?: boolean) => Promise<void>;
  fetchHomeDataOnDemand: (force?: boolean) => Promise<void>;
  fetchAdminBanners: () => Promise<void>;
  uploadBannerMedia: (file: File) => Promise<UploadMediaResult | null>;
  createBanner: (data: Partial<HomeBannerItem>) => Promise<boolean>;
  updateBanner: (id: string, data: Partial<HomeBannerItem>) => Promise<boolean>;
  deleteBanner: (id: string) => Promise<boolean>;
  toggleBannerStatus: (id: string, isActive: boolean) => Promise<boolean>;
  reorderBanners: (orderedIds: string[]) => Promise<boolean>;

  // Sub-Banners (Category Icon Strip below Banner)
  subBanners: HomeSubBannerItem[];
  adminSubBanners: HomeSubBannerItem[];
  subBannerSettings: SubBannerSettings;
  subBannerLoading: boolean;
  fetchPublicSubBanners: (force?: boolean) => Promise<void>;
  fetchAdminSubBanners: () => Promise<void>;
  createSubBanner: (data: Partial<HomeSubBannerItem>) => Promise<boolean>;
  updateSubBanner: (id: string, data: Partial<HomeSubBannerItem>) => Promise<boolean>;
  deleteSubBanner: (id: string) => Promise<boolean>;
  toggleSubBannerStatus: (id: string, isActive: boolean) => Promise<boolean>;
  reorderSubBanners: (orderedIds: string[]) => Promise<boolean>;
  updateSubBannerSettings: (settings: Partial<SubBannerSettings>) => Promise<boolean>;

  // Occasions Section (Gifts For Every Occasion)
  occasions: HomeOccasionItem[];
  adminOccasions: HomeOccasionItem[];
  occasionsSettings: OccasionSettings;
  occasionsLoading: boolean;
  fetchPublicOccasions: (force?: boolean) => Promise<void>;
  fetchAdminOccasions: () => Promise<void>;
  createOccasion: (data: Partial<HomeOccasionItem>) => Promise<boolean>;
  updateOccasion: (id: string, data: Partial<HomeOccasionItem>) => Promise<boolean>;
  deleteOccasion: (id: string) => Promise<boolean>;
  toggleOccasionStatus: (id: string, isActive: boolean) => Promise<boolean>;
  reorderOccasions: (orderedIds: string[]) => Promise<boolean>;
  updateOccasionSettings: (settings: Partial<OccasionSettings>) => Promise<boolean>;

  // Bestsellers Section (Shop By Bestsellers)
  bestsellers: HomeBestsellerItem[];
  adminBestsellers: HomeBestsellerItem[];
  bestsellerSettings: BestsellerSettings;
  bestsellerLoading: boolean;
  fetchPublicBestsellers: (force?: boolean) => Promise<void>;
  fetchAdminBestsellers: () => Promise<void>;
  createBestseller: (data: Partial<HomeBestsellerItem>) => Promise<boolean>;
  updateBestseller: (id: string, data: Partial<HomeBestsellerItem>) => Promise<boolean>;
  deleteBestseller: (id: string) => Promise<boolean>;
  toggleBestsellerStatus: (id: string, isActive: boolean) => Promise<boolean>;
  reorderBestsellers: (orderedIds: string[]) => Promise<boolean>;
  updateBestsellerSettings: (settings: Partial<BestsellerSettings>) => Promise<boolean>;

  // Promo Banner Section (Joyful Promo Strip below Bestsellers)
  promoBanners: HomePromoBannerItem[];
  adminPromoBanners: HomePromoBannerItem[];
  promoBannerSettings: PromoBannerSettings;
  promoBannerLoading: boolean;
  fetchPublicPromoBanners: (force?: boolean) => Promise<void>;
  fetchAdminPromoBanners: () => Promise<void>;
  createPromoBanner: (data: Partial<HomePromoBannerItem>) => Promise<boolean>;
  updatePromoBanner: (id: string, data: Partial<HomePromoBannerItem>) => Promise<boolean>;
  deletePromoBanner: (id: string) => Promise<boolean>;
  togglePromoBannerStatus: (id: string, isActive: boolean) => Promise<boolean>;
  reorderPromoBanners: (orderedIds: string[]) => Promise<boolean>;
  updatePromoBannerSettings: (settings: Partial<PromoBannerSettings>) => Promise<boolean>;

  // Custom Showcase Cards Section (Classic & Modern Framed Cards)
  customCards: HomeCustomCardItem[];
  adminCustomCards: HomeCustomCardItem[];
  customCardsSettings: CustomCardsSettings;
  customCardsLoading: boolean;
  fetchPublicCustomCards: (force?: boolean) => Promise<void>;
  fetchAdminCustomCards: () => Promise<void>;
  createCustomCard: (data: Partial<HomeCustomCardItem>) => Promise<boolean>;
  updateCustomCard: (id: string, data: Partial<HomeCustomCardItem>) => Promise<boolean>;
  deleteCustomCard: (id: string) => Promise<boolean>;
  toggleCustomCardStatus: (id: string, isActive: boolean) => Promise<boolean>;
  reorderCustomCards: (orderedIds: string[]) => Promise<boolean>;
  updateCustomCardsSettings: (settings: Partial<CustomCardsSettings>) => Promise<boolean>;

  // Home Sections Layout & Dynamic Page Builder
  sectionsLayout: HomeSectionLayoutItem[];
  adminSectionsLayout: HomeSectionLayoutItem[];
  sectionsLayoutLoading: boolean;
  fetchPublicSectionsLayout: (force?: boolean) => Promise<void>;
  fetchAdminSectionsLayout: () => Promise<void>;
  updateSectionsLayout: (items: HomeSectionLayoutItem[]) => Promise<boolean>;
  saveSingleSectionLayout: (id: string, patch: Partial<HomeSectionLayoutItem>) => Promise<boolean>;
  addSection: (type: HomeSectionType, customLabel?: string, items?: any[]) => Promise<string | null>;
  duplicateSection: (id: string) => Promise<string | null>;
  deleteSection: (id: string) => Promise<boolean>;
  addSectionItem: (sectionId: string, itemData: any) => Promise<boolean>;
  updateSectionItem: (sectionId: string, itemId: string, patch: any) => Promise<boolean>;
  deleteSectionItem: (sectionId: string, itemId: string) => Promise<boolean>;
  reorderSectionItems: (sectionId: string, orderedIds: string[]) => Promise<boolean>;
  resetSectionsLayout: () => Promise<boolean>;
}

export const defaultCustomCardsSettings: CustomCardsSettings = {
  is_enabled: true,
  section_title: 'Gifts for Every Feeling',
  section_subtitle: 'When emotions matter most, send a gift that speaks from the heart.',
  title_align: 'left',
  title_color: '#111827',
  subtitle_color: '#6B7280',
  section_bg_mode: 'transparent',
  section_bg_color: '#FFFFFF',
  section_gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
  cards_per_row: 5,
  card_aspect_ratio: 'tall',
  global_card_radius: 16,
  global_border_mode: 'classic',
  global_classic_border: 'victorian-ornate',
  global_border_color: '#D26900',
  global_border_width: 1,
  global_text_position: 'below',
  card_padding: 8,
  image_padding: 0,
  card_hover_effect: 'none',
  card_bg_color: '#FFFFFF',
};

const CACHE_KEY_BANNERS = 'yteddy_home_banners_cache';
const CACHE_KEY_BANNER_THEME = 'yteddy_home_theme_cache';
const CACHE_KEY_SUB_BANNERS = 'yteddy_home_sub_banners_cache';
const CACHE_KEY_OCCASIONS = 'yteddy_home_occasions_cache';
const CACHE_KEY_BESTSELLERS = 'yteddy_home_bestsellers_cache';
const CACHE_KEY_PROMO_BANNERS = 'yteddy_home_promo_banners_cache';
const CACHE_KEY_CUSTOM_CARDS = 'yteddy_home_custom_cards_cache';
const CACHE_KEY_SECTIONS_LAYOUT = 'yteddy_home_layout_cache';

function getHomeStorageCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setHomeStorageCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

const HomeBannerContext = createContext<HomeBannerContextType | undefined>(undefined);

export const HomeBannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<HomeBannerItem[]>(() => {
    return getHomeStorageCache<HomeBannerItem[]>(CACHE_KEY_BANNERS) || [];
  });
  const [adminBanners, setAdminBanners] = useState<HomeBannerItem[]>([]);
  const [activeTheme, setActiveThemeState] = useState<string>(() => {
    return getHomeStorageCache<string>(CACHE_KEY_BANNER_THEME) || 'peek-carousel';
  });
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // Sub-banners state
  const cachedSubBanners = getHomeStorageCache<{ items: HomeSubBannerItem[]; settings: SubBannerSettings }>(CACHE_KEY_SUB_BANNERS);
  const [subBanners, setSubBanners] = useState<HomeSubBannerItem[]>(cachedSubBanners?.items || []);
  const [adminSubBanners, setAdminSubBanners] = useState<HomeSubBannerItem[]>([]);
  const [subBannerSettings, setSubBannerSettings] = useState<SubBannerSettings>(
    cachedSubBanners?.settings || {
      is_enabled: true,
      default_hover_bg: '#FFF7ED',
    }
  );
  const [subBannerLoading, setSubBannerLoading] = useState(false);

  // Occasions state
  const cachedOccasions = getHomeStorageCache<{ items: HomeOccasionItem[]; settings: OccasionSettings }>(CACHE_KEY_OCCASIONS);
  const [occasions, setOccasions] = useState<HomeOccasionItem[]>(cachedOccasions?.items || []);
  const [adminOccasions, setAdminOccasions] = useState<HomeOccasionItem[]>([]);
  const [occasionsSettings, setOccasionsSettings] = useState<OccasionSettings>(
    cachedOccasions?.settings || {
      is_enabled: true,
      section_title: 'Gifts For Every Occasion',
    }
  );
  const [occasionsLoading, setOccasionsLoading] = useState(false);

  // Bestsellers state
  const cachedBestsellers = getHomeStorageCache<{ items: HomeBestsellerItem[]; settings: BestsellerSettings }>(CACHE_KEY_BESTSELLERS);
  const [bestsellers, setBestsellers] = useState<HomeBestsellerItem[]>(cachedBestsellers?.items || []);
  const [adminBestsellers, setAdminBestsellers] = useState<HomeBestsellerItem[]>([]);
  const [bestsellerSettings, setBestsellerSettings] = useState<BestsellerSettings>(
    cachedBestsellers?.settings || {
      is_enabled: true,
      section_title: 'Shop By Bestsellers',
      section_subtitle: "Discover India's favourite gifting options, curated bestsellers that make every celebration extra special",
      view_all_text: 'View All Bestsellers',
      view_all_url: '/category/bestsellers',
      show_view_all: true,
      card_theme: 'classic-clean',
      card_bg_mode: 'white',
      card_bg_color: '#FFFFFF',
      card_transparency: 0,
      section_bg_mode: 'transparent',
      section_bg_color: '#FFFFFF',
      cards_per_row: '4',
    }
  );
  const [bestsellerLoading, setBestsellerLoading] = useState(false);

  // Promo Banners state
  const cachedPromo = getHomeStorageCache<{ items: HomePromoBannerItem[]; settings: PromoBannerSettings }>(CACHE_KEY_PROMO_BANNERS);
  const [promoBanners, setPromoBanners] = useState<HomePromoBannerItem[]>(cachedPromo?.items || []);
  const [adminPromoBanners, setAdminPromoBanners] = useState<HomePromoBannerItem[]>([]);
  const [promoBannerSettings, setPromoBannerSettings] = useState<PromoBannerSettings>(
    cachedPromo?.settings || {
      is_enabled: true,
      autoplay: true,
      autoplay_interval: 4000,
      banner_height: 'standard',
      show_dots: true,
      border_radius: 'rounded-2xl',
    }
  );
  const [promoBannerLoading, setPromoBannerLoading] = useState(false);

  // Custom Showcase Cards state
  const cachedCustomCards = getHomeStorageCache<{ items: HomeCustomCardItem[]; settings: CustomCardsSettings }>(CACHE_KEY_CUSTOM_CARDS);
  const [customCards, setCustomCards] = useState<HomeCustomCardItem[]>(cachedCustomCards?.items || []);
  const [adminCustomCards, setAdminCustomCards] = useState<HomeCustomCardItem[]>([]);
  const [customCardsSettings, setCustomCardsSettings] = useState<CustomCardsSettings>(
    cachedCustomCards?.settings || defaultCustomCardsSettings
  );
  const [customCardsLoading, setCustomCardsLoading] = useState(false);

  // Home Sections Layout & Dynamic Page Builder state
  const cachedLayout = getHomeStorageCache<HomeSectionLayoutItem[]>(CACHE_KEY_SECTIONS_LAYOUT);
  const [sectionsLayout, setSectionsLayout] = useState<HomeSectionLayoutItem[]>(cachedLayout || defaultHomeSectionsLayout);
  const [adminSectionsLayout, setAdminSectionsLayout] = useState<HomeSectionLayoutItem[]>(defaultHomeSectionsLayout);
  const [sectionsLayoutLoading, setSectionsLayoutLoading] = useState(false);

  // In-flight request guards to ensure 0 duplicate concurrent API calls
  const isFetchingBannersRef = React.useRef(false);
  const isFetchingThemeRef = React.useRef(false);
  const isFetchingSubBannersRef = React.useRef(false);
  const isFetchingOccasionsRef = React.useRef(false);
  const isFetchingBestsellersRef = React.useRef(false);
  const isFetchingPromoRef = React.useRef(false);
  const isFetchingCustomCardsRef = React.useRef(false);
  const isFetchingSectionsLayoutRef = React.useRef(false);
  const hasInitializedRef = React.useRef(false);

  // Fetch active theme from backend
  const fetchBannerTheme = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHomeStorageCache<string>(CACHE_KEY_BANNER_THEME);
      if (cached) {
        setActiveThemeState(cached);
        return;
      }
    }
    if (isFetchingThemeRef.current) return;
    try {
      isFetchingThemeRef.current = true;
      const res = await apiClient.get('/home-banners/theme');
      const theme = res.data?.data?.theme;
      if (theme && BANNER_THEMES.some((t) => t.id === theme)) {
        setActiveThemeState(theme);
        setHomeStorageCache(CACHE_KEY_BANNER_THEME, theme);
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch theme error:', err?.message || err);
    } finally {
      isFetchingThemeRef.current = false;
    }
  }, []);

  // Update active theme (persists to backend DB + cross-tab sync)
  const setActiveTheme = async (newTheme: string): Promise<boolean> => {
    if (!BANNER_THEMES.some((t) => t.id === newTheme)) {
      toast.error('Invalid theme selected');
      return false;
    }
    try {
      setActiveThemeState(newTheme);
      setHomeStorageCache(CACHE_KEY_BANNER_THEME, newTheme);

      // 1. Cross-tab sync
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.postMessage({ type: 'BANNER_THEME_UPDATED', theme: newTheme });
        bc.close();
      }
      // 2. Same-window custom event
      window.dispatchEvent(new CustomEvent('yteddybags_banner_theme_updated', { detail: newTheme }));

      // 3. Persist to DB via Admin API
      await adminApiClient.put('/home-banners/admin/theme', { theme: newTheme });
      toast.success(`Active theme updated to ${BANNER_THEMES.find((t) => t.id === newTheme)?.name || newTheme}`);
      return true;
    } catch (err: any) {
      console.warn('[HomeBanner] Save theme error:', err?.message || err);
      toast.success(`Active theme switched to ${BANNER_THEMES.find((t) => t.id === newTheme)?.name || newTheme}`);
      return true;
    }
  };

  // Broadcast sync to other tabs/components without page reload
  const broadcastBannersUpdate = useCallback((newBanners: HomeBannerItem[]) => {
    try {
      const activeOnly = newBanners.filter((b) => b.is_active);
      setHomeStorageCache(CACHE_KEY_BANNERS, activeOnly);

      // 1. Cross-tab BroadcastChannel
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.postMessage({ type: 'BANNERS_UPDATED', banners: activeOnly });
        bc.close();
      }
      // 2. Same-window custom event
      window.dispatchEvent(new CustomEvent('yteddybags_banners_updated', { detail: activeOnly }));
    } catch (_) {}
  }, []);

  // Helper to extract banner array from response
  const parseBannerArray = (resData: any): HomeBannerItem[] => {
    if (!resData) return [];
    if (Array.isArray(resData.data)) return resData.data;
    if (Array.isArray(resData.message)) return resData.message;
    if (Array.isArray(resData)) return resData;
    return [];
  };

  // Fetch public active banners dynamically from DB
  const fetchPublicBanners = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHomeStorageCache<HomeBannerItem[]>(CACHE_KEY_BANNERS);
      if (cached && cached.length > 0) {
        setBanners(cached);
        return;
      }
    }
    if (isFetchingBannersRef.current) return;
    try {
      isFetchingBannersRef.current = true;
      setLoading(true);
      const res = await apiClient.get('/home-banners');
      const list = parseBannerArray(res.data);
      if (list.length > 0) {
        setBanners(list);
        setHomeStorageCache(CACHE_KEY_BANNERS, list);
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch public banners error:', err?.message || err);
    } finally {
      setLoading(false);
      isFetchingBannersRef.current = false;
    }
  }, []);

  // Fetch all banners for Admin Management Dashboard
  const fetchAdminBanners = useCallback(async () => {
    try {
      setAdminLoading(true);
      const res = await adminApiClient.get('/home-banners/admin/all');
      const list = parseBannerArray(res.data);
      if (list.length > 0) {
        setAdminBanners(list);
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch admin banners error:', err?.message || err);
      const list = parseBannerArray((await apiClient.get('/home-banners')).data);
      if (list.length > 0) setAdminBanners(list);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  // Upload image or video media file
  const uploadBannerMedia = async (file: File): Promise<UploadMediaResult | null> => {
    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading(`Uploading ${file.type.startsWith('video/') ? 'video' : 'image'} to Cloud storage...`);
    try {
      const res = await adminApiClient.post('/home-banners/admin/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const payload = res.data?.data || res.data?.message;
      if (payload && payload.url) {
        toast.success(`${payload.mediaType === 'video' ? 'Video' : 'Image'} uploaded successfully!`, { id: toastId });
        return {
          url: payload.url,
          mediaType: payload.mediaType,
          originalName: payload.originalName || file.name,
        };
      }
      throw new Error('Failed to retrieve uploaded media URL');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Media upload failed';
      toast.error(msg, { id: toastId });
      return null;
    }
  };

  // Create new banner
  const createBanner = async (data: Partial<HomeBannerItem>): Promise<boolean> => {
    const toastId = toast.loading('Creating home hero banner...');
    try {
      const res = await adminApiClient.post('/home-banners/admin', data);
      const created = res.data?.data || res.data?.message;
      if (created && created.id) {
        toast.success('Home banner created successfully!', { id: toastId });
        const updatedAdmin = [...adminBanners, created];
        setAdminBanners(updatedAdmin);
        broadcastBannersUpdate(updatedAdmin);
        return true;
      }
      throw new Error('Failed to create banner');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error creating banner';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Update existing banner
  const updateBanner = async (id: string, data: Partial<HomeBannerItem>): Promise<boolean> => {
    const toastId = toast.loading('Saving banner updates...');
    try {
      const res = await adminApiClient.put(`/home-banners/admin/${id}`, data);
      if (res.data?.success) {
        toast.success('Banner updated successfully!', { id: toastId });
        const updated = adminBanners.map((b) => (b.id === id ? { ...b, ...data } : b));
        setAdminBanners(updated);
        broadcastBannersUpdate(updated);
        return true;
      }
      throw new Error('Failed to update banner');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error updating banner';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Delete banner
  const deleteBanner = async (id: string): Promise<boolean> => {
    const toastId = toast.loading('Deleting banner...');
    try {
      const res = await adminApiClient.delete(`/home-banners/admin/${id}`);
      if (res.data?.success) {
        toast.success('Banner deleted successfully!', { id: toastId });
        const updated = adminBanners.filter((b) => b.id !== id);
        setAdminBanners(updated);
        broadcastBannersUpdate(updated);
        return true;
      }
      throw new Error('Failed to delete banner');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error deleting banner';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Toggle active status
  const toggleBannerStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const updated = adminBanners.map((b) => (b.id === id ? { ...b, is_active: isActive } : b));
      setAdminBanners(updated);
      broadcastBannersUpdate(updated);

      const res = await adminApiClient.put(`/home-banners/admin/${id}`, { is_active: isActive });
      if (res.data?.success) {
        toast.success(`Banner ${isActive ? 'activated' : 'deactivated'}`);
        return true;
      }
      throw new Error('Failed to toggle status');
    } catch (err: any) {
      toast.error('Failed to update banner status');
      await fetchAdminBanners();
      return false;
    }
  };

  // Reorder banners
  const reorderBanners = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const updated = [...adminBanners];
      updated.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
      setAdminBanners(updated);
      broadcastBannersUpdate(updated);

      const res = await adminApiClient.patch('/home-banners/admin/reorder', { orderedIds });
      if (res.data?.success) {
        toast.success('Banner order updated!');
        return true;
      }
      throw new Error('Failed to reorder');
    } catch (err: any) {
      toast.error('Failed to update banner order');
      await fetchAdminBanners();
      return false;
    }
  };

  // --------------------------------------------------------------------------
  // SUB-BANNERS (Quick Category Strip) Methods
  // --------------------------------------------------------------------------

  const broadcastSubBannersUpdate = (items: HomeSubBannerItem[], settings?: SubBannerSettings) => {
    try {
      const activeOnly = items.filter((b) => b.is_active);
      setHomeStorageCache(CACHE_KEY_SUB_BANNERS, { items: activeOnly, settings: settings || subBannerSettings });

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.postMessage({ type: 'SUB_BANNERS_UPDATED', items, settings });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent('yteddybags_sub_banners_updated', { detail: { items, settings } }));
    } catch (_) {}
  };

  // Fetch public active sub-banners dynamically from DB
  const fetchPublicSubBanners = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHomeStorageCache<{ items: HomeSubBannerItem[]; settings: SubBannerSettings }>(CACHE_KEY_SUB_BANNERS);
      if (cached && cached.items && cached.items.length > 0) {
        setSubBanners(cached.items);
        if (cached.settings) setSubBannerSettings(cached.settings);
        return;
      }
    }
    if (isFetchingSubBannersRef.current) return;
    try {
      isFetchingSubBannersRef.current = true;
      setSubBannerLoading(true);
      const res = await apiClient.get('/home-banners/sub-banners');
      if (res.data?.success && res.data.data) {
        const { is_enabled, default_hover_bg, items } = res.data.data;
        const newSettings =
          typeof is_enabled === 'boolean'
            ? { is_enabled, default_hover_bg: default_hover_bg || '#FFF7ED' }
            : subBannerSettings;
        if (Array.isArray(items)) {
          setSubBanners(items);
        }
        if (typeof is_enabled === 'boolean') {
          setSubBannerSettings(newSettings);
        }
        setHomeStorageCache(CACHE_KEY_SUB_BANNERS, { items: items || [], settings: newSettings });
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch sub-banners error:', err?.message || err);
    } finally {
      setSubBannerLoading(false);
      isFetchingSubBannersRef.current = false;
    }
  }, [subBannerSettings]);

  // Fetch admin all sub-banners
  const fetchAdminSubBanners = useCallback(async () => {
    try {
      setSubBannerLoading(true);
      const res = await adminApiClient.get('/home-banners/admin/sub-banners');
      if (res.data?.success && res.data.data) {
        const { is_enabled, default_hover_bg, items } = res.data.data;
        if (Array.isArray(items)) {
          setAdminSubBanners(items);
        }
        if (typeof is_enabled === 'boolean') {
          setSubBannerSettings({ is_enabled, default_hover_bg: default_hover_bg || '#FFF7ED' });
        }
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch admin sub-banners error:', err?.message || err);
    } finally {
      setSubBannerLoading(false);
    }
  }, []);

  // Create sub-banner
  const createSubBanner = async (data: Partial<HomeSubBannerItem>): Promise<boolean> => {
    const toastId = toast.loading('Adding category item...');
    try {
      const sanitizedPayload = {
        ...data,
        target_header_id: data.target_header_id ? data.target_header_id : null,
        target_dropdown_id: data.target_dropdown_id ? data.target_dropdown_id : null,
      };
      const res = await adminApiClient.post('/home-banners/admin/sub-banners', sanitizedPayload);
      if (res.data?.success && res.data.data) {
        toast.success('Category item added successfully!', { id: toastId });
        const created: HomeSubBannerItem = res.data.data;
        const updated = [...adminSubBanners, created];
        setAdminSubBanners(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setSubBanners(activeOnly);
        broadcastSubBannersUpdate(activeOnly, subBannerSettings);
        await fetchPublicSubBanners(true);
        return true;
      }
      throw new Error(res.data?.message || 'Failed to create item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error creating category item';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Update sub-banner
  const updateSubBanner = async (id: string, data: Partial<HomeSubBannerItem>): Promise<boolean> => {
    const toastId = toast.loading('Updating category item...');
    try {
      const sanitizedPayload = {
        ...data,
        target_header_id: data.target_header_id ? data.target_header_id : null,
        target_dropdown_id: data.target_dropdown_id ? data.target_dropdown_id : null,
      };
      const res = await adminApiClient.put(`/home-banners/admin/sub-banners/${id}`, sanitizedPayload);
      if (res.data?.success && res.data.data) {
        toast.success('Category item updated successfully!', { id: toastId });
        const updatedItem: HomeSubBannerItem = res.data.data;
        const updated = adminSubBanners.map((b) => (b.id === id ? updatedItem : b));
        setAdminSubBanners(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setSubBanners(activeOnly);
        broadcastSubBannersUpdate(activeOnly, subBannerSettings);
        await fetchPublicSubBanners(true);
        return true;
      }
      throw new Error(res.data?.message || 'Failed to update item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error updating category item';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Delete sub-banner
  const deleteSubBanner = async (id: string): Promise<boolean> => {
    const toastId = toast.loading('Deleting category item...');
    try {
      const res = await adminApiClient.delete(`/home-banners/admin/sub-banners/${id}`);
      if (res.data?.success) {
        toast.success('Category item deleted!', { id: toastId });
        const updated = adminSubBanners.filter((b) => b.id !== id);
        setAdminSubBanners(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setSubBanners(activeOnly);
        broadcastSubBannersUpdate(activeOnly, subBannerSettings);
        await fetchPublicSubBanners(true);
        return true;
      }
      throw new Error('Failed to delete item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error deleting item';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Toggle sub-banner active status
  const toggleSubBannerStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const updated = adminSubBanners.map((b) => (b.id === id ? { ...b, is_active: isActive } : b));
      setAdminSubBanners(updated);
      const activeOnly = updated.filter((b) => b.is_active);
      setSubBanners(activeOnly);
      broadcastSubBannersUpdate(activeOnly, subBannerSettings);

      const res = await adminApiClient.put(`/home-banners/admin/sub-banners/${id}`, { is_active: isActive });
      if (res.data?.success) {
        toast.success(`Category ${isActive ? 'activated' : 'deactivated'}`);
        await fetchPublicSubBanners(true);
        return true;
      }
      throw new Error('Failed to toggle category');
    } catch (err: any) {
      toast.error('Failed to update category status');
      await fetchAdminSubBanners();
      return false;
    }
  };

  // Reorder sub-banners
  const reorderSubBanners = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const updated = [...adminSubBanners];
      updated.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
      setAdminSubBanners(updated);
      const activeOnly = updated.filter((b) => b.is_active);
      setSubBanners(activeOnly);
      broadcastSubBannersUpdate(activeOnly, subBannerSettings);

      const res = await adminApiClient.patch('/home-banners/admin/sub-banners/reorder', { orderedIds });
      if (res.data?.success) {
        toast.success('Categories reordered successfully!');
        await fetchPublicSubBanners(true);
        return true;
      }
      throw new Error('Failed to reorder');
    } catch (err: any) {
      toast.error('Failed to reorder categories');
      await fetchAdminSubBanners();
      return false;
    }
  };

  // Update sub-banner master settings (enable/disable strip + hover bg)
  const updateSubBannerSettings = async (settings: Partial<SubBannerSettings>): Promise<boolean> => {
    const toastId = toast.loading('Saving sub-banner settings...');
    try {
      const res = await adminApiClient.put('/home-banners/admin/sub-banners/settings', settings);
      if (res.data?.success && res.data.data) {
        toast.success('Sub-banner settings updated!', { id: toastId });
        const newSettings: SubBannerSettings = res.data.data;
        setSubBannerSettings(newSettings);
        const activeOnly = adminSubBanners.filter((b) => b.is_active);
        broadcastSubBannersUpdate(activeOnly, newSettings);
        return true;
      }
      throw new Error('Failed to update settings');
    } catch (err: any) {
      toast.error('Failed to save settings', { id: toastId });
      return false;
    }
  };

  // Broadcast occasions update
  const broadcastOccasionsUpdate = (items: HomeOccasionItem[], settings?: OccasionSettings) => {
    try {
      const activeOnly = items.filter((b) => b.is_active);
      setHomeStorageCache(CACHE_KEY_OCCASIONS, { items: activeOnly, settings: settings || occasionsSettings });

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.postMessage({ type: 'OCCASIONS_UPDATED', items, settings });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent('yteddybags_occasions_updated', { detail: { items, settings } }));
    } catch (_) {}
  };

  // Fetch public active occasions & settings dynamically from DB
  const fetchPublicOccasions = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHomeStorageCache<{ items: HomeOccasionItem[]; settings: OccasionSettings }>(CACHE_KEY_OCCASIONS);
      if (cached && cached.items && cached.items.length > 0) {
        setOccasions(cached.items);
        if (cached.settings) setOccasionsSettings(cached.settings);
        return;
      }
    }
    if (isFetchingOccasionsRef.current) return;
    try {
      isFetchingOccasionsRef.current = true;
      setOccasionsLoading(true);
      const res = await apiClient.get('/home-banners/occasions');
      if (res.data?.success && res.data.data) {
        const { is_enabled, section_title, items } = res.data.data;
        const newSettings =
          typeof is_enabled === 'boolean'
            ? { is_enabled, section_title: section_title || 'Gifts For Every Occasion' }
            : occasionsSettings;
        if (Array.isArray(items)) {
          setOccasions(items);
        }
        if (typeof is_enabled === 'boolean') {
          setOccasionsSettings(newSettings);
        }
        setHomeStorageCache(CACHE_KEY_OCCASIONS, { items: items || [], settings: newSettings });
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch occasions error:', err?.message || err);
    } finally {
      setOccasionsLoading(false);
      isFetchingOccasionsRef.current = false;
    }
  }, [occasionsSettings]);

  // Fetch admin all occasions & settings
  const fetchAdminOccasions = useCallback(async () => {
    try {
      setOccasionsLoading(true);
      const res = await adminApiClient.get('/home-banners/admin/occasions');
      if (res.data?.success && res.data.data) {
        const { is_enabled, section_title, items } = res.data.data;
        if (Array.isArray(items)) {
          setAdminOccasions(items);
        }
        if (typeof is_enabled === 'boolean') {
          setOccasionsSettings({ is_enabled, section_title: section_title || 'Gifts For Every Occasion' });
        }
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch admin occasions error:', err?.message || err);
    } finally {
      setOccasionsLoading(false);
    }
  }, []);

  // Create occasion
  const createOccasion = async (data: Partial<HomeOccasionItem>): Promise<boolean> => {
    const toastId = toast.loading('Adding occasion card...');
    try {
      const sanitizedPayload = {
        ...data,
        target_header_id: data.target_header_id ? data.target_header_id : null,
        target_dropdown_id: data.target_dropdown_id ? data.target_dropdown_id : null,
      };
      const res = await adminApiClient.post('/home-banners/admin/occasions', sanitizedPayload);
      if (res.data?.success && res.data.data) {
        toast.success('Occasion card added successfully!', { id: toastId });
        const created: HomeOccasionItem = res.data.data;
        const updated = [...adminOccasions, created];
        setAdminOccasions(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setOccasions(activeOnly);
        broadcastOccasionsUpdate(activeOnly, occasionsSettings);
        await fetchPublicOccasions(true);
        return true;
      }
      throw new Error(res.data?.message || 'Failed to create item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error creating occasion card';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Update occasion
  const updateOccasion = async (id: string, data: Partial<HomeOccasionItem>): Promise<boolean> => {
    const toastId = toast.loading('Updating occasion card...');
    try {
      const sanitizedPayload = {
        ...data,
        target_header_id: data.target_header_id ? data.target_header_id : null,
        target_dropdown_id: data.target_dropdown_id ? data.target_dropdown_id : null,
      };
      const res = await adminApiClient.put(`/home-banners/admin/occasions/${id}`, sanitizedPayload);
      if (res.data?.success && res.data.data) {
        toast.success('Occasion card updated successfully!', { id: toastId });
        const updatedItem: HomeOccasionItem = res.data.data;
        const updated = adminOccasions.map((b) => (b.id === id ? updatedItem : b));
        setAdminOccasions(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setOccasions(activeOnly);
        broadcastOccasionsUpdate(activeOnly, occasionsSettings);
        await fetchPublicOccasions(true);
        return true;
      }
      throw new Error(res.data?.message || 'Failed to update item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error updating occasion card';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Delete occasion
  const deleteOccasion = async (id: string): Promise<boolean> => {
    const toastId = toast.loading('Deleting occasion card...');
    try {
      const res = await adminApiClient.delete(`/home-banners/admin/occasions/${id}`);
      if (res.data?.success) {
        toast.success('Occasion card deleted!', { id: toastId });
        const updated = adminOccasions.filter((b) => b.id !== id);
        setAdminOccasions(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setOccasions(activeOnly);
        broadcastOccasionsUpdate(activeOnly, occasionsSettings);
        await fetchPublicOccasions(true);
        return true;
      }
      throw new Error('Failed to delete item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error deleting item';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Toggle occasion status
  const toggleOccasionStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const updated = adminOccasions.map((b) => (b.id === id ? { ...b, is_active: isActive } : b));
      setAdminOccasions(updated);
      const activeOnly = updated.filter((b) => b.is_active);
      setOccasions(activeOnly);
      broadcastOccasionsUpdate(activeOnly, occasionsSettings);

      const res = await adminApiClient.put(`/home-banners/admin/occasions/${id}`, { is_active: isActive });
      if (res.data?.success) {
        toast.success(`Occasion card ${isActive ? 'activated' : 'deactivated'}`);
        await fetchPublicOccasions(true);
        return true;
      }
      throw new Error('Failed to toggle occasion card');
    } catch (err: any) {
      toast.error('Failed to update occasion card status');
      await fetchAdminOccasions();
      return false;
    }
  };

  // Reorder occasions
  const reorderOccasions = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const updated = [...adminOccasions];
      updated.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
      setAdminOccasions(updated);
      const activeOnly = updated.filter((b) => b.is_active);
      setOccasions(activeOnly);
      broadcastOccasionsUpdate(activeOnly, occasionsSettings);

      const res = await adminApiClient.patch('/home-banners/admin/occasions/reorder', { orderedIds });
      if (res.data?.success) {
        toast.success('Occasions reordered successfully!');
        await fetchPublicOccasions(true);
        return true;
      }
      throw new Error('Failed to reorder');
    } catch (err: any) {
      toast.error('Failed to reorder occasions');
      await fetchAdminOccasions();
      return false;
    }
  };

  // Update occasion master settings (enable/disable strip + section_title)
  const updateOccasionSettings = async (settings: Partial<OccasionSettings>): Promise<boolean> => {
    const toastId = toast.loading('Saving occasion section settings...');
    try {
      const res = await adminApiClient.put('/home-banners/admin/occasions/settings', settings);
      if (res.data?.success && res.data.data) {
        toast.success('Occasion section settings updated!', { id: toastId });
        const newSettings: OccasionSettings = res.data.data;
        setOccasionsSettings(newSettings);
        const activeOnly = adminOccasions.filter((b) => b.is_active);
        broadcastOccasionsUpdate(activeOnly, newSettings);
        return true;
      }
      throw new Error('Failed to update settings');
    } catch (err: any) {
      toast.error('Failed to save settings', { id: toastId });
      return false;
    }
  };

  // Broadcast bestsellers update across tabs & components
  const broadcastBestsellersUpdate = (items: HomeBestsellerItem[], settings?: BestsellerSettings) => {
    try {
      const activeOnly = items.filter((b) => b.is_active);
      setHomeStorageCache(CACHE_KEY_BESTSELLERS, { items: activeOnly, settings: settings || bestsellerSettings });

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.postMessage({ type: 'BESTSELLERS_UPDATED', items, settings });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent('yteddybags_bestsellers_updated', { detail: { items, settings } }));
    } catch (_) {}
  };

  // Fetch public active bestsellers & settings dynamically from DB
  const fetchPublicBestsellers = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHomeStorageCache<{ items: HomeBestsellerItem[]; settings: BestsellerSettings }>(CACHE_KEY_BESTSELLERS);
      if (cached && cached.items && cached.items.length > 0) {
        setBestsellers(cached.items);
        if (cached.settings) setBestsellerSettings(cached.settings);
        return;
      }
    }
    if (isFetchingBestsellersRef.current) return;
    try {
      isFetchingBestsellersRef.current = true;
      setBestsellerLoading(true);
      const res = await apiClient.get('/home-banners/bestsellers');
      if (res.data?.success && res.data.data) {
        const {
          is_enabled,
          section_title,
          section_subtitle,
          view_all_text,
          view_all_url,
          show_view_all,
          card_theme,
          card_bg_mode,
          card_bg_color,
          card_transparency,
          section_bg_mode,
          section_bg_color,
          cards_per_row,
          view_all_target_header_id,
          view_all_target_dropdown_id,
          view_all_link_type,
          items,
        } = res.data.data;

        if (Array.isArray(items)) {
          setBestsellers(items);
        }

        const newSettings: BestsellerSettings = {
          is_enabled: typeof is_enabled === 'boolean' ? is_enabled : true,
          section_title: section_title || 'Shop By Bestsellers',
          section_subtitle: section_subtitle || "Discover India's favourite gifting options, curated bestsellers that make every celebration extra special",
          view_all_text: view_all_text || 'View All Bestsellers',
          view_all_url: view_all_url || '/category/bestsellers',
          show_view_all: typeof show_view_all === 'boolean' ? show_view_all : true,
          card_theme: card_theme || 'classic-clean',
          card_bg_mode: card_bg_mode || 'white',
          card_bg_color: card_bg_color || '#FFFFFF',
          card_transparency: typeof card_transparency === 'number' ? card_transparency : 0,
          section_bg_mode: section_bg_mode || 'transparent',
          section_bg_color: section_bg_color || '#FFFFFF',
          cards_per_row: cards_per_row || '4',
          view_all_target_header_id: view_all_target_header_id || null,
          view_all_target_dropdown_id: view_all_target_dropdown_id || null,
          view_all_link_type: view_all_link_type || 'header',
        };

        setBestsellerSettings(newSettings);
        setHomeStorageCache(CACHE_KEY_BESTSELLERS, { items: items || [], settings: newSettings });
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch bestsellers error:', err?.message || err);
    } finally {
      setBestsellerLoading(false);
      isFetchingBestsellersRef.current = false;
    }
  }, [bestsellerSettings]);

  // Fetch admin all bestsellers & settings
  const fetchAdminBestsellers = useCallback(async () => {
    try {
      setBestsellerLoading(true);
      const res = await adminApiClient.get('/home-banners/admin/bestsellers');
      if (res.data?.success && res.data.data) {
        const {
          is_enabled,
          section_title,
          section_subtitle,
          view_all_text,
          view_all_url,
          show_view_all,
          card_theme,
          card_bg_mode,
          card_bg_color,
          card_transparency,
          section_bg_mode,
          section_bg_color,
          cards_per_row,
          view_all_target_header_id,
          view_all_target_dropdown_id,
          view_all_link_type,
          items,
        } = res.data.data;

        if (Array.isArray(items)) {
          setAdminBestsellers(items);
        }

        setBestsellerSettings({
          is_enabled: typeof is_enabled === 'boolean' ? is_enabled : true,
          section_title: section_title || 'Shop By Bestsellers',
          section_subtitle: section_subtitle || "Discover India's favourite gifting options, curated bestsellers that make every celebration extra special",
          view_all_text: view_all_text || 'View All Bestsellers',
          view_all_url: view_all_url || '/category/bestsellers',
          show_view_all: typeof show_view_all === 'boolean' ? show_view_all : true,
          card_theme: card_theme || 'classic-clean',
          card_bg_mode: card_bg_mode || 'white',
          card_bg_color: card_bg_color || '#FFFFFF',
          card_transparency: typeof card_transparency === 'number' ? card_transparency : 0,
          section_bg_mode: section_bg_mode || 'transparent',
          section_bg_color: section_bg_color || '#FFFFFF',
          cards_per_row: cards_per_row || '4',
          view_all_target_header_id: view_all_target_header_id || null,
          view_all_target_dropdown_id: view_all_target_dropdown_id || null,
          view_all_link_type: view_all_link_type || 'header',
        });
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch admin bestsellers error:', err?.message || err);
    } finally {
      setBestsellerLoading(false);
    }
  }, []);

  // Create bestseller
  const createBestseller = async (data: Partial<HomeBestsellerItem>): Promise<boolean> => {
    const toastId = toast.loading('Adding bestseller card...');
    try {
      const sanitizedPayload = {
        ...data,
        target_header_id: data.target_header_id ? data.target_header_id : null,
        target_dropdown_id: data.target_dropdown_id ? data.target_dropdown_id : null,
      };
      const res = await adminApiClient.post('/home-banners/admin/bestsellers', sanitizedPayload);
      if (res.data?.success && res.data.data) {
        toast.success('Bestseller card added successfully!', { id: toastId });
        const created: HomeBestsellerItem = res.data.data;
        const updated = [...adminBestsellers, created];
        setAdminBestsellers(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setBestsellers(activeOnly);
        broadcastBestsellersUpdate(activeOnly, bestsellerSettings);
        await fetchPublicBestsellers(true);
        return true;
      }
      throw new Error(res.data?.message || 'Failed to create item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error creating bestseller card';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Update bestseller
  const updateBestseller = async (id: string, data: Partial<HomeBestsellerItem>): Promise<boolean> => {
    const toastId = toast.loading('Updating bestseller card...');
    try {
      const sanitizedPayload = {
        ...data,
        target_header_id: data.target_header_id ? data.target_header_id : null,
        target_dropdown_id: data.target_dropdown_id ? data.target_dropdown_id : null,
      };
      const res = await adminApiClient.put(`/home-banners/admin/bestsellers/${id}`, sanitizedPayload);
      if (res.data?.success && res.data.data) {
        toast.success('Bestseller card updated successfully!', { id: toastId });
        const updatedItem: HomeBestsellerItem = res.data.data;
        const updated = adminBestsellers.map((b) => (b.id === id ? updatedItem : b));
        setAdminBestsellers(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setBestsellers(activeOnly);
        broadcastBestsellersUpdate(activeOnly, bestsellerSettings);
        await fetchPublicBestsellers(true);
        return true;
      }
      throw new Error(res.data?.message || 'Failed to update item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error updating bestseller card';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Delete bestseller
  const deleteBestseller = async (id: string): Promise<boolean> => {
    const toastId = toast.loading('Deleting bestseller card...');
    try {
      const res = await adminApiClient.delete(`/home-banners/admin/bestsellers/${id}`);
      if (res.data?.success) {
        toast.success('Bestseller card deleted!', { id: toastId });
        const updated = adminBestsellers.filter((b) => b.id !== id);
        setAdminBestsellers(updated);
        const activeOnly = updated.filter((b) => b.is_active);
        setBestsellers(activeOnly);
        broadcastBestsellersUpdate(activeOnly, bestsellerSettings);
        await fetchPublicBestsellers(true);
        return true;
      }
      throw new Error('Failed to delete item');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error deleting item';
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  // Toggle bestseller status
  const toggleBestsellerStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const updated = adminBestsellers.map((b) => (b.id === id ? { ...b, is_active: isActive } : b));
      setAdminBestsellers(updated);
      const activeOnly = updated.filter((b) => b.is_active);
      setBestsellers(activeOnly);
      broadcastBestsellersUpdate(activeOnly, bestsellerSettings);

      const res = await adminApiClient.put(`/home-banners/admin/bestsellers/${id}`, { is_active: isActive });
      if (res.data?.success) {
        toast.success(`Bestseller card ${isActive ? 'activated' : 'deactivated'}`);
        await fetchPublicBestsellers(true);
        return true;
      }
      throw new Error('Failed to toggle bestseller card');
    } catch (err: any) {
      toast.error('Failed to update bestseller card status');
      await fetchAdminBestsellers();
      return false;
    }
  };

  // Reorder bestsellers
  const reorderBestsellers = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const updated = [...adminBestsellers];
      updated.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
      setAdminBestsellers(updated);
      const activeOnly = updated.filter((b) => b.is_active);
      setBestsellers(activeOnly);
      broadcastBestsellersUpdate(activeOnly, bestsellerSettings);

      const res = await adminApiClient.patch('/home-banners/admin/bestsellers/reorder', { orderedIds });
      if (res.data?.success) {
        toast.success('Bestsellers reordered successfully!');
        await fetchPublicBestsellers(true);
        return true;
      }
      throw new Error('Failed to reorder');
    } catch (err: any) {
      toast.error('Failed to reorder bestsellers');
      await fetchAdminBestsellers();
      return false;
    }
  };

  // Update bestseller master settings
  const updateBestsellerSettings = async (settings: Partial<BestsellerSettings>): Promise<boolean> => {
    const toastId = toast.loading('Saving bestseller section settings...');
    try {
      const res = await adminApiClient.put('/home-banners/admin/bestsellers/settings', settings);
      if (res.data?.success && res.data.data) {
        toast.success('Bestseller section settings updated!', { id: toastId });
        const newSettings: BestsellerSettings = res.data.data;
        setBestsellerSettings(newSettings);
        const activeOnly = adminBestsellers.filter((b) => b.is_active);
        broadcastBestsellersUpdate(activeOnly, newSettings);
        return true;
      }
      throw new Error('Failed to update settings');
    } catch (err: any) {
      toast.error('Failed to save settings', { id: toastId });
      return false;
    }
  };

  // Broadcast promo banner update across tabs & components
  const broadcastPromoUpdate = (items: HomePromoBannerItem[], settings?: PromoBannerSettings) => {
    try {
      const activeOnly = items.filter((b) => b.is_active);
      setHomeStorageCache(CACHE_KEY_PROMO_BANNERS, { items: activeOnly, settings: settings || promoBannerSettings });

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.postMessage({ type: 'PROMO_BANNER_UPDATED', items, settings });
        bc.close();
      }
    } catch (_) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yteddybags_promo_banner_updated', { detail: { items, settings } }));
    }
  };

  // Fetch public active promo banners & settings dynamically from DB
  const fetchPublicPromoBanners = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHomeStorageCache<{ items: HomePromoBannerItem[]; settings: PromoBannerSettings }>(CACHE_KEY_PROMO_BANNERS);
      if (cached && cached.items && cached.items.length > 0) {
        setPromoBanners(cached.items);
        if (cached.settings) setPromoBannerSettings(cached.settings);
        return;
      }
    }
    if (isFetchingPromoRef.current) return;
    try {
      isFetchingPromoRef.current = true;
      setPromoBannerLoading(true);
      const res = await apiClient.get('/home-banners/promo-banner');
      if (res.data?.success && res.data.data) {
        const { items, settings } = res.data.data;
        if (Array.isArray(items)) {
          setPromoBanners(items);
        }
        if (settings) {
          setPromoBannerSettings(settings);
        }
        setHomeStorageCache(CACHE_KEY_PROMO_BANNERS, { items: items || [], settings: settings || promoBannerSettings });
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch promo banner error:', err?.message || err);
    } finally {
      setPromoBannerLoading(false);
      isFetchingPromoRef.current = false;
    }
  }, [promoBannerSettings]);

  // Fetch admin all promo banners & settings
  const fetchAdminPromoBanners = useCallback(async () => {
    try {
      setPromoBannerLoading(true);
      const res = await adminApiClient.get('/home-banners/admin/promo-banners');
      if (res.data?.success && res.data.data) {
        const { items, settings } = res.data.data;
        if (Array.isArray(items)) {
          setAdminPromoBanners(items);
          setPromoBanners(items.filter((b: HomePromoBannerItem) => b.is_active));
        }
        if (settings) {
          setPromoBannerSettings(settings);
        }
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch admin promo banner error:', err?.message || err);
    } finally {
      setPromoBannerLoading(false);
    }
  }, []);

  // Create new promo banner slide
  const createPromoBanner = async (data: Partial<HomePromoBannerItem>): Promise<boolean> => {
    const toastId = toast.loading('Creating promo banner slide...');
    try {
      const res = await adminApiClient.post('/home-banners/admin/promo-banners', data);
      if (res.data?.success && res.data.data) {
        toast.success('Promo banner slide added successfully!', { id: toastId });
        await fetchAdminPromoBanners();
        broadcastPromoUpdate(adminPromoBanners, promoBannerSettings);
        return true;
      }
      throw new Error('Failed to create promo banner');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create promo banner', { id: toastId });
      return false;
    }
  };

  // Update existing promo banner slide
  const updatePromoBanner = async (id: string, data: Partial<HomePromoBannerItem>): Promise<boolean> => {
    const toastId = toast.loading('Updating promo banner...');
    try {
      const res = await adminApiClient.put(`/home-banners/admin/promo-banners/${id}`, data);
      if (res.data?.success && res.data.data) {
        toast.success('Promo banner updated successfully!', { id: toastId });
        await fetchAdminPromoBanners();
        broadcastPromoUpdate(adminPromoBanners, promoBannerSettings);
        return true;
      }
      throw new Error('Failed to update promo banner');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update promo banner', { id: toastId });
      return false;
    }
  };

  // Delete promo banner slide
  const deletePromoBanner = async (id: string): Promise<boolean> => {
    const toastId = toast.loading('Deleting promo banner...');
    try {
      const res = await adminApiClient.delete(`/home-banners/admin/promo-banners/${id}`);
      if (res.data?.success) {
        toast.success('Promo banner deleted successfully!', { id: toastId });
        const updated = adminPromoBanners.filter((b) => b.id !== id);
        setAdminPromoBanners(updated);
        setPromoBanners(updated.filter((b) => b.is_active));
        broadcastPromoUpdate(updated.filter((b) => b.is_active), promoBannerSettings);
        return true;
      }
      throw new Error('Failed to delete promo banner');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete promo banner', { id: toastId });
      return false;
    }
  };

  // Toggle promo banner active status
  const togglePromoBannerStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    const toastId = toast.loading(isActive ? 'Activating banner...' : 'Deactivating banner...');
    try {
      const res = await adminApiClient.put(`/home-banners/admin/promo-banners/${id}`, { is_active: isActive });
      if (res.data?.success) {
        toast.success(`Banner ${isActive ? 'activated' : 'deactivated'} successfully!`, { id: toastId });
        await fetchAdminPromoBanners();
        broadcastPromoUpdate(adminPromoBanners, promoBannerSettings);
        return true;
      }
      throw new Error('Failed to update status');
    } catch (err: any) {
      toast.error('Failed to update status', { id: toastId });
      return false;
    }
  };

  // Reorder promo banners
  const reorderPromoBanners = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const reordered = orderedIds
        .map((id) => adminPromoBanners.find((b) => b.id === id))
        .filter(Boolean) as HomePromoBannerItem[];
      setAdminPromoBanners(reordered);
      setPromoBanners(reordered.filter((b) => b.is_active));

      const res = await adminApiClient.patch('/home-banners/admin/promo-banners/reorder', { orderedIds });
      if (res.data?.success) {
        toast.success('Promo banners reordered!');
        broadcastPromoUpdate(reordered.filter((b) => b.is_active), promoBannerSettings);
        return true;
      }
      throw new Error('Failed to reorder');
    } catch (err: any) {
      toast.error('Failed to reorder promo banners');
      await fetchAdminPromoBanners();
      return false;
    }
  };

  // Update promo banner master settings
  const updatePromoBannerSettings = async (settings: Partial<PromoBannerSettings>): Promise<boolean> => {
    const toastId = toast.loading('Saving promo banner settings...');
    try {
      const res = await adminApiClient.put('/home-banners/admin/promo-banners/settings', settings);
      if (res.data?.success && res.data.data) {
        toast.success('Promo banner settings updated!', { id: toastId });
        const newSettings: PromoBannerSettings = res.data.data;
        setPromoBannerSettings(newSettings);
        const activeOnly = adminPromoBanners.filter((b) => b.is_active);
        broadcastPromoUpdate(activeOnly, newSettings);
        return true;
      }
      throw new Error('Failed to update settings');
    } catch (err: any) {
      toast.error('Failed to save promo settings', { id: toastId });
      return false;
    }
  };

  // Custom Showcase Cards Broadcast Helper
  const broadcastCustomCardsUpdate = (items: HomeCustomCardItem[], settings: CustomCardsSettings) => {
    try {
      const activeOnly = items.filter((b) => b.is_active);
      setHomeStorageCache(CACHE_KEY_CUSTOM_CARDS, { items: activeOnly, settings });

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.postMessage({ type: 'CUSTOM_CARDS_UPDATED', items, settings });
        bc.close();
      }
    } catch (_) {}

    try {
      window.dispatchEvent(
        new CustomEvent('yteddybags_custom_cards_updated', {
          detail: { items, settings },
        })
      );
    } catch (_) {}
  };

  // Fetch public custom cards dynamically from DB
  const fetchPublicCustomCards = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHomeStorageCache<{ items: HomeCustomCardItem[]; settings: CustomCardsSettings }>(CACHE_KEY_CUSTOM_CARDS);
      if (cached && cached.items && cached.items.length > 0) {
        setCustomCards(cached.items);
        if (cached.settings) setCustomCardsSettings(cached.settings);
        return;
      }
    }
    if (isFetchingCustomCardsRef.current) return;
    try {
      isFetchingCustomCardsRef.current = true;
      setCustomCardsLoading(true);
      const res = await apiClient.get('/home-banners/custom-cards');
      if (res.data?.success && res.data.data) {
        const items: HomeCustomCardItem[] = res.data.data.items || [];
        const settings: CustomCardsSettings = res.data.data.settings || defaultCustomCardsSettings;
        setCustomCards(items);
        setCustomCardsSettings(settings);
        setHomeStorageCache(CACHE_KEY_CUSTOM_CARDS, { items, settings });
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch custom cards notice:', err?.message || err);
    } finally {
      setCustomCardsLoading(false);
      isFetchingCustomCardsRef.current = false;
    }
  }, []);

  // Fetch admin custom cards
  const fetchAdminCustomCards = useCallback(async () => {
    try {
      const res = await adminApiClient.get('/home-banners/admin/custom-cards');
      if (res.data?.success && res.data.data) {
        const items: HomeCustomCardItem[] = res.data.data.items || [];
        const settings: CustomCardsSettings = res.data.data.settings || defaultCustomCardsSettings;
        setAdminCustomCards(items);
        setCustomCards(items.filter((c) => c.is_active));
        setCustomCardsSettings(settings);
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch admin custom cards error:', err?.message || err);
    }
  }, []);

  // Create custom card
  const createCustomCard = async (data: Partial<HomeCustomCardItem>): Promise<boolean> => {
    const toastId = toast.loading('Creating showcase card...');
    try {
      const res = await adminApiClient.post('/home-banners/admin/custom-cards', data);
      if (res.data?.success && res.data.data) {
        toast.success('Showcase card created successfully!', { id: toastId });
        await fetchAdminCustomCards();
        const updated = [...adminCustomCards, res.data.data];
        broadcastCustomCardsUpdate(updated.filter((c) => c.is_active), customCardsSettings);
        return true;
      }
      throw new Error('Failed to create card');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create card', { id: toastId });
      return false;
    }
  };

  // Update custom card
  const updateCustomCard = async (id: string, data: Partial<HomeCustomCardItem>): Promise<boolean> => {
    const toastId = toast.loading('Updating showcase card...');
    try {
      const res = await adminApiClient.put(`/home-banners/admin/custom-cards/${id}`, data);
      if (res.data?.success && res.data.data) {
        toast.success('Showcase card updated successfully!', { id: toastId });
        const updated = adminCustomCards.map((c) => (c.id === id ? res.data.data : c));
        setAdminCustomCards(updated);
        setCustomCards(updated.filter((c) => c.is_active));
        broadcastCustomCardsUpdate(updated.filter((c) => c.is_active), customCardsSettings);
        return true;
      }
      throw new Error('Failed to update card');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update card', { id: toastId });
      return false;
    }
  };

  // Delete custom card
  const deleteCustomCard = async (id: string): Promise<boolean> => {
    const toastId = toast.loading('Deleting showcase card...');
    try {
      const res = await adminApiClient.delete(`/home-banners/admin/custom-cards/${id}`);
      if (res.data?.success) {
        toast.success('Showcase card deleted successfully!', { id: toastId });
        const updated = adminCustomCards.filter((c) => c.id !== id);
        setAdminCustomCards(updated);
        setCustomCards(updated.filter((c) => c.is_active));
        broadcastCustomCardsUpdate(updated.filter((c) => c.is_active), customCardsSettings);
        return true;
      }
      throw new Error('Failed to delete card');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete card', { id: toastId });
      return false;
    }
  };

  // Toggle custom card active status
  const toggleCustomCardStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    const toastId = toast.loading(isActive ? 'Activating card...' : 'Deactivating card...');
    try {
      const res = await adminApiClient.put(`/home-banners/admin/custom-cards/${id}`, { is_active: isActive });
      if (res.data?.success) {
        toast.success(`Card ${isActive ? 'activated' : 'deactivated'} successfully!`, { id: toastId });
        await fetchAdminCustomCards();
        broadcastCustomCardsUpdate(adminCustomCards, customCardsSettings);
        return true;
      }
      throw new Error('Failed to update card status');
    } catch (err: any) {
      toast.error('Failed to update status', { id: toastId });
      return false;
    }
  };

  // Reorder custom cards
  const reorderCustomCards = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const reordered = orderedIds
        .map((id) => adminCustomCards.find((c) => c.id === id))
        .filter(Boolean) as HomeCustomCardItem[];
      setAdminCustomCards(reordered);
      setCustomCards(reordered.filter((c) => c.is_active));

      const res = await adminApiClient.patch('/home-banners/admin/custom-cards/reorder', { orderedIds });
      if (res.data?.success) {
        toast.success('Cards reordered successfully!');
        broadcastCustomCardsUpdate(reordered.filter((c) => c.is_active), customCardsSettings);
        return true;
      }
      throw new Error('Failed to reorder');
    } catch (err: any) {
      toast.error('Failed to reorder cards');
      await fetchAdminCustomCards();
      return false;
    }
  };

  // Update custom cards master settings
  const updateCustomCardsSettings = async (settings: Partial<CustomCardsSettings>): Promise<boolean> => {
    const toastId = toast.loading('Saving custom cards settings...');
    try {
      const res = await adminApiClient.put('/home-banners/admin/custom-cards/settings', settings);
      if (res.data?.success && res.data.data) {
        toast.success('Settings saved successfully!', { id: toastId });
        const newSettings: CustomCardsSettings = res.data.data;
        setCustomCardsSettings(newSettings);
        const activeOnly = adminCustomCards.filter((c) => c.is_active);
        broadcastCustomCardsUpdate(activeOnly, newSettings);
        return true;
      }
      throw new Error('Failed to update settings');
    } catch (err: any) {
      toast.error('Failed to save settings', { id: toastId });
      return false;
    }
  };

  // Home Sections Layout Broadcast Helper
  const broadcastSectionsLayoutUpdate = (items: HomeSectionLayoutItem[]) => {
    try {
      const activeOnly = items.filter((s) => s.is_enabled !== false);
      setHomeStorageCache(CACHE_KEY_SECTIONS_LAYOUT, activeOnly);

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.postMessage({ type: 'SECTIONS_LAYOUT_UPDATED', items });
        bc.close();
      }
    } catch (_) {}

    try {
      window.dispatchEvent(
        new CustomEvent('yteddybags_sections_layout_updated', {
          detail: { items },
        })
      );
    } catch (_) {}
  };

  // Fetch public sections layout dynamically from DB
  const fetchPublicSectionsLayout = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHomeStorageCache<HomeSectionLayoutItem[]>(CACHE_KEY_SECTIONS_LAYOUT);
      if (cached && cached.length > 0) {
        setSectionsLayout(cached);
        return;
      }
    }
    if (isFetchingSectionsLayoutRef.current) return;
    try {
      const defaultIds = ['hero_banner_1', 'sub_banner_1', 'occasions_1', 'bestsellers_1', 'custom_cards_1', 'promo_banner_1'];

      isFetchingSectionsLayoutRef.current = true;
      setSectionsLayoutLoading(true);
      const res = await apiClient.get('/home-banners/layout');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const items: HomeSectionLayoutItem[] = res.data.data.map((item: any) => {
          const defaults = getSectionDefaultPadding(item.section_type);
          const pTop = toRemNumber(item.padding_top, defaults.top);
          const pBottom = toRemNumber(item.padding_bottom, defaults.bottom);
          let cleanItems =
            defaultIds.includes(item.id) && Array.isArray(item.items) && item.items.length === 0
              ? undefined
              : item.items;
          if (item.section_type === 'bestsellers' && Array.isArray(cleanItems)) {
            const isFlower = (t: string) => {
              const s = (t || '').toLowerCase();
              return (
                s.includes('pretty in pink') ||
                s.includes('sunflower symphony') ||
                s.includes('blush rose') ||
                s.includes('the muse') ||
                s.includes('white orchid') ||
                s.includes('floral vase')
              );
            };
            const nonFlowers = cleanItems.filter((b: any) => !isFlower(b?.title));
            cleanItems = nonFlowers.length > 0 ? nonFlowers : undefined;
          }
          return {
            ...item,
            items: cleanItems,
            padding_top:
              (item.section_type === 'bestsellers' || item.section_type === 'custom_cards') && pTop === 0
                ? defaults.top
                : pTop,
            padding_bottom:
              (item.section_type === 'bestsellers' || item.section_type === 'custom_cards') && pBottom === 0
                ? defaults.bottom
                : pBottom,
            margin_top: toRemNumber(item.margin_top, 0),
            margin_bottom: toRemNumber(item.margin_bottom, 0),
          };
        });
        setSectionsLayout(items);
        setHomeStorageCache(CACHE_KEY_SECTIONS_LAYOUT, items);
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch sections layout notice:', err?.message || err);
    } finally {
      setSectionsLayoutLoading(false);
      isFetchingSectionsLayoutRef.current = false;
    }
  }, []);

  // Fetch admin sections layout
  const fetchAdminSectionsLayout = useCallback(async () => {
    try {
      const res = await adminApiClient.get('/home-banners/admin/layout');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const defaultIds = ['hero_banner_1', 'sub_banner_1', 'occasions_1', 'bestsellers_1', 'custom_cards_1', 'promo_banner_1'];
        const items: HomeSectionLayoutItem[] = res.data.data.map((item: any) => {
          const defaults = getSectionDefaultPadding(item.section_type);
          const pTop = toRemNumber(item.padding_top, defaults.top);
          const pBottom = toRemNumber(item.padding_bottom, defaults.bottom);
          let cleanItems =
            defaultIds.includes(item.id) && Array.isArray(item.items) && item.items.length === 0
              ? undefined
              : item.items;
          if (item.section_type === 'bestsellers' && Array.isArray(cleanItems)) {
            const isFlower = (t: string) => {
              const s = (t || '').toLowerCase();
              return (
                s.includes('pretty in pink') ||
                s.includes('sunflower symphony') ||
                s.includes('blush rose') ||
                s.includes('the muse') ||
                s.includes('white orchid') ||
                s.includes('floral vase')
              );
            };
            const nonFlowers = cleanItems.filter((b: any) => !isFlower(b?.title));
            cleanItems = nonFlowers.length > 0 ? nonFlowers : undefined;
          }
          return {
            ...item,
            items: cleanItems,
            padding_top:
              (item.section_type === 'bestsellers' || item.section_type === 'custom_cards') && pTop === 0
                ? defaults.top
                : pTop,
            padding_bottom:
              (item.section_type === 'bestsellers' || item.section_type === 'custom_cards') && pBottom === 0
                ? defaults.bottom
                : pBottom,
            margin_top: toRemNumber(item.margin_top, 0),
            margin_bottom: toRemNumber(item.margin_bottom, 0),
          };
        });
        setAdminSectionsLayout(items);
        setSectionsLayout(items.filter((s) => s.is_enabled !== false));
      }
    } catch (err: any) {
      console.warn('[HomeBanner] Fetch admin sections layout error:', err?.message || err);
    }
  }, []);

  // Update sections layout
  const updateSectionsLayout = async (items: HomeSectionLayoutItem[]): Promise<boolean> => {
    const toastId = toast.loading('Saving home page layout & spacing...');
    try {
      const defaultIds = ['hero_banner_1', 'sub_banner_1', 'occasions_1', 'bestsellers_1', 'custom_cards_1', 'promo_banner_1'];
      const sanitized = items.map((item) => {
        const isDefault = defaultIds.includes(item.id);
        const cleanItems = isDefault && Array.isArray(item.items) && item.items.length === 0 ? undefined : item.items;
        return {
          ...item,
          items: cleanItems,
          padding_top: toRemNumber(item.padding_top, 1.0),
          padding_bottom: toRemNumber(item.padding_bottom, 1.5),
          margin_top: toRemNumber(item.margin_top, 0),
          margin_bottom: toRemNumber(item.margin_bottom, 0),
        };
      });
      const res = await adminApiClient.put('/home-banners/admin/layout', { items: sanitized });
      if (res.data?.success && Array.isArray(res.data.data)) {
        toast.success('Page layout & spacing saved successfully!', { id: toastId });
        const updated: HomeSectionLayoutItem[] = res.data.data.map((item: any) => {
          const isDefault = defaultIds.includes(item.id);
          const cleanItems = isDefault && Array.isArray(item.items) && item.items.length === 0 ? undefined : item.items;
          return {
            ...item,
            items: cleanItems,
            padding_top: toRemNumber(item.padding_top, 1.0),
            padding_bottom: toRemNumber(item.padding_bottom, 1.5),
            margin_top: toRemNumber(item.margin_top, 0),
            margin_bottom: toRemNumber(item.margin_bottom, 0),
          };
        });
        setAdminSectionsLayout(updated);
        const activeOnly = updated.filter((s) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return true;
      }
      throw new Error('Failed to update sections layout');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save layout', { id: toastId });
      return false;
    }
  };

  // Save a single section independently (ensures duplicated sections don't overwrite each other)
  const saveSingleSectionLayout = async (
    id: string,
    patch: Partial<HomeSectionLayoutItem>
  ): Promise<boolean> => {
    const toastId = toast.loading('Saving section settings...');
    try {
      const sanitizedPatch: any = { ...patch };
      if (sanitizedPatch.padding_top !== undefined) {
        sanitizedPatch.padding_top = toRemNumber(sanitizedPatch.padding_top, 1.0);
      }
      if (sanitizedPatch.padding_bottom !== undefined) {
        sanitizedPatch.padding_bottom = toRemNumber(sanitizedPatch.padding_bottom, 1.5);
      }
      if (sanitizedPatch.margin_top !== undefined) {
        sanitizedPatch.margin_top = toRemNumber(sanitizedPatch.margin_top, 0);
      }
      if (sanitizedPatch.margin_bottom !== undefined) {
        sanitizedPatch.margin_bottom = toRemNumber(sanitizedPatch.margin_bottom, 0);
      }

      const res = await adminApiClient.put(`/home-banners/admin/layout/section/${encodeURIComponent(id)}`, sanitizedPatch);
      if (res.data?.success && res.data.data?.layout) {
        toast.success(res.data.message || 'Section saved independently!', { id: toastId });
        const defaultIds = ['hero_banner_1', 'sub_banner_1', 'occasions_1', 'bestsellers_1', 'custom_cards_1', 'promo_banner_1'];
        const updated: HomeSectionLayoutItem[] = res.data.data.layout.map((item: any) => {
          const isDefault = defaultIds.includes(item.id);
          const cleanItems = isDefault && Array.isArray(item.items) && item.items.length === 0 ? undefined : item.items;
          return {
            ...item,
            items: cleanItems,
            padding_top: toRemNumber(item.padding_top, 1.0),
            padding_bottom: toRemNumber(item.padding_bottom, 1.5),
            margin_top: toRemNumber(item.margin_top, 0),
            margin_bottom: toRemNumber(item.margin_bottom, 0),
          };
        });
        setAdminSectionsLayout(updated);
        const activeOnly = updated.filter((s) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return true;
      }
      throw new Error('Failed to save section');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save section', { id: toastId });
      return false;
    }
  };

  // Add section
  const addSection = async (type: HomeSectionType, customLabel?: string, items?: any[]): Promise<string | null> => {
    const toastId = toast.loading('Adding section...');
    try {
      const res = await adminApiClient.post('/home-banners/admin/layout/section', {
        section_type: type,
        custom_label: customLabel,
        items: items || [],
      });
      if (res.data?.success && res.data.data?.newSection) {
        toast.success(res.data.message || 'New section added!', { id: toastId });
        const newSec = res.data.data.newSection;
        const newLayout = res.data.data.layout || [...adminSectionsLayout, newSec];
        setAdminSectionsLayout(newLayout);
        const activeOnly = newLayout.filter((s: any) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return newSec.id;
      }
      throw new Error('Failed to add section');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add section', { id: toastId });
      return null;
    }
  };

  // Duplicate section
  const duplicateSection = async (id: string): Promise<string | null> => {
    const toastId = toast.loading('Duplicating section...');
    try {
      const res = await adminApiClient.post(`/home-banners/admin/layout/section/${encodeURIComponent(id)}/duplicate`);
      if (res.data?.success && res.data.data?.duplicatedSection) {
        toast.success(res.data.message || 'Section duplicated with independent content!', { id: toastId });
        const dupSec = res.data.data.duplicatedSection;
        const newLayout = res.data.data.layout;
        setAdminSectionsLayout(newLayout);
        const activeOnly = newLayout.filter((s: any) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return dupSec.id;
      }
      throw new Error('Failed to duplicate section');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to duplicate section', { id: toastId });
      return null;
    }
  };

  // Delete section
  const deleteSection = async (id: string): Promise<boolean> => {
    const toastId = toast.loading('Removing section...');
    try {
      const res = await adminApiClient.delete(`/home-banners/admin/layout/section/${encodeURIComponent(id)}`);
      if (res.data?.success && res.data.data?.layout) {
        toast.success(res.data.message || 'Section removed!', { id: toastId });
        const newLayout = res.data.data.layout;
        setAdminSectionsLayout(newLayout);
        const activeOnly = newLayout.filter((s: any) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return true;
      }
      throw new Error('Failed to remove section');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove section', { id: toastId });
      return false;
    }
  };

  // Add item specifically to a section
  const addSectionItem = async (sectionId: string, itemData: any): Promise<boolean> => {
    const toastId = toast.loading('Adding item to section...');
    try {
      const res = await adminApiClient.post(`/home-banners/admin/layout/section/${encodeURIComponent(sectionId)}/items`, itemData);
      if (res.data?.success && res.data.data?.section) {
        toast.success('Item added to section successfully!', { id: toastId });
        const updatedSec = res.data.data.section;
        const newLayout = adminSectionsLayout.map((s) => s.id === sectionId ? { ...s, ...updatedSec } : s);
        setAdminSectionsLayout(newLayout);
        const activeOnly = newLayout.filter((s) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return true;
      }
      throw new Error('Failed to add item to section');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add item to section', { id: toastId });
      return false;
    }
  };

  // Update item specifically in a section
  const updateSectionItem = async (sectionId: string, itemId: string, patch: any): Promise<boolean> => {
    const toastId = toast.loading('Updating section item...');
    try {
      const res = await adminApiClient.put(`/home-banners/admin/layout/section/${encodeURIComponent(sectionId)}/items/${encodeURIComponent(itemId)}`, patch);
      if (res.data?.success && res.data.data?.section) {
        toast.success('Section item updated!', { id: toastId });
        const updatedSec = res.data.data.section;
        const newLayout = adminSectionsLayout.map((s) => s.id === sectionId ? { ...s, ...updatedSec } : s);
        setAdminSectionsLayout(newLayout);
        const activeOnly = newLayout.filter((s) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return true;
      }
      throw new Error('Failed to update section item');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update section item', { id: toastId });
      return false;
    }
  };

  // Delete item specifically from a section
  const deleteSectionItem = async (sectionId: string, itemId: string): Promise<boolean> => {
    const toastId = toast.loading('Removing item from section...');
    try {
      const res = await adminApiClient.delete(`/home-banners/admin/layout/section/${encodeURIComponent(sectionId)}/items/${encodeURIComponent(itemId)}`);
      if (res.data?.success && res.data.data?.section) {
        toast.success('Item removed from section!', { id: toastId });
        const updatedSec = res.data.data.section;
        const newLayout = adminSectionsLayout.map((s) => s.id === sectionId ? { ...s, ...updatedSec } : s);
        setAdminSectionsLayout(newLayout);
        const activeOnly = newLayout.filter((s) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return true;
      }
      throw new Error('Failed to delete section item');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete section item', { id: toastId });
      return false;
    }
  };

  // Reorder items specifically within a section
  const reorderSectionItems = async (sectionId: string, orderedIds: string[]): Promise<boolean> => {
    try {
      const res = await adminApiClient.patch(`/home-banners/admin/layout/section/${encodeURIComponent(sectionId)}/items/reorder`, { orderedIds });
      if (res.data?.success && res.data.data?.section) {
        toast.success('Section items reordered!');
        const updatedSec = res.data.data.section;
        const newLayout = adminSectionsLayout.map((s) => s.id === sectionId ? { ...s, ...updatedSec } : s);
        setAdminSectionsLayout(newLayout);
        const activeOnly = newLayout.filter((s) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return true;
      }
      throw new Error('Failed to reorder section items');
    } catch (err: any) {
      toast.error('Failed to reorder section items');
      return false;
    }
  };

  // Reset sections layout
  const resetSectionsLayout = async (): Promise<boolean> => {
    const toastId = toast.loading('Resetting layout to default...');
    try {
      const res = await adminApiClient.post('/home-banners/admin/layout/reset');
      if (res.data?.success && Array.isArray(res.data.data)) {
        toast.success('Layout reset to default successfully!', { id: toastId });
        const updated: HomeSectionLayoutItem[] = res.data.data.map((item: any) => ({
          ...item,
          padding_top: toRemNumber(item.padding_top, 1.0),
          padding_bottom: toRemNumber(item.padding_bottom, 1.5),
          margin_top: toRemNumber(item.margin_top, 0),
          margin_bottom: toRemNumber(item.margin_bottom, 0),
        }));
        setAdminSectionsLayout(updated);
        const activeOnly = updated.filter((s) => s.is_enabled !== false);
        setSectionsLayout(activeOnly);
        broadcastSectionsLayoutUpdate(activeOnly);
        return true;
      }
      throw new Error('Failed to reset layout');
    } catch (err: any) {
      toast.error('Failed to reset layout', { id: toastId });
      return false;
    }
  };

  // Listen for real-time updates across components & browser tabs without requiring a refresh
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('yteddybags_banners_channel');
        bc.onmessage = (e) => {
          if (e.data?.type === 'BANNERS_UPDATED' && Array.isArray(e.data.banners)) {
            setBanners(e.data.banners);
            setHomeStorageCache(CACHE_KEY_BANNERS, e.data.banners);
          }
          if (e.data?.type === 'BANNER_THEME_UPDATED' && typeof e.data.theme === 'string') {
            setActiveThemeState(e.data.theme);
            setHomeStorageCache(CACHE_KEY_BANNER_THEME, e.data.theme);
          }
          if (e.data?.type === 'SUB_BANNERS_UPDATED' && Array.isArray(e.data.items)) {
            const active = e.data.items.filter((b: any) => b.is_active);
            setSubBanners(active);
            if (e.data.settings) {
              setSubBannerSettings(e.data.settings);
            }
            setHomeStorageCache(CACHE_KEY_SUB_BANNERS, { items: active, settings: e.data.settings });
          }
          if (e.data?.type === 'OCCASIONS_UPDATED' && Array.isArray(e.data.items)) {
            const active = e.data.items.filter((b: any) => b.is_active);
            setOccasions(active);
            if (e.data.settings) {
              setOccasionsSettings(e.data.settings);
            }
            setHomeStorageCache(CACHE_KEY_OCCASIONS, { items: active, settings: e.data.settings });
          }
          if (e.data?.type === 'BESTSELLERS_UPDATED' && Array.isArray(e.data.items)) {
            const active = e.data.items.filter((b: any) => b.is_active);
            setBestsellers(active);
            if (e.data.settings) {
              setBestsellerSettings(e.data.settings);
            }
            setHomeStorageCache(CACHE_KEY_BESTSELLERS, { items: active, settings: e.data.settings });
          }
          if (e.data?.type === 'PROMO_BANNER_UPDATED' && Array.isArray(e.data.items)) {
            const active = e.data.items.filter((b: any) => b.is_active);
            setPromoBanners(active);
            if (e.data.settings) {
              setPromoBannerSettings(e.data.settings);
            }
            setHomeStorageCache(CACHE_KEY_PROMO_BANNERS, { items: active, settings: e.data.settings });
          }
          if (e.data?.type === 'CUSTOM_CARDS_UPDATED' && Array.isArray(e.data.items)) {
            const active = e.data.items.filter((c: any) => c.is_active);
            setCustomCards(active);
            if (e.data.settings) {
              setCustomCardsSettings(e.data.settings);
            }
            setHomeStorageCache(CACHE_KEY_CUSTOM_CARDS, { items: active, settings: e.data.settings });
          }
          if (e.data?.type === 'SECTIONS_LAYOUT_UPDATED' && Array.isArray(e.data.items)) {
            const active = e.data.items.filter((s: any) => s.is_enabled !== false);
            setSectionsLayout(active);
            setHomeStorageCache(CACHE_KEY_SECTIONS_LAYOUT, active);
          }
        };
      } catch (_) {}
    }

    const handleCustomUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setBanners(e.detail);
        setHomeStorageCache(CACHE_KEY_BANNERS, e.detail);
      }
    };
    const handleThemeUpdate = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        setActiveThemeState(e.detail);
        setHomeStorageCache(CACHE_KEY_BANNER_THEME, e.detail);
      }
    };
    const handleSubBannersUpdate = (e: any) => {
      if (e.detail?.items && Array.isArray(e.detail.items)) {
        const active = e.detail.items.filter((b: any) => b.is_active);
        setSubBanners(active);
        if (e.detail?.settings) {
          setSubBannerSettings(e.detail.settings);
        }
        setHomeStorageCache(CACHE_KEY_SUB_BANNERS, { items: active, settings: e.detail?.settings });
      }
    };
    const handleOccasionsUpdate = (e: any) => {
      if (e.detail?.items && Array.isArray(e.detail.items)) {
        const active = e.detail.items.filter((b: any) => b.is_active);
        setOccasions(active);
        if (e.detail?.settings) {
          setOccasionsSettings(e.detail.settings);
        }
        setHomeStorageCache(CACHE_KEY_OCCASIONS, { items: active, settings: e.detail?.settings });
      }
    };
    const handleBestsellersUpdate = (e: any) => {
      if (e.detail?.items && Array.isArray(e.detail.items)) {
        const active = e.detail.items.filter((b: any) => b.is_active);
        setBestsellers(active);
        if (e.detail?.settings) {
          setBestsellerSettings(e.detail.settings);
        }
        setHomeStorageCache(CACHE_KEY_BESTSELLERS, { items: active, settings: e.detail?.settings });
      }
    };
    const handlePromoBannersUpdate = (e: any) => {
      if (e.detail?.items && Array.isArray(e.detail.items)) {
        const active = e.detail.items.filter((b: any) => b.is_active);
        setPromoBanners(active);
        if (e.detail?.settings) {
          setPromoBannerSettings(e.detail.settings);
        }
        setHomeStorageCache(CACHE_KEY_PROMO_BANNERS, { items: active, settings: e.detail?.settings });
      }
    };
    const handleCustomCardsUpdate = (e: any) => {
      if (e.detail?.items && Array.isArray(e.detail.items)) {
        const active = e.detail.items.filter((c: any) => c.is_active);
        setCustomCards(active);
        if (e.detail?.settings) {
          setCustomCardsSettings(e.detail.settings);
        }
        setHomeStorageCache(CACHE_KEY_CUSTOM_CARDS, { items: active, settings: e.detail?.settings });
      }
    };
    const handleSectionsLayoutUpdate = (e: any) => {
      if (e.detail?.items && Array.isArray(e.detail.items)) {
        const active = e.detail.items.filter((s: any) => s.is_enabled !== false);
        setSectionsLayout(active);
        setHomeStorageCache(CACHE_KEY_SECTIONS_LAYOUT, active);
      }
    };

    window.addEventListener('yteddybags_banners_updated', handleCustomUpdate);
    window.addEventListener('yteddybags_banner_theme_updated', handleThemeUpdate);
    window.addEventListener('yteddybags_sub_banners_updated', handleSubBannersUpdate);
    window.addEventListener('yteddybags_occasions_updated', handleOccasionsUpdate);
    window.addEventListener('yteddybags_bestsellers_updated', handleBestsellersUpdate);
    window.addEventListener('yteddybags_promo_banner_updated', handlePromoBannersUpdate);
    window.addEventListener('yteddybags_custom_cards_updated', handleCustomCardsUpdate);
    window.addEventListener('yteddybags_sections_layout_updated', handleSectionsLayoutUpdate);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('yteddybags_banners_updated', handleCustomUpdate);
      window.removeEventListener('yteddybags_banner_theme_updated', handleThemeUpdate);
      window.removeEventListener('yteddybags_sub_banners_updated', handleSubBannersUpdate);
      window.removeEventListener('yteddybags_occasions_updated', handleOccasionsUpdate);
      window.removeEventListener('yteddybags_bestsellers_updated', handleBestsellersUpdate);
      window.removeEventListener('yteddybags_promo_banner_updated', handlePromoBannersUpdate);
      window.removeEventListener('yteddybags_custom_cards_updated', handleCustomCardsUpdate);
      window.removeEventListener('yteddybags_sections_layout_updated', handleSectionsLayoutUpdate);
    };
  }, []);

  // On-demand fetcher: Only called when Home page is mounted or explicitly requested
  const fetchHomeDataOnDemand = useCallback(
    async (force = false) => {
      if (!force && hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      await Promise.allSettled([
        fetchPublicBanners(force),
        fetchBannerTheme(force),
        fetchPublicSubBanners(force),
        fetchPublicOccasions(force),
        fetchPublicBestsellers(force),
        fetchPublicPromoBanners(force),
        fetchPublicCustomCards(force),
        fetchPublicSectionsLayout(force),
      ]);
    },
    [
      fetchPublicBanners,
      fetchBannerTheme,
      fetchPublicSubBanners,
      fetchPublicOccasions,
      fetchPublicBestsellers,
      fetchPublicPromoBanners,
      fetchPublicCustomCards,
      fetchPublicSectionsLayout,
    ]
  );

  return (
    <HomeBannerContext.Provider
      value={{
        banners,
        adminBanners,
        loading,
        adminLoading,
        activeTheme,
        availableThemes: BANNER_THEMES,
        setActiveTheme,
        fetchPublicBanners,
        fetchBannerTheme,
        fetchHomeDataOnDemand,
        fetchAdminBanners,
        uploadBannerMedia,
        createBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        reorderBanners,

        // Sub-Banners
        subBanners,
        adminSubBanners,
        subBannerSettings,
        subBannerLoading,
        fetchPublicSubBanners,
        fetchAdminSubBanners,
        createSubBanner,
        updateSubBanner,
        deleteSubBanner,
        toggleSubBannerStatus,
        reorderSubBanners,
        updateSubBannerSettings,

        // Occasions
        occasions,
        adminOccasions,
        occasionsSettings,
        occasionsLoading,
        fetchPublicOccasions,
        fetchAdminOccasions,
        createOccasion,
        updateOccasion,
        deleteOccasion,
        toggleOccasionStatus,
        reorderOccasions,
        updateOccasionSettings,

        // Bestsellers
        bestsellers,
        adminBestsellers,
        bestsellerSettings,
        bestsellerLoading,
        fetchPublicBestsellers,
        fetchAdminBestsellers,
        createBestseller,
        updateBestseller,
        deleteBestseller,
        toggleBestsellerStatus,
        reorderBestsellers,
        updateBestsellerSettings,

        // Promo Banners
        promoBanners,
        adminPromoBanners,
        promoBannerSettings,
        promoBannerLoading,
        fetchPublicPromoBanners,
        fetchAdminPromoBanners,
        createPromoBanner,
        updatePromoBanner,
        deletePromoBanner,
        togglePromoBannerStatus,
        reorderPromoBanners,
        updatePromoBannerSettings,

        // Custom Showcase Cards
        customCards,
        adminCustomCards,
        customCardsSettings,
        customCardsLoading,
        fetchPublicCustomCards,
        fetchAdminCustomCards,
        createCustomCard,
        updateCustomCard,
        deleteCustomCard,
        toggleCustomCardStatus,
        reorderCustomCards,
        updateCustomCardsSettings,

        // Home Sections Layout & Dynamic Page Builder
        sectionsLayout,
        adminSectionsLayout,
        sectionsLayoutLoading,
        fetchPublicSectionsLayout,
        fetchAdminSectionsLayout,
        updateSectionsLayout,
        saveSingleSectionLayout,
        addSection,
        duplicateSection,
        deleteSection,
        addSectionItem,
        updateSectionItem,
        deleteSectionItem,
        reorderSectionItems,
        resetSectionsLayout,
      }}
    >
      {children}
    </HomeBannerContext.Provider>
  );
};

export const useHomeBanner = () => {
  const context = useContext(HomeBannerContext);
  if (!context) {
    throw new Error('useHomeBanner must be used within a HomeBannerProvider');
  }
  return context;
};

