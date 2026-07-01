import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Payload, PayloadWithRaw, Settings } from '../models/Payload';
import { DEFAULT_SETTINGS } from '../models/Payload';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextValue {
  payload: PayloadWithRaw | null;
  setPayload: (p: PayloadWithRaw | null) => void;
  basePayload: Payload | null;
  setBasePayload: (p: Payload | null) => void;
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
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

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    [setSettings]
  );

  const value = useMemo(
    () => ({
      payload,
      setPayload,
      basePayload,
      setBasePayload,
      settings,
      updateSettings,
    }),
    [
      payload,
      setPayload,
      basePayload,
      setBasePayload,
      settings,
      updateSettings,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
