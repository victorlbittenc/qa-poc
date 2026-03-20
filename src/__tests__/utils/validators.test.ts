// Generated for commit 03f8c5c — targets validators.ts
import { describe, it, expect } from 'vitest';
import {
  validateProductName,
  validateSKU,
  validatePrice,
  validateQuantity,
  validateStockAdjustment,
  validateReason,
} from '../../utils/validators';

describe('validateProductName', () => {
  it('returns valid for a normal name', () => {
    expect(validateProductName('Widget')).toEqual({ valid: true });
  });

  it('rejects empty string', () => {
    const result = validateProductName('');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  it('rejects whitespace-only string', () => {
    expect(validateProductName('   ').valid).toBe(false);
  });

  it('rejects name shorter than 2 chars after trim', () => {
    expect(validateProductName('A').valid).toBe(false);
  });

  it('accepts name of exactly 2 chars', () => {
    expect(validateProductName('AB').valid).toBe(true);
  });

  it('accepts name of exactly 100 chars', () => {
    expect(validateProductName('A'.repeat(100)).valid).toBe(true);
  });

  it('rejects name longer than 100 chars', () => {
    expect(validateProductName('A'.repeat(101)).valid).toBe(false);
  });

  it('trims leading/trailing whitespace before validation', () => {
    expect(validateProductName('  AB  ').valid).toBe(true);
  });
});

describe('validateSKU', () => {
  it('returns valid for a correct SKU', () => {
    expect(validateSKU('ABC-123', [])).toEqual({ valid: true });
  });

  it('rejects empty SKU', () => {
    expect(validateSKU('', []).valid).toBe(false);
  });

  it('rejects SKU shorter than 3 chars', () => {
    expect(validateSKU('AB', []).valid).toBe(false);
  });

  it('accepts SKU of exactly 3 chars', () => {
    expect(validateSKU('ABC', []).valid).toBe(true);
  });

  it('rejects SKU longer than 20 chars', () => {
    expect(validateSKU('A'.repeat(21), []).valid).toBe(false);
  });

  it('rejects SKU with special characters', () => {
    expect(validateSKU('ABC@123', []).valid).toBe(false);
  });

  it('rejects SKU with spaces', () => {
    expect(validateSKU('ABC 123', []).valid).toBe(false);
  });

  it('allows alphanumeric and dashes only', () => {
    expect(validateSKU('A-B-C-1-2', []).valid).toBe(true);
  });

  it('rejects duplicate SKU (case-insensitive)', () => {
    expect(validateSKU('abc-123', ['ABC-123']).valid).toBe(false);
  });

  it('accepts SKU not in existing list', () => {
    expect(validateSKU('NEW-SKU', ['OLD-SKU']).valid).toBe(true);
  });
});

describe('validatePrice', () => {
  it('returns valid for a normal price', () => {
    expect(validatePrice(9.99)).toEqual({ valid: true });
  });

  it('rejects zero', () => {
    expect(validatePrice(0).valid).toBe(false);
  });

  it('rejects negative price', () => {
    expect(validatePrice(-5).valid).toBe(false);
  });

  it('rejects NaN', () => {
    expect(validatePrice(NaN).valid).toBe(false);
  });

  it('accepts integer price', () => {
    expect(validatePrice(10).valid).toBe(true);
  });

  it('accepts price with 2 decimal places', () => {
    expect(validatePrice(10.99).valid).toBe(true);
  });

  it('rejects price with more than 2 decimal places', () => {
    expect(validatePrice(10.999).valid).toBe(false);
  });
});

describe('validateQuantity', () => {
  it('returns valid for zero', () => {
    expect(validateQuantity(0)).toEqual({ valid: true });
  });

  it('returns valid for positive integer', () => {
    expect(validateQuantity(42)).toEqual({ valid: true });
  });

  it('rejects negative number', () => {
    expect(validateQuantity(-1).valid).toBe(false);
  });

  it('rejects non-integer', () => {
    expect(validateQuantity(1.5).valid).toBe(false);
  });

  it('rejects NaN', () => {
    expect(validateQuantity(NaN).valid).toBe(false);
  });
});

describe('validateStockAdjustment', () => {
  it('accepts positive adjustment', () => {
    expect(validateStockAdjustment(10, 5)).toEqual({ valid: true });
  });

  it('accepts negative adjustment that does not go below zero', () => {
    expect(validateStockAdjustment(10, -10)).toEqual({ valid: true });
  });

  it('rejects zero adjustment', () => {
    expect(validateStockAdjustment(10, 0).valid).toBe(false);
  });

  it('rejects adjustment that would make quantity negative', () => {
    const result = validateStockAdjustment(5, -10);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/below 0/i);
  });

  it('accepts adjustment bringing quantity to exactly 0', () => {
    expect(validateStockAdjustment(5, -5).valid).toBe(true);
  });
});

describe('validateReason', () => {
  it('returns valid for a normal reason', () => {
    expect(validateReason('Received shipment')).toEqual({ valid: true });
  });

  it('rejects empty reason', () => {
    expect(validateReason('').valid).toBe(false);
  });

  it('rejects reason shorter than 3 chars', () => {
    expect(validateReason('ab').valid).toBe(false);
  });

  it('accepts reason of exactly 3 chars', () => {
    expect(validateReason('abc').valid).toBe(true);
  });

  it('trims whitespace before checking length', () => {
    expect(validateReason('   ab   ').valid).toBe(false);
  });
});
