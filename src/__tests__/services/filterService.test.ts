// Generated for commit 03f8c5c — targets filterService.ts
import { describe, it, expect } from 'vitest';
import { filterProducts } from '../../services/filterService';
import type { Product } from '../../types/product';
import type { FilterCriteria } from '../../types/filters';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Alpha Widget',
    sku: 'AW-001',
    category: 'Electronics',
    price: 10,
    quantity: 50,
    reorderPoint: 10,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function defaultCriteria(overrides: Partial<FilterCriteria> = {}): FilterCriteria {
  return {
    searchText: '',
    categories: [],
    stockStatus: 'all',
    sort: { field: 'name', direction: 'asc' },
    ...overrides,
  };
}

const sampleProducts: Product[] = [
  makeProduct({ id: '1', name: 'Alpha', sku: 'ALP-001', category: 'Electronics', quantity: 50, price: 10 }),
  makeProduct({ id: '2', name: 'Beta', sku: 'BET-002', category: 'Clothing', quantity: 0, price: 25 }),
  makeProduct({ id: '3', name: 'Gamma', sku: 'GAM-003', category: 'Food', quantity: 5, reorderPoint: 10, price: 5 }),
];

describe('filterService', () => {
  describe('text search', () => {
    it('returns all products when search is empty', () => {
      const result = filterProducts(sampleProducts, defaultCriteria());
      expect(result).toHaveLength(3);
    });

    it('filters by name (case-insensitive)', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ searchText: 'alpha' }));
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alpha');
    });

    it('filters by SKU', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ searchText: 'BET' }));
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('BET-002');
    });
  });

  describe('category filter', () => {
    it('returns all when no categories specified', () => {
      const result = filterProducts(sampleProducts, defaultCriteria());
      expect(result).toHaveLength(3);
    });

    it('filters by single category', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ categories: ['Electronics'] }));
      expect(result).toHaveLength(1);
    });

    it('filters by multiple categories', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ categories: ['Electronics', 'Food'] }));
      expect(result).toHaveLength(2);
    });
  });

  describe('stock status filter', () => {
    it('returns all when status is "all"', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ stockStatus: 'all' }));
      expect(result).toHaveLength(3);
    });

    it('filters out-of-stock', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ stockStatus: 'out-of-stock' }));
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Beta');
    });

    it('filters low-stock', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ stockStatus: 'low-stock' }));
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Gamma');
    });
  });

  describe('sorting', () => {
    it('sorts by name ascending', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ sort: { field: 'name', direction: 'asc' } }));
      expect(result.map((p) => p.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('sorts by name descending', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ sort: { field: 'name', direction: 'desc' } }));
      expect(result.map((p) => p.name)).toEqual(['Gamma', 'Beta', 'Alpha']);
    });

    it('sorts by price ascending', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ sort: { field: 'price', direction: 'asc' } }));
      expect(result.map((p) => p.price)).toEqual([5, 10, 25]);
    });

    it('sorts by quantity descending', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ sort: { field: 'quantity', direction: 'desc' } }));
      expect(result[0].quantity).toBe(50);
      expect(result[2].quantity).toBe(0);
    });

    it('sorts by value (price * quantity)', () => {
      const result = filterProducts(sampleProducts, defaultCriteria({ sort: { field: 'value', direction: 'desc' } }));
      // Alpha: 10*50=500, Gamma: 5*5=25, Beta: 25*0=0
      expect(result.map((p) => p.name)).toEqual(['Alpha', 'Gamma', 'Beta']);
    });
  });

  describe('combined filters', () => {
    it('applies search + category + stock status simultaneously (AND logic)', () => {
      const products = [
        makeProduct({ id: '1', name: 'Alpha Widget', category: 'Electronics', quantity: 50 }),
        makeProduct({ id: '2', name: 'Alpha Jacket', category: 'Clothing', quantity: 0 }),
        makeProduct({ id: '3', name: 'Beta Widget', category: 'Electronics', quantity: 0 }),
      ];
      const result = filterProducts(products, defaultCriteria({
        searchText: 'alpha',
        categories: ['Electronics'],
        stockStatus: 'in-stock',
      }));
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alpha Widget');
    });
  });
});
