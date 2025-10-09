import React, { useEffect, useState } from 'react';
import { Loader2 } from '../lucide-stub';

import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import { Deadline, AuditLogEntry, PaginatedResponse } from '../types';

interface AuditLogModalProps {
  deadline: Deadline | null;
  isOpen: boolean;
  onClose: () => void;
}

const actionLabel: Record<AuditLogEntry['action'], string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  compute: 'Computed',
};

const AuditLogModal: React.FC<AuditLogModalProps> = ({ deadline, isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { apiFetch } = useApi();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !deadline) {
      return;
    }
    let cancelled = false;

    const loadEntries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch<PaginatedResponse<AuditLogEntry>>(
          `audit-log/?entity_table=deadlines&entity_id=${deadline.id}`,
        );
        if (!cancelled) {
          setEntries(response.results ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unable to load audit history.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadEntries();

    return () => {
      cancelled = true;
    };
  }, [apiFetch, deadline, isOpen]);

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
              <h2 className={`text-xl font-semibold ${textPrimary}`}>Audit History</h2>
              <p className={`${textSecondary} text-sm`}>{deadline.case_caption ?? 'Untitled case'}</p>
            </div>
            <button
              onClick={onClose}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className={textSecondary}>Loading history…</span>
            </div>
          )}

          {error && (
            <div className={`p-3 rounded-lg text-sm ${
              isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {!isLoading && entries.length === 0 && !error && (
            <p className={`text-center py-12 ${textSecondary}`}>
              No audit entries recorded for this deadline yet.
            </p>
          )}

          {entries.length > 0 && (
            <div className={`overflow-hidden border rounded-xl ${borderColor}`}>
              <table className={`w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <thead className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}>
                  <tr>
                    <th className="text-left px-4 py-3">Action</th>
                    <th className="text-left px-4 py-3">Actor</th>
                    <th className="text-left px-4 py-3">Timestamp</th>
                    <th className="text-left px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {actionLabel[entry.action] ?? entry.action}
                      </td>
                      <td className="px-4 py-3">{entry.actor_name ?? 'System'}</td>
                      <td className="px-4 py-3">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <pre className={`whitespace-pre-wrap text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;
