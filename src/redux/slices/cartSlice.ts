import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../Utils/apiClient';
import type { ProductItem } from './productSlice';
import { getOrCreateGuestId } from './wishlistSlice';

export interface CartItem {
  id: string;
  productId: string;
  product: ProductItem;
  selectedColor: string | null;
  selectedSize: string | null;
  quantity: number;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  giftingEnabled: boolean;
  donationAmount: number;
}

const CACHE_KEY = 'yteddy_cart_items';

function getCachedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedCart(items: CartItem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {}
}

const initialCached = getCachedCart();

const initialState: CartState = {
  items: initialCached,
  loading: false,
  error: null,
  giftingEnabled: false,
  donationAmount: 0,
};

let isCartFetching = false;
let lastCartFetchTime = 0;

// Fetch Cart items
export const fetchCart = createAsyncThunk<
  CartItem[],
  boolean | void,
  { state: { cart: CartState } }
>(
  'cart/fetchCart',
  async (_force) => {
    isCartFetching = true;
    lastCartFetchTime = Date.now();
    try {
      const guestId = getOrCreateGuestId();
      const res = await apiClient.get('/cart', {
        headers: { 'x-guest-id': guestId },
      });
      const data: CartItem[] = Array.isArray(res.data?.data) ? res.data.data : [];
      saveCachedCart(data);
      return data;
    } catch (err: any) {
      return getCachedCart();
    } finally {
      isCartFetching = false;
    }
  },
  {
    condition: (force, { getState }) => {
      if (isCartFetching) return false;
      if (!force) {
        const state = getState();
        if (state.cart.loading) return false;
        if (Date.now() - lastCartFetchTime < 15000 && state.cart.items.length > 0) {
          return false;
        }
      }
      return true;
    },
  }
);

// Add to Cart Thunk
export const addToCart = createAsyncThunk<
  CartItem,
  {
    product: ProductItem;
    selectedColor?: string | null;
    selectedSize?: string | null;
    quantity?: number;
  }
>(
  'cart/addToCart',
  async ({ product, selectedColor, selectedSize, quantity = 1 }) => {
    const guestId = getOrCreateGuestId();
    try {
      const res = await apiClient.post(
        '/cart/add',
        {
          productId: product.id,
          selectedColor: selectedColor || null,
          selectedSize: selectedSize || null,
          quantity,
        },
        {
          headers: { 'x-guest-id': guestId },
        }
      );
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (_) {}

    // Fallback optimistic item
    return {
      id: 'cart_' + product.id + '_' + (selectedColor || '') + '_' + (selectedSize || '') + '_' + Date.now(),
      productId: product.id,
      product,
      selectedColor: selectedColor || null,
      selectedSize: selectedSize || null,
      quantity,
      isSelected: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

// Update Cart Item Quantity
export const updateCartItemQty = createAsyncThunk<
  { id: string; quantity: number },
  { id: string; quantity: number }
>(
  'cart/updateQty',
  async ({ id, quantity }) => {
    const guestId = getOrCreateGuestId();
    try {
      await apiClient.put(
        `/cart/item/${id}`,
        { quantity },
        { headers: { 'x-guest-id': guestId } }
      );
    } catch (_) {}
    return { id, quantity };
  }
);

// Update Cart Item Selection
export const toggleCartItemSelection = createAsyncThunk<
  { id: string; isSelected: boolean },
  { id: string; isSelected: boolean }
>(
  'cart/toggleSelection',
  async ({ id, isSelected }) => {
    const guestId = getOrCreateGuestId();
    try {
      await apiClient.put(
        `/cart/item/${id}`,
        { isSelected },
        { headers: { 'x-guest-id': guestId } }
      );
    } catch (_) {}
    return { id, isSelected };
  }
);

// Remove Item from Cart
export const removeFromCart = createAsyncThunk<
  string,
  string
>(
  'cart/removeFromCart',
  async (id) => {
    const guestId = getOrCreateGuestId();
    try {
      await apiClient.delete(`/cart/item/${id}`, {
        headers: { 'x-guest-id': guestId },
      });
    } catch (_) {}
    return id;
  }
);

// Clear Entire Cart
export const clearCart = createAsyncThunk<
  void,
  void
>(
  'cart/clearCart',
  async () => {
    const guestId = getOrCreateGuestId();
    try {
      await apiClient.delete('/cart/clear', {
        headers: { 'x-guest-id': guestId },
      });
    } catch (_) {}
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setGiftingEnabled: (state, action: PayloadAction<boolean>) => {
      state.giftingEnabled = action.payload;
    },
    setDonationAmount: (state, action: PayloadAction<number>) => {
      state.donationAmount = action.payload;
    },
    toggleSelectAll: (state, action: PayloadAction<boolean>) => {
      state.items.forEach((item) => {
        item.isSelected = action.payload;
      });
      saveCachedCart(state.items);
    },
    updateItemColorAndSize: (
      state,
      action: PayloadAction<{ id: string; selectedColor?: string | null; selectedSize?: string | null }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        if (action.payload.selectedColor !== undefined) {
          item.selectedColor = action.payload.selectedColor;
        }
        if (action.payload.selectedSize !== undefined) {
          item.selectedSize = action.payload.selectedSize;
        }
        saveCachedCart(state.items);
      }
    },
  },
  extraReducers: (builder) => {
    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.loading = false;
        state.items = action.payload;
        saveCachedCart(state.items);
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      });

    // addToCart
    builder.addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload;
      const existingIndex = state.items.findIndex(
        (i) =>
          i.productId === incoming.productId &&
          (i.selectedColor || null) === (incoming.selectedColor || null) &&
          (i.selectedSize || null) === (incoming.selectedSize || null)
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += incoming.quantity || 1;
        state.items[existingIndex].isSelected = true;
      } else {
        state.items.unshift(incoming);
      }
      saveCachedCart(state.items);
    });

    // updateCartItemQty
    builder.addCase(updateCartItemQty.fulfilled, (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) {
          item.quantity = quantity;
        }
      }
      saveCachedCart(state.items);
    });

    // toggleCartItemSelection
    builder.addCase(toggleCartItemSelection.fulfilled, (state, action) => {
      const { id, isSelected } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.isSelected = isSelected;
      }
      saveCachedCart(state.items);
    });

    // removeFromCart
    builder.addCase(removeFromCart.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCachedCart(state.items);
    });

    // clearCart
    builder.addCase(clearCart.fulfilled, (state) => {
      state.items = [];
      saveCachedCart([]);
    });
  },
});

export const {
  setGiftingEnabled,
  setDonationAmount,
  toggleSelectAll,
  updateItemColorAndSize,
} = cartSlice.actions;

export default cartSlice.reducer;
