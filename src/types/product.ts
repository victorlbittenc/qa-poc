export const Category = {
  Electronics: 'Electronics',
  Clothing: 'Clothing',
  Food: 'Food',
  Tools: 'Tools',
  Other: 'Other',
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  price: number;
  quantity: number;
  reorderPoint: number;
  createdAt: string;
  updatedAt: string;
}
