import { useState } from 'react';
import { Category } from '../types/product';
import { useInventory } from '../context/InventoryContext';

const allCategories = Object.values(Category);

export function BulkActionBar() {
  const { selectedIds, clearSelection, deleteSelected, changeCategorySelected, adjustStockSelected } =
    useInventory();
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [adjustment, setAdjustment] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (selectedIds.size === 0) return null;

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteSelected();
    setConfirmDelete(false);
  };

  const handleCategoryChange = (cat: Category) => {
    changeCategorySelected(cat);
    setShowCategoryPicker(false);
  };

  const handleAdjustStock = () => {
    if (adjustment === 0) return;
    adjustStockSelected(adjustment);
    setShowAdjustStock(false);
    setAdjustment(0);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-6 py-4 z-40"
      data-testid="bulk-action-bar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700" data-testid="selection-count">
            {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={clearSelection}
            className="text-sm text-gray-500 hover:text-gray-700"
            data-testid="clear-selection"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Delete */}
          <button
            onClick={handleDelete}
            className={`px-4 py-2 text-sm rounded ${
              confirmDelete
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
            data-testid="bulk-delete"
          >
            {confirmDelete ? `Confirm Delete (${selectedIds.size})` : 'Delete Selected'}
          </button>

          {/* Category change */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryPicker(!showCategoryPicker);
                setShowAdjustStock(false);
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              data-testid="bulk-change-category"
            >
              Change Category
            </button>
            {showCategoryPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px]">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    data-testid={`bulk-category-${cat.toLowerCase()}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stock adjust */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAdjustStock(!showAdjustStock);
                setShowCategoryPicker(false);
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              data-testid="bulk-adjust-stock"
            >
              Adjust Stock
            </button>
            {showAdjustStock && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setAdjustment((a) => a - 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={adjustment}
                    onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                    className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                    data-testid="bulk-adjustment-input"
                  />
                  <button
                    onClick={() => setAdjustment((a) => a + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAdjustStock}
                  className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  data-testid="bulk-apply-adjustment"
                >
                  Apply to {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
