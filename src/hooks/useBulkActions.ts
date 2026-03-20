import { useState, useCallback } from 'react';
import type { Product, Category } from '../types/product';
import { bulkDelete, bulkChangeCategory, bulkAdjustStock } from '../services/bulkService';

export function useBulkActions(
  products: Product[],
  setProducts: (products: Product[]) => void
) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(
    (productIds: string[]) => {
      setSelectedIds(new Set(productIds));
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const deleteSelected = useCallback(() => {
    const updated = bulkDelete(products, selectedIds);
    setProducts(updated);
    setSelectedIds(new Set());
  }, [products, selectedIds, setProducts]);

  const changeCategorySelected = useCallback(
    (category: Category) => {
      const updated = bulkChangeCategory(products, selectedIds, category);
      setProducts(updated);
      setSelectedIds(new Set());
    },
    [products, selectedIds, setProducts]
  );

  const adjustStockSelected = useCallback(
    (adjustment: number) => {
      const result = bulkAdjustStock(products, selectedIds, adjustment);
      setProducts(result.products);
      setSelectedIds(new Set());
      return result.preview;
    },
    [products, selectedIds, setProducts]
  );

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    deleteSelected,
    changeCategorySelected,
    adjustStockSelected,
  };
}
