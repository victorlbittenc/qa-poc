import type { Product, Category } from '../types/product';
import { validateStockAdjustment } from '../utils/validators';
import { calculateBulkAdjustmentPreview, type BulkPreview } from '../utils/calculators';
import { saveProducts } from './productService';

export function bulkDelete(products: Product[], selectedIds: Set<string>): Product[] {
  const updated = products.filter((p) => !selectedIds.has(p.id));
  saveProducts(updated);
  return updated;
}

export function bulkChangeCategory(
  products: Product[],
  selectedIds: Set<string>,
  category: Category
): Product[] {
  const now = new Date().toISOString();
  const updated = products.map((p) => {
    if (!selectedIds.has(p.id)) return p;
    return { ...p, category, updatedAt: now };
  });
  saveProducts(updated);
  return updated;
}

export interface BulkAdjustResult {
  products: Product[];
  preview: BulkPreview;
}

export function bulkAdjustStock(
  products: Product[],
  selectedIds: Set<string>,
  adjustment: number
): BulkAdjustResult {
  const selectedProducts = products.filter((p) => selectedIds.has(p.id));
  const preview = calculateBulkAdjustmentPreview(selectedProducts, adjustment);

  const validIds = new Set(preview.valid.map((p) => p.id));
  const now = new Date().toISOString();

  const updated = products.map((p) => {
    if (!validIds.has(p.id)) return p;
    const adjResult = validateStockAdjustment(p.quantity, adjustment);
    if (!adjResult.valid) return p;
    return { ...p, quantity: p.quantity + adjustment, updatedAt: now };
  });

  saveProducts(updated);
  return { products: updated, preview };
}

export function previewBulkAdjustment(
  products: Product[],
  selectedIds: Set<string>,
  adjustment: number
): BulkPreview {
  const selectedProducts = products.filter((p) => selectedIds.has(p.id));
  return calculateBulkAdjustmentPreview(selectedProducts, adjustment);
}
