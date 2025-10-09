import React from 'react';
import { 
  Home, 
  Calendar, 
  Search, 
  BookOpen, 
  Settings, 
  FileText,
  AlertTriangle,
  Clock,
  Gavel
} from '../lucide-stub';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen }) => {
  const { isDarkMode } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'deadlines', label: 'Deadlines', icon: Clock },
    { id: 'cases', label: 'Cases', icon: FileText },
    { id: 'rules', label: 'Rules & Research', icon: BookOpen },
    { id: 'judges', label: 'Judges', icon: Gavel },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'search', label: 'Advanced Search', icon: Search },
  ];

  const secondaryItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'
    } ${
      isOpen ? 'w-64' : 'w-0 lg:w-64'
    } overflow-hidden`}>
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-700">
          <nav className="space-y-2">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;