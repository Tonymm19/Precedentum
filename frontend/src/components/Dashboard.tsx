import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, TrendingUp, FileText, Bell } from '../lucide-stub';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import ReminderModal, { ReminderData } from './ReminderModal';

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { cases, deadlines, judges, isLoading, error } = useData();
  const [showReminderModal, setShowReminderModal] = React.useState(false);

  const upcomingDeadlines = deadlines
    .filter((deadline) => new Date(deadline.due_at).getTime() >= Date.now())
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5);

  const urgentDeadlines = deadlines.filter((deadline) => {
    const dueTime = new Date(deadline.due_at).getTime();
    const diff = dueTime - Date.now();
    return diff >= 0 && diff < 3 * 24 * 60 * 60 * 1000;
  });

  const openCases = cases.filter((caseItem) => caseItem.status === 'open');

  const stats = [
    {
      title: 'Open Cases',
      value: openCases.length,
      icon: FileText,
      color: 'blue',
      change: 'Open matters'
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingDeadlines.length,
      icon: Clock,
      color: 'amber',
      change: 'Within 30 days'
    },
    {
      title: 'Urgent Items',
      value: urgentDeadlines.length,
      icon: AlertTriangle,
      color: 'red',
      change: 'Due in ≤ 3 days'
    },
    {
      title: 'Judges Tracked',
      value: judges.length,
      icon: CheckCircle,
      color: 'green',
      change: 'Profile records'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-100',
      amber: 'bg-amber-500 text-amber-100',
      red: 'bg-red-500 text-red-100',
      green: 'bg-green-500 text-green-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Medium':
        return 'text-amber-600 bg-amber-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 2) return 'High';
    if (priority === 3) return 'Medium';
    return 'Low';
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const handleSaveReminder = (reminder: ReminderData) => {
    console.log('Manual reminder saved', reminder);
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back! Here's your federal court compliance overview.
            </p>
          </div>
          <button
            onClick={() => setShowReminderModal(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Set Reminder</span>
          </button>
        </div>
        {isLoading && (
          <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading the latest cases, deadlines, and judge data…
          </p>
        )}
        {error && (
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
            {error}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`rounded-xl shadow-sm border p-6 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.title}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <div className={`rounded-xl shadow-sm border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Deadlines
              </h2>
              <button className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              }`}>
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => {
                const caseTitle = deadline.case_caption ?? cases.find((caseItem) => caseItem.id === deadline.case)?.caption ?? 'Untitled case';
                return (
                  <div key={deadline.id} className={`flex items-center space-x-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex-shrink-0">
                      <Clock className={`h-5 w-5 ${
                        getPriorityLabel(deadline.priority) === 'High' ? 'text-red-500'
                        : getPriorityLabel(deadline.priority) === 'Medium' ? 'text-amber-500'
                        : 'text-green-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {deadline.trigger_source_type ? `${deadline.trigger_source_type.replace(/_/g, ' ')}` : 'Deadline'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {caseTitle}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getPriorityColor(getPriorityLabel(deadline.priority))
                      }`}>
                        {formatDate(deadline.due_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {upcomingDeadlines.length === 0 && (
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No upcoming deadlines found.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className={`rounded-xl shadow-sm border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Alerts
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Coming soon
              </span>
            </div>
          </div>
          <div className="p-6">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Automated alerting is under development. Once enabled, deadline reminders and rule updates will populate here.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`mt-8 rounded-xl shadow-sm border p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
            isDarkMode 
              ? 'border-gray-600 hover:bg-gray-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <FileText className="h-5 w-5 text-blue-600" />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Case
            </span>
          </button>
          <button className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
            isDarkMode 
              ? 'border-gray-600 hover:bg-gray-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <Calendar className="h-5 w-5 text-green-600" />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Schedule Deadline
            </span>
          </button>
          <button className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
            isDarkMode 
              ? 'border-gray-600 hover:bg-gray-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <CheckCircle className="h-5 w-5 text-amber-600" />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Search Rules
            </span>
          </button>
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSave={handleSaveReminder}
      />
    </div>
  );
};

export default Dashboard;
