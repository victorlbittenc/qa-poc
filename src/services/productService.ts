import type { Product, Category } from '../types/product';
import { validateProductName, validateSKU, validatePrice, validateQuantity } from '../utils/validators';
import { storageRead, storageWrite } from '../utils/storage';

const PRODUCTS_KEY = 'products';

export function loadProducts(): Product[] {
  return storageRead<Product[]>(PRODUCTS_KEY) || [];
}

export function saveProducts(products: Product[]): void {
  storageWrite(PRODUCTS_KEY, products);
}

export interface CreateProductInput {
  name: string;
  sku: string;
  category: Category;
  price: number;
  quantity: number;
  reorderPoint: number;
}

export interface ProductValidationErrors {
  name?: string;
  sku?: string;
  price?: string;
  quantity?: string;
  reorderPoint?: string;
}

export function validateProduct(
  input: CreateProductInput,
  existingSkus: string[]
): ProductValidationErrors {
  const errors: ProductValidationErrors = {};

  const nameResult = validateProductName(input.name);
  if (!nameResult.valid) errors.name = nameResult.error;

  const skuResult = validateSKU(input.sku, existingSkus);
  if (!skuResult.valid) errors.sku = skuResult.error;

  const priceResult = validatePrice(input.price);
  if (!priceResult.valid) errors.price = priceResult.error;

  const qtyResult = validateQuantity(input.quantity);
  if (!qtyResult.valid) errors.quantity = qtyResult.error;

  const reorderResult = validateQuantity(input.reorderPoint);
  if (!reorderResult.valid) errors.reorderPoint = reorderResult.error;

  return errors;
}

export function createProduct(
  products: Product[],
  input: CreateProductInput
): { products: Product[]; newProduct: Product } {
  const now = new Date().toISOString();
  const newProduct: Product = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    sku: input.sku.trim(),
    category: input.category,
    price: input.price,
    quantity: input.quantity,
    reorderPoint: input.reorderPoint,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [...products, newProduct];
  saveProducts(updated);
  return { products: updated, newProduct };
}

export function updateProduct(
  products: Product[],
  id: string,
  input: Partial<CreateProductInput>
): Product[] {
  const updated = products.map((p) => {
    if (p.id !== id) return p;
    return {
      ...p,
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.sku !== undefined && { sku: input.sku.trim() }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.reorderPoint !== undefined && { reorderPoint: input.reorderPoint }),
      updatedAt: new Date().toISOString(),
    };
  });
  saveProducts(updated);
  return updated;
}

export function deleteProduct(products: Product[], id: string): Product[] {
  const updated = products.filter((p) => p.id !== id);
  saveProducts(updated);
  return updated;
}
