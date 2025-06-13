import axios from 'axios';
import { httpClient } from '../config/AxiosHelper';

// const API_BASE_URL = 'http://localhost:8080/api/auth';
const API_BASE_URL = 'https://chat-backend-p6dq.onrender.com/api/auth';

// Create axios instance with base configuration
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // or show a modal/toast if you prefer
    }
    return Promise.reject(error);
  }
);


// Handle response errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Signup
  async signup(userData) {
    try {
      const response = await authApi.post('/signup', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Signup failed' 
      };
    }
  },

  // Login
  async login(credentials) {
    try {
      const response = await authApi.post('/login', credentials);
      const { token, ...userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Login failed' 
      };
    }
  },

  // Update Profile
  async updateProfile(profileData) {
    try {
      const response = await authApi.put('/update', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Profile update failed' 
      };
    }
  },

  // Update User Status
  async updateUserStatus(statusData) {
    try {
      const response = await authApi.put('/status', statusData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Status update failed' 
      };
    }
  },

  // Reset Password
  async resetPassword(resetData) {
    try {
      const response = await authApi.put('/reset-password', resetData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Password reset failed' 
      };
    }
  },

  // Send OTP
  async sendOtp(email) {
    try {
      const response = await authApi.post('/send-otp', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to send OTP' 
      };
    }
  },

  // Verify OTP
  async verifyOtp(otpData) {
    try {
      const response = await authApi.post('/verify-otp', otpData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'OTP verification failed' 
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }
};
