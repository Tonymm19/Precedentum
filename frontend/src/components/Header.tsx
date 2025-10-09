import React, { useState } from 'react';
import { Bell, Search, Menu, User, Settings, LogOut, Moon, Sun, RefreshCcw } from '../lucide-stub';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { logout, userEmail } = useAuth();
  const { refresh, isLoading, error } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfile(false);
  };

  return (
    <header className={`border-b px-4 py-3 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left side - Menu and Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className={`p-2 rounded-lg lg:hidden ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Menu className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}>
              <div className="h-6 w-6 bg-white rounded-sm flex items-center justify-center">
                <span className={`font-bold text-sm ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`}>DC</span>
              </div>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                District Court Bot
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Federal Court Compliance Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search rules, deadlines, judges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg relative transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Bell className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notifications
                  </h3>
                </div>
                <div className={`p-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Notifications from automated monitors will appear here once configured.
                </div>
                <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
              }`}>
                <User className="h-4 w-4 text-white" />
              </div>
              <span className={`hidden md:block text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Sarah Chen
              </span>
            </button>

            {showProfile && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userEmail ?? 'Authenticated user'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Signed in via token auth
                  </p>
                </div>
                <div className="py-2">
                  <button className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={refresh}
            className={`hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            disabled={isLoading}
            title="Refresh data from API"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search rules, deadlines, judges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        {error && (
          <div className={`mt-3 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
            {error}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
