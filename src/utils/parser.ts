import type { Payload, PayloadWithRaw } from '../models/Payload';

const DELIMITER = '#';

export function parsePayload(raw: string): PayloadWithRaw | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(DELIMITER);
  if (parts.length !== 4) return null;

  const [referenceId, timestamp, description, itemId] = parts;

  if (!referenceId || !timestamp || !description || !itemId) return null;

  return {
    referenceId,
    timestamp,
    description,
    itemId,
    raw: trimmed,
  };
}

export function payloadToString(payload: Payload): string {
  return [payload.referenceId, payload.timestamp, payload.description, payload.itemId].join(
    DELIMITER
  );
}

export function reassemblePayload(payload: Payload): string {
  return payloadToString(payload);
}
