import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({loading: true, error: null});
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      const {access_token, refresh_token} = response.data;
      
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      
      set({
        isAuthenticated: true,
        accessToken: access_token,
        refreshToken: refresh_token,
        loading: false,
      });
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Login failed',
        loading: false,
      });
      throw error;
    }
  },
  
  register: async (email: string, password: string) => {
    set({loading: true, error: null});
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
      });
      
      const {access_token, refresh_token} = response.data;
      
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      
      set({
        isAuthenticated: true,
        accessToken: access_token,
        refreshToken: refresh_token,
        loading: false,
      });
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Registration failed',
        loading: false,
      });
      throw error;
    }
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    
    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  },
  
  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      
      const {access_token, refresh_token} = response.data;
      
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      
      set({
        accessToken: access_token,
        refreshToken: refresh_token,
      });
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error) {
      // Refresh failed, logout
      await get().logout();
    }
  },
  
  loadStoredToken: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (accessToken && refreshToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
        });
      }
    } catch (error) {
      console.error('Failed to load stored token:', error);
    }
  },
}));