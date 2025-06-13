import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, Save, ToggleLeft, ToggleRight } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, updateUserStatus, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form data if user changes (e.g., after a simulated update)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const updateData = {
        userId: user.userId,
        name: formData.name.trim()
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const result = await updateProfile(updateData);

      if (result.success) {
        toast.success('Profile updated successfully!');
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const result = await updateUserStatus({
        userId: user.userId,
        isActive: !user.isActive
      });

      if (result.success) {
        toast.success(`Account ${user.isActive ? 'activated' : 'deactivated'} successfully!`);
        if (!user.isActive) {
          // If account is deactivated, log out
          logout();
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred while updating status');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
          <span>Loading user profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 p-10 rounded-lg shadow-xl border border-gray-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <p className="mt-1 text-sm text-gray-400">
              Update your account information and preferences
            </p>
          </div>

          <div className="px-6 py-6">
            {/* Account Status */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Account Status</h3>
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div>
                  <p className="text-sm font-medium text-white">Account Status</p>
                  <p className="text-sm text-gray-400">
                    {user?.isActive ? 'Your account is deactivated' : 'Your account is active'}
                  </p>
                </div>
                <button disabled
                  onClick={handleStatusToggle}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {user?.isActive ? (
                    <>
                      <ToggleLeft className="h-4 w-4" />
                      <span>Activate</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4" />
                      <span>Deactivate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-medium text-white">Personal Information</h3>
              
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    } bg-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Display (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    disabled
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-400 rounded-md sm:text-sm cursor-not-allowed"
                    value={user?.email || ''}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-white">Change Password (Optional)</h4>
                
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-12 border ${
                        errors.password ? 'border-red-500' : 'border-gray-600'
                      } bg-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter new password (leave blank to keep current)"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                {formData.password && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                      Confirm New Password
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-12 border ${
                          errors.confirmPassword 
                            ? 'border-red-500' 
                            : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? 'border-green-500'
                            : 'border-gray-600'
                        } bg-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
