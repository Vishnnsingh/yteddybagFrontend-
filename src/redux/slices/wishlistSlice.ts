import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../Utils/apiClient';
import type { ProductItem } from './productSlice';

// Helper to retrieve or initialize persistent guest ID
export function getOrCreateGuestId(): string {
  try {
    let gid = localStorage.getItem('yteddy_guest_id');
    if (!gid) {
      gid = 'guest_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      localStorage.setItem('yteddy_guest_id', gid);
    }
    return gid;
  } catch {
    return 'guest_temp_default';
  }
}

// LocalStorage cache helpers
const CACHE_KEY = 'yteddy_wishlist_items';
function getCachedWishlist(): ProductItem[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedWishlist(items: ProductItem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {}
}

export interface WishlistState {
  items: ProductItem[];
  itemIds: string[];
  loading: boolean;
  error: string | null;
}

const initialCached = getCachedWishlist();

const initialState: WishlistState = {
  items: initialCached,
  itemIds: initialCached.map((i) => i.id),
  loading: false,
  error: null,
};

// Fetch user/guest wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async () => {
    try {
      const guestId = getOrCreateGuestId();
      const res = await apiClient.get('/wishlist', {
        headers: { 'x-guest-id': guestId },
      });
      const data: ProductItem[] = Array.isArray(res.data?.data) ? res.data.data : [];
      saveCachedWishlist(data);
      return data;
    } catch (err: any) {
      // Fallback to local cache if network/offline
      return getCachedWishlist();
    }
  }
);

// Toggle product in wishlist (optimistic update)
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (product: ProductItem, { rejectWithValue }) => {
    try {
      const guestId = getOrCreateGuestId();
      const res = await apiClient.post(
        '/wishlist/toggle',
        { productId: product.id },
        { headers: { 'x-guest-id': guestId } }
      );
      return {
        product,
        inWishlist: Boolean(res.data?.data?.inWishlist),
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
    }
  }
);

// Remove specific product from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const guestId = getOrCreateGuestId();
      await apiClient.delete(`/wishlist/${productId}`, {
        headers: { 'x-guest-id': guestId },
      });
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

// Sync local guest items to user profile when user logs in
export const syncWishlistOnLogin = createAsyncThunk(
  'wishlist/syncWishlistOnLogin',
  async (productIds: string[], { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/wishlist/sync', { productIds });
      const data: ProductItem[] = Array.isArray(res.data?.data) ? res.data.data : [];
      saveCachedWishlist(data);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to sync wishlist');
    }
  }
);

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.itemIds = [];
      saveCachedWishlist([]);
    },
  },
  extraReducers: (builder) => {
    // fetchWishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<ProductItem[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.itemIds = action.payload.map((p) => p.id);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Could not load wishlist';
      });

    // toggleWishlist
    builder.addCase(
      toggleWishlist.fulfilled,
      (state, action: PayloadAction<{ product: ProductItem; inWishlist: boolean }>) => {
        const { product, inWishlist } = action.payload;
        if (inWishlist) {
          if (!state.itemIds.includes(product.id)) {
            state.items.unshift(product);
            state.itemIds.push(product.id);
          }
        } else {
          state.items = state.items.filter((p) => p.id !== product.id);
          state.itemIds = state.itemIds.filter((id) => id !== product.id);
        }
        saveCachedWishlist(state.items);
      }
    );

    // removeFromWishlist
    builder.addCase(
      removeFromWishlist.fulfilled,
      (state, action: PayloadAction<string>) => {
        const removedId = action.payload;
        state.items = state.items.filter((p) => p.id !== removedId);
        state.itemIds = state.itemIds.filter((id) => id !== removedId);
        saveCachedWishlist(state.items);
      }
    );

    // syncWishlistOnLogin
    builder.addCase(
      syncWishlistOnLogin.fulfilled,
      (state, action: PayloadAction<ProductItem[]>) => {
        state.items = action.payload;
        state.itemIds = action.payload.map((p) => p.id);
      }
    );
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
