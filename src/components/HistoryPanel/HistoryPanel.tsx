import { useState, useCallback } from 'react';
import type { HistoryEntry } from '../../models/Payload';
import { useClipboard } from '../../hooks/useClipboard';
import { useAppContext } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/formatter';
import './HistoryPanel.css';

export function HistoryPanel() {
  const { history, clearHistory, exportHistory, addLog } = useAppContext();
  const { copy } = useClipboard();
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(
    async (entry: HistoryEntry) => {
      await copy(entry.payload.raw);
      setCopiedId(entry.id);
      addLog('clipboard', `Copied history entry: ${entry.payload.referenceId}#...`);
      setTimeout(() => setCopiedId(null), 2000);
    },
    [copy, addLog]
  );

  const handleExport = useCallback(() => {
    const json = exportHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'qr-history.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    addLog('download', 'Exported history as JSON');
  }, [exportHistory, addLog]);

  const handleClear = useCallback(() => {
    clearHistory();
    addLog('info', 'History cleared');
  }, [clearHistory, addLog]);

  return (
    <div className="history-panel card">
      <button
        className="card-header-btn"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label="Toggle history"
      >
        <div className="card-header-content">
          <h2 className="card-title">History</h2>
          <span className="card-badge">{history.length}</span>
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
        <div className="history-content">
          <div className="history-actions">
            <button className="btn btn-ghost btn-sm" onClick={handleExport}>
              Export JSON
            </button>
            <button className="btn btn-ghost btn-sm btn-danger" onClick={handleClear}>
              Clear History
            </button>
          </div>
          {history.length === 0 ? (
            <p className="history-empty">No history entries yet</p>
          ) : (
            <div className="history-list">
              {history.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-item-info">
                    <span className="history-item-ref mono">
                      {entry.payload.referenceId}
                    </span>
                    <span className="history-item-desc">
                      {entry.payload.description}
                    </span>
                    <span className="history-item-time">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleCopy(entry)}
                    aria-label="Copy this payload"
                  >
                    {copiedId === entry.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
