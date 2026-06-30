import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import './Settings.css';

export function Settings() {
  const { settings, updateSettings } = useAppContext();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="settings card">
      <button
        className="card-header-btn"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label="Toggle settings"
      >
        <div className="card-header-content">
          <h2 className="card-title">Settings</h2>
          <span className="card-badge">
            {settings.darkMode ? 'Dark' : 'Light'}
          </span>
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
        <div className="settings-content">
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Auto Refresh</span>
              <span className="setting-description">
                Automatically refresh QR every interval
              </span>
            </div>
            <label className="toggle" htmlFor="auto-refresh">
              <input
                id="auto-refresh"
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => updateSettings({ autoRefresh: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Refresh Interval</span>
              <span className="setting-description">
                {settings.refreshInterval} seconds
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              value={settings.refreshInterval}
              onChange={(e) =>
                updateSettings({ refreshInterval: Number(e.target.value) })
              }
              className="setting-slider"
              aria-label="Refresh interval in seconds"
            />
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Dark Mode</span>
              <span className="setting-description">
                Toggle dark/light theme
              </span>
            </div>
            <label className="toggle" htmlFor="dark-mode">
              <input
                id="dark-mode"
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => updateSettings({ darkMode: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">History Limit</span>
              <span className="setting-description">
                Max {settings.historyLimit} entries
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={settings.historyLimit}
              onChange={(e) =>
                updateSettings({ historyLimit: Number(e.target.value) })
              }
              className="setting-slider"
              aria-label="History limit"
            />
          </div>
        </div>
      )}
    </div>
  );
}
