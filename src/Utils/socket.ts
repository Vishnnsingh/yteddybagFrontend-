import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { API_BASE_URL } from './apiClient';
import {
  productCreatedFromSocket,
  productUpdatedFromSocket,
  productDeletedFromSocket,
  type ProductItem,
} from '../redux/slices/productSlice';
import {
  productUpdatedInWishlist,
  productDeletedFromWishlist,
  fetchWishlist,
} from '../redux/slices/wishlistSlice';
import { store, type AppDispatch } from '../redux/store';
import type { QueryClient } from '@tanstack/react-query';
import { productKeys } from '../hooks/useProductsQuery';

// Derive Socket server URL by stripping /api/v1 from API base URL
const SOCKET_SERVER_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

let socket: Socket | null = null;
let isInitialized = false;
let hasConnectedOnce = false;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
    });
  }
  return socket;
}

/**
 * Join or re-join user room for targeted private notifications (multi-device wishlist sync)
 */
export function syncSocketUserRoom(userId: string | null) {
  if (!userId) return;
  const s = getSocket();
  s.emit('join_room', `user_${userId}`);
}

/**
 * Initialize real-time Socket.io listeners with:
 * 1. Automatic reconnection cache resync (Check 1)
 * 2. Version / updatedAt timestamp check (discarding stale events) (Check 2)
 * 3. Wishlist price-drop and stock notification alerts via Socket.IO
 * 4. Selective active query invalidation for filtered/sorted/paginated lists (Check 3)
 * 5. Clean silent execution without console log pollution
 * 6. Multi-device live Wishlist DB sync (Check 5)
 */
export function initSocketListeners(dispatch: AppDispatch, queryClient: QueryClient) {
  if (isInitialized) return;
  isInitialized = true;

  const s = getSocket();

  // Check 1 & Check 5: Socket Connect & Reconnect Resync
  s.on('connect', () => {
    const user = store.getState().auth.user;
    if (user?.id) {
      s.emit('join_room', `user_${user.id}`);
    }

    if (hasConnectedOnce) {
      // Reconnected after disconnection: selectively resync active queries & wishlist
      queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: 'active' });
      dispatch(fetchWishlist());
    }
    hasConnectedOnce = true;
  });

  // Multi-device Wishlist Sync Listener
  s.on('wishlist:updated', (payload: any) => {
    const currentUserId = store.getState().auth.user?.id;
    if (!payload?.userId || payload.userId === currentUserId) {
      dispatch(fetchWishlist());
    }
  });

  s.on('wishlist:synced', (payload: any) => {
    const currentUserId = store.getState().auth.user?.id;
    if (!payload?.userId || payload.userId === currentUserId) {
      dispatch(fetchWishlist());
    }
  });

  // 1. Live Product Created Event
  s.on('product:created', (newProduct: ProductItem) => {
    if (!newProduct || !newProduct.id) return;

    // Redux store update
    dispatch(productCreatedFromSocket(newProduct));

    // Update public list cache in memory
    queryClient.setQueryData<ProductItem[]>(productKeys.publicList(), (oldList) => {
      if (!Array.isArray(oldList)) return [newProduct];
      const exists = oldList.some((p) => p.id === newProduct.id);
      return exists ? oldList : [newProduct, ...oldList];
    });

    // Check 3: Selectively refresh active filtered/sorted catalog queries without full page reload
    queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: 'active' });
    window.dispatchEvent(new CustomEvent('product_catalog_updated'));
  });

  // 2. Live Product Updated Event
  s.on('product:updated', (updatedProduct: ProductItem) => {
    if (!updatedProduct || !updatedProduct.id) return;

    // Check 2: Version / UpdatedAt timestamp check (discard stale events)
    const currentState = store.getState();
    const existingInRedux = currentState.products.products.find(
      (p) => p.id === updatedProduct.id || p.slug === updatedProduct.slug
    );

    if (existingInRedux?.updated_at && updatedProduct.updated_at) {
      const existingTime = new Date(existingInRedux.updated_at).getTime();
      const incomingTime = new Date(updatedProduct.updated_at).getTime();
      if (incomingTime < existingTime) {
        // Out-of-order stale event, skip
        return;
      }
    }

    // Check Wishlist Notification: Price Drop or Back-in-Stock alert for shortlisted items
    const existingWishlistItem = currentState.wishlist.items.find(
      (p) => p.id === updatedProduct.id || (p.slug && p.slug === updatedProduct.slug)
    );

    if (existingWishlistItem) {
      const oldPrice = Number(existingWishlistItem.price);
      const newPrice = Number(updatedProduct.price);

      if (!isNaN(oldPrice) && !isNaN(newPrice) && oldPrice > newPrice) {
        toast.success(
          `🎉 Price Drop! "${updatedProduct.title}" in your Wishlist is now ₹${newPrice} (was ₹${oldPrice})`,
          {
            duration: 5500,
            icon: '🏷️',
          }
        );
      } else if (
        (!existingWishlistItem.in_stock || (existingWishlistItem.stock_quantity ?? 0) <= 0) &&
        updatedProduct.in_stock &&
        (updatedProduct.stock_quantity ?? 0) > 0
      ) {
        toast.success(
          `🛍️ Back in Stock! "${updatedProduct.title}" in your Wishlist is now ready to order!`,
          {
            duration: 5500,
            icon: '📦',
          }
        );
      }
    }

    // Update Redux product & wishlist states immediately
    dispatch(productUpdatedFromSocket(updatedProduct));
    dispatch(productUpdatedInWishlist(updatedProduct));

    // Update in-memory public list cache
    queryClient.setQueryData<ProductItem[]>(productKeys.publicList(), (oldList) => {
      if (!Array.isArray(oldList)) return [updatedProduct];
      const idx = oldList.findIndex(
        (p) => p.id === updatedProduct.id || p.slug === updatedProduct.slug
      );
      if (idx !== -1) {
        if (updatedProduct.is_active) {
          const next = [...oldList];
          next[idx] = updatedProduct;
          return next;
        } else {
          return oldList.filter(
            (p) => p.id !== updatedProduct.id && p.slug !== updatedProduct.slug
          );
        }
      }
      return updatedProduct.is_active ? [updatedProduct, ...oldList] : oldList;
    });

    // Update individual product detail cache if open (both by ID and by slug)
    queryClient.setQueryData(productKeys.detail(updatedProduct.id), (old: any) => {
      if (!old) return old;
      return { ...old, product: updatedProduct };
    });
    if (updatedProduct.slug) {
      queryClient.setQueryData(productKeys.detail(updatedProduct.slug), (old: any) => {
        if (!old) return old;
        return { ...old, product: updatedProduct };
      });
    }

    // Check 3: Selectively refresh active queries for filters/categories in background
    queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: 'active' });
    window.dispatchEvent(new CustomEvent('product_catalog_updated'));
  });

  // 3. Live Product Deleted Event
  s.on('product:deleted', (payload: { id: string }) => {
    const deletedId = payload?.id || String(payload);
    if (!deletedId) return;

    const currentState = store.getState();
    const existingWishlistItem = currentState.wishlist.items.find(
      (p) => p.id === deletedId || p.slug === deletedId
    );

    if (existingWishlistItem) {
      toast.info(
        `"${existingWishlistItem.title}" in your Wishlist is no longer available.`,
        { duration: 5000 }
      );
    }

    // Update Redux state
    dispatch(productDeletedFromSocket(deletedId));
    dispatch(productDeletedFromWishlist(deletedId));

    // Update in-memory cache
    queryClient.setQueryData<ProductItem[]>(productKeys.publicList(), (oldList) => {
      if (!Array.isArray(oldList)) return [];
      return oldList.filter((p) => p.id !== deletedId && p.slug !== deletedId);
    });

    // Invalidate detail query and active queries
    queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
    queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: 'active' });

    window.dispatchEvent(new CustomEvent('product_catalog_updated'));
  });
}
