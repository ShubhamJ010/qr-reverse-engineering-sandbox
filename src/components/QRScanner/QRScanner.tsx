import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import './QRScanner.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (text: string) => void;
}

const SCANNER_ELEMENT_ID = 'qr-scanner-reader';

async function findRearCamera(): Promise<string | null> {
  const devices = await Html5Qrcode.getCameras();
  if (!devices || devices.length === 0) return null;

  // Prefer camera with "back", "rear", or "environment" in the label
  const rear = devices.find((d) => {
    const label = (d.label || '').toLowerCase();
    return label.includes('back') || label.includes('rear') || label.includes('environment');
  });

  // Fall back to last camera (usually rear on mobile)
  return rear?.id || devices[devices.length - 1]?.id || null;
}

export function QRScanner({ isOpen, onClose, onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  const [error, setError] = useState<string | null>(null);

  onScanRef.current = onScan;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setError(null);
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

    const start = async () => {
      // Wait for DOM
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      if (cancelled) return;

      const el = document.getElementById(SCANNER_ELEMENT_ID);
      if (!el) {
        setError('Scanner element not found');
        return;
      }

      const cameraId = await findRearCamera();
      if (cancelled) return;

      if (!cameraId) {
        setError('No camera found on this device.');
        return;
      }

      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!cancelled) {
              onScanRef.current(decodedText);
              stopScanner();
              onCloseRef.current();
            }
          },
          () => {} // ignore per-frame errors
        );
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('QR scanner start failed:', msg);
          if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
            setError('Camera permission denied. Please allow camera access and try again.');
          } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFound')) {
            setError('No camera found on this device.');
          } else {
            setError(`Camera error: ${msg}`);
          }
          scannerRef.current = null;
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isOpen]);

  function cleanup() {
    if (!scannerRef.current) return;
    try {
      const state = scannerRef.current.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        scannerRef.current.stop().catch(() => {});
      }
    } catch { /* ok */ }
    scannerRef.current = null;
  }

  function stopScanner() {
    if (!scannerRef.current) return;
    try {
      const state = scannerRef.current.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        scannerRef.current.stop().catch(() => {});
      }
    } catch { /* ok */ }
    scannerRef.current = null;
  }

  if (!isOpen) return null;

  return (
    <div className="scanner-overlay" onClick={onClose} role="dialog" aria-label="QR Scanner">
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <h3>Scan QR Code</h3>
          <button className="scanner-close" onClick={onClose} aria-label="Close scanner">
            &times;
          </button>
        </div>
        <div className="scanner-body">
          <div id={SCANNER_ELEMENT_ID} className="scanner-reader" />
          {error && <p className="scanner-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
