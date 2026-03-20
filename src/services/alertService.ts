import type { Alert, AlertSeverity } from '../types/alerts';
import type { Product } from '../types/product';
import { calculateAlertSeverity } from '../utils/calculators';
import { formatAlertMessage } from '../utils/formatters';
import { storageRead, storageWrite } from '../utils/storage';

const DISMISSED_KEY = 'dismissed_alerts';

function loadDismissedIds(): Set<string> {
  const ids = storageRead<string[]>(DISMISSED_KEY) || [];
  return new Set(ids);
}

function saveDismissedIds(ids: Set<string>): void {
  storageWrite(DISMISSED_KEY, Array.from(ids));
}

function makeAlertId(productId: string, severity: AlertSeverity): string {
  return `${productId}_${severity}`;
}

export function generateAlerts(products: Product[]): Alert[] {
  const dismissedIds = loadDismissedIds();
  const alerts: Alert[] = [];

  for (const product of products) {
    const severity = calculateAlertSeverity(product);
    if (severity === null) continue;

    const alertId = makeAlertId(product.id, severity);
    const dismissed = dismissedIds.has(alertId);

    alerts.push({
      id: alertId,
      productId: product.id,
      productName: product.name,
      severity,
      message: formatAlertMessage(product, severity),
      dismissed,
    });
  }

  return alerts;
}

export function dismissAlert(alertId: string): void {
  const dismissedIds = loadDismissedIds();
  dismissedIds.add(alertId);
  saveDismissedIds(dismissedIds);
}

export function resetDismissals(): void {
  storageWrite(DISMISSED_KEY, []);
}

export function clearDismissalsForProduct(productId: string): void {
  const dismissedIds = loadDismissedIds();
  const toRemove = Array.from(dismissedIds).filter((id) => id.startsWith(productId + '_'));
  for (const id of toRemove) {
    dismissedIds.delete(id);
  }
  saveDismissedIds(dismissedIds);
}
