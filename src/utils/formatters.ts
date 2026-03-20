import type { AlertSeverity } from '../types/alerts';
import type { Product } from '../types/product';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatQuantity(quantity: number): string {
  const formatted = new Intl.NumberFormat('en-US').format(quantity);
  return `${formatted} units`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export function formatAlertMessage(product: Product, severity: AlertSeverity): string {
  switch (severity) {
    case 'critical':
      return `${product.name} is out of stock`;
    case 'warning':
      return `${product.name} is below reorder point (${product.quantity}/${product.reorderPoint})`;
    case 'info':
      return `${product.name} is approaching reorder point`;
  }
}
