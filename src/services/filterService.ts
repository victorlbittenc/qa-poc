import type { Product } from '../types/product';
import type { FilterCriteria } from '../types/filters';
import { calculateStockStatus } from '../utils/calculators';

export function filterProducts(products: Product[], criteria: FilterCriteria): Product[] {
  let result = [...products];

  // Text search
  if (criteria.searchText.trim()) {
    const search = criteria.searchText.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search)
    );
  }

  // Category filter
  if (criteria.categories.length > 0) {
    result = result.filter((p) => criteria.categories.includes(p.category));
  }

  // Stock status filter
  if (criteria.stockStatus !== 'all') {
    result = result.filter((p) => calculateStockStatus(p) === criteria.stockStatus);
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0;
    switch (criteria.sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'sku':
        comparison = a.sku.localeCompare(b.sku);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'value':
        comparison = a.price * a.quantity - b.price * b.quantity;
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return criteria.sort.direction === 'asc' ? comparison : -comparison;
  });

  return result;
}
