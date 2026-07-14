let counter = 0;

export function createId(prefix = 'id'): string {
  counter += 1;
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}
