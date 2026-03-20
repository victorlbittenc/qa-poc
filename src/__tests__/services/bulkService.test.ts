// Generated for commit 03f8c5c — targets bulkService.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  bulkDelete,
  bulkChangeCategory,
  bulkAdjustStock,
  previewBulkAdjustment,
} from '../../services/bulkService';
import { loadProducts } from '../../services/productService';
import type { Product } from '../../types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Product',
    sku: 'PRD-001',
    category: 'Electronics',
    price: 10,
    quantity: 50,
    reorderPoint: 10,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('bulkService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('bulkDelete', () => {
    it('removes selected products', () => {
      const products = [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2' }), makeProduct({ id: 'p3' })];
      const result = bulkDelete(products, new Set(['p1', 'p3']));
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p2');
    });

    it('persists to localStorage', () => {
      const products = [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2' })];
      bulkDelete(products, new Set(['p1']));
      expect(loadProducts()).toHaveLength(1);
    });
  });

  describe('bulkChangeCategory', () => {
    it('changes category for selected products only', () => {
      const products = [
        makeProduct({ id: 'p1', category: 'Electronics' }),
        makeProduct({ id: 'p2', category: 'Electronics' }),
      ];
      const result = bulkChangeCategory(products, new Set(['p1']), 'Food');
      expect(result[0].category).toBe('Food');
      expect(result[1].category).toBe('Electronics');
    });

    it('updates the updatedAt timestamp for changed products', () => {
      const products = [makeProduct({ id: 'p1', updatedAt: '2025-01-01T00:00:00.000Z' })];
      const result = bulkChangeCategory(products, new Set(['p1']), 'Clothing');
      expect(result[0].updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('persists to localStorage', () => {
      const products = [makeProduct({ id: 'p1', category: 'Electronics' })];
      bulkChangeCategory(products, new Set(['p1']), 'Tools');
      expect(loadProducts()[0].category).toBe('Tools');
    });
  });

  describe('bulkAdjustStock', () => {
    it('adjusts stock for valid products', () => {
      const products = [
        makeProduct({ id: 'p1', quantity: 50 }),
        makeProduct({ id: 'p2', quantity: 20 }),
      ];
      const result = bulkAdjustStock(products, new Set(['p1', 'p2']), -10);
      const p1 = result.products.find((p) => p.id === 'p1');
      const p2 = result.products.find((p) => p.id === 'p2');
      expect(p1?.quantity).toBe(40);
      expect(p2?.quantity).toBe(10);
    });

    it('rejects products that would go negative', () => {
      const products = [
        makeProduct({ id: 'p1', quantity: 50 }),
        makeProduct({ id: 'p2', quantity: 2 }),
      ];
      const result = bulkAdjustStock(products, new Set(['p1', 'p2']), -5);
      expect(result.preview.valid).toHaveLength(1);
      expect(result.preview.rejected).toHaveLength(1);
      expect(result.preview.rejected[0].id).toBe('p2');
      // p2 should remain unchanged
      const p2 = result.products.find((p) => p.id === 'p2');
      expect(p2?.quantity).toBe(2);
    });

    it('persists to localStorage', () => {
      const products = [makeProduct({ id: 'p1', quantity: 50 })];
      bulkAdjustStock(products, new Set(['p1']), 10);
      expect(loadProducts()[0].quantity).toBe(60);
    });
  });

  describe('previewBulkAdjustment', () => {
    it('returns preview without modifying data', () => {
      const products = [
        makeProduct({ id: 'p1', quantity: 50 }),
        makeProduct({ id: 'p2', quantity: 2 }),
      ];
      const preview = previewBulkAdjustment(products, new Set(['p1', 'p2']), -5);
      expect(preview.valid).toHaveLength(1);
      expect(preview.rejected).toHaveLength(1);
      expect(preview.totalAffected).toBe(1);
      // Original products should be unchanged
      expect(products[1].quantity).toBe(2);
    });
  });
});
