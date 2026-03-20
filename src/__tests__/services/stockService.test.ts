// Generated for commit 03f8c5c — targets stockService.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { adjustStock, loadStockHistory } from '../../services/stockService';
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

describe('stockService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('adjustStock', () => {
    it('increases stock successfully', () => {
      const result = adjustStock(makeProduct({ quantity: 10 }), 5, 'Received shipment');
      expect(result.success).toBe(true);
      expect(result.updatedProduct?.quantity).toBe(15);
    });

    it('decreases stock successfully', () => {
      const result = adjustStock(makeProduct({ quantity: 10 }), -3, 'Sold to customer');
      expect(result.success).toBe(true);
      expect(result.updatedProduct?.quantity).toBe(7);
    });

    it('rejects adjustment that would go negative', () => {
      const result = adjustStock(makeProduct({ quantity: 5 }), -10, 'Bad adjustment');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects zero adjustment', () => {
      const result = adjustStock(makeProduct({ quantity: 10 }), 0, 'No change');
      expect(result.success).toBe(false);
    });

    it('rejects empty reason', () => {
      const result = adjustStock(makeProduct({ quantity: 10 }), 5, '');
      expect(result.success).toBe(false);
    });

    it('rejects reason shorter than 3 chars', () => {
      const result = adjustStock(makeProduct({ quantity: 10 }), 5, 'ab');
      expect(result.success).toBe(false);
    });

    it('updates the updatedAt timestamp', () => {
      const result = adjustStock(makeProduct(), 5, 'Received shipment');
      expect(result.updatedProduct?.updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('records the adjustment in stock history', () => {
      adjustStock(makeProduct({ id: 'prod-1', quantity: 10 }), 5, 'Restock');
      const history = loadStockHistory();
      expect(history).toHaveLength(1);
      expect(history[0].productId).toBe('prod-1');
      expect(history[0].adjustment).toBe(5);
      expect(history[0].previousQuantity).toBe(10);
      expect(history[0].newQuantity).toBe(15);
    });

    it('appends to existing history', () => {
      const product = makeProduct({ quantity: 10 });
      adjustStock(product, 5, 'First restock');
      adjustStock(product, 3, 'Second restock');
      expect(loadStockHistory()).toHaveLength(2);
    });
  });
});
