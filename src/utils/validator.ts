export interface ValidationError {
  field: string;
  message: string;
}

export function validatePayload(raw: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = raw.trim();

  if (!trimmed) {
    errors.push({ field: 'payload', message: 'Payload is empty' });
    return errors;
  }

  const parts = trimmed.split('#');

  if (parts.length !== 4) {
    errors.push({
      field: 'format',
      message: `Expected 4 fields separated by #, found ${parts.length}`,
    });
    return errors;
  }

  const [referenceId, timestamp, description, itemId] = parts;

  if (!referenceId) {
    errors.push({ field: 'referenceId', message: 'Reference ID is empty' });
  }

  if (!timestamp) {
    errors.push({ field: 'timestamp', message: 'Timestamp is empty' });
  } else if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
    errors.push({
      field: 'timestamp',
      message: 'Timestamp must be in YYYY-MM-DD HH:mm:ss format',
    });
  }

  if (!description) {
    errors.push({ field: 'description', message: 'Description is empty' });
  }

  if (!itemId) {
    errors.push({ field: 'itemId', message: 'Item ID is empty' });
  }

  return errors;
}
