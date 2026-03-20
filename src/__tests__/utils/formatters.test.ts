// Generated for commit 03f8c5c — targets formatters.ts
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatQuantity,
  formatDate,
  formatAlertMessage,
} from '../../utils/formatters';
import type { Product } from '../../types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Widget',
    sku: 'WDG-001',
    category: 'Electronics',
    price: 10,
    quantity: 50,
    reorderPoint: 10,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('formatCurrency', () => {
  it('formats a simple value with dollar sign and 2 decimals', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });

  it('formats with comma separator for thousands', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatQuantity', () => {
  it('formats quantity with units suffix', () => {
    expect(formatQuantity(42)).toBe('42 units');
  });

  it('formats large numbers with comma separators', () => {
    expect(formatQuantity(1500)).toBe('1,500 units');
  });

  it('formats zero', () => {
    expect(formatQuantity(0)).toBe('0 units');
  });
});

describe('formatDate', () => {
  it('formats ISO string to MMM DD, YYYY', () => {
    const result = formatDate('2025-06-15T12:00:00.000Z');
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });
});

describe('formatAlertMessage', () => {
  it('formats critical alert message', () => {
    const product = makeProduct({ name: 'Gadget', quantity: 0 });
    expect(formatAlertMessage(product, 'critical')).toBe('Gadget is out of stock');
  });

  it('formats warning alert message with quantity info', () => {
    const product = makeProduct({ name: 'Gadget', quantity: 3, reorderPoint: 10 });
    expect(formatAlertMessage(product, 'warning')).toBe(
      'Gadget is below reorder point (3/10)'
    );
  });

  it('formats info alert message', () => {
    const product = makeProduct({ name: 'Gadget' });
    expect(formatAlertMessage(product, 'info')).toBe('Gadget is approaching reorder point');
  });
});
