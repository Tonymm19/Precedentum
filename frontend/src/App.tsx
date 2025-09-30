import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RulesSearch from './components/RulesSearch';
import JudgeProfiles from './components/JudgeProfiles';
import DeadlineTracker from './components/DeadlineTracker';

function AppContent() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'deadlines':
        return <DeadlineTracker />;
      case 'rules':
        return <RulesSearch />;
      case 'judges':
        return <JudgeProfiles />;
      case 'cases':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cases
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Case management features coming soon...
              </p>
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Alerts & Notifications
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Advanced alert management coming soon...
              </p>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Calendar Integration
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Calendar integration features coming soon...
              </p>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Search
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Advanced search capabilities coming soon...
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                User settings and preferences coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;