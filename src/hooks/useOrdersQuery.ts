import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { adminApiClient } from '../Utils/apiClient';

export type EcommerceOrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type EcommercePaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItemProduct {
  productId: string;
  title: string;
  brand?: string;
  primaryImage?: string;
  price: number;
  mrp?: number;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  status?: EcommerceOrderStatus;
  cancellationReason?: string | null;
  cancellationComment?: string | null;
  cancelledAt?: string | null;
}

export interface ShippingAddressSnapshot {
  name: string;
  mobile: string;
  phone?: string;
  address: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
  type?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  shippingAddress: ShippingAddressSnapshot;
  paymentMethod: string;
  paymentStatus: EcommercePaymentStatus;
  paymentDetails?: any;
  orderStatus: EcommerceOrderStatus;
  totalMrp: number;
  discountAmount: number;
  couponCode?: string | null;
  couponDiscount: number;
  shippingFee: number;
  platformFee: number;
  totalAmount: number;
  items: OrderItemProduct[];
  trackingNumber?: string | null;
  courierPartner?: string | null;
  notes?: string | null;
  // Delhivery Logistics fields
  delhiveryWaybill?: string | null;
  delhiveryStatus?: string | null;
  delhiveryStatusCode?: string | null;
  delhiveryScans?: Array<{
    dateTime: string;
    status: string;
    location: string;
    instructions?: string;
  }>;
  delhiveryLabelUrl?: string | null;
  estimatedDeliveryDate?: string | null;
  pickupLocation?: string | null;
  cancellationReason?: string | null;
  cancellationComment?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DelhiveryPincodeServiceability {
  serviceable: boolean;
  pincode: string;
  district: string;
  city: string;
  state: string;
  prepaidAvailable: boolean;
  codAvailable: boolean;
  pickupAvailable: boolean;
  estimatedDeliveryDays: number;
  estimatedDeliveryDate: string;
  message: string;
}

export interface DelhiveryTrackingInfo {
  waybill: string;
  orderNumber?: string;
  status: string;
  statusCode: string;
  courierPartner: string;
  currentLocation: string;
  expectedDeliveryDate?: string;
  scans: Array<{
    dateTime: string;
    status: string;
    location: string;
    instructions?: string;
  }>;
}

export interface AdminOrdersResponse {
  orders: OrderRecord[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  statusCounts: {
    total: number;
    placed: number;
    confirmed: number;
    packed: number;
    shipped: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
  };
}

export const orderKeys = {
  all: ['orders'] as const,
  myOrders: (filters?: { status?: string; search?: string }) =>
    ['orders', 'my-orders', filters || {}] as const,
  myOrderDetail: (id: string) => ['orders', 'my-orders', id] as const,
  adminList: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    ['orders', 'admin', params || {}] as const,
  adminDetail: (id: string) => ['orders', 'admin', id] as const,
  delhiveryPincode: (pincode: string) => ['delhivery', 'pincode', pincode] as const,
  delhiveryTrack: (waybill: string) => ['delhivery', 'track', waybill] as const,
  delhiveryLabel: (orderId: string) => ['delhivery', 'label', orderId] as const,
};

// 1. Hook: Fetch logged-in user's orders
export function useMyOrdersQuery(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: orderKeys.myOrders(filters),
    queryFn: async (): Promise<OrderRecord[]> => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }
      if (filters?.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      const res = await apiClient.get(`/orders/my-orders?${params.toString()}`);
      return res.data?.data || [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

// 2. Hook: Create Order Mutation (Customer Checkout)
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      items: any[];
      shippingAddress: ShippingAddressSnapshot;
      paymentMethod: string;
      paymentDetails?: any;
      totalMrp?: number;
      discountAmount?: number;
      couponCode?: string | null;
      couponDiscount?: number;
      shippingFee?: number;
      platformFee?: number;
      totalAmount: number;
      notes?: string | null;
    }): Promise<OrderRecord> => {
      const res = await apiClient.post('/orders', payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// 3. Hook: Cancel My Order (Customer Action)
export function useCancelMyOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      args: string | { orderId: string; itemIndex?: number; productId?: string; reason?: string; comment?: string }
    ): Promise<OrderRecord> => {
      const orderId = typeof args === 'string' ? args : args.orderId;
      const body =
        typeof args === 'string'
          ? {}
          : {
              reason: args.reason,
              comment: args.comment,
              itemIndex: args.itemIndex,
              productId: args.productId,
            };
      const res = await apiClient.patch(`/orders/my-orders/${orderId}/cancel`, body);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// 3b. Hook: Customer Pre-pay Order Mutation
export function usePayOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { orderId: string; paymentDetails?: any }): Promise<OrderRecord> => {
      const res = await apiClient.patch(`/orders/my-orders/${payload.orderId}/pay`, {
        paymentDetails: payload.paymentDetails,
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// 4. Hook: Admin Fetch All Orders (Pagination 10 per page, search, status filter)
export function useAdminOrdersQuery(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: orderKeys.adminList(params),
    queryFn: async (): Promise<AdminOrdersResponse> => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      queryParams.append('limit', String(params?.limit || 10)); // exactly 10 per page
      if (params?.status && params.status !== 'All') {
        queryParams.append('status', params.status);
      }
      if (params?.search && params.search.trim()) {
        queryParams.append('search', params.search.trim());
      }

      const res = await adminApiClient.get(`/orders/admin/all?${queryParams.toString()}`);
      return (
        res.data?.data || {
          orders: [],
          pagination: { totalCount: 0, totalPages: 1, currentPage: 1, limit: 10 },
          statusCounts: {
            total: 0,
            placed: 0,
            confirmed: 0,
            packed: 0,
            shipped: 0,
            outForDelivery: 0,
            delivered: 0,
            cancelled: 0,
          },
        }
      );
    },
    staleTime: 1000 * 15, // 15 seconds
  });
}

// 5. Hook: Admin Update Order Status (Placed -> Confirmed -> Packed -> Shipped -> Out for Delivery -> Delivered -> Cancelled)
export function useAdminUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      orderStatus,
      paymentStatus,
      trackingNumber,
      courierPartner,
      notes,
    }: {
      id: string;
      orderStatus?: EcommerceOrderStatus;
      paymentStatus?: EcommercePaymentStatus;
      trackingNumber?: string | null;
      courierPartner?: string | null;
      notes?: string | null;
    }): Promise<OrderRecord> => {
      const res = await adminApiClient.patch(`/orders/admin/${id}/status`, {
        orderStatus,
        paymentStatus,
        trackingNumber,
        courierPartner,
        notes,
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// 6. Hook: Admin Delete Order Mutation
export function useAdminDeleteOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<{ id: string }> => {
      const res = await adminApiClient.delete(`/orders/admin/${id}`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// 7. Hook: Check Delhivery Pincode Serviceability (Public / Customer)
export function useCheckDelhiveryPincodeQuery(pincode: string, options?: { enabled?: boolean }) {
  const cleanPin = (pincode || '').trim();
  const isValidLength = cleanPin.length === 6 && /^\d{6}$/.test(cleanPin);

  return useQuery({
    queryKey: orderKeys.delhiveryPincode(cleanPin),
    queryFn: async (): Promise<DelhiveryPincodeServiceability> => {
      const res = await apiClient.get(`/orders/shipping/check-pincode?pincode=${cleanPin}`);
      return res.data?.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled && isValidLength : isValidLength,
    staleTime: 1000 * 60 * 60, // 1 hour cache
    retry: 1,
  });
}

// 8. Hook: Admin Create / Manifest Delhivery B2C Shipment
export function useAdminCreateDelhiveryShipmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      weightGrams,
      pickupWarehouse,
    }: {
      orderId: string;
      weightGrams?: number;
      pickupWarehouse?: string;
    }): Promise<{ order: OrderRecord; shipment: any }> => {
      const res = await adminApiClient.post(
        `/orders/admin/${orderId}/create-delhivery-shipment`,
        { weightGrams, pickupWarehouse }
      );
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// 9. Hook: Track Delhivery Shipment (By Waybill AWB)
export function useDelhiveryTrackingQuery(waybill?: string | null, orderNumber?: string) {
  const cleanWbn = (waybill || '').trim();
  return useQuery({
    queryKey: orderKeys.delhiveryTrack(cleanWbn),
    queryFn: async (): Promise<DelhiveryTrackingInfo> => {
      const params = new URLSearchParams();
      if (orderNumber) params.append('orderNumber', orderNumber);
      const res = await apiClient.get(
        `/orders/shipping/track/${cleanWbn}?${params.toString()}`
      );
      return res.data?.data;
    },
    enabled: Boolean(cleanWbn && cleanWbn.length >= 6),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // auto refresh every 5 min if open
  });
}

// 10. Hook: Admin Cancel Delhivery Shipment
export function useAdminCancelDelhiveryShipmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string): Promise<{ order: OrderRecord; cancelResult: any }> => {
      const res = await adminApiClient.post(
        `/orders/admin/${orderId}/cancel-delhivery-shipment`
      );
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// 11. Hook: Admin Get Shipping Label URL / Packing Slip
export function useAdminGetShippingLabelQuery(orderId?: string | null) {
  return useQuery({
    queryKey: orderKeys.delhiveryLabel(orderId || ''),
    queryFn: async (): Promise<{ waybill: string; labelUrl: string; orderNumber: string }> => {
      const res = await adminApiClient.get(`/orders/admin/${orderId}/shipping-label`);
      return res.data?.data;
    },
    enabled: Boolean(orderId),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

