import { useState, useCallback, useEffect } from 'react';
import type { Payload } from '../../models/Payload';
import { payloadToString } from '../../utils/parser';
import './DeveloperPanel.css';

interface Props {
  payload: Payload | null;
  onUpdate: (payload: Payload) => void;
}

export function DeveloperPanel({ payload, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [fields, setFields] = useState<Payload>(
    payload || { referenceId: '', timestamp: '', description: '', itemId: '' }
  );

  useEffect(() => {
    if (payload) setFields(payload);
  }, [payload]);

  const handleChange = useCallback(
    (key: keyof Payload, value: string) => {
      const next = { ...fields, [key]: value };
      setFields(next);
      if (next.referenceId && next.timestamp && next.description && next.itemId) {
        onUpdate(next);
      }
    },
    [fields, onUpdate]
  );

  return (
    <div className="developer-panel card">
      <button
        className="card-header-btn"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label="Toggle developer tools"
      >
        <div className="card-header-content">
          <h2 className="card-title">Developer Tools</h2>
          <span className="card-badge">Edit</span>
        </div>
        <svg
          className={`chevron ${expanded ? 'chevron-open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="developer-fields">
          <div className="dev-field">
            <label className="field-label" htmlFor="dev-ref">Reference ID</label>
            <input
              id="dev-ref"
              className="dev-input mono"
              value={fields.referenceId}
              onChange={(e) => handleChange('referenceId', e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="dev-field">
            <label className="field-label" htmlFor="dev-ts">Timestamp</label>
            <input
              id="dev-ts"
              className="dev-input mono"
              value={fields.timestamp}
              onChange={(e) => handleChange('timestamp', e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="dev-field">
            <label className="field-label" htmlFor="dev-desc">Description</label>
            <input
              id="dev-desc"
              className="dev-input"
              value={fields.description}
              onChange={(e) => handleChange('description', e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="dev-field">
            <label className="field-label" htmlFor="dev-item">Item ID</label>
            <input
              id="dev-item"
              className="dev-input mono"
              value={fields.itemId}
              onChange={(e) => handleChange('itemId', e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="dev-raw-preview">
            <span className="field-label">Reassembled</span>
            <code className="mono">{payloadToString(fields)}</code>
          </div>
        </div>
      )}
    </div>
  );
}
