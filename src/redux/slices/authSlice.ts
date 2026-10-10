import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL, authenticatedFetch } from '../../Utils/apiClient';

export const loginUserAPI = createAsyncThunk(
  'auth/loginUserAPI',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || 'Login failed');
      }
      return data.data; // { user, accessToken, refreshToken }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Validates active session on page mount/hard refresh and restores live user from DB
export const fetchCurrentUserAPI = createAsyncThunk(
  'auth/fetchCurrentUserAPI',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || localStorage.getItem('accessToken');
      if (!token) return rejectWithValue('No token');

      // Use authenticatedFetch to transparently handle token expiry and auto-refresh
      const res = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
      if (res.status === 401) {
        return rejectWithValue('Session expired');
      }
      const data = await res.json();
      if (data.success && data.data?.user) {
        return data.data.user;
      }
      return rejectWithValue('User profile not available');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch current user');
    }
  }
);

export const logoutUserAPI = createAsyncThunk(
  'auth/logoutUserAPI',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || localStorage.getItem('accessToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}` 
          },
        });
      }
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const safeParse = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item && item !== 'undefined' ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

const initialState: AuthState = {
  token: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: safeParse('user'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: any; accessToken: string; refreshToken?: string }>
    ) => {
      if (action.payload.user !== undefined && action.payload.user !== null) {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload };
      if (state.user) {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUserAPI.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUserAPI.fulfilled, (state, action: any) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    });
    builder.addCase(loginUserAPI.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Current User Profile on load / refresh
    builder.addCase(fetchCurrentUserAPI.fulfilled, (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    });
    builder.addCase(fetchCurrentUserAPI.rejected, (state, action) => {
      // If server explicitly confirmed session is expired/invalid, clear session
      if (action.payload === 'Session expired') {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    });

    // Logout
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    });
    builder.addCase(logoutUserAPI.rejected, (state) => {
      // Force local logout even if server endpoint failed
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    });
  },
});

export const { setCredentials, logoutUser, updateUser } = authSlice.actions;

export default authSlice.reducer;
