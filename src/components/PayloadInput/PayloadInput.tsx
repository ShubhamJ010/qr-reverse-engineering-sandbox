import { useState, useCallback } from 'react';
import { EXAMPLE_PAYLOAD } from '../../models/Payload';
import { parsePayload } from '../../utils/parser';
import { validatePayload } from '../../utils/validator';
import { useClipboard } from '../../hooks/useClipboard';
import { QRScanner } from '../QRScanner/QRScanner';
import './PayloadInput.css';

interface Props {
  onPayloadParsed: (raw: string) => void;
}

export function PayloadInput({ onPayloadParsed }: Props) {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const { copied } = useClipboard();

  const handleParse = useCallback(() => {
    const validationErrors = validatePayload(input);
    if (validationErrors.length > 0) {
      setErrors(validationErrors.map((e) => e.message));
      return;
    }
    const parsed = parsePayload(input);
    if (!parsed) {
      setErrors(['Invalid payload format']);
      return;
    }
    setErrors([]);
    onPayloadParsed(input.trim());
  }, [input, onPayloadParsed]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      // clipboard access denied
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setErrors([]);
  }, []);

  const handleExample = useCallback(() => {
    setInput(EXAMPLE_PAYLOAD);
    setErrors([]);
  }, []);

  const handleScan = useCallback(
    (scannedText: string) => {
      setInput(scannedText);
      setErrors([]);
      setTimeout(() => {
        const validationErrors = validatePayload(scannedText);
        if (validationErrors.length > 0) {
          setErrors(validationErrors.map((e) => e.message));
          return;
        }
        const parsed = parsePayload(scannedText);
        if (!parsed) {
          setErrors(['Invalid payload format']);
          return;
        }
        onPayloadParsed(scannedText.trim());
      }, 0);
    },
    [onPayloadParsed]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleParse();
      }
    },
    [handleParse]
  );

  return (
    <div className="payload-input card">
      <div className="scan-hero">
        <h2 className="card-title">Load Payload</h2>
        <p className="card-description">
          Scan a QR code to load a payload
        </p>
        <button
          className="btn btn-primary btn-scan"
          onClick={() => setScannerOpen(true)}
          aria-label="Scan QR code"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="12" y1="7" x2="12" y2="17" />
          </svg>
          Scan QR Code
        </button>
      </div>

      <button
        className="btn btn-ghost toggle-manual"
        onClick={() => setShowManual(!showManual)}
        aria-expanded={showManual}
      >
        {showManual ? 'Hide manual input' : 'Or paste manually'}
      </button>

      {showManual && (
        <div className="manual-section">
          <textarea
            className="payload-textarea"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setErrors([]);
            }}
            onKeyDown={handleKeyDown}
            placeholder="G10B5243Z26630202911993#2026-06-30 15:31:19#1 x Today's Special Dinner#463"
            rows={4}
            aria-label="QR Payload Input"
          />
          {errors.length > 0 && (
            <div className="payload-errors" role="alert">
              {errors.map((err, i) => (
                <span key={i} className="payload-error">
                  {err}
                </span>
              ))}
            </div>
          )}
          <div className="payload-actions">
            <button className="btn btn-primary" onClick={handleParse} aria-label="Parse payload">
              Parse
            </button>
            <button className="btn btn-secondary" onClick={handlePaste} aria-label="Paste from clipboard">
              {copied ? 'Copied!' : 'Paste Clipboard'}
            </button>
            <button className="btn btn-ghost" onClick={handleExample} aria-label="Use example payload">
              Example
            </button>
            <button className="btn btn-ghost" onClick={handleClear} aria-label="Clear input">
              Clear
            </button>
          </div>
        </div>
      )}

      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}
