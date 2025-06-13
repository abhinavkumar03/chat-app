import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile')
  };

  const handleChatAppClick = () => {
    navigate('/chat')
  };

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button onClick={handleChatAppClick} className="flex items-center focus:outline-none">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-extrabold text-indigo-400">ChatApp</h1>
              </div>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            {user ? (
              <div className="flex items-center space-x-3 bg-gray-700 rounded-full px-3 py-1">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Loading user...</span>
            )}

            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleProfileClick}
                className="p-2 text-gray-400 hover:text-indigo-300 hover:bg-gray-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
                title="Profile Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-gray-800"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
