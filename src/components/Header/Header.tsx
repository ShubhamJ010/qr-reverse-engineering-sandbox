import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="3" height="3" />
          <rect x="18" y="18" width="3" height="3" />
          <rect x="14" y="18" width="3" height="3" />
          <rect x="18" y="14" width="3" height="3" />
        </svg>
      </div>
      <div className="header-text">
        <h1 className="header-title">QR Reverse Engineering</h1>
        <p className="header-subtitle">Sandbox</p>
      </div>
    </header>
  );
}
