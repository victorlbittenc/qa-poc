import { useState } from 'react';
import type { Product } from '../types/product';
import { useInventory } from '../context/InventoryContext';
import { ProductRow } from './ProductRow';
import { ProductForm } from './ProductForm';
import { StockAdjuster } from './StockAdjuster';

export function ProductTable() {
  const { filteredProducts, selectedIds, toggleSelection, selectAll, clearSelection, removeProduct } =
    useInventory();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  const allSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(filteredProducts.map((p) => p.id));
    }
  };

  return (
    <>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full" data-testid="product-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  data-testid="select-all"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-sm">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.has(product.id)}
                  onToggleSelect={() => toggleSelection(product.id)}
                  onEdit={() => setEditingProduct(product)}
                  onDelete={() => removeProduct(product.id)}
                  onAdjustStock={() => setAdjustingProduct(product)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <ProductForm product={editingProduct} onClose={() => setEditingProduct(null)} />
      )}
      {adjustingProduct && (
        <StockAdjuster product={adjustingProduct} onClose={() => setAdjustingProduct(null)} />
      )}
    </>
  );
}
