import { formatDateTimeForFilename } from '../utils/formatter';

export function generateQRFilename(): string {
  return `qr_${formatDateTimeForFilename(new Date())}.png`;
}
