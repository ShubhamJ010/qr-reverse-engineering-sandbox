import { useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/formatter';
import './LogConsole.css';

export function LogConsole() {
  const { logs, clearLogs } = useAppContext();
  const [expanded, setExpanded] = useState(false);

  const getLogIcon = useCallback((type: string) => {
    switch (type) {
      case 'refresh': return '\u21bb';
      case 'clipboard': return '\u2398';
      case 'download': return '\u2193';
      case 'parse': return '\u2699';
      case 'error': return '\u2716';
      default: return '\u2139';
    }
  }, []);

  const getLogClass = useCallback((type: string) => {
    switch (type) {
      case 'error': return 'log-error';
      case 'refresh': return 'log-refresh';
      case 'download': return 'log-download';
      case 'clipboard': return 'log-clipboard';
      default: return 'log-info';
    }
  }, []);

  return (
    <div className="log-console card">
      <button
        className="card-header-btn"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label="Toggle log console"
      >
        <div className="card-header-content">
          <h2 className="card-title">Log Console</h2>
          <span className="card-badge">{logs.length}</span>
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
        <div className="log-content">
          <div className="log-actions">
            <button className="btn btn-ghost btn-sm btn-danger" onClick={clearLogs}>
              Clear Logs
            </button>
          </div>
          {logs.length === 0 ? (
            <p className="log-empty">No logs yet</p>
          ) : (
            <div className="log-list">
              {logs.map((entry) => (
                <div key={entry.id} className={`log-entry ${getLogClass(entry.type)}`}>
                  <span className="log-icon">{getLogIcon(entry.type)}</span>
                  <span className="log-message">{entry.message}</span>
                  <span className="log-time">{formatRelativeTime(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
