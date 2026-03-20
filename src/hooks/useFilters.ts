import { useState, useMemo, useCallback } from 'react';
import type { Product, Category, StockStatus } from '../types/product';
import type { FilterCriteria, SortField, SortDirection } from '../types/filters';
import { filterProducts } from '../services/filterService';

const defaultFilters: FilterCriteria = {
  searchText: '',
  categories: [],
  stockStatus: 'all',
  sort: { field: 'name', direction: 'asc' },
};

export function useFilters(products: Product[]) {
  const [filters, setFilters] = useState<FilterCriteria>(defaultFilters);

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters]
  );

  const setSearchText = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, searchText: text }));
  }, []);

  const setCategories = useCallback((categories: Category[]) => {
    setFilters((prev) => ({ ...prev, categories }));
  }, []);

  const setStockStatus = useCallback((stockStatus: StockStatus | 'all') => {
    setFilters((prev) => ({ ...prev, stockStatus }));
  }, []);

  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setFilters((prev) => ({ ...prev, sort: { field, direction } }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    filters,
    filteredProducts,
    setSearchText,
    setCategories,
    setStockStatus,
    setSort,
    resetFilters,
  };
}
