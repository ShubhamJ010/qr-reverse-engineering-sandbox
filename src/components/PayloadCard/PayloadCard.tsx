import type { PayloadWithRaw } from '../../models/Payload';
import './PayloadCard.css';

interface Props {
  payload: PayloadWithRaw;
}

export function PayloadCard({ payload }: Props) {
  return (
    <div className="payload-card card">
      <h2 className="card-title card-title-padded">Parsed Payload</h2>
      <div className="payload-fields">
        <div className="payload-field">
          <span className="field-label">Reference ID</span>
          <span className="field-value mono">{payload.referenceId}</span>
        </div>
        <div className="payload-field">
          <span className="field-label">Timestamp</span>
          <span className="field-value mono">{payload.timestamp}</span>
        </div>
        <div className="payload-field">
          <span className="field-label">Description</span>
          <span className="field-value">{payload.description}</span>
        </div>
        <div className="payload-field">
          <span className="field-label">Item ID</span>
          <span className="field-value mono">{payload.itemId}</span>
        </div>
      </div>
      <div className="payload-raw">
        <span className="field-label">Full Payload</span>
        <code className="field-value mono payload-raw-text">{payload.raw}</code>
      </div>
    </div>
  );
}
