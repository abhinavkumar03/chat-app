import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        // Extract user data from the response, excluding the token
        const { token, ...userData } = result.data.data;
        setUser(userData);
        console.log('Login successful, user data:', userData);
        console.log('Token stored:', !!localStorage.getItem('token'));
      } else {
        console.error('Login failed:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    return await authService.signup(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const result = await authService.updateProfile(profileData);
    if (result.success) {
      // Update local user data
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return result;
  };

  const updateUserStatus = async (statusData) => {
    return await authService.updateUserStatus(statusData);
  };

  const resetPassword = async (resetData) => {
    return await authService.resetPassword(resetData);
  };

  const sendOtp = async (email) => {
    return await authService.sendOtp(email);
  };

  const verifyOtp = async (otpData) => {
    return await authService.verifyOtp(otpData);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    updateUserStatus,
    resetPassword,
    sendOtp,
    verifyOtp,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
