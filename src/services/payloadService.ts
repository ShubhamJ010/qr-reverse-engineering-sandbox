import type { Payload, PayloadWithRaw } from '../models/Payload';
import { payloadToString } from '../utils/parser';
import { generateTimestamp } from './timestampService';

export function generatePayload(basePayload: Payload): PayloadWithRaw {
  const payload: Payload = {
    ...basePayload,
    timestamp: generateTimestamp(),
  };
  return {
    ...payload,
    raw: payloadToString(payload),
  };
}

export function buildPayloadString(
  referenceId: string,
  description: string,
  itemId: string,
  timestamp?: string
): string {
  const ts = timestamp || generateTimestamp();
  return [referenceId, ts, description, itemId].join('#');
}

export function extractFieldsFromRaw(raw: string): Payload | null {
  const parts = raw.trim().split('#');
  if (parts.length !== 4) return null;
  const [referenceId, timestamp, description, itemId] = parts;
  if (!referenceId || !timestamp || !description || !itemId) return null;
  return { referenceId, timestamp, description, itemId };
}
