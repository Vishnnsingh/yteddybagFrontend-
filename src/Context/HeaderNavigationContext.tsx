import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import apiClient, { adminApiClient } from '../Utils/apiClient';

export interface HeaderDropdownItem {
  id: string;
  header_item_id: string;
  title: string;
  sub_heading?: string | null;
  layout?: 'column' | 'row' | null;
  image_url?: string | null;
  path: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeaderItem {
  id: string;
  title: string;
  path: string;
  order_index: number;
  is_active: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  dropdown_items?: HeaderDropdownItem[];
}

export interface SavedBannerImageItem {
  url: string;
  name: string;
  is_default?: boolean;
}

export interface LoginBannerConfig {
  id?: string;
  is_active: boolean;
  image_url: string;
  heading: string;
  subheading: string;
  coupon_code: string;
  badge_text: string;
  terms_text: string;
  bg_color: string;
  saved_images?: (string | SavedBannerImageItem)[];
  updated_at: string;
}

export interface DoodleItem {
  id: string;
  url: string;
  name: string;
  created_at: string;
  isActive?: boolean;
}

export interface DeviceBgConfig {
  bg_type: 'default' | 'color' | 'gradient' | 'custom';
  bg_color: string;
  gradient_to: string;
  use_gradient: boolean;
  pattern_size: number;
  pattern_opacity: number;
  pattern_gap: number;
  apply_to_login?: boolean;
  doodles: DoodleItem[];
}

export interface BgThemeConfig {
  desktop: DeviceBgConfig;
  mobile: DeviceBgConfig;
  apply_to_login?: boolean;
  updated_at: string;
}

export interface SitePageContent {
  slug: string;
  title: string;
  description: string;
  updated_at?: string;
}

export type SitePagesMap = Record<string, SitePageContent>;

interface HeaderNavigationContextType {
  headerItems: HeaderItem[];
  loading: boolean;
  adminItems: HeaderItem[];
  adminLoading: boolean;
  loginBanner: LoginBannerConfig | null;
  bannerLoading: boolean;
  sitePages: SitePagesMap;
  pagesLoading: boolean;
  bgTheme: BgThemeConfig | null;
  bgThemeLoading: boolean;
  refreshHeaderItems: (force?: boolean) => Promise<void>;
  refreshAdminItems: (force?: boolean) => Promise<void>;
  refreshLoginBanner: () => Promise<void>;
  refreshSitePages: (force?: boolean) => Promise<void>;
  refreshBgTheme: (force?: boolean) => Promise<BgThemeConfig | null>;
  createHeaderItem: (data: { title: string; path?: string; order_index?: number; image_url?: string | null }) => Promise<boolean>;
  updateHeaderItem: (id: string, data: Partial<HeaderItem>) => Promise<boolean>;
  deleteHeaderItem: (id: string) => Promise<boolean>;
  createDropdownItem: (
    headerId: string,
    data: {
      title?: string;
      items?: string[];
      sub_heading?: string | null;
      layout?: 'column' | 'row';
      image_url?: string | null;
      path?: string;
      order_index?: number;
    }
  ) => Promise<boolean>;
  updateDropdownItem: (
    subId: string,
    data: Partial<HeaderDropdownItem> & { sub_heading?: string | null; layout?: 'column' | 'row'; image_url?: string | null }
  ) => Promise<boolean>;
  deleteDropdownItem: (subId: string) => Promise<boolean>;
  uploadDropdownImage: (file: File, subId?: string) => Promise<{ success: boolean; imageUrl?: string }>;
  uploadHeaderImage: (file: File, headerId?: string) => Promise<{ success: boolean; imageUrl?: string }>;
  updateLoginBanner: (data: Partial<LoginBannerConfig>) => Promise<boolean>;
  uploadBannerImage: (file: File) => Promise<{ success: boolean; imageUrl?: string; saved_images?: (string | SavedBannerImageItem)[] }>;
  deleteBannerImage: (url: string) => Promise<boolean>;
  updateSitePage: (slug: string, data: { title: string; description: string }) => Promise<boolean>;
  updateBgTheme: (data: Partial<BgThemeConfig>) => Promise<boolean>;
  uploadDoodleImage: (files: File | File[], device: 'desktop' | 'mobile') => Promise<{ success: boolean; theme?: BgThemeConfig }>;
  deleteDoodleImage: (url: string, device: 'desktop' | 'mobile') => Promise<{ success: boolean; theme?: BgThemeConfig }>;
}

// BroadcastChannel for instant zero-refresh cross-tab synchronization
const SYNC_CHANNEL_NAME = 'yteddybags_header_sync';
const STORAGE_SYNC_KEY = 'yteddybags_header_sync_ts';

export const BG_THEME_STORAGE_KEY = 'yteddy_bg_theme_cache';
export const BG_THEME_TIMESTAMP_KEY = 'yteddy_bg_theme_timestamp';
export const BG_THEME_CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache duration

export const HEADER_NAV_STORAGE_KEY = 'yteddy_header_nav_cache';
export const HEADER_NAV_TIMESTAMP_KEY = 'yteddy_header_nav_timestamp';
export const ADMIN_NAV_STORAGE_KEY = 'yteddy_admin_nav_cache';
export const ADMIN_NAV_TIMESTAMP_KEY = 'yteddy_admin_nav_timestamp';
export const SITE_PAGES_STORAGE_KEY = 'yteddy_site_pages_cache';
export const SITE_PAGES_TIMESTAMP_KEY = 'yteddy_site_pages_timestamp';
export const HEADER_NAV_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache duration

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (_) {
    broadcastChannel = null;
  }
}

// Helpers for localStorage theme caching
export const getBgThemeFromCache = (): BgThemeConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(BG_THEME_STORAGE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (parsed && (parsed.desktop || parsed.mobile)) {
      return parsed as BgThemeConfig;
    }
  } catch (_) {}
  return null;
};

export const saveBgThemeToCache = (theme: BgThemeConfig) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BG_THEME_STORAGE_KEY, JSON.stringify(theme));
    localStorage.setItem(BG_THEME_TIMESTAMP_KEY, Date.now().toString());
  } catch (_) {}
};

// Helpers for localStorage navbar header items caching
export const getHeaderItemsFromCache = (): HeaderItem[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(HEADER_NAV_STORAGE_KEY);
    const ts = localStorage.getItem(HEADER_NAV_TIMESTAMP_KEY);
    if (!cached || !ts) return null;
    if (Date.now() - parseInt(ts, 10) > HEADER_NAV_CACHE_DURATION) return null;
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (_) {}
  return null;
};

export const saveHeaderItemsToCache = (items: HeaderItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HEADER_NAV_STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(HEADER_NAV_TIMESTAMP_KEY, Date.now().toString());
  } catch (_) {}
};

// Helpers for localStorage admin header items caching
export const getAdminItemsFromCache = (): HeaderItem[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(ADMIN_NAV_STORAGE_KEY);
    const ts = localStorage.getItem(ADMIN_NAV_TIMESTAMP_KEY);
    if (!cached || !ts) return null;
    if (Date.now() - parseInt(ts, 10) > HEADER_NAV_CACHE_DURATION) return null;
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (_) {}
  return null;
};

export const saveAdminItemsToCache = (items: HeaderItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_NAV_STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(ADMIN_NAV_TIMESTAMP_KEY, Date.now().toString());
  } catch (_) {}
};

// Helpers for localStorage site pages caching
export const getSitePagesFromCache = (): SitePagesMap | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(SITE_PAGES_STORAGE_KEY);
    const ts = localStorage.getItem(SITE_PAGES_TIMESTAMP_KEY);
    if (!cached || !ts) return null;
    if (Date.now() - parseInt(ts, 10) > HEADER_NAV_CACHE_DURATION) return null;
    const parsed = JSON.parse(cached);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {}
  return null;
};

export const saveSitePagesToCache = (pages: SitePagesMap) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SITE_PAGES_STORAGE_KEY, JSON.stringify(pages));
    localStorage.setItem(SITE_PAGES_TIMESTAMP_KEY, Date.now().toString());
  } catch (_) {}
};

// Notify other open browser tabs instantly
const notifyTabsHeaderUpdated = (newTheme?: BgThemeConfig) => {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'HEADER_NAV_CHANGED',
        timestamp: Date.now(),
        bgTheme: newTheme,
      });
    }
  } catch (_) {}

  try {
    localStorage.setItem(STORAGE_SYNC_KEY, Date.now().toString());
  } catch (_) {}
};

const HeaderNavigationContext = createContext<HeaderNavigationContextType | undefined>(undefined);

export const HeaderNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headerItems, setHeaderItems] = useState<HeaderItem[]>(() => {
    const cached = getHeaderItemsFromCache();
    return cached || [];
  });
  const [loading, setLoading] = useState(false);
  const [adminItems, setAdminItems] = useState<HeaderItem[]>(() => {
    const cached = getAdminItemsFromCache();
    return cached || [];
  });
  const [adminLoading, setAdminLoading] = useState(false);

  const [loginBanner, setLoginBanner] = useState<LoginBannerConfig | null>({
    is_active: true,
    image_url: '/images/login-banner-girls.jpg',
    heading: 'FLAT ₹300 OFF',
    subheading: 'ON YOUR 1ST ORDER + EXCITING OFFERS*',
    coupon_code: 'YTEDDY300',
    badge_text: '₹300 OFF',
    terms_text: '*T&C Applied | Limited Time Offer',
    bg_color: '#FEEFEA',
    updated_at: new Date().toISOString(),
  });
  const [bannerLoading, setBannerLoading] = useState(false);

  const defaultSitePages: SitePagesMap = {
    'terms-of-use': {
      slug: 'terms-of-use',
      title: 'Terms of Use',
      description: `Welcome to YTeddybags. By accessing or using our website, services, or purchasing products, you agree to comply with and be bound by these Terms of Use.\n\n1. Acceptance of Terms: Please read these terms carefully before accessing or using our website. By using any part of the site, you agree to be bound by these terms.\n2. Product Information & Pricing: All bag models, teddy plush products, dimensions, and prices are subject to availability and change without notice.\n3. Orders & Payment: By placing an order, you agree to provide complete and accurate purchase and account information.\n4. Intellectual Property: All trademarks, logos, content, and imagery remain the property of YTeddybags.\n5. Limitation of Liability: YTeddybags shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our services.\n\nFor inquiries regarding our Terms of Use, please reach out via our Get Help portal or contact support@yteddybags.com.`,
      updated_at: new Date().toISOString(),
    },
    'privacy-policy': {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      description: `At YTeddybags, we take your privacy seriously. This Privacy Policy outlines how your personal information is collected, used, and shared when you visit or make a purchase from our platform.\n\n1. Information We Collect: When you visit the site, we collect device information, IP address, and details you provide during registration or order placement (name, delivery address, email, phone number).\n2. How We Use Your Information: We use order information to fulfill orders, process payments, arrange shipping, send invoices and order confirmations, and screen for potential fraud.\n3. Data Protection & Security: We employ industry-standard encryption, SSL protocols, and secure cloud storage to protect your private credentials.\n4. Third-Party Sharing: We only share your data with trusted logistics and payment gateways necessary for transaction execution.\n5. Your Rights: You have the right to access, rectify, or request deletion of your personal data at any time.\n\nIf you have any questions about this Privacy Policy, please contact our privacy compliance team.`,
      updated_at: new Date().toISOString(),
    },
    'get-help': {
      slug: 'get-help',
      title: 'Customer Support & Help Center',
      description: `Need assistance with an order, bag sizing, returns, or tracking? The YTeddybags Support Team is here to help you 24/7!\n\n1. Track Your Order: Check the status of your shipment anytime by navigating to your Account Orders or contacting our support desk.\n2. Returns & Exchanges: We offer hassle-free 7-day returns for defective or damaged items. Ensure products are in original condition with tags attached.\n3. Contact Information:\n• Email: support@yteddybags.com\n• Helpline: +91 98765 43210 (Mon-Sat, 9:00 AM - 7:00 PM IST)\n• WhatsApp Assistance: Available for instant chat & order status\n4. Frequently Asked Questions:\n• How long does delivery take? Standard shipping takes 3-5 business days across India.\n• What payment methods are accepted? We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery.\n\nFeel free to write to us or message our team anytime!`,
      updated_at: new Date().toISOString(),
    },
  };

  const [sitePages, setSitePages] = useState<SitePagesMap>(() => {
    const cached = getSitePagesFromCache();
    if (cached) return { ...defaultSitePages, ...cached };
    return defaultSitePages;
  });
  const [pagesLoading, setPagesLoading] = useState(false);

  const isFetchingRef = React.useRef(false);
  const isAdminFetchingRef = React.useRef(false);
  const lastFetchRef = React.useRef(0);
  const isBannerFetchingRef = React.useRef(false);
  const isPagesFetchingRef = React.useRef(false);

  // Fetch Public Pages (Terms of Use, Privacy Policy, Get Help) with localStorage cache
  const refreshSitePages = useCallback(async (force = false) => {
    if (!force) {
      const cached = getSitePagesFromCache();
      if (cached) {
        return;
      }
    }
    if (isPagesFetchingRef.current) return;
    try {
      isPagesFetchingRef.current = true;
      setPagesLoading(true);
      const res = await apiClient.get('/header-nav/pages');
      if (res.data?.success && res.data?.data) {
        setSitePages((prev) => {
          const updated = {
            ...prev,
            ...res.data.data,
          };
          saveSitePagesToCache(updated);
          return updated;
        });
      }
    } catch (e) {
      console.warn('Failed to load site pages:', e);
    } finally {
      setPagesLoading(false);
      isPagesFetchingRef.current = false;
    }
  }, []);

  // Fetch Login Banner Configuration (Strictly on-demand for Login page & Admin banner editor)
  const refreshLoginBanner = useCallback(async () => {
    if (isBannerFetchingRef.current) return;
    try {
      isBannerFetchingRef.current = true;
      setBannerLoading(true);
      const res = await apiClient.get('/header-nav/login-banner');
      if (res.data?.success && res.data?.data) {
        setLoginBanner(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to load login banner:', e);
    } finally {
      setBannerLoading(false);
      isBannerFetchingRef.current = false;
    }
  }, []);

  const defaultBgThemeConfig: BgThemeConfig = {
    desktop: {
      bg_type: 'default',
      bg_color: '#FDF0EC',
      gradient_to: '#FDF5F2',
      use_gradient: true,
      pattern_size: 55,
      pattern_opacity: 0.25,
      pattern_gap: 65,
      apply_to_login: false,
      doodles: [],
    },
    mobile: {
      bg_type: 'default',
      bg_color: '#FDF0EC',
      gradient_to: '#FDF5F2',
      use_gradient: true,
      pattern_size: 40,
      pattern_opacity: 0.22,
      pattern_gap: 50,
      apply_to_login: false,
      doodles: [],
    },
    apply_to_login: false,
    updated_at: new Date().toISOString(),
  };

  const [bgTheme, setBgTheme] = useState<BgThemeConfig | null>(() => {
    const cached = getBgThemeFromCache();
    if (cached) return cached;
    return defaultBgThemeConfig;
  });
  const [bgThemeLoading, setBgThemeLoading] = useState(false);
  const isBgThemeFetchingRef = React.useRef(false);

  // Fetch Background Theme (Desktop & Mobile Cloud Doodles)
  // Fetch Background Theme (Desktop & Mobile Cloud Doodles) with persistent localStorage cache
  const refreshBgTheme = useCallback(async (force = false): Promise<BgThemeConfig | null> => {
    // If not forcing fresh data, check if we have a valid cache in localStorage
    if (!force && typeof window !== 'undefined') {
      try {
        const cached = getBgThemeFromCache();
        if (cached) {
          setBgTheme(cached);
          return cached;
        }
      } catch (_) {}
    }

    if (isBgThemeFetchingRef.current) return null;
    try {
      isBgThemeFetchingRef.current = true;
      setBgThemeLoading(true);
      const res = await apiClient.get('/header-nav/bg-theme');
      if (res.data?.success && res.data?.data) {
        const themeData = res.data.data as BgThemeConfig;
        setBgTheme(themeData);
        saveBgThemeToCache(themeData);
        return themeData;
      }
    } catch (err) {
      console.warn('Failed to load background theme:', err);
    } finally {
      setBgThemeLoading(false);
      isBgThemeFetchingRef.current = false;
    }
    return null;
  }, []);

  // Fetch active header items for customer website with persistent localStorage cache
  const refreshHeaderItems = useCallback(async (force = false) => {
    if (!force) {
      const cached = getHeaderItemsFromCache();
      if (cached && cached.length > 0) {
        setHeaderItems(cached);
        return;
      }
    }
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setLoading(true);
      const res = await apiClient.get('/header-nav');
      const items = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.message)
        ? res.data.message
        : null;
      if (items !== null) {
        setHeaderItems(items);
        saveHeaderItemsToCache(items);
      }
      lastFetchRef.current = Date.now();
    } catch (err) {
      console.error('Failed to load public header items', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Fetch all header items for Admin Dashboard (strictly on-demand when on /dashboard routes)
  const refreshAdminItems = useCallback(async (force = false) => {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');
    if (!isAdmin) return; // Never call admin APIs on customer-facing pages

    if (!force) {
      const cached = getAdminItemsFromCache();
      if (cached && cached.length > 0) {
        setAdminItems(cached);
        return;
      }
    }
    if (isAdminFetchingRef.current) return;
    try {
      isAdminFetchingRef.current = true;
      setAdminLoading(true);
      const res = await adminApiClient.get('/header-nav/admin/all');
      const items = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.message)
        ? res.data.message
        : null;
      if (items !== null) {
        setAdminItems(items);
        saveAdminItemsToCache(items);
      }
    } catch (err) {
      console.error('Failed to load admin header items', err);
    } finally {
      setAdminLoading(false);
      isAdminFetchingRef.current = false;
    }
  }, []);

  // Initial fetch for client header and background theme (only hits API if not in localStorage)
  useEffect(() => {
    refreshHeaderItems(false);
    refreshBgTheme(false);
  }, [refreshHeaderItems, refreshBgTheme]);

  // Real-time automatic listener across all open tabs (Home, Dashboard, etc.)
  useEffect(() => {
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'HEADER_NAV_CHANGED') {
        refreshHeaderItems(true);
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
          refreshAdminItems(true);
        }
        refreshSitePages(true);
        if (event.data?.bgTheme) {
          setBgTheme(event.data.bgTheme);
          saveBgThemeToCache(event.data.bgTheme);
        } else {
          refreshBgTheme(true);
        }
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    // Storage event for fallback cross-tab sync
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_SYNC_KEY || event.key === BG_THEME_STORAGE_KEY) {
        refreshHeaderItems(true);
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
          refreshAdminItems(true);
        }
        refreshSitePages(true);
        const cached = getBgThemeFromCache();
        if (cached) {
          setBgTheme(cached);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshHeaderItems, refreshAdminItems, refreshSitePages, refreshBgTheme]);

  // Create Header Item
  const createHeaderItem = async (data: { title: string; path?: string; order_index?: number; image_url?: string | null }) => {
    try {
      const res = await adminApiClient.post('/header-nav/admin', data);
      if (res.data?.success) {
        toast.success(`Header item "${data.title}" added successfully!`);
        await Promise.all([refreshAdminItems(true), refreshHeaderItems(true)]);
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create header item');
      return false;
    }
  };

  // Update Header Item
  const updateHeaderItem = async (id: string, data: Partial<HeaderItem>) => {
    try {
      const res = await adminApiClient.put(`/header-nav/admin/${id}`, data);
      if (res.data?.success) {
        toast.success('Header item updated!');
        await Promise.all([refreshAdminItems(true), refreshHeaderItems(true)]);
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update header item');
      return false;
    }
  };

  // Delete Header Item
  const deleteHeaderItem = async (id: string) => {
    try {
      const res = await adminApiClient.delete(`/header-nav/admin/${id}`);
      if (res.data?.success) {
        toast.success('Header item deleted!');
        await Promise.all([refreshAdminItems(true), refreshHeaderItems(true)]);
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete header item');
      return false;
    }
  };

  // Create Dropdown Sub-Item (single or batch)
  const createDropdownItem = async (
    headerId: string,
    data: {
      title?: string;
      items?: string[];
      sub_heading?: string | null;
      layout?: 'column' | 'row';
      image_url?: string | null;
      path?: string;
      order_index?: number;
    }
  ) => {
    try {
      const res = await adminApiClient.post(`/header-nav/admin/${headerId}/sub-items`, data);
      if (res.data?.success) {
        const count = Array.isArray(data.items) ? data.items.filter((t) => t && t.trim()).length : 1;
        toast.success(
          count > 1
            ? `${count} dropdown items added successfully!`
            : `Dropdown item "${data.title || 'Item'}" added!`
        );
        await Promise.all([refreshAdminItems(true), refreshHeaderItems(true)]);
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create dropdown item');
      return false;
    }
  };

  // Update Dropdown Sub-Item
  const updateDropdownItem = async (
    subId: string,
    data: Partial<HeaderDropdownItem> & { sub_heading?: string | null; layout?: 'column' | 'row'; image_url?: string | null }
  ) => {
    try {
      const res = await adminApiClient.put(`/header-nav/admin/sub-items/${subId}`, data);
      if (res.data?.success) {
        toast.success('Dropdown item updated!');
        await Promise.all([refreshAdminItems(true), refreshHeaderItems(true)]);
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update dropdown item');
      return false;
    }
  };

  // Upload Dropdown Item Image (Mobile Drawer View) - Max 2MB limit
  const uploadDropdownImage = async (file: File, subId?: string): Promise<{ success: boolean; imageUrl?: string }> => {
    try {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return { success: false };
      }
      const formData = new FormData();
      formData.append('image', file);
      if (subId) formData.append('subId', subId);

      const res = await adminApiClient.post('/header-nav/admin/upload-dropdown-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data.data?.imageUrl) {
        toast.success('Dropdown image uploaded successfully!');
        if (subId) {
          await Promise.all([refreshAdminItems(true), refreshHeaderItems(true)]);
          notifyTabsHeaderUpdated();
        }
        return { success: true, imageUrl: res.data.data.imageUrl };
      }
      return { success: false };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload dropdown image');
      return { success: false };
    }
  };

  // Upload Header Category Image (Mobile Drawer View) - Max 2MB limit
  const uploadHeaderImage = async (file: File, headerId?: string): Promise<{ success: boolean; imageUrl?: string }> => {
    try {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return { success: false };
      }
      const formData = new FormData();
      formData.append('image', file);
      if (headerId) formData.append('headerId', headerId);

      const res = await adminApiClient.post('/header-nav/admin/upload-header-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data.data?.imageUrl) {
        toast.success('Header category image uploaded successfully!');
        if (headerId) {
          await Promise.all([refreshAdminItems(true), refreshHeaderItems(true)]);
          notifyTabsHeaderUpdated();
        }
        return { success: true, imageUrl: res.data.data.imageUrl };
      }
      return { success: false };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload header category image');
      return { success: false };
    }
  };

  // Delete Dropdown Sub-Item
  const deleteDropdownItem = async (subId: string) => {
    try {
      const res = await adminApiClient.delete(`/header-nav/admin/sub-items/${subId}`);
      if (res.data?.success) {
        toast.success('Dropdown item deleted!');
        await Promise.all([refreshAdminItems(true), refreshHeaderItems(true)]);
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete dropdown item');
      return false;
    }
  };

  // Update Login Offer Banner
  const updateLoginBanner = async (data: Partial<LoginBannerConfig>) => {
    try {
      const res = await adminApiClient.put('/header-nav/admin/login-banner', data);
      if (res.data?.success) {
        toast.success('Login offer banner updated successfully!');
        setLoginBanner(res.data.data);
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update login banner');
      return false;
    }
  };

  // Upload Banner Image to Cloudflare R2
  const uploadBannerImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await adminApiClient.post('/header-nav/admin/upload-banner-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        toast.success('Image uploaded to Cloudflare R2 successfully!');
        const newUrl = res.data.data?.imageUrl;
        const newSaved = res.data.data?.saved_images;
        if (res.data.data?.banner) {
          setLoginBanner(res.data.data.banner);
        } else if (loginBanner) {
          setLoginBanner({
            ...loginBanner,
            image_url: newUrl || loginBanner.image_url,
            saved_images: newSaved || loginBanner.saved_images,
          });
        }
        notifyTabsHeaderUpdated();
        return { success: true, imageUrl: newUrl, saved_images: newSaved };
      }
      return { success: false };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image to Cloudflare R2');
      return { success: false };
    }
  };

  // Delete Banner Image from Cloudflare R2 and Supabase DB
  const deleteBannerImage = async (url: string): Promise<boolean> => {
    try {
      const res = await adminApiClient.post('/header-nav/admin/delete-banner-image', { url });
      if (res.data?.success) {
        toast.success('Banner image deleted successfully!');
        if (res.data.data?.banner) {
          setLoginBanner(res.data.data.banner);
        } else {
          await refreshLoginBanner();
        }
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete banner image');
      return false;
    }
  };

  // Update Legal & Help Page (Terms of Use, Privacy Policy, Get Help)
  const updateSitePage = async (
    slug: string,
    data: { title: string; description: string }
  ): Promise<boolean> => {
    try {
      const res = await adminApiClient.put(`/header-nav/admin/pages/${slug}`, data);
      if (res.data?.success) {
        toast.success(res.data.message || 'Page updated successfully!');
        const updated = res.data.data;
        if (updated) {
          setSitePages((prev) => {
            const nextPages = {
              ...prev,
              [slug]: updated,
            };
            saveSitePagesToCache(nextPages);
            return nextPages;
          });
        } else {
          await refreshSitePages(true);
        }
        notifyTabsHeaderUpdated();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update page');
      return false;
    }
  };

  // Update Background Theme (Admin)
  const updateBgTheme = async (data: Partial<BgThemeConfig>) => {
    try {
      const res = await adminApiClient.put('/header-nav/admin/bg-theme', data);
      if (res.data?.success) {
        toast.success('Background theme saved successfully!');
        const updated = res.data.data as BgThemeConfig;
        setBgTheme(updated);
        saveBgThemeToCache(updated);
        notifyTabsHeaderUpdated(updated);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update background theme');
      return false;
    }
  };

  // Upload Doodle Image(s) to Cloudflare R2 Cloud Storage
  const uploadDoodleImage = async (files: File | File[], device: 'desktop' | 'mobile') => {
    try {
      const formData = new FormData();
      const fileList = Array.isArray(files) ? files : [files];
      fileList.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('device', device);
      const res = await adminApiClient.post('/header-nav/admin/bg-theme/upload-doodle', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data.data?.theme) {
        toast.success(`${fileList.length} doodle image(s) uploaded to Cloud!`);
        const updated = res.data.data.theme as BgThemeConfig;
        setBgTheme(updated);
        saveBgThemeToCache(updated);
        notifyTabsHeaderUpdated(updated);
        return { success: true, theme: updated };
      }
      return { success: false };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload doodle image');
      return { success: false };
    }
  };

  // Delete Doodle Image from Cloudflare R2 and DB
  const deleteDoodleImage = async (url: string, device: 'desktop' | 'mobile') => {
    try {
      const res = await adminApiClient.post('/header-nav/admin/bg-theme/delete-doodle', { url, device });
      if (res.data?.success && res.data.data) {
        toast.success('Doodle deleted successfully from cloud!');
        const updated = res.data.data as BgThemeConfig;
        setBgTheme(updated);
        saveBgThemeToCache(updated);
        notifyTabsHeaderUpdated(updated);
        return { success: true, theme: updated };
      }
      return { success: false };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete doodle image');
      return { success: false };
    }
  };

  return (
    <HeaderNavigationContext.Provider
      value={{
        headerItems,
        loading,
        adminItems,
        adminLoading,
        loginBanner,
        bannerLoading,
        sitePages,
        pagesLoading,
        bgTheme,
        bgThemeLoading,
        refreshHeaderItems,
        refreshAdminItems,
        refreshLoginBanner,
        refreshSitePages,
        refreshBgTheme,
        createHeaderItem,
        updateHeaderItem,
        deleteHeaderItem,
        createDropdownItem,
        updateDropdownItem,
        deleteDropdownItem,
        uploadDropdownImage,
        uploadHeaderImage,
        updateLoginBanner,
        uploadBannerImage,
        deleteBannerImage,
        updateSitePage,
        updateBgTheme,
        uploadDoodleImage,
        deleteDoodleImage,
      }}
    >
      {children}
    </HeaderNavigationContext.Provider>
  );
};

export const useHeaderNavigation = () => {
  const context = useContext(HeaderNavigationContext);
  if (!context) {
    throw new Error('useHeaderNavigation must be used within a HeaderNavigationProvider');
  }
  return context;
};
