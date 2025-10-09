import React, { useEffect, useState } from 'react';
import { X } from '../lucide-stub';

import { useTheme } from '../contexts/ThemeContext';
import { AppUser, Case, Deadline, NewDeadlineFormPayload } from '../types';

interface NewDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  users: AppUser[];
  onSave: (payload: NewDeadlineFormPayload) => Promise<void> | void;
}

const triggerTypeOptions: Deadline['trigger_type'][] = ['rule', 'court_order', 'user'];
const basisOptions: Deadline['basis'][] = ['calendar_days', 'business_days'];
const statusOptions: Deadline['status'][] = ['open', 'snoozed', 'done', 'missed'];

const buildInitialForm = (): NewDeadlineFormPayload => ({
  case: '',
  trigger_type: 'user',
  trigger_source_type: '',
  trigger_source_id: null,
  basis: 'calendar_days',
  holiday_calendar: null,
  due_at: '',
  timezone: 'America/Chicago',
  owner: null,
  priority: 3,
  status: 'open',
  snooze_until: null,
  extension_notes: '',
  outcome: '',
  computation_rationale: '',
});

const NewDeadlineModal: React.FC<NewDeadlineModalProps> = ({ isOpen, onClose, cases, users, onSave }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<NewDeadlineFormPayload>(buildInitialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormData(buildInitialForm());
    setIsSaving(false);
    setError(null);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modalBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
  }`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: NewDeadlineFormPayload = {
        ...formData,
        trigger_source_id: formData.trigger_source_id || null,
        due_at: new Date(formData.due_at).toISOString(),
        snooze_until: formData.snooze_until ? new Date(formData.snooze_until).toISOString() : null,
        owner: formData.owner || null,
      };
      await onSave(payload);
      onClose();
      setIsSaving(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create deadline.';
      setError(message);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${modalBg}`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Create Deadline</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Case *</label>
              <select
                value={formData.case}
                onChange={(event) => setFormData((prev) => ({ ...prev, case: event.target.value }))}
                className={inputClasses}
                required
              >
                <option value="">Select case</option>
                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.caption}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Trigger Type *</label>
              <select
                value={formData.trigger_type}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    trigger_type: event.target.value as Deadline['trigger_type'],
                  }))
                }
                className={inputClasses}
                required
              >
                {triggerTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Trigger Source Type
              </label>
              <input
                type="text"
                value={formData.trigger_source_type}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, trigger_source_type: event.target.value }))
                }
                className={inputClasses}
                placeholder="e.g., docket_entry"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Trigger Source ID
              </label>
              <input
                type="text"
                value={formData.trigger_source_id ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    trigger_source_id: event.target.value || null,
                  }))
                }
                className={inputClasses}
                placeholder="UUID or reference"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Basis *</label>
              <select
                value={formData.basis}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    basis: event.target.value as Deadline['basis'],
                  }))
                }
                className={inputClasses}
                required
              >
                {basisOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Due At *</label>
              <input
                type="datetime-local"
                value={formData.due_at}
                onChange={(event) => setFormData((prev) => ({ ...prev, due_at: event.target.value }))}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Timezone *</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(event) => setFormData((prev) => ({ ...prev, timezone: event.target.value }))}
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Priority *</label>
              <input
                type="number"
                min={1}
                max={5}
                value={formData.priority}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, priority: Number(event.target.value) }))
                }
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Status *</label>
              <select
                value={formData.status}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: event.target.value as Deadline['status'],
                  }))
                }
                className={inputClasses}
                required
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Snooze Until</label>
              <input
                type="datetime-local"
                value={formData.snooze_until ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    snooze_until: event.target.value || null,
                  }))
                }
                className={inputClasses}
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Leave blank to create without snoozing.
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Computation Rationale
              </label>
              <textarea
                value={formData.computation_rationale}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, computation_rationale: event.target.value }))
                }
                rows={3}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Extension Notes
              </label>
              <textarea
                value={formData.extension_notes}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, extension_notes: event.target.value }))
                }
                rows={3}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Outcome</label>
              <textarea
                value={formData.outcome}
                onChange={(event) => setFormData((prev) => ({ ...prev, outcome: event.target.value }))}
                rows={3}
                className={inputClasses}
              />
            </div>
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm ${
              isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
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
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg font-medium text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? 'Saving…' : 'Create Deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDeadlineModal;
