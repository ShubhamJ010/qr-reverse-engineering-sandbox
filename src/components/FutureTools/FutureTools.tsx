import { useState } from 'react';
import './FutureTools.css';

interface ToolDef {
  name: string;
  description: string;
}

const tools: ToolDef[] = [
  { name: 'Reference Decoder', description: 'Decode reference ID patterns' },
  { name: 'Checksum', description: 'Verify payload checksums' },
  { name: 'Pattern Analysis', description: 'Analyze payload patterns' },
  { name: 'Binary View', description: 'View payload as binary data' },
  { name: 'Hex View', description: 'View payload in hexadecimal' },
  { name: 'Timestamp Decoder', description: 'Decode timestamp formats' },
  { name: 'Field Inspector', description: 'Inspect individual fields' },
];

export function FutureTools() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="future-tools card">
      <button
        className="card-header-btn"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label="Toggle future reverse engineering tools"
      >
        <div className="card-header-content">
          <h2 className="card-title">Future Reverse Engineering</h2>
          <span className="card-badge">{tools.length}</span>
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
        <div className="future-content">
          {tools.map((tool) => (
            <div key={tool.name} className="future-tool">
              <div className="future-tool-info">
                <span className="future-tool-name">{tool.name}</span>
                <span className="future-tool-desc">{tool.description}</span>
              </div>
              <span className="future-tool-badge">Coming Soon</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
