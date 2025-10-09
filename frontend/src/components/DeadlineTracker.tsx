import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle,
  FileText,
  Bell,
  Edit,
} from '../lucide-stub';

import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import {
  Deadline,
  DeadlineReminderCreatePayload,
  DeadlineUpdatePayload,
  NewDeadlineFormPayload,
} from '../types';
import ReminderModal, { ReminderData } from './ReminderModal';
import DeadlineEditModal from './DeadlineEditModal';
import DeadlineReminderListModal from './DeadlineReminderListModal';
import NewDeadlineModal from './NewDeadlineModal';
import AuditLogModal from './AuditLogModal';

const DEADLINE_STATUS_OPTIONS: Array<'all' | 'open' | 'snoozed' | 'missed' | 'done'> = [
  'all',
  'open',
  'snoozed',
  'missed',
  'done',
];

const PRIORITY_FILTER_OPTIONS: Array<'all' | 'High' | 'Medium' | 'Low'> = ['all', 'High', 'Medium', 'Low'];

const DeadlineTracker: React.FC = () => {
  const { isDarkMode } = useTheme();
  const {
    deadlines,
    cases,
    users,
    isLoading,
    error,
    createDeadlineReminder,
    updateDeadline,
    createDeadline,
  } = useData();

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<(typeof DEADLINE_STATUS_OPTIONS)[number]>('all');
  const [filterPriority, setFilterPriority] = useState<(typeof PRIORITY_FILTER_OPTIONS)[number]>('all');
  const [caseFilter, setCaseFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReminderList, setShowReminderList] = useState(false);
  const [reminderListDeadline, setReminderListDeadline] = useState<Deadline | null>(null);
  const [showNewDeadlineModal, setShowNewDeadlineModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditDeadline, setAuditDeadline] = useState<Deadline | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const getPriorityLabel = (priority: number): 'High' | 'Medium' | 'Low' => {
    if (priority <= 2) return 'High';
    if (priority === 3) return 'Medium';
    return 'Low';
  };

  const filteredDeadlines = useMemo(() => {
    return deadlines
      .filter((deadline) => (filterStatus === 'all' ? true : deadline.status === filterStatus))
      .filter((deadline) => (filterPriority === 'all' ? true : getPriorityLabel(deadline.priority) === filterPriority))
      .filter((deadline) => (caseFilter === 'all' ? true : deadline.case === caseFilter))
      .filter((deadline) => (ownerFilter === 'all' ? true : deadline.owner === ownerFilter))
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  }, [deadlines, filterPriority, filterStatus, caseFilter, ownerFilter]);

  const getUrgencyLevel = (dueDate: string) => {
    const today = new Date();
    const deadlineDate = new Date(dueDate);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { level: 'overdue', color: 'bg-red-500', textColor: 'text-red-700' };
    if (diffDays === 0) return { level: 'today', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (diffDays === 1) return { level: 'tomorrow', color: 'bg-amber-500', textColor: 'text-amber-700' };
    if (diffDays <= 3) return { level: 'urgent', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (diffDays <= 7) return { level: 'soon', color: 'bg-blue-500', textColor: 'text-blue-700' };
    return { level: 'upcoming', color: 'bg-green-500', textColor: 'text-green-700' };
  };

  const handleScheduleReminder = (deadline: Deadline) => {
    setReminderError(null);
    setActionMessage(null);
    setSelectedDeadline(deadline);
    setShowReminderModal(true);
  };

  const buildReminderPayloads = (
    deadline: Deadline,
    reminder: ReminderData,
  ): DeadlineReminderCreatePayload[] => {
    const { reminderTimes, notificationMethods, dueDate } = reminder;
    if (!dueDate) {
      return [];
    }

    const due = new Date(dueDate);
    const offsets: Record<string, number> = {
      '15 minutes': 15 * 60 * 1000,
      '30 minutes': 30 * 60 * 1000,
      '1 hour': 60 * 60 * 1000,
      '2 hours': 2 * 60 * 60 * 1000,
      '4 hours': 4 * 60 * 60 * 1000,
      '8 hours': 8 * 60 * 60 * 1000,
      '1 day': 24 * 60 * 60 * 1000,
      '2 days': 2 * 24 * 60 * 60 * 1000,
      '3 days': 3 * 24 * 60 * 60 * 1000,
      '1 week': 7 * 24 * 60 * 60 * 1000,
      '2 weeks': 14 * 24 * 60 * 60 * 1000,
    };

    const channelMap: Record<'email' | 'sms' | 'push', 'email' | 'sms' | 'push'> = {
      email: 'email',
      sms: 'sms',
      push: 'push',
    };

    const times = reminderTimes.length ? reminderTimes : ['1 day'];
    const methods = notificationMethods.length ? notificationMethods : ['email'];

    const payloads: DeadlineReminderCreatePayload[] = [];

    times.forEach((label) => {
      const offset = offsets[label] ?? 0;
      const notifyDate = new Date(due.getTime() - offset);
      if (Number.isNaN(notifyDate.getTime())) {
        return;
      }

      methods.forEach((method) => {
        const channel = channelMap[method as keyof typeof channelMap] ?? null;
        if (!channel) {
          return;
        }

        if (notifyDate.getTime() <= Date.now()) {
          return;
        }

        payloads.push({
          deadline: deadline.id,
          notify_at: notifyDate.toISOString(),
          channel,
        });
      });
    });

    return payloads;
  };

  const handleSaveReminder = async (reminder: ReminderData) => {
    if (!selectedDeadline) {
      return;
    }

    const payloads = buildReminderPayloads(selectedDeadline, reminder);
    if (!payloads.length) {
      const message = 'Select at least one reminder time in the future.';
      setReminderError(message);
      return;
    }

    try {
      await Promise.all(payloads.map(createDeadlineReminder));
      setActionMessage('Reminder scheduled successfully.');
      setShowReminderModal(false);
      setSelectedDeadline(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to schedule reminder.';
      setReminderError(message);
    }
  };

  const handleMarkComplete = async (deadline: Deadline) => {
    try {
      await updateDeadline(deadline.id, { status: 'done' });
      setActionMessage('Deadline marked as completed.');
      setReminderError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update deadline.';
      setReminderError(message);
    }
  };
  const toggleSelection = (deadlineId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(deadlineId)) {
        next.delete(deadlineId);
      } else {
        next.add(deadlineId);
      }
      return next;
    });
  };

  const isSelected = (deadlineId: string) => selectedIds.has(deadlineId);

  const handleBulkComplete = async () => {
    if (selectedIds.size === 0) {
      return;
    }
    setBulkLoading(true);
    setReminderError(null);
    setActionMessage(null);

    try {
      await Promise.all(
        Array.from(selectedIds).map((deadlineId) => updateDeadline(deadlineId, { status: 'done' })),
      );
      setActionMessage('Selected deadlines marked as completed.');
      setSelectedIds(new Set());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update selected deadlines.';
      setReminderError(message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleEditDeadline = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setShowEditModal(true);
    setReminderError(null);
    setActionMessage(null);
  };

  const handleSaveDeadline = async (payload: DeadlineUpdatePayload) => {
    if (!selectedDeadline) {
      return;
    }

    try {
      await updateDeadline(selectedDeadline.id, payload);
      setActionMessage('Deadline updated successfully.');
      setReminderError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update deadline.';
      setReminderError(message);
    }
  };

  const handleViewReminders = (deadline: Deadline) => {
    setReminderError(null);
    setActionMessage(null);
    setReminderListDeadline(deadline);
    setShowReminderList(true);
  };

  const handleViewAudit = (deadline: Deadline) => {
    setReminderError(null);
    setActionMessage(null);
    setAuditDeadline(deadline);
    setShowAuditModal(true);
  };

 const handleCreateDeadline = async (form: NewDeadlineFormPayload) => {
    try {
      await createDeadline(form);
      setActionMessage('Deadline created successfully.');
      setReminderError(null);
      setShowNewDeadlineModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create deadline.';
      setReminderError(message);
      throw err instanceof Error ? err : new Error(message);
    }
  };

  const stats = useMemo(
    () => {
      const totalUrgent = deadlines.filter((deadline) => ['overdue', 'today', 'tomorrow', 'urgent'].includes(getUrgencyLevel(deadline.due_at).level)).length;
      const totalThisWeek = deadlines.filter((deadline) => ['today', 'tomorrow', 'urgent', 'soon'].includes(getUrgencyLevel(deadline.due_at).level)).length;
      const totalPending = deadlines.filter((deadline) => deadline.status !== 'done').length;
      const totalCompleted = deadlines.filter((deadline) => deadline.status === 'done').length;

      return [
        {
          title: 'Urgent (≤3 days)',
          value: totalUrgent,
          icon: AlertTriangle,
          accent: 'bg-red-100 text-red-600',
        },
        {
          title: 'Due This Week',
          value: totalThisWeek,
          icon: Clock,
          accent: 'bg-amber-100 text-amber-600',
        },
        {
          title: 'Pending Deadlines',
          value: totalPending,
          icon: Calendar,
          accent: 'bg-blue-100 text-blue-600',
        },
        {
          title: 'Completed',
          value: totalCompleted,
          icon: CheckCircle,
          accent: 'bg-green-100 text-green-600',
        },
      ];
    },
    [deadlines],
  );

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Deadline Tracker</h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and track all case deadlines with automated alerts
            </p>
            {error && (
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
            )}
          </div>
          <button
            onClick={() => {
              setShowNewDeadlineModal(true);
              setActionMessage(null);
              setReminderError(null);
            }}
            className={`px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 ${
              isDarkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>New Deadline</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`rounded-xl shadow-sm border p-6 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.accent}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-xl shadow-sm border p-6 mb-8 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Filter className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filters
            </span>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {DEADLINE_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'all'
                    ? 'All statuses'
                    : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(event) => setFilterPriority(event.target.value as typeof filterPriority)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {PRIORITY_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All priorities' : `${option} priority`}
                </option>
              ))}
            </select>
            <select
              value={caseFilter}
              onChange={(event) => setCaseFilter(event.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All cases</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.caption}
                </option>
              ))}
            </select>
            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All owners</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkComplete}
              disabled={selectedIds.size === 0 || bulkLoading}
              className={`px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium ${
                selectedIds.size === 0 || bulkLoading
                  ? 'bg-green-300 text-green-100 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {bulkLoading ? 'Updating…' : `Mark ${selectedIds.size || ''} Complete`}
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'list'
                  ? isDarkMode
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-blue-100 text-blue-700'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? isDarkMode
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-blue-100 text-blue-700'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {isLoading && (
          <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading deadlines…
          </p>
        )}
        {actionMessage && (
          <p className={`mt-4 text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
            {actionMessage}
          </p>
        )}
        {reminderError && (
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
            {reminderError}
          </p>
        )}
      </div>

      <div className={`rounded-xl shadow-sm border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Deadlines ({filteredDeadlines.length})
          </h2>
        </div>

        {filteredDeadlines.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No deadlines found
            </p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Adjust the filters to broaden your view.'
                : 'Create a deadline to populate this list.'}
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredDeadlines.map((deadline) => {
              const caseRecord = cases.find((candidate) => candidate.id === deadline.case);
              const urgency = getUrgencyLevel(deadline.due_at);
              const priorityLabel = getPriorityLabel(deadline.priority);

              return (
                <div
                  key={deadline.id}
                  className={`p-6 transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="pt-2">
                        <input
                          type="checkbox"
                          checked={isSelected(deadline.id)}
                          onChange={() => toggleSelection(deadline.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {priorityLabel === 'High' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {priorityLabel === 'Medium' && <Clock className="h-5 w-5 text-amber-500" />}
                        {priorityLabel === 'Low' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {deadline.computation_rationale || 'Procedure-driven deadline'}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              deadline.status === 'done'
                                ? 'bg-green-100 text-green-800'
                                : deadline.status === 'missed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {deadline.status.charAt(0).toUpperCase() + deadline.status.slice(1)}
                          </span>
                        </div>
                        <div
                          className={`flex flex-wrap items-center gap-3 text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <span className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{deadline.case_caption ?? caseRecord?.caption ?? 'Unassigned case'}</span>
                          </span>
                          {caseRecord?.case_number && <span>• {caseRecord.case_number}</span>}
                          <span>• {caseRecord?.timezone ?? deadline.timezone}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              urgency.textColor.replace('text-', 'bg-').replace('-700', '-100') + ' ' + urgency.textColor
                            }`}
                          >
                            {new Date(deadline.due_at).toLocaleString()}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Owner: {deadline.owner_name ?? 'Unassigned'}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Created by {deadline.created_by_name ?? 'System'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {deadline.status !== 'done' && (
                        <button
                          onClick={() => handleMarkComplete(deadline)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-green-900 text-green-300 hover:bg-green-800'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Mark Complete
                        </button>
                      )}
                     <button
                       onClick={() => handleViewReminders(deadline)}
                       className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                         isDarkMode
                           ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800'
                           : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                       }`}
                     >
                        Reminders
                        {deadline.pending_reminders > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs px-2 py-0.5">
                            {deadline.pending_reminders}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleViewAudit(deadline)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          isDarkMode
                            ? 'bg-purple-900 text-purple-300 hover:bg-purple-800'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        History
                      </button>
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
                      <button
                        onClick={() => handleEditDeadline(deadline)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Edit className="h-3 w-3 mr-1 inline" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {view === 'calendar' && (
        <div
          className={`mt-8 rounded-xl border-dashed border-2 p-12 text-center ${
            isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'
          }`}
        >
          Calendar visualization coming soon.
        </div>
      )}

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setSelectedDeadline(null);
        }}
        onSave={handleSaveReminder}
        initialData={selectedDeadline ? {
          title: selectedDeadline.case_caption ?? 'Case deadline reminder',
          description: selectedDeadline.computation_rationale ?? '',
          dueDate: selectedDeadline.due_at,
          priority: getPriorityLabel(selectedDeadline.priority),
          notificationMethods: ['email', 'push'],
          reminderTimes: ['1 day'],
          caseId: selectedDeadline.case,
          deadlineId: selectedDeadline.id,
        } : undefined}
      />

      <DeadlineEditModal
        isOpen={showEditModal}
        deadline={selectedDeadline}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDeadline(null);
        }}
        onSave={handleSaveDeadline}
        users={users}
      />

      <DeadlineReminderListModal
        isOpen={showReminderList}
        deadline={reminderListDeadline}
        onClose={() => {
          setShowReminderList(false);
          setReminderListDeadline(null);
        }}
      />

      <NewDeadlineModal
        isOpen={showNewDeadlineModal}
        onClose={() => setShowNewDeadlineModal(false)}
        onSave={handleCreateDeadline}
        cases={cases}
        users={users}
      />

      <AuditLogModal
        isOpen={showAuditModal}
        deadline={auditDeadline}
        onClose={() => {
          setShowAuditModal(false);
          setAuditDeadline(null);
        }}
      />
    </div>
  );
};

export default DeadlineTracker;
