import { useEffect, useRef, useState, useCallback } from 'react';
import './QRScanner.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (text: string) => void;
}

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

  onScanRef.current = onScan;
  onCloseRef.current = onClose;

  const handleDetected = useCallback((text: string) => {
    if (text && text.trim()) {
      onScanRef.current(text.trim());
      onCloseRef.current();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
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

      // Check if native BarcodeDetector is available
      const BarcodeDetectorCtor = 'BarcodeDetector' in globalThis
        ? (globalThis as unknown as { BarcodeDetector: new (opts?: { formats: string[] }) => { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector
        : null;

      if (BarcodeDetectorCtor) {
        try {
          const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
          // Test that it actually works
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
                return;
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

      // Fallback: html5-qrcode library (it manages its own camera)
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
      cleanup();
    };
  }, [isOpen, handleDetected]);

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
          {error && <p className="scanner-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
