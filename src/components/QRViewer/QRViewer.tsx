import { useRef, useCallback, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useClipboard } from '../../hooks/useClipboard';
import { useAppContext } from '../../context/AppContext';
import { generateQRFilename } from '../../services/qrService';
import './QRViewer.css';

interface Props {
  value: string | null;
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function QRViewer({ value }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const { copied, copy } = useClipboard();
  const { addLog } = useAppContext();
  const [colors, setColors] = useState({ bg: '#FFFFFF', fg: '#1A1C1E' });
  const [maximized, setMaximized] = useState(false);
  const [brightness, setBrightness] = useState(1.5);

  useEffect(() => {
    const update = () => {
      setColors({
        bg: getCSSVar('--surface') || '#FFFFFF',
        fg: getCSSVar('--on-surface') || '#1A1C1E',
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!maximized) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMaximized(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [maximized]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const filename = generateQRFilename();
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    addLog('download', `Downloaded QR as ${filename}`);
  }, [addLog]);

  const handleCopyPayload = useCallback(() => {
    if (value) {
      copy(value);
      addLog('clipboard', 'Copied payload to clipboard');
    }
  }, [value, copy, addLog]);

  const handleMaximize = useCallback(() => {
    setMaximized(true);
    addLog('info', 'QR fullscreen mode opened');
  }, [addLog]);

  if (!value) {
    return (
      <div className="qr-viewer card">
        <h2 className="card-title">QR Code</h2>
        <div className="qr-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="18" width="3" height="3" />
            <rect x="14" y="18" width="3" height="3" />
            <rect x="18" y="14" width="3" height="3" />
          </svg>
          <p>Parse a payload to generate QR</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="qr-viewer card">
        <h2 className="card-title">QR Code</h2>
        <div className="qr-display">
          <div className="qr-canvas-wrapper">
            <QRCodeCanvas
              ref={canvasRef}
              value={value}
              size={220}
              level="M"
              includeMargin
              bgColor={colors.bg}
              fgColor={colors.fg}
            />
          </div>
        </div>
        <div className="qr-actions">
          <button
            className="btn btn-primary"
            onClick={handleMaximize}
            aria-label="Maximize QR code"
          >
            Maximize
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleDownload}
            aria-label="Download QR as PNG"
          >
            Download PNG
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleCopyPayload}
            aria-label="Copy payload string"
          >
            {copied ? 'Copied!' : 'Copy Payload'}
          </button>
        </div>
      </div>

      {maximized && (
        <div className="qr-fullscreen" role="dialog" aria-label="QR fullscreen view">
          <div className="qr-fullscreen-topbar">
            <span className="qr-fullscreen-label">Scan QR Code</span>
            <div className="qr-fullscreen-controls">
              <label className="qr-brightness-control">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  aria-label="Brightness"
                />
                <span className="qr-brightness-value">{Math.round(brightness * 100)}%</span>
              </label>
              <button
                className="qr-fullscreen-close"
                onClick={() => setMaximized(false)}
                aria-label="Close fullscreen"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div className="qr-fullscreen-body">
            <div
              className="qr-fullscreen-code"
              style={{ filter: `brightness(${brightness})` }}
            >
              <QRCodeCanvas
                ref={fullscreenCanvasRef}
                value={value}
                size={Math.min(window.innerWidth - 48, window.innerHeight - 160, 600)}
                level="H"
                includeMargin
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
            <p className="qr-fullscreen-hint">Point your camera at the QR code</p>
          </div>
        </div>
      )}
    </>
  );
}
