import { useState, useCallback } from 'react';
import type { Product } from '../types/product';
import {
  loadProducts,
  saveProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  validateProduct,
  type CreateProductInput,
  type ProductValidationErrors,
} from '../services/productService';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());

  const addProduct = useCallback(
    (input: CreateProductInput): ProductValidationErrors | null => {
      const existingSkus = products.map((p) => p.sku);
      const errors = validateProduct(input, existingSkus);
      if (Object.keys(errors).length > 0) return errors;

      const result = createProduct(products, input);
      setProducts(result.products);
      return null;
    },
    [products]
  );

  const editProduct = useCallback(
    (id: string, input: Partial<CreateProductInput>): ProductValidationErrors | null => {
      const product = products.find((p) => p.id === id);
      if (!product) return { name: 'Product not found' };

      const existingSkus = products.filter((p) => p.id !== id).map((p) => p.sku);
      const merged: CreateProductInput = {
        name: input.name ?? product.name,
        sku: input.sku ?? product.sku,
        category: input.category ?? product.category,
        price: input.price ?? product.price,
        quantity: input.quantity ?? product.quantity,
        reorderPoint: input.reorderPoint ?? product.reorderPoint,
      };

      const errors = validateProduct(merged, existingSkus);
      if (Object.keys(errors).length > 0) return errors;

      const updated = updateProduct(products, id, input);
      setProducts(updated);
      return null;
    },
    [products]
  );

  const removeProduct = useCallback(
    (id: string) => {
      const updated = deleteProduct(products, id);
      setProducts(updated);
    },
    [products]
  );

  const initProducts = useCallback((initial: Product[]) => {
    saveProducts(initial);
    setProducts(initial);
  }, []);

  return { products, setProducts, addProduct, editProduct, removeProduct, initProducts };
}
