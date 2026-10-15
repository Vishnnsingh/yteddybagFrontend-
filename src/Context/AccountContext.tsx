import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { API_BASE_URL, authenticatedFetch } from '../Utils/apiClient';
import type { RootState, AppDispatch } from '../redux/store';
import { logoutUser, updateUser } from '../redux/slices/authSlice';

export interface UserAddress {
  id: string;
  name: string;
  mobile: string;
  pincode: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  type: 'HOME' | 'OFFICE' | 'WORK';
  isDefault: boolean;
  openOnSaturday?: boolean;
  openOnSunday?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  dateOfBirth: string;
  location: string;
  alternateMobile: string;
  hintName: string;
  role: string;
  createdAt: string;
}

interface AccountContextType {
  profile: UserProfileData | null;
  addresses: UserAddress[];
  orders: any[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchProfile: (force?: boolean) => Promise<void>;
  updateProfile: (data: Partial<UserProfileData>) => Promise<boolean>;
  fetchAddresses: (force?: boolean) => Promise<void>;
  addAddress: (addressData: Omit<UserAddress, 'id'>) => Promise<boolean>;
  updateAddress: (id: string, addressData: Partial<UserAddress>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// -------------------------------------------------------------
// LOCALSTORAGE CACHE HELPERS (Industry Standard Pattern)
// -------------------------------------------------------------
const PROFILE_CACHE_KEY = 'yteddy_account_profile';
const ADDRESSES_CACHE_KEY = 'yteddy_account_addresses';

const getCachedProfile = (): UserProfileData | null => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCachedProfile = (data: UserProfileData | null) => {
  try {
    if (data) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {}
};

const getCachedAddresses = (): UserAddress[] => {
  try {
    const raw = localStorage.getItem(ADDRESSES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setCachedAddresses = (data: UserAddress[]) => {
  try {
    localStorage.setItem(ADDRESSES_CACHE_KEY, JSON.stringify(data));
  } catch {}
};

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);

  // Initialize immediately from localStorage cache for 0ms instant display
  const [profile, setProfile] = useState<UserProfileData | null>(getCachedProfile);
  const [addresses, setAddresses] = useState<UserAddress[]>(getCachedAddresses);
  const [orders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFetchingProfile = useRef(false);
  const isFetchingAddresses = useRef(false);

  // When user logs out or switches, clear local cache (keep guest addresses)
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('accessToken')) {
      setProfile(null);
      setCachedProfile(null);
    }
  }, [isAuthenticated]);

  const getAuthHeader = useCallback(() => {
    const activeToken = localStorage.getItem('accessToken') || token;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${activeToken}`,
    };
  }, [token]);

  // 1. Fetch Profile: Uses localStorage cache first, only hits network if no cache or force === true
  const fetchProfile = useCallback(async (force = false) => {
    const activeToken = localStorage.getItem('accessToken') || token;
    if (!activeToken) return;

    // Check if we already have valid profile in memory or localStorage cache
    const cached = getCachedProfile();
    if (cached && !profile) {
      setProfile(cached);
    }

    // Do NOT make repeated API calls if data is already cached unless force is true
    if (!force && (profile || cached)) {
      return;
    }

    if (isFetchingProfile.current) return;
    isFetchingProfile.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/account/profile`);
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        setCachedProfile(json.data);
      } else if (user) {
        const fallback = {
          id: user.id || '',
          name: user.name || '',
          email: user.email || '',
          mobile: user.phone || '',
          gender: '',
          dateOfBirth: '',
          location: '',
          alternateMobile: '',
          hintName: '',
          role: user.role || 'user',
          createdAt: user.createdAt || new Date().toISOString(),
        };
        setProfile(fallback);
        setCachedProfile(fallback);
      }
    } catch (err: any) {
      console.warn('[AccountContext] fetchProfile error:', err);
    } finally {
      setLoading(false);
      isFetchingProfile.current = false;
    }
  }, [token, user, profile]);

  // 2. Update Profile: Only called on SAVE button click -> calls API and saves to DB + localStorage
  const updateProfile = async (data: Partial<UserProfileData>): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/account/profile`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updated = json.data;
        setProfile(updated);
        setCachedProfile(updated);
        if (updated.name || updated.mobile) {
          dispatch(updateUser({ name: updated.name, phone: updated.mobile }));
        }
        toast.success('Profile details updated successfully');
        return true;
      } else {
        throw new Error(json.message || 'Failed to update profile');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 3. Fetch Addresses: Uses localStorage cache first, only hits network if no cache or force === true
  const fetchAddresses = useCallback(async (force = false) => {
    const activeToken = localStorage.getItem('accessToken') || token;
    if (!activeToken) return;

    // Check if we already have valid addresses in memory or localStorage cache
    const cached = getCachedAddresses();
    if (cached.length > 0 && addresses.length === 0) {
      setAddresses(cached);
    }

    // Do NOT make repeated API calls if addresses are already present unless force is true
    if (!force && (addresses.length > 0 || cached.length > 0)) {
      return;
    }

    if (isFetchingAddresses.current) return;
    isFetchingAddresses.current = true;

    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/account/addresses`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAddresses(json.data);
        setCachedAddresses(json.data);
      }
    } catch (err: any) {
      console.warn('[AccountContext] fetchAddresses error:', err);
    } finally {
      isFetchingAddresses.current = false;
    }
  }, [token, addresses.length]);

  // 4. Add Address: Only called when user saves address -> saves to DB + syncs to state & localStorage (No extra GET request!)
  const addAddress = async (addressData: Omit<UserAddress, 'id'>): Promise<boolean> => {
    setSaving(true);
    const activeToken = localStorage.getItem('accessToken') || token;
    if (!activeToken) {
      const newAddr: UserAddress = {
        ...addressData,
        id: `addr_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAddresses((prev) => {
        let updatedList = prev;
        if (newAddr.isDefault) {
          updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
        }
        const next = [newAddr, ...updatedList];
        setCachedAddresses(next);
        return next;
      });
      setSaving(false);
      toast.success('Address added successfully');
      return true;
    }
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/account/addresses`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(addressData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newAddr = json.data;
        setAddresses((prev) => {
          let updatedList = prev;
          if (newAddr.isDefault) {
            updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
          }
          const next = [newAddr, ...updatedList];
          setCachedAddresses(next);
          return next;
        });
        toast.success('Address added successfully');
        return true;
      } else {
        throw new Error(json.message || 'Failed to add address');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to add address';
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 5. Update Address: Only called when user saves edited address -> saves to DB + syncs state & localStorage (No extra GET request!)
  const updateAddress = async (id: string, addressData: Partial<UserAddress>): Promise<boolean> => {
    setSaving(true);
    const activeToken = localStorage.getItem('accessToken') || token;
    if (!activeToken) {
      setAddresses((prev) => {
        let list = prev.map((a) => (a.id === id ? { ...a, ...addressData, updatedAt: new Date().toISOString() } : a));
        if (addressData.isDefault) {
          list = list.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
        }
        setCachedAddresses(list);
        return list;
      });
      setSaving(false);
      toast.success('Address updated successfully');
      return true;
    }
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/account/addresses/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(addressData),
      });
      const json = await res.json();
      if (json.success) {
        const updatedAddr = json.data;
        setAddresses((prev) => {
          let list = prev.map((a) => (a.id === id ? { ...a, ...(updatedAddr || addressData) } : a));
          if (updatedAddr?.isDefault || addressData.isDefault) {
            list = list.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
          }
          setCachedAddresses(list);
          return list;
        });
        toast.success('Address updated successfully');
        return true;
      } else {
        throw new Error(json.message || 'Failed to update address');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to update address';
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 6. Delete Address: Only called when user removes address -> deletes from DB + syncs state & localStorage (No extra GET request!)
  const deleteAddress = async (id: string): Promise<boolean> => {
    const activeToken = localStorage.getItem('accessToken') || token;
    if (!activeToken) {
      setAddresses((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        if (prev.find((a) => a.id === id)?.isDefault && filtered.length > 0) {
          filtered[0].isDefault = true;
        }
        setCachedAddresses(filtered);
        return filtered;
      });
      toast.success('Address removed');
      return true;
    }
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/account/addresses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      const json = await res.json();
      if (json.success) {
        setAddresses((prev) => {
          const filtered = prev.filter((a) => a.id !== id);
          if (prev.find((a) => a.id === id)?.isDefault && filtered.length > 0) {
            filtered[0].isDefault = true;
          }
          setCachedAddresses(filtered);
          return filtered;
        });
        toast.success('Address removed');
        return true;
      } else {
        throw new Error(json.message || 'Failed to delete address');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete address');
      return false;
    }
  };

  // 7. Set Default Address: Only called when user clicks make default -> updates DB + syncs state & localStorage
  const setDefaultAddress = async (id: string): Promise<boolean> => {
    const activeToken = localStorage.getItem('accessToken') || token;
    if (!activeToken) {
      setAddresses((prev) => {
        const next = prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }));
        setCachedAddresses(next);
        return next;
      });
      toast.success('Default address updated');
      return true;
    }
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/account/addresses/${id}/default`, {
        method: 'PUT',
        headers: getAuthHeader(),
      });
      const json = await res.json();
      if (json.success) {
        setAddresses((prev) => {
          const next = prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));
          setCachedAddresses(next);
          return next;
        });
        toast.success('Default address updated');
        return true;
      } else {
        throw new Error(json.message || 'Failed to update default address');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to set default address');
      return false;
    }
  };

  // 8. Delete Account: Calls API and wipes out local caches
  const deleteAccount = async (): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/account/delete-account`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Your account has been deleted');
        setProfile(null);
        setAddresses([]);
        setCachedProfile(null);
        setCachedAddresses([]);
        dispatch(logoutUser());
        return true;
      } else {
        throw new Error(json.message || 'Failed to delete account');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        profile,
        addresses,
        orders,
        loading,
        saving,
        error,
        fetchProfile,
        updateProfile,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        deleteAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
