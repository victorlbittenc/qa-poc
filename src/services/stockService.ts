import type { Product } from '../types/product';
import { validateStockAdjustment, validateReason } from '../utils/validators';
import { storageRead, storageWrite } from '../utils/storage';

const HISTORY_KEY = 'stock_history';

export interface StockAdjustment {
  productId: string;
  adjustment: number;
  reason: string;
  timestamp: string;
  previousQuantity: number;
  newQuantity: number;
}

export function loadStockHistory(): StockAdjustment[] {
  return storageRead<StockAdjustment[]>(HISTORY_KEY) || [];
}

function saveStockHistory(history: StockAdjustment[]): void {
  storageWrite(HISTORY_KEY, history);
}

export interface AdjustStockResult {
  success: boolean;
  error?: string;
  updatedProduct?: Product;
}

export function adjustStock(
  product: Product,
  adjustment: number,
  reason: string
): AdjustStockResult {
  const adjResult = validateStockAdjustment(product.quantity, adjustment);
  if (!adjResult.valid) {
    return { success: false, error: adjResult.error };
  }

  const reasonResult = validateReason(reason);
  if (!reasonResult.valid) {
    return { success: false, error: reasonResult.error };
  }

  const newQuantity = product.quantity + adjustment;
  const updatedProduct: Product = {
    ...product,
    quantity: newQuantity,
    updatedAt: new Date().toISOString(),
  };

  const historyEntry: StockAdjustment = {
    productId: product.id,
    adjustment,
    reason: reason.trim(),
    timestamp: new Date().toISOString(),
    previousQuantity: product.quantity,
    newQuantity,
  };

  const history = loadStockHistory();
  history.push(historyEntry);
  saveStockHistory(history);

  return { success: true, updatedProduct };
}
