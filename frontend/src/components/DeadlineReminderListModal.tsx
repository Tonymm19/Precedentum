import React, { useEffect, useState } from 'react';
import { Loader2, Trash2, RefreshCw, Bell } from '../lucide-stub';

import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import { Deadline, DeadlineReminder, PaginatedResponse } from '../types';

interface DeadlineReminderListModalProps {
  isOpen: boolean;
  deadline: Deadline | null;
  onClose: () => void;
}

const channelLabel: Record<DeadlineReminder['channel'], string> = {
  in_app: 'In-app',
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
};

const DeadlineReminderListModal: React.FC<DeadlineReminderListModalProps> = ({ isOpen, deadline, onClose }) => {
  const { isDarkMode } = useTheme();
  const { apiFetch } = useApi();
  const [reminders, setReminders] = useState<DeadlineReminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !deadline) {
      return;
    }

    let cancelled = false;

    const fetchReminders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch<PaginatedResponse<DeadlineReminder>>(
          `deadline-reminders/?deadline=${deadline.id}`,
        );
        if (!cancelled) {
          setReminders(response.results ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unable to load reminders.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchReminders();

    return () => {
      cancelled = true;
    };
  }, [apiFetch, deadline, isOpen]);

  const handleRefresh = async () => {
    if (!deadline) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch<PaginatedResponse<DeadlineReminder>>(
        `deadline-reminders/?deadline=${deadline.id}`,
      );
      setReminders(response.results ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to refresh reminders.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (!deadline) {
      return;
    }
    try {
      await apiFetch(`deadline-reminders/${reminderId}/`, {
        method: 'DELETE',
      });
      setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete reminder.';
      setError(message);
    }
  };

  if (!isOpen || !deadline) {
    return null;
  }

  const modalBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${modalBg}`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${textPrimary}`}>Scheduled Reminders</h2>
              <p className={`${textSecondary} text-sm`}>{deadline.case_caption ?? 'Untitled case'}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center space-x-2 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={onClose}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className={textSecondary}>Loading reminders…</span>
            </div>
          )}

          {error && (
            <div className={`p-3 rounded-lg text-sm ${
              isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {!isLoading && reminders.length === 0 && !error && (
            <div className={`text-center py-12 ${textSecondary}`}>
              <Bell className={`mx-auto mb-4 h-10 w-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p>No reminders scheduled for this deadline yet.</p>
            </div>
          )}

          {reminders.length > 0 && (
            <div className={`overflow-hidden border rounded-xl ${borderColor}`}>
              <table className={`w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <thead className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}>
                  <tr>
                    <th className="text-left px-4 py-3">Notify At</th>
                    <th className="text-left px-4 py-3">Channel</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((reminder) => {
                    const notifyDate = new Date(reminder.notify_at).toLocaleString();
                    return (
                      <tr
                        key={reminder.id}
                        className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">{notifyDate}</td>
                        <td className="px-4 py-3">{channelLabel[reminder.channel]}</td>
                        <td className="px-4 py-3">
                          {reminder.sent
                            ? `Sent ${reminder.sent_at ? new Date(reminder.sent_at).toLocaleString() : ''}`
                            : 'Pending'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!reminder.sent && (
                            <button
                              onClick={() => handleDelete(reminder.id)}
                              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium ${
                                isDarkMode
                                  ? 'bg-red-900/40 text-red-200 hover:bg-red-900/60'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeadlineReminderListModal;
