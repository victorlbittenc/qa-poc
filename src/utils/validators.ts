export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateProductName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Product name is required' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Product name must be at least 2 characters' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'Product name must be at most 100 characters' };
  }
  return { valid: true };
}

export function validateSKU(sku: string, existingSkus: string[]): ValidationResult {
  const trimmed = sku.trim();
  if (!trimmed) {
    return { valid: false, error: 'SKU is required' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'SKU must be at least 3 characters' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'SKU must be at most 20 characters' };
  }
  if (!/^[a-zA-Z0-9-]+$/.test(trimmed)) {
    return { valid: false, error: 'SKU must contain only letters, numbers, and dashes' };
  }
  const isDuplicate = existingSkus.some(
    (existing) => existing.toLowerCase() === trimmed.toLowerCase()
  );
  if (isDuplicate) {
    return { valid: false, error: 'SKU must be unique' };
  }
  return { valid: true };
}

export function validatePrice(price: number): ValidationResult {
  if (price === null || price === undefined || isNaN(price)) {
    return { valid: false, error: 'Price is required and must be a number' };
  }
  if (price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  const decimalPlaces = (price.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { valid: false, error: 'Price can have at most 2 decimal places' };
  }
  return { valid: true };
}

export function validateQuantity(quantity: number): ValidationResult {
  if (quantity === null || quantity === undefined || isNaN(quantity)) {
    return { valid: false, error: 'Quantity must be a number' };
  }
  if (!Number.isInteger(quantity)) {
    return { valid: false, error: 'Quantity must be an integer' };
  }
  if (quantity < 0) {
    return { valid: false, error: 'Quantity must be 0 or greater' };
  }
  return { valid: true };
}

export function validateStockAdjustment(
  currentQuantity: number,
  adjustment: number
): ValidationResult {
  if (adjustment === 0) {
    return { valid: false, error: 'Adjustment cannot be 0' };
  }
  if (currentQuantity + adjustment < 0) {
    return {
      valid: false,
      error: `Cannot reduce stock below 0. Current: ${currentQuantity}, adjustment: ${adjustment}`,
    };
  }
  return { valid: true };
}

export function validateReason(reason: string): ValidationResult {
  const trimmed = reason.trim();
  if (!trimmed) {
    return { valid: false, error: 'Reason is required' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'Reason must be at least 3 characters' };
  }
  return { valid: true };
}
