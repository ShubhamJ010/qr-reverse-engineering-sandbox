import { useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useClipboard } from '../../hooks/useClipboard';
import { useAppContext } from '../../context/AppContext';
import { generateQRFilename } from '../../services/qrService';
import './QRViewer.css';

interface Props {
  value: string | null;
}

export function QRViewer({ value }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { copied, copy } = useClipboard();
  const { addLog } = useAppContext();

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
            bgColor="var(--surface)"
            fgColor="var(--on-surface)"
          />
        </div>
      </div>
      <div className="qr-actions">
        <button
          className="btn btn-primary"
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
  );
}
