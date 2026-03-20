import { useState, useEffect, useRef } from 'react';
import { Category, type StockStatus } from '../types/product';
import type { SortField, SortDirection } from '../types/filters';
import { useInventory } from '../context/InventoryContext';

const allCategories = Object.values(Category);
const stockStatusOptions: Array<{ label: string; value: StockStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
];
const sortFields: Array<{ label: string; value: SortField }> = [
  { label: 'Name', value: 'name' },
  { label: 'SKU', value: 'sku' },
  { label: 'Price', value: 'price' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Value', value: 'value' },
  { label: 'Last Updated', value: 'updatedAt' },
];

export function SearchBar() {
  const { filters, setSearchText, setCategories, setStockStatus, setSort } = useInventory();
  const [searchInput, setSearchInput] = useState(filters.searchText);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearchText(searchInput);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput, setSearchText]);

  const handleCategoryToggle = (cat: Category) => {
    if (filters.categories.includes(cat)) {
      setCategories(filters.categories.filter((c) => c !== cat));
    } else {
      setCategories([...filters.categories, cat]);
    }
  };

  const handleSortChange = (field: SortField) => {
    const direction: SortDirection =
      filters.sort.field === field && filters.sort.direction === 'asc' ? 'desc' : 'asc';
    setSort(field, direction);
  };

  return (
    <div className="mb-6 space-y-3" data-testid="search-bar">
      <div className="flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="search-input"
        />

        <div className="flex gap-2">
          {stockStatusOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="stockStatus"
                checked={filters.stockStatus === opt.value}
                onChange={() => setStockStatus(opt.value)}
                data-testid={`stock-filter-${opt.value}`}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-gray-500">Categories:</span>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryToggle(cat)}
            className={`px-3 py-1 text-sm rounded-full border ${
              filters.categories.includes(cat)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            data-testid={`category-filter-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-gray-500">Sort by:</span>
        {sortFields.map((sf) => (
          <button
            key={sf.value}
            onClick={() => handleSortChange(sf.value)}
            className={`px-3 py-1 text-sm rounded border ${
              filters.sort.field === sf.value
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            data-testid={`sort-${sf.value}`}
          >
            {sf.label}
            {filters.sort.field === sf.value && (
              <span className="ml-1">{filters.sort.direction === 'asc' ? '\u2191' : '\u2193'}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
