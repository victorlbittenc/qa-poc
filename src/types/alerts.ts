export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  severity: AlertSeverity;
  message: string;
  dismissed: boolean;
}
