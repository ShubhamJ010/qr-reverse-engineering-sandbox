import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from './context/AppContext';
import { parsePayload, payloadToString } from './utils/parser';
import { generatePayload } from './services/payloadService';
import { useCountdown } from './hooks/useCountdown';
import { decodeSharePayload } from './utils/share';
import { REFRESH_INTERVAL } from './models/Payload';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { PayloadInput } from './components/PayloadInput/PayloadInput';
import { PayloadCard } from './components/PayloadCard/PayloadCard';
import { QRViewer } from './components/QRViewer/QRViewer';
import { Countdown } from './components/Countdown/Countdown';
import { DeveloperPanel } from './components/DeveloperPanel/DeveloperPanel';
import './styles/global.css';

export default function App() {
  const {
    payload,
    setPayload,
    basePayload,
    setBasePayload,
    settings,
  } = useAppContext();

  // Memoize so it's computed once on mount — decodeSharePayload() returns a new
  // object reference every call, which would re-fire the share-mode effect on
  // every render (each second) and regenerate the payload prematurely.
  const sharePayload = useMemo(() => decodeSharePayload(), []);
  const shareMode = sharePayload !== null;

  const basePayloadRef = useRef(basePayload);
  basePayloadRef.current = basePayload;

  const setPayloadRef = useRef(setPayload);
  setPayloadRef.current = setPayload;

  const handleRefresh = useCallback(() => {
    const bp = basePayloadRef.current;
    if (!bp) return;
    setPayloadRef.current(generatePayload(bp));
  }, []);

  const { seconds, reset } = useCountdown({
    initialSeconds: REFRESH_INTERVAL,
    active: !!basePayload,
    onComplete: handleRefresh,
  });

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.darkMode]);

  // Share mode: load payload from URL (runs once on mount)
  useEffect(() => {
    if (!sharePayload) return;
    const parsed = parsePayload(payloadToString(sharePayload));
    if (!parsed) return;

    setBasePayload(parsed);
    setPayload(generatePayload(parsed));
  }, [sharePayload]);

  const handlePayloadParsed = useCallback(
    (raw: string) => {
      const parsed = parsePayload(raw);
      if (parsed) {
        setBasePayload(parsed);
        setPayload(generatePayload(parsed));
        reset(REFRESH_INTERVAL);
      }
    },
    [setBasePayload, setPayload, reset]
  );

  const handleDevUpdate = useCallback(
    (updatedPayload: import('./models/Payload').Payload) => {
      setBasePayload(updatedPayload);
      setPayload(generatePayload(updatedPayload));
    },
    [setBasePayload, setPayload]
  );

  const qrValue = payload ? payload.raw : null;

  // ── Share mode: minimal view ──
  if (shareMode) {
    return (
      <div className="app app-share">
        <main className="app-content share-content">
          {payload && (
            <>
              <QRViewer value={qrValue} shareMode />
              <Countdown
                seconds={seconds}
                totalSeconds={REFRESH_INTERVAL}
                active
              />
            </>
          )}
        </main>
      </div>
    );
  }

  // ── Full mode ──
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
              totalSeconds={REFRESH_INTERVAL}
              active
            />
            <DeveloperPanel payload={basePayload} onUpdate={handleDevUpdate} />
          </>
        )}

        {basePayload && (
          <button
            className="btn btn-ghost new-payload-btn"
            onClick={() => {
              setBasePayload(null);
              setPayload(null);
            }}
          >
            New Payload
          </button>
        )}
      </main>
      <Footer />
    </div>
  );
}
