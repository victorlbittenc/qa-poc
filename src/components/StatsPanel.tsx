import { useInventory } from '../context/InventoryContext';
import { calculateInventoryValue, calculateStockStatus } from '../utils/calculators';
import { formatCurrency } from '../utils/formatters';

export function StatsPanel() {
  const { products } = useInventory();

  const totalProducts = products.length;
  const totalValue = calculateInventoryValue(products);
  const lowStockCount = products.filter(
    (p) => calculateStockStatus(p) === 'low-stock'
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  const stats = [
    { label: 'Total Products', value: totalProducts.toString(), color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Value', value: formatCurrency(totalValue), color: 'bg-green-50 text-green-700' },
    { label: 'Low Stock', value: lowStockCount.toString(), color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Out of Stock', value: outOfStockCount.toString(), color: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg p-4 ${stat.color}`}
          data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="text-sm font-medium">{stat.label}</div>
          <div className="text-2xl font-bold mt-1">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
