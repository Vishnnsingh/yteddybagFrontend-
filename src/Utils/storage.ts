/**
 * Industry-Standard Storage Management for YTeddybags
 *
 * Separation of Concerns (Company Best Practice):
 * 1. LOCAL STORAGE:
 *    - Auth tokens & persistent user profile: accessToken, refreshToken, user
 *    - Admin credentials: adminAccessToken, adminUser
 *    - Persistent customer cart & guest wishlist to sync upon login
 *
 * 2. SESSION STORAGE:
 *    - Transient tab-specific data: redirectAfterLogin, checkoutFlowStep, tab session ID
 *
 * 3. NO STATIC DATA IN LOCAL STORAGE:
 *    - Dynamic catalogs (products, banners, occasions, bestsellers, cards) must NEVER
 *      be trapped in localStorage. They are fetched live from Supabase via API,
 *      allowing hard-refresh to clear memory and reload live data instantly.
 */

// Keys strictly managed in LocalStorage (Persistent)
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  ADMIN_ACCESS_TOKEN: 'adminAccessToken',
  ADMIN_USER: 'adminUser',
  WISHLIST_ITEMS: 'yteddy_wishlist_items',
  CART_ITEMS: 'yteddy_cart_items',
} as const;

// Keys strictly managed in SessionStorage (Tab / Session-lived)
export const SESSION_KEYS = {
  REDIRECT_AFTER_LOGIN: 'yteddy_redirect_after_login',
  CHECKOUT_STEP: 'yteddy_checkout_step',
  SESSION_ID: 'yteddy_session_id',
} as const;

// Stale legacy cache keys to wipe clean from localStorage
const LEGACY_CACHE_KEYS = [
  'yteddybags_public_products_cache',
  'yteddybags_home_banners',
  'yteddybags_home_banners_time',
  'yteddybags_home_sub_banners',
  'yteddybags_home_sub_banners_time',
  'yteddybags_home_sub_banner_settings',
  'yteddybags_home_occasions',
  'yteddybags_home_occasions_time',
  'yteddybags_home_occasions_settings',
  'yteddybags_home_bestsellers',
  'yteddybags_home_bestsellers_time',
  'yteddybags_home_bestsellers_settings',
  'yteddybags_home_promo_banners',
  'yteddybags_home_promo_time',
  'yteddybags_home_promo_settings',
  'yteddybags_home_custom_cards',
  'yteddybags_home_custom_cards_time',
  'yteddybags_home_custom_cards_settings',
  'yteddybags_home_sections_layout',
  'yteddybags_home_sections_layout_time',
  'yteddybags_home_banner_theme',
  'yteddybags_home_banner_theme_time',
  'yteddy_bg_theme_cache',
  'yteddy_bg_theme_timestamp',
  'yteddy_account_profile',
  'yteddy_account_addresses',
];

/**
 * Clean up obsolete static localStorage entries on startup so that
 * all catalog, banner, and occasion data is 100% dynamic from the DB.
 */
export function purgeLegacyStaticCaches(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_CACHE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch (_) {}
}

/**
 * LocalStorage Helpers
 */
export const LocalStorage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined') return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return (localStorage.getItem(key) as unknown as T) || defaultValue;
    }
  },

  getString(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },

  set(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (_) {}
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (_) {}
  },
};

/**
 * SessionStorage Helpers (Tab / Session Lifetime)
 */
export const SessionStorage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = sessionStorage.getItem(key);
      if (!item || item === 'undefined') return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return (sessionStorage.getItem(key) as unknown as T) || defaultValue;
    }
  },

  getString(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  },

  set(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      if (typeof value === 'string') {
        sessionStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (_) {}
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(key);
    } catch (_) {}
  },
};
