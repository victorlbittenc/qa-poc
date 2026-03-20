// Generated for commit 03f8c5c — targets calculators.ts
import { describe, it, expect } from 'vitest';
import {
  calculateInventoryValue,
  calculateStockStatus,
  calculateReorderSuggestion,
  calculateAlertSeverity,
  calculateBulkAdjustmentPreview,
} from '../../utils/calculators';
import type { Product } from '../../types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
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

describe('calculateInventoryValue', () => {
  it('returns 0 for empty array', () => {
    expect(calculateInventoryValue([])).toBe(0);
  });

  it('sums price * quantity for all products', () => {
    const products = [
      makeProduct({ price: 10, quantity: 5 }),
      makeProduct({ price: 20, quantity: 3 }),
    ];
    expect(calculateInventoryValue(products)).toBe(110);
  });

  it('handles products with zero quantity', () => {
    const products = [makeProduct({ price: 100, quantity: 0 })];
    expect(calculateInventoryValue(products)).toBe(0);
  });
});

describe('calculateStockStatus', () => {
  it('returns out-of-stock when quantity is 0', () => {
    expect(calculateStockStatus(makeProduct({ quantity: 0 }))).toBe('out-of-stock');
  });

  it('returns low-stock when quantity equals reorderPoint', () => {
    expect(calculateStockStatus(makeProduct({ quantity: 10, reorderPoint: 10 }))).toBe('low-stock');
  });

  it('returns low-stock when quantity is below reorderPoint', () => {
    expect(calculateStockStatus(makeProduct({ quantity: 5, reorderPoint: 10 }))).toBe('low-stock');
  });

  it('returns in-stock when quantity is above reorderPoint', () => {
    expect(calculateStockStatus(makeProduct({ quantity: 50, reorderPoint: 10 }))).toBe('in-stock');
  });
});

describe('calculateReorderSuggestion', () => {
  it('returns 0 for in-stock product', () => {
    expect(calculateReorderSuggestion(makeProduct({ quantity: 50, reorderPoint: 10 }))).toBe(0);
  });

  it('returns reorderPoint * 2 - quantity for low-stock product', () => {
    expect(calculateReorderSuggestion(makeProduct({ quantity: 5, reorderPoint: 10 }))).toBe(15);
  });

  it('returns reorderPoint * 2 for out-of-stock product', () => {
    expect(calculateReorderSuggestion(makeProduct({ quantity: 0, reorderPoint: 10 }))).toBe(20);
  });
});

describe('calculateAlertSeverity', () => {
  it('returns critical when quantity is 0', () => {
    expect(calculateAlertSeverity(makeProduct({ quantity: 0 }))).toBe('critical');
  });

  it('returns warning when quantity <= reorderPoint', () => {
    expect(calculateAlertSeverity(makeProduct({ quantity: 10, reorderPoint: 10 }))).toBe('warning');
  });

  it('returns info when quantity <= reorderPoint * 1.5', () => {
    expect(calculateAlertSeverity(makeProduct({ quantity: 15, reorderPoint: 10 }))).toBe('info');
  });

  it('returns null when quantity > reorderPoint * 1.5', () => {
    expect(calculateAlertSeverity(makeProduct({ quantity: 50, reorderPoint: 10 }))).toBeNull();
  });

  it('returns warning (not info) at reorderPoint boundary', () => {
    expect(calculateAlertSeverity(makeProduct({ quantity: 10, reorderPoint: 10 }))).toBe('warning');
  });
});

describe('calculateBulkAdjustmentPreview', () => {
  it('puts all products in valid when adjustment is positive', () => {
    const products = [makeProduct({ quantity: 5 }), makeProduct({ quantity: 0, id: '2' })];
    const result = calculateBulkAdjustmentPreview(products, 10);
    expect(result.valid).toHaveLength(2);
    expect(result.rejected).toHaveLength(0);
    expect(result.totalAffected).toBe(2);
  });

  it('rejects products that would go negative', () => {
    const products = [
      makeProduct({ quantity: 5, id: '1' }),
      makeProduct({ quantity: 2, id: '2' }),
    ];
    const result = calculateBulkAdjustmentPreview(products, -3);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0].id).toBe('1');
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].id).toBe('2');
  });

  it('returns empty arrays for empty input', () => {
    const result = calculateBulkAdjustmentPreview([], -5);
    expect(result.valid).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
    expect(result.totalAffected).toBe(0);
  });
});
