import type { AlertSeverity } from '../types/alerts';
import type { Product, StockStatus } from '../types/product';

export function calculateInventoryValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
}

export function calculateStockStatus(product: Product): StockStatus {
  if (product.quantity === 0) return 'out-of-stock';
  if (product.quantity <= product.reorderPoint) return 'low-stock';
  return 'in-stock';
}

export function calculateReorderSuggestion(product: Product): number {
  const status = calculateStockStatus(product);
  if (status === 'low-stock' || status === 'out-of-stock') {
    return product.reorderPoint * 2 - product.quantity;
  }
  return 0;
}

export function calculateAlertSeverity(product: Product): AlertSeverity | null {
  if (product.quantity === 0) return 'critical';
  if (product.quantity <= product.reorderPoint) return 'warning';
  if (product.quantity <= product.reorderPoint * 1.5) return 'info';
  return null;
}

export interface BulkPreview {
  valid: Product[];
  rejected: Product[];
  totalAffected: number;
}

export function calculateBulkAdjustmentPreview(
  products: Product[],
  adjustment: number
): BulkPreview {
  const valid: Product[] = [];
  const rejected: Product[] = [];

  for (const product of products) {
    if (product.quantity + adjustment < 0) {
      rejected.push(product);
    } else {
      valid.push(product);
    }
  }

  return { valid, rejected, totalAffected: valid.length };
}
