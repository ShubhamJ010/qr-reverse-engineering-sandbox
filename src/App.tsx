import { useCallback, useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { parsePayload, payloadToString } from './utils/parser';
import { generatePayload } from './services/payloadService';
import { useCountdown } from './hooks/useCountdown';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { PayloadInput } from './components/PayloadInput/PayloadInput';
import { PayloadCard } from './components/PayloadCard/PayloadCard';
import { QRViewer } from './components/QRViewer/QRViewer';
import { Countdown } from './components/Countdown/Countdown';
import { DeveloperPanel } from './components/DeveloperPanel/DeveloperPanel';
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel';
import { LogConsole } from './components/LogConsole/LogConsole';
import { Settings } from './components/Settings/Settings';
import { Statistics } from './components/Statistics/Statistics';
import { FutureTools } from './components/FutureTools/FutureTools';
import './styles/global.css';

export default function App() {
  const {
    payload,
    setPayload,
    basePayload,
    setBasePayload,
    settings,
    addHistory,
    addLog,
    refreshCount,
    setRefreshCount,
  } = useAppContext();

  const handleRefresh = useCallback(() => {
    if (!basePayload) return;
    const newPayload = generatePayload(basePayload);
    setPayload(newPayload);
    addHistory(newPayload);
    setRefreshCount(refreshCount + 1);
    addLog('refresh', `Refreshed: ${newPayload.timestamp}`);
  }, [basePayload, setPayload, addHistory, setRefreshCount, addLog, refreshCount]);

  const { seconds, reset } = useCountdown({
    initialSeconds: settings.refreshInterval,
    active: settings.autoRefresh && !!basePayload,
    onComplete: handleRefresh,
  });

  useEffect(() => {
    reset(settings.refreshInterval);
  }, [settings.refreshInterval, reset]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.darkMode]);

  const handlePayloadParsed = useCallback(
    (raw: string) => {
      const parsed = parsePayload(raw);
      if (parsed) {
        setBasePayload(parsed);
        const newPayload = generatePayload(parsed);
        setPayload(newPayload);
        addHistory(newPayload);
        setRefreshCount(0);
        reset(settings.refreshInterval);
        addLog('parse', `Payload parsed: ${parsed.referenceId}#${parsed.timestamp.substring(0, 10)}#...`);
      }
    },
    [setBasePayload, setPayload, addHistory, setRefreshCount, reset, settings.refreshInterval, addLog]
  );

  const handleManualRefresh = useCallback(() => {
    handleRefresh();
    reset(settings.refreshInterval);
    addLog('info', 'Manual refresh triggered');
  }, [handleRefresh, reset, settings.refreshInterval, addLog]);

  const handleDevUpdate = useCallback(
    (updatedPayload: import('./models/Payload').Payload) => {
      setBasePayload(updatedPayload);
      const newPayload = generatePayload(updatedPayload);
      setPayload(newPayload);
      addHistory(newPayload);
      addLog('info', `Developer updated: ${payloadToString(updatedPayload)}`);
    },
    [setBasePayload, setPayload, addHistory, addLog]
  );

  const qrValue = payload ? payload.raw : null;

  return (
    <div className="app">
      <Header />
      <main className="app-content">
        {!basePayload && (
          <PayloadInput onPayloadParsed={handlePayloadParsed} />
        )}

        {payload && (
          <>
            <PayloadCard payload={payload} />
            <QRViewer value={qrValue} />
            <Countdown
              seconds={seconds}
              totalSeconds={settings.refreshInterval}
              active={settings.autoRefresh}
            />
            {settings.autoRefresh && (
              <button
                className="btn btn-primary"
                onClick={handleManualRefresh}
                style={{ width: '100%' }}
                aria-label="Refresh QR now"
              >
                Refresh Now
              </button>
            )}
            <DeveloperPanel payload={basePayload} onUpdate={handleDevUpdate} />
            <Statistics />
          </>
        )}

        <Settings />
        <HistoryPanel />
        <LogConsole />
        <FutureTools />

        {basePayload && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setBasePayload(null);
              setPayload(null);
              addLog('info', 'Payload cleared');
            }}
            style={{ width: '100%' }}
          >
            New Payload
          </button>
        )}
      </main>
      <Footer />
    </div>
  );
}
