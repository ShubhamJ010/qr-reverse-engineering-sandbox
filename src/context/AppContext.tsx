import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  Payload,
  PayloadWithRaw,
  HistoryEntry,
  LogEntry,
  Settings,
} from '../models/Payload';
import { DEFAULT_SETTINGS } from '../models/Payload';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextValue {
  payload: PayloadWithRaw | null;
  setPayload: (p: PayloadWithRaw | null) => void;
  basePayload: Payload | null;
  setBasePayload: (p: Payload | null) => void;
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  history: HistoryEntry[];
  addHistory: (entry: PayloadWithRaw) => void;
  clearHistory: () => void;
  exportHistory: () => string;
  logs: LogEntry[];
  addLog: (type: LogEntry['type'], message: string) => void;
  clearLogs: () => void;
  refreshCount: number;
  setRefreshCount: (n: number) => void;
  startTime: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useLocalStorage<PayloadWithRaw | null>('qr-payload', null);
  const [basePayload, setBasePayload] = useLocalStorage<Payload | null>('qr-base', null);
  const [settings, setSettings] = useLocalStorage<Settings>('qr-settings', DEFAULT_SETTINGS);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('qr-history', []);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('qr-logs', []);
  const [refreshCount, setRefreshCount] = useLocalStorage<number>('qr-refresh-count', 0);
  const [startTime] = useLocalStorage<number>('qr-start-time', Date.now());

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    [setSettings]
  );

  const addHistory = useCallback(
    (entry: PayloadWithRaw) => {
      setHistory((prev) => {
        const newEntry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          payload: entry,
          timestamp: Date.now(),
        };
        const next = [newEntry, ...prev].slice(0, settings.historyLimit);
        return next;
      });
    },
    [setHistory, settings.historyLimit]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const exportHistory = useCallback(() => {
    return JSON.stringify(history, null, 2);
  }, [history]);

  const addLog = useCallback(
    (type: LogEntry['type'], message: string) => {
      setLogs((prev) => {
        const entry: LogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          type,
          message,
        };
        return [entry, ...prev].slice(0, 200);
      });
    },
    [setLogs]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, [setLogs]);

  const value = useMemo(
    () => ({
      payload,
      setPayload,
      basePayload,
      setBasePayload,
      settings,
      updateSettings,
      history,
      addHistory,
      clearHistory,
      exportHistory,
      logs,
      addLog,
      clearLogs,
      refreshCount,
      setRefreshCount,
      startTime,
    }),
    [
      payload,
      setPayload,
      basePayload,
      setBasePayload,
      settings,
      updateSettings,
      history,
      addHistory,
      clearHistory,
      exportHistory,
      logs,
      addLog,
      clearLogs,
      refreshCount,
      setRefreshCount,
      startTime,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
