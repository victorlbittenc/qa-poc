// Generated for commit 03f8c5c — targets storage.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageRead, storageWrite, storageRemove } from '../../utils/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('storageWrite and storageRead', () => {
    it('writes and reads back an object', () => {
      storageWrite('test', { foo: 'bar' });
      expect(storageRead('test')).toEqual({ foo: 'bar' });
    });

    it('writes and reads back an array', () => {
      storageWrite('list', [1, 2, 3]);
      expect(storageRead('list')).toEqual([1, 2, 3]);
    });

    it('prefixes keys with inventory_', () => {
      storageWrite('key', 'value');
      expect(localStorage.getItem('inventory_key')).toBe('"value"');
    });

    it('returns null for non-existent key', () => {
      expect(storageRead('nonexistent')).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      localStorage.setItem('inventory_bad', '{invalid json}');
      expect(storageRead('bad')).toBeNull();
    });
  });

  describe('storageRemove', () => {
    it('removes the item from localStorage', () => {
      storageWrite('temp', 'data');
      storageRemove('temp');
      expect(storageRead('temp')).toBeNull();
    });
  });
});
