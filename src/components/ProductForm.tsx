import { useState, useEffect } from 'react';
import { Category, type Product } from '../types/product';
import type { CreateProductInput, ProductValidationErrors } from '../services/productService';
import { useInventory } from '../context/InventoryContext';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

const allCategories = Object.values(Category);

export function ProductForm({ product, onClose }: ProductFormProps) {
  const { addProduct, editProduct } = useInventory();
  const isEditing = !!product;

  const [form, setForm] = useState<CreateProductInput>({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    category: product?.category ?? Category.Other,
    price: product?.price ?? 0,
    quantity: product?.quantity ?? 0,
    reorderPoint: product?.reorderPoint ?? 0,
  });
  const [errors, setErrors] = useState<ProductValidationErrors>({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        reorderPoint: product.reorderPoint,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let result: ProductValidationErrors | null;

    if (isEditing) {
      result = editProduct(product.id, form);
    } else {
      result = addProduct(form);
    }

    if (result && Object.keys(result).length > 0) {
      setErrors(result);
      return;
    }

    onClose();
  };

  const updateField = <K extends keyof CreateProductInput>(
    key: K,
    value: CreateProductInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="product-form-modal">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              data-testid="product-name-input"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1" data-testid="error-name">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => updateField('sku', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              data-testid="product-sku-input"
            />
            {errors.sku && <p className="text-red-600 text-xs mt-1" data-testid="error-sku">{errors.sku}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value as Category)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              data-testid="product-category-select"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                data-testid="product-price-input"
              />
              {errors.price && <p className="text-red-600 text-xs mt-1" data-testid="error-price">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                data-testid="product-quantity-input"
              />
              {errors.quantity && <p className="text-red-600 text-xs mt-1" data-testid="error-quantity">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reorder Point</label>
              <input
                type="number"
                value={form.reorderPoint}
                onChange={(e) => updateField('reorderPoint', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                data-testid="product-reorder-input"
              />
              {errors.reorderPoint && <p className="text-red-600 text-xs mt-1" data-testid="error-reorder">{errors.reorderPoint}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              data-testid="product-form-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              data-testid="product-form-submit"
            >
              {isEditing ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
