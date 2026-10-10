import { useQuery } from '@tanstack/react-query';
import apiClient, { adminApiClient } from '../Utils/apiClient';
import type { ProductItem, ProductFilters } from '../redux/slices/productSlice';

// Key Factory
export const productKeys = {
  all: ['products'] as const,
  publicList: (filters?: ProductFilters) => ['products', 'public', filters || {}] as const,
  detail: (idOrSlug: string) => ['products', 'detail', idOrSlug] as const,
  adminList: () => ['products', 'admin'] as const,
};

// Backwards-compatible dummy helpers so other files don't break if importing
export function getCachedPublicProducts(): ProductItem[] {
  return [];
}

export function setCachedPublicProducts(_items: ProductItem[]): void {
  // Catalogs are now 100% dynamic; we intentionally do not trap products in localStorage
}

// Fetch public active products dynamically from DB
export function usePublicProductsQuery(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.publicList(filters),
    queryFn: async (): Promise<ProductItem[]> => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.header_id) params.append('header_id', filters.header_id);
      if (filters?.dropdown_id) params.append('dropdown_id', filters.dropdown_id);
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.limit) params.append('limit', String(filters.limit));

      const res = await apiClient.get(`/products?${params.toString()}`);
      const data = res.data?.data;
      let items: ProductItem[] = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.products)) {
        items = data.products;
      }

      return items;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes memory staleTime
  });
}

// Fetch single product details with related products
export function useProductDetailQuery(idOrSlug: string) {
  return useQuery({
    queryKey: productKeys.detail(idOrSlug),
    queryFn: async (): Promise<{ product: ProductItem; relatedProducts: ProductItem[] }> => {
      const res = await apiClient.get(`/products/detail/${idOrSlug}`);
      return res.data?.data;
    },
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 2,
  });
}

// Fetch admin products (all items, active & inactive)
export function useAdminProductsQuery() {
  return useQuery({
    queryKey: productKeys.adminList(),
    queryFn: async (): Promise<ProductItem[]> => {
      const res = await adminApiClient.get('/products/admin/all');
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    staleTime: 1000 * 30,
  });
}
