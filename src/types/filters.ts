import type { Category, StockStatus } from './product';

export type SortField = 'name' | 'sku' | 'price' | 'quantity' | 'value' | 'updatedAt';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterCriteria {
  searchText: string;
  categories: Category[];
  stockStatus: StockStatus | 'all';
  sort: SortConfig;
}
