import React, { useState } from 'react';
import { X, Clock, Calendar, Bell, AlertTriangle, Mail, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: ReminderData) => void;
  initialData?: Partial<ReminderData>;
}

export interface ReminderData {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  reminderTimes: string[];
  priority: 'High' | 'Medium' | 'Low';
  notificationMethods: ('email' | 'sms' | 'push')[];
  caseId?: string;
  deadlineId?: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<ReminderData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate || '',
    reminderTimes: initialData?.reminderTimes || ['1 day'],
    priority: initialData?.priority || 'Medium',
    notificationMethods: initialData?.notificationMethods || ['email', 'push'],
    caseId: initialData?.caseId,
    deadlineId: initialData?.deadlineId,
  });

  const reminderOptions = [
    '15 minutes',
    '30 minutes',
    '1 hour',
    '2 hours',
    '4 hours',
    '8 hours',
    '1 day',
    '2 days',
    '3 days',
    '1 week',
    '2 weeks'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const toggleReminderTime = (time: string) => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.includes(time)
        ? prev.reminderTimes.filter(t => t !== time)
        : [...prev.reminderTimes, time]
    }));
  };

  const toggleNotificationMethod = (method: 'email' | 'sms' | 'push') => {
    setFormData(prev => ({
      ...prev,
      notificationMethods: prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Schedule Reminder
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Reminder Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="e.g., Motion for Summary Judgment Due"
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Additional details about this reminder..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Due Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Priority */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Priority Level
            </label>
            <div className="flex space-x-3">
              {(['High', 'Medium', 'Low'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.priority === priority
                      ? priority === 'High' 
                        ? 'bg-red-100 text-red-800 border-red-200' 
                        : priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  } border`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Times */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Reminder Schedule
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {reminderOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleReminderTime(time)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.reminderTimes.includes(time)
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  } border`}
                >
                  {time} before
                </button>
              ))}
            </div>
          </div>

          {/* Notification Methods */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notification Methods
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => toggleNotificationMethod('email')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.notificationMethods.includes('email')
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                } border`}
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => toggleNotificationMethod('sms')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.notificationMethods.includes('sms')
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                } border`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>SMS</span>
              </button>
              <button
                type="button"
                onClick={() => toggleNotificationMethod('push')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.notificationMethods.includes('push')
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                } border`}
              >
                <Bell className="h-4 w-4" />
                <span>Push</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Schedule Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;