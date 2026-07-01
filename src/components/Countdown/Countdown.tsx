import './Countdown.css';

interface Props {
  seconds: number;
  totalSeconds: number;
  active: boolean;
}

export function Countdown({ seconds, totalSeconds, active }: Props) {
  if (!active) return null;

  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="countdown card">
      <h2 className="card-title card-title-padded">Refreshing in</h2>
      <div className="countdown-visual">
        <svg className="countdown-ring" width="52" height="52" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 20 20)"
            style={{ transition: 'stroke-dashoffset 0.3s linear' }}
          />
        </svg>
        <span className="countdown-number">{seconds}</span>
      </div>
      <div className="countdown-bar">
        <div
          className="countdown-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
