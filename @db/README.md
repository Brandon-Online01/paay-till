# Database Services Documentation

## Overview

This directory contains all database-related services for the orrbit till application, including consolidated initialization, product management, transaction handling, and migrations.

## Quick Start

### Initialize All Database Services

```typescript
import { initializeDatabase } from '@/db';

// In your app's main initialization (e.g., App.tsx or main entry point)
await initializeDatabase({
    runMigrations: true, // Run product migrations from JSON
    forceMigrations: false, // Don't overwrite existing data
    showStatus: true, // Show database status after init
});
```

### Alternative Advanced Initialization

```typescript
import { DatabaseInitService } from '@/db';

// Manual initialization with more control
await DatabaseInitService.initializeAll({
    runMigrations: true,
    forceMigrations: false,
});

// Check health
const health = await DatabaseInitService.healthCheck();
console.log('Database health:', health);

// Show current status
await DatabaseInitService.showStatus();
```

## Services

### 1. DatabaseInitService (NEW - Consolidated)

**Purpose**: Single point of initialization for all database services

**Key Methods**:

- `initializeAll()` - Initialize all services and run migrations
- `healthCheck()` - Check if all services are working
- `showStatus()` - Display current database statistics
- `resetDatabase()` - Clear and reinitialize everything

### 2. ProductService

**Purpose**: Product CRUD operations

**Key Methods**:

- `createProduct(product)` - Add new product
- `getProducts(filters?)` - Get products with optional filtering
- `getProductById(id)` - Get specific product
- `updateProduct(id, updates)` - Update product
- `deleteProduct(id)` - Remove product
- `getProductStats()` - Get product statistics
- `bulkImportProducts(products)` - Import multiple products

### 3. TransactionService

**Purpose**: Transaction operations (existing, now consolidated)

**Key Methods**:

- `saveTransaction(data)` - Save completed transaction
- `getTransactions(filters?)` - Get transactions
- `getTransactionStats()` - Get transaction statistics

### 4. ProductMigration

**Purpose**: Import products from JSON to database

**Key Methods**:

- `runMigration()` - Import products (skip if exists)
- `forceMigration()` - Import products (overwrite existing)
- `clearProducts()` - Remove all products
- `showStatus()` - Display current state

## Database Schema

### Products Table

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT,
  description TEXT,
  badge TEXT,
  variants TEXT, -- JSON
  inStock BOOLEAN DEFAULT 1,
  stockQuantity INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cashierID TEXT NOT NULL,
  transactionID TEXT UNIQUE NOT NULL,
  orderID TEXT,
  items TEXT NOT NULL, -- JSON array
  paymentMethods TEXT NOT NULL, -- JSON array
  subtotal REAL NOT NULL,
  tax REAL NOT NULL,
  discount REAL DEFAULT 0,
  totalAmount REAL NOT NULL,
  change REAL DEFAULT 0,
  customerName TEXT,
  receiptStatus TEXT NOT NULL,
  receiptOptions TEXT, -- JSON
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  currencySymbol TEXT DEFAULT 'R',
  additionalMetrics TEXT DEFAULT ''
);
```

### Transaction Items Table (NEW)

```sql
CREATE TABLE transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transactionId INTEGER NOT NULL,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unitPrice REAL NOT NULL,
  calculatedPrice REAL NOT NULL,
  variantPrice REAL DEFAULT 0,
  totalPrice REAL NOT NULL,
  selectedVariants TEXT, -- JSON
  notes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (transactionId) REFERENCES transactions(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

## Usage Examples

### Basic Product Operations

```typescript
import { ProductService } from '@/db';

// Create product
const newProduct = await ProductService.createProduct({
    name: 'iPhone 15',
    category: 'electronics',
    price: 12999,
    image: '📱',
    description: 'Latest iPhone',
    stockQuantity: 50,
});

// Get all products
const products = await ProductService.getProducts();

// Search products
const results = await ProductService.searchProducts('iPhone');

// Get by category
const electronics = await ProductService.getProductsByCategory('electronics');

// Get statistics
const stats = await ProductService.getProductStats();
```

### Migration Operations

```typescript
import { ProductMigration } from '@/db';

// Run migration (safe - won't overwrite)
await ProductMigration.runMigration();

// Force migration (overwrite existing)
await ProductMigration.forceMigration();

// Clear all products
await ProductMigration.clearProducts();

// Check status
await ProductMigration.showStatus();
```

## Development Commands

```bash
# Run migrations
npm run migrate-products

# Force migrations
npm run migrate-products force

# Clear products
npm run migrate-products clear

# Show status
npm run migrate-products status
```

## Integration Notes

1. **App Initialization**: Call `initializeDatabase()` in your app's main entry point
2. **Product Grid**: Update to use `ProductService.getProducts()` instead of JSON
3. **Inventory**: Update to use `ProductService` methods
4. **Transactions**: Already using consolidated database service
5. **Reports**: Will be updated to join with product data

## Next Steps

1. ✅ Database schema created
2. ✅ Product service implemented
3. ✅ Migration system created
4. ✅ Consolidated initialization
5. 🔄 Update product-grid to use database
6. 🔄 Update inventory to use database
7. 🔄 Update add-product form to save to database
8. 🔄 Enhance reports with product relationships
9. 🔄 Add product analytics to detail modal
