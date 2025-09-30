import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, TrendingUp, FileText, Bell } from 'lucide-react';
import { cases, deadlines, alerts, judges } from '../data/mockData';
import { useTheme } from '../contexts/ThemeContext';
import ReminderModal, { ReminderData } from './ReminderModal';

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [showReminderModal, setShowReminderModal] = React.useState(false);
  const [reminders, setReminders] = React.useState<ReminderData[]>([]);

  const upcomingDeadlines = deadlines
    .filter(d => !d.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const urgentDeadlines = deadlines.filter(d => 
    !d.completed && 
    new Date(d.dueDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000
  );

  const activeCases = cases.filter(c => c.status === 'Active');
  const unreadAlerts = alerts.filter(a => !a.read);

  const stats = [
    {
      title: 'Active Cases',
      value: activeCases.length,
      icon: FileText,
      color: 'blue',
      change: '+2 this week'
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingDeadlines.length,
      icon: Clock,
      color: 'amber',
      change: '3 this week'
    },
    {
      title: 'Urgent Items',
      value: urgentDeadlines.length,
      icon: AlertTriangle,
      color: 'red',
      change: 'Action required'
    },
    {
      title: 'Judges Tracked',
      value: judges.length,
      icon: CheckCircle,
      color: 'green',
      change: 'All updated'
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
    const newReminder = {
      ...reminder,
      id: Date.now().toString()
    };
    setReminders(prev => [...prev, newReminder]);
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
              Welcome back, Sarah. Here's your federal court compliance overview.
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
                const case_ = cases.find(c => c.id === deadline.caseId);
                const judge = judges.find(j => j.id === case_?.judgeId);
                return (
                  <div key={deadline.id} className={`flex items-center space-x-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex-shrink-0">
                      <Clock className={`h-5 w-5 ${
                        deadline.priority === 'High' ? 'text-red-500' : 
                        deadline.priority === 'Medium' ? 'text-amber-500' : 'text-green-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {deadline.description}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {case_?.title}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {judge?.name}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getPriorityColor(deadline.priority)
                      }`}>
                        {formatDate(deadline.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
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
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {unreadAlerts.length} unread
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                  alert.read 
                    ? isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    : isDarkMode 
                    ? 'bg-blue-900 border-l-4 border-blue-400' 
                    : 'bg-blue-50 border-l-4 border-blue-500'
                }`}>
                  <div className="flex-shrink-0">
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.priority === 'High' ? 'text-red-500' :
                      alert.priority === 'Medium' ? 'text-amber-500' : 'text-green-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {alert.title}
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {alert.message}
                    </p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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