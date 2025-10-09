import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from './AuthContext';
import { useApi } from '../hooks/useApi';
import {
  Case,
  Deadline,
  Judge,
  Rule,
  PaginatedResponse,
  DeadlineReminderCreatePayload,
  DeadlineUpdatePayload,
  NewDeadlineFormPayload,
  AppUser,
} from '../types';

interface DataContextValue {
  judges: Judge[];
  cases: Case[];
  deadlines: Deadline[];
  rules: Rule[];
  users: AppUser[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createDeadlineReminder: (payload: DeadlineReminderCreatePayload) => Promise<void>;
  updateDeadline: (id: string, payload: DeadlineUpdatePayload) => Promise<void>;
  createDeadline: (payload: NewDeadlineFormPayload) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const initialState = {
  judges: [] as Judge[],
  cases: [] as Case[],
  deadlines: [] as Deadline[],
  rules: [] as Rule[],
  users: [] as AppUser[],
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const { apiFetch } = useApi();
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setData(initialState);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [
        judgesResponse,
        casesResponse,
        deadlinesResponse,
        rulesResponse,
        usersResponse,
      ] = await Promise.all([
        apiFetch<PaginatedResponse<Judge>>('judges/'),
        apiFetch<PaginatedResponse<Case>>('cases/'),
        apiFetch<PaginatedResponse<Deadline>>('deadlines/'),
        apiFetch<PaginatedResponse<Rule>>('rules/'),
        apiFetch<PaginatedResponse<AppUser>>('users/'),
      ]);

      setData({
        judges: judgesResponse.results ?? [],
        cases: casesResponse.results ?? [],
        deadlines: deadlinesResponse.results ?? [],
        rules: rulesResponse.results ?? [],
        users: usersResponse.results ?? [],
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, apiFetch]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (cancelled) return;
      await loadData();
    };
    fetchData();

    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const createDeadlineReminder = useCallback(
    async (payload: DeadlineReminderCreatePayload) => {
      await apiFetch('deadline-reminders/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    [apiFetch],
  );

  const updateDeadline = useCallback(
    async (id: string, payload: DeadlineUpdatePayload) => {
      await apiFetch(`deadlines/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await loadData();
    },
    [apiFetch, loadData],
  );

  const createDeadline = useCallback(
    async (payload: NewDeadlineFormPayload) => {
      await apiFetch('deadlines/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await loadData();
    },
    [apiFetch, loadData],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      judges: data.judges,
      cases: data.cases,
      deadlines: data.deadlines,
      rules: data.rules,
      users: data.users,
      isLoading,
      error,
      refresh,
      createDeadlineReminder,
      updateDeadline,
      createDeadline,
    }),
    [data, isLoading, error, refresh, createDeadlineReminder, updateDeadline, createDeadline],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextValue => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
