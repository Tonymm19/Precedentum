import React, { useEffect, useState } from 'react';
import { X } from '../lucide-stub';

import { useTheme } from '../contexts/ThemeContext';
import { AppUser, Deadline, DeadlineUpdatePayload } from '../types';

interface DeadlineEditModalProps {
  deadline: Deadline | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: DeadlineUpdatePayload) => Promise<void> | void;
  users: AppUser[];
}

const statusOptions: Deadline['status'][] = ['open', 'snoozed', 'done', 'missed'];

const DeadlineEditModal: React.FC<DeadlineEditModalProps> = ({ deadline, isOpen, onClose, onSave, users }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<DeadlineUpdatePayload>({
    status: deadline?.status,
    snooze_until: deadline?.snooze_until ?? undefined,
    extension_notes: deadline?.extension_notes ?? '',
    outcome: deadline?.outcome ?? '',
    owner: deadline?.owner ?? undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !deadline) {
      return;
    }
    setError(null);
    setIsSaving(false);
    setFormData({
      status: deadline.status,
      snooze_until: deadline.snooze_until ?? undefined,
      extension_notes: deadline.extension_notes ?? '',
      outcome: deadline.outcome ?? '',
      owner: deadline.owner ?? undefined,
    });
  }, [deadline, isOpen]);

  if (!isOpen || !deadline) {
    return null;
  }

  const snoozeLocalValue = formData.snooze_until
    ? new Date(formData.snooze_until).toISOString().slice(0, 16)
    : '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: DeadlineUpdatePayload = {
        status: formData.status,
        snooze_until: formData.snooze_until ?? null,
        extension_notes: formData.extension_notes ?? '',
        outcome: formData.outcome ?? '',
        owner: formData.owner ?? null,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update deadline.';
      setError(message);
      setIsSaving(false);
    }
  };

  const modalBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${modalBg}`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Edit Deadline</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
            {deadline.case_caption ?? 'Untitled case'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Status</label>
            <select
              value={formData.status ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value as Deadline['status'] }))}
              className={inputClasses}
            >
              <option value="">Select status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Owner</label>
            <select
              value={formData.owner ?? ''}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  owner: event.target.value ? event.target.value : null,
                }))
              }
              className={inputClasses}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
              Snooze Until
            </label>
            <input
              type="datetime-local"
              value={snoozeLocalValue}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  snooze_until: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                }))
              }
              className={inputClasses}
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Leave blank to clear the snooze date.
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Extension Notes</label>
            <textarea
              value={formData.extension_notes ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, extension_notes: event.target.value }))}
              rows={3}
              className={inputClasses}
              placeholder="Notes about extensions or adjustments..."
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Outcome</label>
            <textarea
              value={formData.outcome ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, outcome: event.target.value }))}
              rows={3}
              className={inputClasses}
              placeholder="Outcome or resolution details..."
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg font-medium text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeadlineEditModal;
