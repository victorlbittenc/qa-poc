import { useState } from 'react';
import { StatsPanel } from './StatsPanel';
import { AlertBanner } from './AlertBanner';
import { SearchBar } from './SearchBar';
import { ProductTable } from './ProductTable';
import { BulkActionBar } from './BulkActionBar';
import { ProductForm } from './ProductForm';

export function Dashboard() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Inventory Dashboard</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            data-testid="add-product-btn"
          >
            Add Product
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <AlertBanner />
        <StatsPanel />
        <SearchBar />
        <ProductTable />
      </main>

      <BulkActionBar />

      {showAddForm && <ProductForm onClose={() => setShowAddForm(false)} />}
    </div>
  );
}
