import type { Product } from '../types/product';
import { calculateStockStatus } from '../utils/calculators';
import { formatCurrency } from '../utils/formatters';

interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAdjustStock: () => void;
}

const statusBadge = {
  'in-stock': 'bg-green-100 text-green-800',
  'low-stock': 'bg-yellow-100 text-yellow-800',
  'out-of-stock': 'bg-red-100 text-red-800',
};

const statusLabel = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
};

export function ProductRow({
  product,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onAdjustStock,
}: ProductRowProps) {
  const status = calculateStockStatus(product);
  const value = product.price * product.quantity;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50" data-testid={`product-row-${product.sku}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          data-testid={`select-${product.sku}`}
        />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{product.sku}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{product.category}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(product.price)}</td>
      <td className="px-4 py-3 text-sm text-gray-900">
        <button
          onClick={onAdjustStock}
          className="hover:underline"
          data-testid={`quantity-${product.sku}`}
        >
          {product.quantity}
        </button>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusBadge[status]}`} data-testid={`status-${product.sku}`}>
          {statusLabel[status]}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(value)}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-800"
            data-testid={`edit-${product.sku}`}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-red-600 hover:text-red-800"
            data-testid={`delete-${product.sku}`}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
