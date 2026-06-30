import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatDuration } from '../../utils/formatter';
import './Statistics.css';

export function Statistics() {
  const { refreshCount, startTime, settings, history, payload } = useAppContext();
  const [expanded, setExpanded] = useState(false);

  const elapsed = useMemo(() => {
    return Math.floor((Date.now() - startTime) / 1000);
  }, [startTime]);

  const stats = useMemo(
    () => [
      { label: 'Refresh Count', value: String(refreshCount) },
      { label: 'Elapsed Time', value: formatDuration(elapsed) },
      { label: 'Payload Length', value: payload ? `${payload.raw.length} chars` : '-' },
      { label: 'Current Interval', value: `${settings.refreshInterval}s` },
      { label: 'History Size', value: `${history.length} entries` },
    ],
    [refreshCount, elapsed, payload, settings.refreshInterval, history.length]
  );

  return (
    <div className="statistics card">
      <button
        className="card-header-btn"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label="Toggle statistics"
      >
        <div className="card-header-content">
          <h2 className="card-title">Statistics</h2>
          <span className="card-badge">{refreshCount} refreshes</span>
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
        <div className="stats-content">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-row">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value mono">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
