import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiClient, { adminApiClient } from '../../Utils/apiClient';

export interface ProductImage {
  id: string;
  url: string;
  is_primary?: boolean;
  alt?: string;
  color_name?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSpecificationItem {
  key: string;
  value: string;
}

export interface ProductItem {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  sku?: string;
  price: number;
  mrp: number;
  discount_percent: number;
  rating: number;
  reviews_count: number;
  badge_text?: string;
  badge_style?: string;
  badge_color?: string;
  images: ProductImage[];
  primary_image?: string;
  colors: ProductColor[];
  sizes: string[];
  target_header_id?: string | null;
  target_dropdown_id?: string | null;
  header_title?: string | null;
  header_path?: string | null;
  dropdown_title?: string | null;
  dropdown_path?: string | null;
  why_love_it: string[];
  specifications: ProductSpecificationItem[];
  description: string;
  stock_quantity: number;
  in_stock: boolean;
  is_active: boolean;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilters {
  search?: string;
  header_id?: string;
  dropdown_id?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

interface ProductState {
  products: ProductItem[];
  adminProducts: ProductItem[];
  currentProduct: ProductItem | null;
  relatedProducts: ProductItem[];
  loading: boolean;
  adminLoading: boolean;
  uploadingImages: boolean;
  error: string | null;
  adminError: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ProductState = {
  products: [],
  adminProducts: [],
  currentProduct: null,
  relatedProducts: [],
  loading: false,
  adminLoading: false,
  uploadingImages: false,
  error: null,
  adminError: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

// ==========================================
// ASYNC THUNKS
// ==========================================

// Public: Fetch products catalog dynamically from DB
export const fetchPublicProducts = createAsyncThunk<any, ProductFilters | undefined>(
  'products/fetchPublic',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.header_id) params.append('header_id', filters.header_id);
      if (filters.dropdown_id) params.append('dropdown_id', filters.dropdown_id);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const res = await apiClient.get(`/products?${params.toString()}`);
      const data = res.data?.data;
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);


// Public: Fetch single product details (supports UUID or slug)
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (idOrSlug: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/products/detail/${idOrSlug}`);
      return res.data.data; // { product, relatedProducts }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Product not found');
    }
  }
);

// Admin: Fetch all products
export const fetchAdminProducts = createAsyncThunk(
  'products/fetchAdminAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.get('/products/admin/all');
      return res.data.data; // ProductItem[]
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin products');
    }
  }
);

// Admin: Create product
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData: Partial<ProductItem>, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.post('/products/admin', productData);
      return res.data.data; // Created ProductItem
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create product');
    }
  }
);

// Admin: Update product
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }: { id: string; data: Partial<ProductItem> }, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.put(`/products/admin/${id}`, data);
      return res.data.data; // Updated ProductItem
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update product');
    }
  }
);

// Admin: Delete product
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminApiClient.delete(`/products/admin/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
    }
  }
);

// Admin: Toggle active status
export const toggleProductStatus = createAsyncThunk(
  'products/toggleStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.patch(`/products/admin/${id}/toggle-status`);
      return res.data.data; // Updated ProductItem
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle status');
    }
  }
);

// Admin: Multi-image upload
export const uploadProductImages = createAsyncThunk(
  'products/uploadImages',
  async (files: File[], { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const res = await adminApiClient.post('/products/admin/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data.urls as string[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Image upload failed');
    }
  }
);

// ==========================================
// SLICE DEFINITION
// ==========================================
export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.relatedProducts = [];
    },
    clearProductErrors: (state) => {
      state.error = null;
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPublicProducts
    builder
      .addCase(fetchPublicProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProducts.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.products = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.products || []);
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchPublicProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load products';
      });

    // fetchProductById
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.relatedProducts || [];
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch product';
      });

    // fetchAdminProducts
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action: PayloadAction<ProductItem[]>) => {
        state.adminLoading = false;
        state.adminProducts = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = (action.payload as string) || 'Failed to load admin products';
      });

    // createProduct
    builder
      .addCase(createProduct.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<ProductItem>) => {
        state.adminLoading = false;
        state.adminProducts.unshift(action.payload);
        state.products.unshift(action.payload);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('product_catalog_updated'));
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = (action.payload as string) || 'Failed to create product';
      });

    // updateProduct
    builder
      .addCase(updateProduct.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<ProductItem>) => {
        state.adminLoading = false;
        const idx = state.adminProducts.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) {
          state.adminProducts[idx] = action.payload;
        }
        const pIdx = state.products.findIndex((p) => p.id === action.payload.id);
        if (pIdx !== -1) {
          state.products[pIdx] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('product_catalog_updated'));
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = (action.payload as string) || 'Failed to update product';
      });

    // deleteProduct
    builder
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.adminProducts = state.adminProducts.filter((p) => p.id !== action.payload);
        state.products = state.products.filter((p) => p.id !== action.payload);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('product_catalog_updated'));
        }
      });

    // toggleProductStatus
    builder
      .addCase(toggleProductStatus.fulfilled, (state, action: PayloadAction<ProductItem>) => {
        const idx = state.adminProducts.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) {
          state.adminProducts[idx] = action.payload;
        }
      });

    // uploadProductImages
    builder
      .addCase(uploadProductImages.pending, (state) => {
        state.uploadingImages = true;
      })
      .addCase(uploadProductImages.fulfilled, (state) => {
        state.uploadingImages = false;
      })
      .addCase(uploadProductImages.rejected, (state) => {
        state.uploadingImages = false;
      });
  },
});

export const { clearCurrentProduct, clearProductErrors } = productSlice.actions;
export default productSlice.reducer;
