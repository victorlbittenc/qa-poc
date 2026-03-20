import { useState } from 'react';
import type { Product } from '../types/product';
import { useInventory } from '../context/InventoryContext';

interface StockAdjusterProps {
  product: Product;
  onClose: () => void;
}

export function StockAdjuster({ product, onClose }: StockAdjusterProps) {
  const { adjustProductStock } = useInventory();
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const err = adjustProductStock(product.id, adjustment, reason);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="stock-adjuster-modal">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Adjust Stock: {product.name}</h3>
        <p className="text-sm text-gray-600 mb-4">Current quantity: {product.quantity}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm" data-testid="stock-adjuster-error">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Adjustment</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdjustment((a) => a - 1)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              data-testid="stock-decrease"
            >
              -
            </button>
            <input
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
              className="w-20 text-center px-2 py-1 border border-gray-300 rounded"
              data-testid="stock-adjustment-input"
            />
            <button
              onClick={() => setAdjustment((a) => a + 1)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              data-testid="stock-increase"
            >
              +
            </button>
          </div>
          {adjustment !== 0 && (
            <p className="text-sm text-gray-500 mt-1">
              New quantity: {product.quantity + adjustment}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Received shipment"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            data-testid="stock-reason-input"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            data-testid="stock-adjuster-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            data-testid="stock-adjuster-submit"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
