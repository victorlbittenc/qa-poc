// Generated for commit 03f8c5c — targets productService.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadProducts,
  saveProducts,
  validateProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  type CreateProductInput,
} from '../../services/productService';
import type { Product } from '../../types/product';

function makeInput(overrides: Partial<CreateProductInput> = {}): CreateProductInput {
  return {
    name: 'Test Product',
    sku: 'TST-001',
    category: 'Electronics',
    price: 29.99,
    quantity: 100,
    reorderPoint: 10,
    ...overrides,
  };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'test-id',
    name: 'Existing Product',
    sku: 'EXS-001',
    category: 'Tools',
    price: 15,
    quantity: 30,
    reorderPoint: 5,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('productService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadProducts / saveProducts', () => {
    it('returns empty array when no products stored', () => {
      expect(loadProducts()).toEqual([]);
    });

    it('persists and retrieves products', () => {
      const products = [makeProduct()];
      saveProducts(products);
      expect(loadProducts()).toEqual(products);
    });
  });

  describe('validateProduct', () => {
    it('returns empty errors for valid input', () => {
      const errors = validateProduct(makeInput(), []);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('returns name error for empty name', () => {
      const errors = validateProduct(makeInput({ name: '' }), []);
      expect(errors.name).toBeDefined();
    });

    it('returns sku error for duplicate SKU', () => {
      const errors = validateProduct(makeInput({ sku: 'DUP-001' }), ['DUP-001']);
      expect(errors.sku).toBeDefined();
    });

    it('returns price error for zero price', () => {
      const errors = validateProduct(makeInput({ price: 0 }), []);
      expect(errors.price).toBeDefined();
    });

    it('returns quantity error for negative quantity', () => {
      const errors = validateProduct(makeInput({ quantity: -1 }), []);
      expect(errors.quantity).toBeDefined();
    });

    it('returns reorderPoint error for non-integer', () => {
      const errors = validateProduct(makeInput({ reorderPoint: 1.5 }), []);
      expect(errors.reorderPoint).toBeDefined();
    });

    it('returns multiple errors at once', () => {
      const errors = validateProduct(makeInput({ name: '', price: -1 }), []);
      expect(errors.name).toBeDefined();
      expect(errors.price).toBeDefined();
    });
  });

  describe('createProduct', () => {
    it('adds a new product to the array', () => {
      const result = createProduct([], makeInput());
      expect(result.products).toHaveLength(1);
      expect(result.newProduct.name).toBe('Test Product');
    });

    it('assigns an id, createdAt, and updatedAt', () => {
      const result = createProduct([], makeInput());
      expect(result.newProduct.id).toBeDefined();
      expect(result.newProduct.createdAt).toBeDefined();
      expect(result.newProduct.updatedAt).toBeDefined();
    });

    it('trims name and sku', () => {
      const result = createProduct([], makeInput({ name: '  Trimmed  ', sku: '  TRM-001  ' }));
      expect(result.newProduct.name).toBe('Trimmed');
      expect(result.newProduct.sku).toBe('TRM-001');
    });

    it('persists to localStorage', () => {
      createProduct([], makeInput());
      expect(loadProducts()).toHaveLength(1);
    });
  });

  describe('updateProduct', () => {
    it('updates the specified product fields', () => {
      const products = [makeProduct({ id: 'p1' })];
      const updated = updateProduct(products, 'p1', { name: 'New Name', price: 99 });
      expect(updated[0].name).toBe('New Name');
      expect(updated[0].price).toBe(99);
    });

    it('does not modify other products', () => {
      const products = [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2', name: 'Other' })];
      const updated = updateProduct(products, 'p1', { name: 'Changed' });
      expect(updated[1].name).toBe('Other');
    });

    it('updates the updatedAt timestamp', () => {
      const products = [makeProduct({ id: 'p1', updatedAt: '2025-01-01T00:00:00.000Z' })];
      const updated = updateProduct(products, 'p1', { name: 'Changed' });
      expect(updated[0].updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('persists changes to localStorage', () => {
      const products = [makeProduct({ id: 'p1' })];
      updateProduct(products, 'p1', { name: 'Persisted' });
      expect(loadProducts()[0].name).toBe('Persisted');
    });
  });

  describe('deleteProduct', () => {
    it('removes the product by id', () => {
      const products = [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2' })];
      const updated = deleteProduct(products, 'p1');
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe('p2');
    });

    it('returns same array if id not found', () => {
      const products = [makeProduct({ id: 'p1' })];
      const updated = deleteProduct(products, 'nonexistent');
      expect(updated).toHaveLength(1);
    });

    it('persists deletion to localStorage', () => {
      const products = [makeProduct({ id: 'p1' })];
      deleteProduct(products, 'p1');
      expect(loadProducts()).toHaveLength(0);
    });
  });
});
