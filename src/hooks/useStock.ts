import { useCallback } from 'react';
import type { Product } from '../types/product';
import { adjustStock } from '../services/stockService';
import { saveProducts } from '../services/productService';

export function useStock(
  products: Product[],
  setProducts: (products: Product[]) => void
) {
  const adjustProductStock = useCallback(
    (productId: string, adjustment: number, reason: string): string | null => {
      const product = products.find((p) => p.id === productId);
      if (!product) return 'Product not found';

      const result = adjustStock(product, adjustment, reason);
      if (!result.success) return result.error || 'Unknown error';

      const updated = products.map((p) =>
        p.id === productId ? result.updatedProduct! : p
      );
      saveProducts(updated);
      setProducts(updated);
      return null;
    },
    [products, setProducts]
  );

  return { adjustProductStock };
}
