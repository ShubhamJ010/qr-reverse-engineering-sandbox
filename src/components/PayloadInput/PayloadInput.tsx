import { useState, useCallback } from 'react';
import { EXAMPLE_PAYLOAD } from '../../models/Payload';
import { parsePayload } from '../../utils/parser';
import { validatePayload } from '../../utils/validator';
import { useClipboard } from '../../hooks/useClipboard';
import { useAppContext } from '../../context/AppContext';
import './PayloadInput.css';

interface Props {
  onPayloadParsed: (raw: string) => void;
}

export function PayloadInput({ onPayloadParsed }: Props) {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const { copied } = useClipboard();
  const { addLog } = useAppContext();

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
    addLog('parse', `Parsed payload: ${parsed.referenceId}#${parsed.timestamp.substring(0, 10)}#...`);
    onPayloadParsed(input.trim());
  }, [input, onPayloadParsed, addLog]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      addLog('clipboard', 'Pasted from clipboard');
    } catch {
      addLog('error', 'Failed to read from clipboard');
    }
  }, [addLog]);

  const handleClear = useCallback(() => {
    setInput('');
    setErrors([]);
  }, []);

  const handleExample = useCallback(() => {
    setInput(EXAMPLE_PAYLOAD);
    setErrors([]);
  }, []);

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
      <h2 className="card-title">Paste Payload</h2>
      <p className="card-description">
        Paste your QR payload below or use the example
      </p>
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
  );
}
