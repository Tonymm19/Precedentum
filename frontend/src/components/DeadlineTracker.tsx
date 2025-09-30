import React, { useState } from 'react';
import { Calendar, Clock, Plus, Filter, AlertTriangle, CheckCircle, FileText, Bell } from 'lucide-react';
import { deadlines, cases, judges } from '../data/mockData';
import { Deadline } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import ReminderModal, { ReminderData } from './ReminderModal';

const DeadlineTracker: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [reminders, setReminders] = useState<ReminderData[]>([]);

  const getFilteredDeadlines = () => {
    let filtered = deadlines;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(deadline => 
        filterStatus === 'pending' ? !deadline.completed : deadline.completed
      );
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(deadline => deadline.priority === filterPriority);
    }

    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const filteredDeadlines = getFilteredDeadlines();

  const getUrgencyLevel = (dueDate: string) => {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { level: 'overdue', color: 'bg-red-500', textColor: 'text-red-700' };
    if (diffDays === 0) return { level: 'today', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (diffDays === 1) return { level: 'tomorrow', color: 'bg-amber-500', textColor: 'text-amber-700' };
    if (diffDays <= 3) return { level: 'urgent', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (diffDays <= 7) return { level: 'soon', color: 'bg-blue-500', textColor: 'text-blue-700' };
    return { level: 'upcoming', color: 'bg-green-500', textColor: 'text-green-700' };
  };

  const handleScheduleReminder = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setShowReminderModal(true);
  };

  const handleSaveReminder = (reminder: ReminderData) => {
    const newReminder = {
      ...reminder,
      id: Date.now().toString(),
      deadlineId: selectedDeadline?.id
    };
    setReminders(prev => [...prev, newReminder]);
    setSelectedDeadline(null);
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Medium':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'Federal Rule': return 'bg-blue-100 text-blue-800';
      case 'Local Rule': return 'bg-purple-100 text-purple-800';
      case 'Judge Standing Order': return 'bg-indigo-100 text-indigo-800';
      case 'Court Order': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Deadline Tracker
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and track all case deadlines with automated alerts
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className={`px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Add Deadline</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-xl shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {deadlines.filter(d => !d.completed && getUrgencyLevel(d.dueDate).level === 'urgent').length}
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Urgent (≤3 days)
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {deadlines.filter(d => !d.completed && getUrgencyLevel(d.dueDate).level === 'soon').length}
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This Week
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {deadlines.filter(d => !d.completed).length}
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Pending
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {deadlines.filter(d => d.completed).length}
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className={`rounded-xl shadow-sm border p-6 mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-2">
              <Filter className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter by:
              </span>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'list'
                  ? isDarkMode 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-100 text-blue-700'
                  : isDarkMode
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'calendar'
                  ? isDarkMode 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-100 text-blue-700'
                  : isDarkMode
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Deadlines List */}
      <div className={`rounded-xl shadow-sm border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Deadlines ({filteredDeadlines.length})
          </h2>
        </div>

        <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {filteredDeadlines.map((deadline) => {
            const case_ = cases.find(c => c.id === deadline.caseId);
            const judge = judges.find(j => j.id === case_?.judgeId);
            const urgency = getUrgencyLevel(deadline.dueDate);

            return (
              <div key={deadline.id} className={`p-6 transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Priority Icon */}
                    <div className="flex-shrink-0">
                      {getPriorityIcon(deadline.priority)}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {deadline.description}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getSourceBadgeColor(deadline.source)
                        }`}>
                          {deadline.source}
                        </span>
                      </div>
                      
                      <div className={`flex items-center space-x-4 text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{case_?.title}</span>
                        </div>
                        <span>•</span>
                        <span>{case_?.caseNumber}</span>
                        <span>•</span>
                        <span>{judge?.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          deadline.completed ? 'bg-green-100 text-green-800' : urgency.textColor.replace('text-', 'bg-').replace('-700', '-100') + ' ' + urgency.textColor
                        }`}>
                          {deadline.completed ? 'Completed' : formatDateForDisplay(deadline.dueDate)}
                        </span>
                        
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Confidence: {deadline.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleScheduleReminder(deadline)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <Bell className="h-3 w-3 mr-1 inline" />
                      Remind
                    </button>
                    {!deadline.completed && (
                      <button className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>
                        Mark Complete
                      </button>
                    )}
                    <button className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                      Edit
                    </button>
                  </div>
                </div>

                {/* Urgency Indicator */}
                {!deadline.completed && urgency.level !== 'upcoming' && (
                  <div className="mt-3 flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${urgency.color}`}></div>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {urgency.level === 'overdue' && 'OVERDUE'}
                      {urgency.level === 'today' && 'DUE TODAY'}
                      {urgency.level === 'tomorrow' && 'DUE TOMORROW'}
                      {urgency.level === 'urgent' && 'URGENT - Due within 3 days'}
                      {urgency.level === 'soon' && 'Due this week'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredDeadlines.length === 0 && (
          <div className="p-12 text-center">
            <Clock className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No deadlines found
            </p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your filters to see more results'
                : 'Add your first deadline to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setSelectedDeadline(null);
        }}
        onSave={handleSaveReminder}
        initialData={selectedDeadline ? {
          title: selectedDeadline.description,
          description: `Reminder for ${selectedDeadline.type} in case ${cases.find(c => c.id === selectedDeadline.caseId)?.title}`,
          dueDate: selectedDeadline.dueDate,
          priority: selectedDeadline.priority,
          caseId: selectedDeadline.caseId,
          deadlineId: selectedDeadline.id
        } : undefined}
      />
    </div>
  );
};

export default DeadlineTracker;