import { useEffect, useRef, useState, useCallback } from 'react';
import './QRScanner.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (text: string) => void;
}

const MAX_ATTEMPTS = 6;
const SCAN_INTERVAL_MS = 1000;

async function getRearStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
    });
  } catch {
    return await navigator.mediaDevices.getUserMedia({ video: true });
  }
}

export function QRScanner({ isOpen, onClose, onScan }: Props) {
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<{ stop: () => void } | null>(null);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  const [error, setError] = useState<string | null>(null);
  const [useNative, setUseNative] = useState<boolean | null>(null);

  // Multi-scan state
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const modeRef = useRef<'idle' | 'monitoring' | 'stable'>('idle');
  const initialPayloadRef = useRef<string | null>(null);
  const capturedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  onScanRef.current = onScan;
  onCloseRef.current = onClose;

  function cleanup() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
  }

  function resetMultiScan() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    modeRef.current = 'idle';
    initialPayloadRef.current = null;
    capturedRef.current = false;
    setScanHistory([]);
    setIsMonitoring(false);
    setIsStable(false);
    setAttempt(0);
  }

  const handleClose = useCallback(() => {
    resetMultiScan();
    onCloseRef.current();
  }, []);

  const handleUsePayload = useCallback(() => {
    const payload = initialPayloadRef.current;
    resetMultiScan();
    if (payload) {
      onScanRef.current(payload);
    }
    onCloseRef.current();
  }, []);

  const handleDetected = useCallback((text: string) => {
    if (!text?.trim()) return;
    const payload = text.trim();

    if (modeRef.current === 'idle') {
      // First detection — start monitoring
      initialPayloadRef.current = payload;
      capturedRef.current = true;
      modeRef.current = 'monitoring';
      setIsMonitoring(true);
      setAttempt(1);
      setScanHistory([payload]);

      intervalRef.current = setInterval(() => {
        capturedRef.current = false;
        setAttempt((prev) => {
          const next = prev + 1;
          if (next > MAX_ATTEMPTS) {
            // Stable — no change detected
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            modeRef.current = 'stable';
            setIsMonitoring(false);
            setIsStable(true);
            cleanup();
          }
          return next;
        });
      }, SCAN_INTERVAL_MS);
    } else if (modeRef.current === 'monitoring' && !capturedRef.current) {
      // Subsequent detection during monitoring
      capturedRef.current = true;

      if (payload !== initialPayloadRef.current) {
        // Change detected — close immediately with new payload
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        modeRef.current = 'idle';
        onScanRef.current(payload);
        onCloseRef.current();
        return;
      }

      setScanHistory((prev) => [...prev, payload]);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetMultiScan();
      cleanup();
      setError(null);
      setUseNative(null);
      return;
    }

    if (!window.isSecureContext) {
      setError(
        'Camera requires HTTPS. Access this page via https:// or use localhost instead of an IP address.'
      );
      return;
    }

    if (!navigator.mediaDevices) {
      setError('Camera not available. Your browser may be blocking access in this context.');
      return;
    }

    let cancelled = false;
    let animationId = 0;

    const start = async () => {
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      if (cancelled) return;

      const BarcodeDetectorCtor = 'BarcodeDetector' in globalThis
        ? (globalThis as unknown as { BarcodeDetector: new (opts?: { formats: string[] }) => { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector
        : null;

      if (BarcodeDetectorCtor) {
        try {
          const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
          await detector.detect(document.createElement('canvas'));
          setUseNative(true);

          const videoEl = document.getElementById('qr-scanner-video') as HTMLVideoElement | null;
          if (!videoEl || cancelled) return;

          let stream: MediaStream;
          try {
            stream = await getRearStream();
          } catch (err: unknown) {
            if (cancelled) return;
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('Permission') || msg.includes('NotAllowed') || msg.includes('PermissionDenied')) {
              setError('Camera permission denied. Please allow camera access and try again.');
            } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFound')) {
              setError('No camera found on this device.');
            } else {
              setError(`Camera error: ${msg}`);
            }
            return;
          }

          if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

          streamRef.current = stream;
          videoEl.srcObject = stream;
          await videoEl.play();
          if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

          scannerRef.current = {
            stop: () => cancelAnimationFrame(animationId),
          };

          const detect = async () => {
            if (cancelled) return;
            try {
              const barcodes = await detector.detect(videoEl);
              if (barcodes.length > 0 && !cancelled) {
                handleDetected(barcodes[0].rawValue);
              }
            } catch {
              // ignore per-frame errors
            }
            if (!cancelled) {
              animationId = requestAnimationFrame(detect);
            }
          };
          animationId = requestAnimationFrame(detect);
          return;
        } catch {
          // BarcodeDetector not usable
        }
      }

      // Fallback: html5-qrcode library
      setUseNative(false);
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new Html5Qrcode('qr-scanner-fallback');

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            if (!cancelled && decodedText) {
              handleDetected(decodedText);
            }
          },
          () => {}
        );

        scannerRef.current = { stop: () => { scanner.stop().catch(() => {}); } };
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[QRScanner] html5-qrcode error:', msg);
        if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
          setError('Camera permission denied. Please allow camera access and try again.');
        } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFound')) {
          setError('No camera found on this device.');
        } else {
          setError(`Camera error: ${msg}`);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationId);
      resetMultiScan();
      cleanup();
    };
  }, [isOpen, handleDetected]);

  if (!isOpen) return null;

  const progressPercent = isMonitoring ? (attempt / MAX_ATTEMPTS) * 100 : 0;

  return (
    <div className="scanner-overlay" onClick={handleClose} role="dialog" aria-label="QR Scanner">
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <h3>
            {isStable
              ? 'Scan Complete'
              : isMonitoring
                ? `Scanning… ${attempt}/${MAX_ATTEMPTS}`
                : 'Scan QR Code'}
          </h3>
          <button className="scanner-close" onClick={handleClose} aria-label="Close scanner">
            &times;
          </button>
        </div>
        <div className="scanner-body">
          {/* Camera view — hidden once stable */}
          {!isStable && (
            <>
              {useNative !== false && (
                <div className="scanner-reader">
                  <video
                    id="qr-scanner-video"
                    className="scanner-video"
                    playsInline
                    muted
                    style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              )}
              {useNative === false && (
                <div id="qr-scanner-fallback" className="scanner-reader" />
              )}
            </>
          )}

          {error && <p className="scanner-error">{error}</p>}

          {/* Monitoring progress bar */}
          {isMonitoring && (
            <div className="scan-progress">
              <div className="scan-progress-bar">
                <div
                  className="scan-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="scan-progress-label">
                Checking for changes…
              </span>
            </div>
          )}

          {/* Stable results */}
          {isStable && (
            <div className="scan-stable">
              <div className="scan-stable-header">
                <span className="scan-stable-icon">✓</span>
                <span>Payload stable across {scanHistory.length} scans</span>
              </div>
              <ul className="scan-history">
                {scanHistory.map((payload, i) => (
                  <li key={i} className="scan-history-item">
                    <span className="scan-history-label">Scan {i + 1}</span>
                    <code className="scan-history-payload mono">{payload}</code>
                  </li>
                ))}
              </ul>
              <div className="scan-stable-actions">
                <button className="btn btn-primary" onClick={handleUsePayload}>
                  Use This Payload
                </button>
                <button className="btn btn-ghost" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
