import { BackendObjectId } from '../types';

/**
 * The API serializes MongoDB ObjectIds as their decomposed parts
 * (timestamp/machine/pid/increment) instead of the canonical 24-char hex
 * string. Reconstruct that hex string here since it's what the API's
 * write/lookup endpoints (e.g. subscription/tenant/{id}) actually expect.
 */
export const toObjectIdHex = (objectId: BackendObjectId | null | undefined): string => {
  if (!objectId) {
    return '';
  }

  const toHex = (value: number, byteLength: number): string => {
    const unsigned = value < 0 ? value + 2 ** (byteLength * 8) : value;
    return unsigned.toString(16).padStart(byteLength * 2, '0');
  };

  return (
    toHex(objectId.timestamp, 4) +
    toHex(objectId.machine, 3) +
    toHex(objectId.pid, 2) +
    toHex(objectId.increment, 3)
  );
};
