import {Platform} from 'react-native';

// Use different URLs for Android emulator vs iOS simulator
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine
    // For physical device or WSL, use the actual IP address
    return 'http://10.0.2.2:8000';  // For Android emulator
    // return 'http://172.22.170.200:8000';  // For physical device or WSL
  } else {
    // iOS simulator can use localhost
    return 'http://localhost:8000';
  }
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    PASSWORD_RESET: `${API_BASE_URL}/auth/password-reset`,
  },
  SYNC: {
    UP: `${API_BASE_URL}/sync/up`,
    DOWN: `${API_BASE_URL}/sync/down`,
  },
  PHOTOS: {
    PRESIGNED_URL: `${API_BASE_URL}/photos/presigned-url`,
    UPLOAD: (photoId: string) => `${API_BASE_URL}/photos/upload/${photoId}`,
    DOWNLOAD: (photoId: string) => `${API_BASE_URL}/photos/download/${photoId}`,
  },
  HEALTH: {
    CHECK: `${API_BASE_URL}/health`,
    API: `${API_BASE_URL}/api/health`,
  },
};