import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { adminApiClient } from '../../Utils/apiClient';

interface AdminState {
  admin: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const safeParse = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item && item !== 'undefined' ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

// Async Thunks

export const adminLoginAPI = createAsyncThunk(
  'admin/loginAPI',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.post('/admin/auth/login', credentials);
      return res.data.data; // { accessToken, admin }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const adminLogoutAPI = createAsyncThunk(
  'admin/logoutAPI',
  async (_, { rejectWithValue }) => {
    try {
      await adminApiClient.post('/admin/auth/logout');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const fetchAdminProfile = createAsyncThunk(
  'admin/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminApiClient.get('/admin/auth/profile');
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile'
      );
    }
  }
);

// Slice

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: safeParse('adminUser'),
    token: localStorage.getItem('adminAccessToken') || null,
    isAuthenticated: !!localStorage.getItem('adminAccessToken'),
    loading: false,
    error: null,
  } as AdminState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    setAdminCredentials: (
      state,
      action: PayloadAction<{ admin: any; accessToken: string }>
    ) => {
      state.admin = action.payload.admin;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('adminAccessToken', action.payload.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(action.payload.admin));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(adminLoginAPI.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(adminLoginAPI.fulfilled, (state, action) => {
      state.loading = false;
      state.admin = action.payload.admin;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('adminAccessToken', action.payload.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(action.payload.admin));
    });
    builder.addCase(adminLoginAPI.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(adminLogoutAPI.fulfilled, (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminUser');
    });

    // Fetch Profile
    builder.addCase(fetchAdminProfile.fulfilled, (state, action) => {
      state.admin = action.payload;
    });
  },
});

export const { clearAdminError, setAdminCredentials } = adminSlice.actions;
export default adminSlice.reducer;
