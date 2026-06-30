export interface Payload {
  referenceId: string;
  timestamp: string;
  description: string;
  itemId: string;
}

export interface PayloadWithRaw extends Payload {
  raw: string;
}

export interface HistoryEntry {
  id: string;
  payload: PayloadWithRaw;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'refresh' | 'clipboard' | 'download' | 'error' | 'parse';
  message: string;
}

export interface Settings {
  autoRefresh: boolean;
  refreshInterval: number;
  darkMode: boolean;
  historyLimit: number;
}

export interface AppState {
  payload: PayloadWithRaw | null;
  settings: Settings;
  history: HistoryEntry[];
  logs: LogEntry[];
  refreshCount: number;
  isRefreshing: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoRefresh: true,
  refreshInterval: 5,
  darkMode: false,
  historyLimit: 100,
};

export const EXAMPLE_PAYLOAD =
  'G10B5243Z26630202911993#2026-06-30 15:31:19#1 x Today\'s Special Dinner#463';
