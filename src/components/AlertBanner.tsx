import { useInventory } from '../context/InventoryContext';

const severityStyles = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
};

export function AlertBanner() {
  const { activeAlerts, dismissAlert } = useInventory();

  if (activeAlerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-2" data-testid="alert-banner">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between px-4 py-3 rounded-lg border ${severityStyles[alert.severity]}`}
          data-testid={`alert-${alert.severity}`}
          role="alert"
        >
          <span className="text-sm font-medium">{alert.message}</span>
          {alert.severity !== 'critical' && (
            <button
              onClick={() => dismissAlert(alert.id)}
              className="ml-4 text-sm underline hover:no-underline"
              data-testid="dismiss-alert"
            >
              Dismiss
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
