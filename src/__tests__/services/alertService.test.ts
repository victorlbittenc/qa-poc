// Generated for commit 03f8c5c — targets alertService.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateAlerts,
  dismissAlert,
  resetDismissals,
  clearDismissalsForProduct,
} from '../../services/alertService';
import type { Product } from '../../types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Test Product',
    sku: 'TST-001',
    category: 'Electronics',
    price: 10,
    quantity: 50,
    reorderPoint: 10,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('alertService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('generateAlerts', () => {
    it('returns empty array for healthy products', () => {
      const products = [makeProduct({ quantity: 50, reorderPoint: 10 })];
      expect(generateAlerts(products)).toHaveLength(0);
    });

    it('generates critical alert for out-of-stock product', () => {
      const products = [makeProduct({ quantity: 0, name: 'Empty' })];
      const alerts = generateAlerts(products);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[0].message).toContain('out of stock');
    });

    it('generates warning alert for low-stock product', () => {
      const products = [makeProduct({ quantity: 5, reorderPoint: 10, name: 'Low' })];
      const alerts = generateAlerts(products);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('warning');
    });

    it('generates info alert for product approaching reorder point', () => {
      const products = [makeProduct({ quantity: 15, reorderPoint: 10, name: 'Near' })];
      const alerts = generateAlerts(products);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('info');
    });

    it('generates multiple alerts for multiple problematic products', () => {
      const products = [
        makeProduct({ id: 'p1', quantity: 0 }),
        makeProduct({ id: 'p2', quantity: 5, reorderPoint: 10 }),
        makeProduct({ id: 'p3', quantity: 50, reorderPoint: 10 }),
      ];
      const alerts = generateAlerts(products);
      expect(alerts).toHaveLength(2);
    });

    it('marks previously dismissed alerts as dismissed', () => {
      const products = [makeProduct({ id: 'p1', quantity: 5, reorderPoint: 10 })];
      // Generate alerts first, then dismiss, then regenerate
      const alerts1 = generateAlerts(products);
      dismissAlert(alerts1[0].id);
      const alerts2 = generateAlerts(products);
      expect(alerts2[0].dismissed).toBe(true);
    });
  });

  describe('dismissAlert', () => {
    it('persists dismissal so next generateAlerts marks it dismissed', () => {
      const products = [makeProduct({ id: 'p1', quantity: 5, reorderPoint: 10 })];
      const alerts = generateAlerts(products);
      dismissAlert(alerts[0].id);
      const regenerated = generateAlerts(products);
      expect(regenerated[0].dismissed).toBe(true);
    });
  });

  describe('resetDismissals', () => {
    it('clears all dismissals', () => {
      const products = [makeProduct({ id: 'p1', quantity: 5, reorderPoint: 10 })];
      const alerts = generateAlerts(products);
      dismissAlert(alerts[0].id);
      resetDismissals();
      const regenerated = generateAlerts(products);
      expect(regenerated[0].dismissed).toBe(false);
    });
  });

  describe('clearDismissalsForProduct', () => {
    it('clears dismissals only for the specified product', () => {
      const products = [
        makeProduct({ id: 'p1', quantity: 5, reorderPoint: 10 }),
        makeProduct({ id: 'p2', quantity: 3, reorderPoint: 10 }),
      ];
      const alerts = generateAlerts(products);
      dismissAlert(alerts[0].id);
      dismissAlert(alerts[1].id);

      clearDismissalsForProduct('p1');
      const regenerated = generateAlerts(products);

      const p1Alert = regenerated.find((a) => a.productId === 'p1');
      const p2Alert = regenerated.find((a) => a.productId === 'p2');
      expect(p1Alert?.dismissed).toBe(false);
      expect(p2Alert?.dismissed).toBe(true);
    });
  });
});
