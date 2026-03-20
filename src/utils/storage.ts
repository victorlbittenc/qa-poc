const STORAGE_PREFIX = 'inventory_';

export function storageRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageWrite<T>(key: string, data: T): void {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

export function storageRemove(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}
