import { useState, useCallback, useEffect } from 'react';
import type { Alert } from '../types/alerts';
import type { Product } from '../types/product';
import { generateAlerts, dismissAlert as dismissAlertService, clearDismissalsForProduct } from '../services/alertService';

export function useAlerts(products: Product[]) {
  const [alerts, setAlerts] = useState<Alert[]>(() => generateAlerts(products));

  const regenerateAlerts = useCallback(() => {
    setAlerts(generateAlerts(products));
  }, [products]);

  useEffect(() => {
    regenerateAlerts();
  }, [regenerateAlerts]);

  const dismissAlert = useCallback(
    (alertId: string) => {
      dismissAlertService(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a))
      );
    },
    []
  );

  const clearProductDismissals = useCallback(
    (productId: string) => {
      clearDismissalsForProduct(productId);
    },
    []
  );

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return { alerts, activeAlerts, dismissAlert, regenerateAlerts, clearProductDismissals };
}
