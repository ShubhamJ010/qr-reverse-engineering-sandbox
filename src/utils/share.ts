import type { Payload } from '../models/Payload';
import { payloadToString } from './parser';

const SHARE_PARAM = 'share';

export function encodeShareUrl(payload: Payload): string {
  const raw = payloadToString(payload);
  const encoded = btoa(encodeURIComponent(raw));
  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_PARAM, encoded);
  return url.toString();
}

export function decodeSharePayload(): Payload | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(SHARE_PARAM);
  if (!encoded) return null;

  try {
    const raw = decodeURIComponent(atob(encoded));
    const parts = raw.split('#');
    if (parts.length !== 4) return null;
    const [referenceId, timestamp, description, itemId] = parts;
    if (!referenceId || !timestamp || !description || !itemId) return null;
    return { referenceId, timestamp, description, itemId };
  } catch {
    return null;
  }
}

export function isShareMode(): boolean {
  return decodeSharePayload() !== null;
}
