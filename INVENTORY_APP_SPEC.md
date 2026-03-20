# Inventory Dashboard — Application Specification

> **Purpose:** This application is being built as a PoC target for validating AI-driven test generation. The architecture is intentionally layered with shared dependencies so that a code intelligence tool (GitNexus) produces a rich knowledge graph with meaningful call chains, blast radius, and execution flows.

---

## Overview

A single-screen inventory dashboard for a small warehouse. Pure frontend React app with localStorage persistence. No backend. The user can manage products, track stock levels, receive low-stock alerts, search/filter the inventory, and perform bulk operations.

## Tech Stack

- **React 18** with TypeScript
- **Vite** as build tool
- **Vitest** for unit tests (configure from the start, even if empty initially)
- **Tailwind CSS** for styling (keep it clean and functional, not fancy)
- **localStorage** for persistence

Do NOT use any state management library (no Redux, Zustand, etc.). Use React hooks + context. This is intentional — we want the dependency graph to flow through our own code, not through a library's internals.

---

## Architecture — Layered by Responsibility

This is the most important section. Follow this structure exactly. Each layer only imports from the layer below it. Components never call utilities directly — they go through hooks, which go through services.

```
src/
├── types/                    # Shared TypeScript interfaces and enums
│   ├── product.ts            # Product, StockLevel, Category types
│   ├── filters.ts            # FilterCriteria, SortConfig types
│   └── alerts.ts             # Alert, AlertSeverity types
│
├── utils/                    # Pure utility functions (no React, no side effects)
│   ├── validators.ts         # Input validation: product fields, stock quantities
│   ├── formatters.ts         # Currency, date, quantity formatting
│   ├── calculators.ts        # Stock value, reorder point, alert threshold calculations
│   └── storage.ts            # localStorage read/write with JSON serialization
│
├── services/                 # Business logic (uses utils, returns typed results)
│   ├── productService.ts     # CRUD operations on products via localStorage
│   ├── stockService.ts       # Stock level adjustments, history tracking
│   ├── alertService.ts       # Alert generation, severity classification, dismissal
│   ├── filterService.ts      # Search, filter, sort logic on product arrays
│   └── bulkService.ts        # Bulk operations: delete, category change, stock adjust
│
├── hooks/                    # React hooks (bridge between services and components)
│   ├── useProducts.ts        # Product state management, CRUD via productService
│   ├── useStock.ts           # Stock adjustments via stockService
│   ├── useAlerts.ts          # Alert state, generation via alertService
│   ├── useFilters.ts         # Filter/search/sort state via filterService
│   └── useBulkActions.ts     # Selection state, bulk operations via bulkService
│
├── context/                  # React context for cross-cutting state
│   └── InventoryContext.tsx   # Provides products, alerts, filters to the tree
│
├── components/               # React components (UI only, logic via hooks)
│   ├── App.tsx               # Root component, wraps with InventoryContext
│   ├── Dashboard.tsx         # Main layout: header, alerts bar, table, actions
│   ├── ProductTable.tsx      # Table of products with inline editing
│   ├── ProductRow.tsx        # Single product row with stock indicator
│   ├── ProductForm.tsx       # Add/edit product modal or inline form
│   ├── StockAdjuster.tsx     # +/- stock controls with reason input
│   ├── AlertBanner.tsx       # Top banner showing critical/warning alerts
│   ├── SearchBar.tsx         # Search input + filter dropdowns
│   ├── BulkActionBar.tsx     # Actions bar (appears when items selected)
│   └── StatsPanel.tsx        # Summary: total products, total value, low stock count
│
├── main.tsx                  # Vite entry point
└── index.css                 # Tailwind imports
```

## Dependency Flow (Important for GitNexus Graph)

```
Components → Hooks → Services → Utils → Types
     ↓          ↓         ↓         ↓
  Context    Context   (pure)    (pure)
```

Specific cross-cutting dependencies that create interesting blast radius:

- `validators.ts` is used by BOTH `productService.ts` AND `stockService.ts` AND `bulkService.ts`
- `calculators.ts` is used by `stockService.ts`, `alertService.ts`, AND `filterService.ts` (for sorting by value)
- `storage.ts` is used by ALL services (it's the persistence layer)
- `formatters.ts` is used by multiple components AND by `alertService.ts` (for alert messages)
- `alertService.ts` depends on `stockService.ts` (checks stock levels) AND `calculators.ts` (computes thresholds)

These shared dependencies mean that changing `validators.ts` or `calculators.ts` has a wide blast radius — exactly what we want to test with GitNexus `detect_changes` and `impact`.

---

## Domain Rules (Business Logic)

### Products

A product has:
- `id`: string (UUID)
- `name`: string (required, 2–100 chars)
- `sku`: string (required, unique, alphanumeric + dashes, 3–20 chars)
- `category`: enum (Electronics, Clothing, Food, Tools, Other)
- `price`: number (required, > 0, max 2 decimal places)
- `quantity`: number (integer, >= 0)
- `reorderPoint`: number (integer, >= 0, the threshold below which we alert)
- `createdAt`: ISO date string
- `updatedAt`: ISO date string

### Stock Management

- Stock adjustments are always relative: +N or -N, never set to absolute value
- Each adjustment requires a `reason` string (min 3 chars): "Received shipment", "Sold to customer", "Damaged", "Inventory correction"
- Quantity can never go below 0. If an adjustment would make it negative, reject with error
- After every stock adjustment, recalculate alerts

### Alert System

Alerts are generated automatically based on stock levels:

| Condition | Severity | Message Template |
|-----------|----------|-----------------|
| quantity === 0 | critical | "{name} is out of stock" |
| quantity <= reorderPoint | warning | "{name} is below reorder point ({quantity}/{reorderPoint})" |
| quantity <= reorderPoint * 1.5 | info | "{name} is approaching reorder point" |

- Alerts regenerate on: product creation, stock adjustment, product deletion, reorder point change
- Users can dismiss individual alerts (dismissed alerts don't reappear until the next stock change)
- Critical alerts cannot be dismissed

### Search and Filter

- **Text search**: matches against `name` and `sku` (case-insensitive, substring match)
- **Category filter**: select one or multiple categories
- **Stock status filter**: "All", "In Stock", "Low Stock", "Out of Stock"
- **Sort**: by name, SKU, price, quantity, value (price × quantity), last updated
- **Sort direction**: ascending or descending
- Filters combine with AND logic. Search + category + stock status all apply simultaneously

### Bulk Actions

- User selects multiple products via checkboxes
- Available bulk actions:
  - **Delete selected**: removes all selected products, regenerates alerts
  - **Change category**: sets all selected products to a chosen category
  - **Adjust stock**: applies the same +/- adjustment to all selected products (with the same validation: no negative quantities)
- Bulk actions show a confirmation with count of affected products before executing
- After any bulk action: clear selection, regenerate alerts, persist to localStorage

### Statistics Panel

The stats panel always shows:
- Total products count
- Total inventory value (sum of price × quantity for all products)
- Low stock count (products at or below reorder point)
- Out of stock count

These must recalculate on every product or stock change.

---

## Validation Rules (in validators.ts)

```
validateProductName(name: string): ValidationResult
  - Required, 2–100 characters
  - No leading/trailing whitespace (trim)

validateSKU(sku: string, existingSkus: string[]): ValidationResult
  - Required, 3–20 characters
  - Only alphanumeric and dashes
  - Must be unique (case-insensitive) among existingSkus

validatePrice(price: number): ValidationResult
  - Required, must be a number
  - Must be > 0
  - Max 2 decimal places

validateQuantity(quantity: number): ValidationResult
  - Must be an integer
  - Must be >= 0

validateStockAdjustment(currentQuantity: number, adjustment: number): ValidationResult
  - adjustment can be positive or negative
  - currentQuantity + adjustment must be >= 0
  - adjustment cannot be 0

validateReason(reason: string): ValidationResult
  - Required, min 3 characters

ValidationResult = { valid: boolean; error?: string }
```

---

## Calculator Functions (in calculators.ts)

```
calculateInventoryValue(products: Product[]): number
  - Sum of (price × quantity) for all products

calculateStockStatus(product: Product): "in-stock" | "low-stock" | "out-of-stock"
  - out-of-stock: quantity === 0
  - low-stock: quantity <= reorderPoint
  - in-stock: everything else

calculateReorderSuggestion(product: Product): number
  - If low-stock or out-of-stock: reorderPoint * 2 - quantity
  - If in-stock: 0

calculateAlertSeverity(product: Product): AlertSeverity | null
  - Returns "critical", "warning", "info", or null based on the alert rules above

calculateBulkAdjustmentPreview(products: Product[], adjustment: number): BulkPreview
  - Returns: { valid: Product[], rejected: Product[], totalAffected: number }
  - Products where currentQuantity + adjustment < 0 go into rejected
```

---

## Formatter Functions (in formatters.ts)

```
formatCurrency(value: number): string
  - Returns "$X,XXX.XX" format

formatQuantity(quantity: number): string
  - Returns "X units" with comma separators for large numbers

formatDate(isoString: string): string
  - Returns "MMM DD, YYYY" format

formatAlertMessage(product: Product, severity: AlertSeverity): string
  - Uses the message templates from the alert rules table
```

---

## UI Behavior Notes

Keep the UI clean and functional. This is not a design exercise — the goal is testable interactions.

- **ProductTable**: Renders a table with columns: checkbox, name, SKU, category, price, quantity, stock status (colored badge), value, actions (edit, delete)
- **ProductForm**: Appears as an inline form or modal. Shows validation errors inline next to each field
- **StockAdjuster**: Small +/- buttons next to quantity in each row, OR a dedicated popover/modal with reason field
- **AlertBanner**: Fixed at the top of the dashboard. Shows critical alerts as red, warnings as yellow, info as blue. Dismissible (except critical)
- **SearchBar**: Debounced search input (300ms). Category dropdown (multi-select). Stock status radio buttons
- **BulkActionBar**: Appears at the bottom or top when 1+ products are selected. Shows count of selected. Action buttons: Delete, Change Category, Adjust Stock
- **StatsPanel**: A row of 4 stat cards above the table

---

## Initial Seed Data

Pre-populate localStorage with 10 products on first load (if localStorage is empty):

Include a mix of:
- 2 out-of-stock products (quantity: 0)
- 3 low-stock products (quantity <= reorderPoint)
- 5 healthy products

Spread across all 5 categories. Use realistic names and prices.

---

## Testing Setup (Empty but Configured)

Set up Vitest from the start but do NOT write tests yet. The whole point of the PoC is to let AI generate them.

```bash
# Install Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# vitest.config.ts should be configured with:
# - environment: jsdom
# - globals: true
# - setupFiles pointing to a test setup file that imports @testing-library/jest-dom
```

Create an empty `src/__tests__/` directory with a single placeholder:

```typescript
// src/__tests__/.gitkeep
```

Similarly, set up Playwright Test but leave the tests directory empty:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Create a minimal `playwright.config.ts` pointing at `http://localhost:5173` (or whatever Vite's dev port is).

---

## What NOT to Do

- Do NOT use any external component library (no Material UI, Chakra, Ant Design). Use plain HTML + Tailwind. This keeps the component tree ours and makes Playwright selectors cleaner
- Do NOT use React Router — single screen, no routing needed
- Do NOT use Redux/Zustand/Jotai — hooks + context only
- Do NOT write any tests — that's for the AI to do later
- Do NOT use `any` types — keep TypeScript strict for GitNexus parsing quality
- Do NOT put business logic in components — always delegate to hooks → services → utils
