import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Product, Category, StockStatus } from '../types/product';
import type { Alert } from '../types/alerts';
import type { FilterCriteria, SortField, SortDirection } from '../types/filters';
import type { CreateProductInput, ProductValidationErrors } from '../services/productService';
import type { BulkPreview } from '../utils/calculators';
import { useProducts } from '../hooks/useProducts';
import { useStock } from '../hooks/useStock';
import { useAlerts } from '../hooks/useAlerts';
import { useFilters } from '../hooks/useFilters';
import { useBulkActions } from '../hooks/useBulkActions';
import { seedProducts } from '../data/seed';

interface InventoryContextValue {
  // Products
  products: Product[];
  filteredProducts: Product[];
  addProduct: (input: CreateProductInput) => ProductValidationErrors | null;
  editProduct: (id: string, input: Partial<CreateProductInput>) => ProductValidationErrors | null;
  removeProduct: (id: string) => void;

  // Stock
  adjustProductStock: (productId: string, adjustment: number, reason: string) => string | null;

  // Alerts
  alerts: Alert[];
  activeAlerts: Alert[];
  dismissAlert: (alertId: string) => void;

  // Filters
  filters: FilterCriteria;
  setSearchText: (text: string) => void;
  setCategories: (categories: Category[]) => void;
  setStockStatus: (status: StockStatus | 'all') => void;
  setSort: (field: SortField, direction: SortDirection) => void;
  resetFilters: () => void;

  // Bulk Actions
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  changeCategorySelected: (category: Category) => void;
  adjustStockSelected: (adjustment: number) => BulkPreview;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { products, setProducts, addProduct, editProduct, removeProduct, initProducts } =
    useProducts();
  const { adjustProductStock } = useStock(products, setProducts);
  const { alerts, activeAlerts, dismissAlert } = useAlerts(products);
  const { filters, filteredProducts, setSearchText, setCategories, setStockStatus, setSort, resetFilters } =
    useFilters(products);
  const {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    deleteSelected,
    changeCategorySelected,
    adjustStockSelected,
  } = useBulkActions(products, setProducts);

  // Seed data on first load
  useEffect(() => {
    if (products.length === 0) {
      initProducts(seedProducts());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <InventoryContext.Provider
      value={{
        products,
        filteredProducts,
        addProduct,
        editProduct,
        removeProduct,
        adjustProductStock,
        alerts,
        activeAlerts,
        dismissAlert,
        filters,
        setSearchText,
        setCategories,
        setStockStatus,
        setSort,
        resetFilters,
        selectedIds,
        toggleSelection,
        selectAll,
        clearSelection,
        deleteSelected,
        changeCategorySelected,
        adjustStockSelected,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return ctx;
}
