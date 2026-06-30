import { formatTimestamp } from '../utils/formatter';

export function generateTimestamp(): string {
  return formatTimestamp(new Date());
}

export function parseTimestamp(ts: string): Date | null {
  const match = ts.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, m, d, h, min, s] = match;
  return new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(h),
    Number(min),
    Number(s)
  );
}

export function isTimestampValid(ts: string): boolean {
  return parseTimestamp(ts) !== null;
}
