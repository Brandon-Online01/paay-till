import * as SQLite from 'expo-sqlite';
import {
    Transaction,
    TransactionCreateInput,
    TransactionUpdateInput,
    TransactionFilters,
} from '../types/transaction.types';

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;
    private static instance: DatabaseService;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    /**
     * Initialize the database and create tables
     */
    public async initialize(): Promise<void> {
        try {
            this.db = await SQLite.openDatabaseAsync('transactions.db');
            await this.createTables();
            console.log('db init success');
        } catch (error) {
            console.error('db init failed:', error);
            throw new Error('Database initialization failed');
        }
    }

    /**
     * Get the database instance for advanced queries
     */
    public getDb(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }

    /**
     * Create the transactions and products tables with optimized schemas
     */
    private async createTables(): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        // Products table with enhanced fields
        const createProductsTableSQL = `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL CHECK (price >= 0),
        image TEXT,
        description TEXT,
        badge TEXT,
        variants TEXT, -- JSON object with variants
        inStock BOOLEAN NOT NULL DEFAULT 1,
        stockQuantity INTEGER NOT NULL DEFAULT 0 CHECK (stockQuantity >= 0),
        barcode TEXT,
        qrCode TEXT,
        reorderQty INTEGER NOT NULL DEFAULT 10 CHECK (reorderQty >= 0),
        maxBuyQty INTEGER NOT NULL DEFAULT 100 CHECK (maxBuyQty > 0),
        minBuyQty INTEGER NOT NULL DEFAULT 1 CHECK (minBuyQty > 0),
        resellerName TEXT,
        brand TEXT,
        information TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

        // Transactions table
        const createTransactionsTableSQL = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cashierID TEXT NOT NULL,
        transactionID TEXT UNIQUE NOT NULL,
        orderID TEXT,
        items TEXT NOT NULL, -- JSON array of TransactionItem[]
        paymentMethods TEXT NOT NULL, -- JSON array of PaymentMethod[]
        subtotal REAL NOT NULL CHECK (subtotal >= 0),
        tax REAL NOT NULL CHECK (tax >= 0),
        discount REAL NOT NULL DEFAULT 0 CHECK (discount >= 0),
        totalAmount REAL NOT NULL CHECK (totalAmount >= 0),
        change REAL NOT NULL DEFAULT 0 CHECK (change >= 0),
        customerName TEXT,
        receiptStatus TEXT NOT NULL CHECK (receiptStatus IN ('issued', 'pending', 'void')),
        receiptOptions TEXT, -- JSON object with receipt preferences
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'canceled')),
        type TEXT NOT NULL CHECK (type IN ('sale', 'refund', 'return')),
        currency TEXT NOT NULL DEFAULT 'ZAR',
        currencySymbol TEXT NOT NULL DEFAULT 'R',
        additionalMetrics TEXT DEFAULT ''
      );
    `;

        // Transaction items table for better relationship management
        const createTransactionItemsTableSQL = `
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId INTEGER NOT NULL,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unitPrice REAL NOT NULL CHECK (unitPrice >= 0),
        calculatedPrice REAL NOT NULL CHECK (calculatedPrice >= 0),
        variantPrice REAL NOT NULL DEFAULT 0 CHECK (variantPrice >= 0),
        totalPrice REAL NOT NULL CHECK (totalPrice >= 0),
        selectedVariants TEXT, -- JSON object with selected variants
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id)
      );
    `;

        // Basic indexes (only for columns that exist in base schema)
        const createBasicIndexSQL = `
      -- Product indexes for performance (basic columns only)
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
      CREATE INDEX IF NOT EXISTS idx_products_instock ON products(inStock);
      CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
      
      -- Transaction indexes
      CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions(cashierID);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(createdAt);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(orderID);
      
      -- Transaction items indexes
      CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transactionId);
      CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(productId);
      CREATE INDEX IF NOT EXISTS idx_transaction_items_date ON transaction_items(createdAt);
    `;

        await this.db.execAsync(createProductsTableSQL);
        await this.db.execAsync(createTransactionsTableSQL);
        await this.db.execAsync(createTransactionItemsTableSQL);
        await this.db.execAsync(createBasicIndexSQL);
    }

    /**
     * Create advanced indexes after migrations have run
     */
    public async createAdvancedIndexes(): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        const createAdvancedIndexSQL = `
      -- Advanced product indexes (for migrated columns)
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_products_qrcode ON products(qrCode);
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
      CREATE INDEX IF NOT EXISTS idx_products_category_brand ON products(category, brand);
      CREATE INDEX IF NOT EXISTS idx_products_reseller ON products(resellerName);
      CREATE INDEX IF NOT EXISTS idx_products_stock_reorder ON products(stockQuantity, reorderQty);
      CREATE INDEX IF NOT EXISTS idx_products_created ON products(createdAt);
      CREATE INDEX IF NOT EXISTS idx_products_updated ON products(updatedAt);
    `;

        try {
            await this.db.execAsync(createAdvancedIndexSQL);
            console.log('✅ Advanced indexes created successfully');
        } catch (error) {
            console.warn('⚠️ Some advanced indexes could not be created:', error);
            // Don't throw error - indexes are for performance, not functionality
        }
    }

    /**
     * Create a new transaction with optimized data structure
     */
    public async createTransaction(
        transaction: TransactionCreateInput
    ): Promise<Transaction> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        this.validateTransactionData(transaction);

        const now = new Date().toISOString();
        const insertSQL = `
      INSERT INTO transactions (
        cashierID, transactionID, orderID, items, paymentMethods, subtotal, tax, discount,
        totalAmount, change, customerName, receiptStatus, receiptOptions, createdAt, updatedAt,
        status, type, currency, currencySymbol, additionalMetrics
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            const result = await this.db.runAsync(insertSQL, [
                transaction.cashierID,
                transaction.transactionID,
                transaction.orderID || null,
                JSON.stringify(transaction.items),
                JSON.stringify(transaction.paymentMethods),
                transaction.subtotal,
                transaction.tax,
                transaction.discount,
                transaction.totalAmount,
                transaction.change,
                transaction.customerName || null,
                transaction.receiptStatus,
                transaction.receiptOptions
                    ? JSON.stringify(transaction.receiptOptions)
                    : null,
                now,
                now,
                transaction.status,
                transaction.type,
                transaction.currency,
                transaction.currencySymbol,
                transaction.additionalMetrics || '',
            ]);

            return await this.getTransactionById(result.lastInsertRowId);
        } catch (error) {
            console.error('Failed to create transaction:', error);
            throw new Error('Failed to create transaction');
        }
    }

    /**
     * Get a transaction by ID with proper JSON parsing
     */
    public async getTransactionById(id: number): Promise<Transaction> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const result = await this.db.getFirstAsync<any>(
                'SELECT * FROM transactions WHERE id = ?',
                [id]
            );

            if (!result) {
                throw new Error('Transaction not found');
            }

            return this.parseTransactionFromDb(result);
        } catch (error) {
            console.error('Failed to get transaction:', error);
            throw new Error('Failed to retrieve transaction');
        }
    }

    /**
     * Get transaction by transactionID with proper JSON parsing
     */
    public async getTransactionByTransactionId(
        transactionID: string
    ): Promise<Transaction> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const result = await this.db.getFirstAsync<any>(
                'SELECT * FROM transactions WHERE transactionID = ?',
                [transactionID]
            );

            if (!result) {
                throw new Error('Transaction not found');
            }

            return this.parseTransactionFromDb(result);
        } catch (error) {
            console.error('Failed to get transaction:', error);
            throw new Error('Failed to retrieve transaction');
        }
    }

    /**
     * Parse transaction from database format to TypeScript format
     */
    private parseTransactionFromDb(dbTransaction: any): Transaction {
        try {
            return {
                ...dbTransaction,
                items: JSON.parse(dbTransaction.items || '[]'),
                paymentMethods: JSON.parse(
                    dbTransaction.paymentMethods || '[]'
                ),
                receiptOptions: dbTransaction.receiptOptions
                    ? JSON.parse(dbTransaction.receiptOptions)
                    : undefined,
            };
        } catch (error) {
            console.error('Failed to parse transaction from database:', error);
            throw new Error('Invalid transaction data in database');
        }
    }

    /**
     * Get transactions with filters and proper JSON parsing
     */
    public async getTransactions(
        filters: TransactionFilters = {}
    ): Promise<Transaction[]> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        let sql = 'SELECT * FROM transactions WHERE 1=1';
        const params: any[] = [];

        // Apply filters
        if (filters.cashierID) {
            sql += ' AND cashierID = ?';
            params.push(filters.cashierID);
        }

        if (filters.status) {
            sql += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.type) {
            sql += ' AND type = ?';
            params.push(filters.type);
        }

        if (filters.dateFrom) {
            sql += ' AND createdAt >= ?';
            params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
            sql += ' AND createdAt <= ?';
            params.push(filters.dateTo);
        }

        // Order by most recent first
        sql += ' ORDER BY createdAt DESC';

        // Apply pagination
        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);

            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        try {
            const result = await this.db.getAllAsync<any>(sql, params);
            return result.map((row) => this.parseTransactionFromDb(row));
        } catch (error) {
            console.error('Failed to get transactions:', error);
            throw new Error('Failed to retrieve transactions');
        }
    }

    /**
     * Update a transaction
     */
    public async updateTransaction(
        id: number,
        updates: TransactionUpdateInput
    ): Promise<Transaction> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        // Validate updates
        if (Object.keys(updates).length === 0) {
            throw new Error('No updates provided');
        }

        const allowedFields = [
            'cashierID',
            'transactionID',
            'paymentMethod',
            'totalAmount',
            'discount',
            'change',
            'receiptStatus',
            'receiptDetails',
            'status',
            'type',
            'additionalMetrics',
        ];

        const updateFields: string[] = [];
        const params: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value !== undefined) {
                updateFields.push(`${key} = ?`);
                params.push(value);
            }
        });

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        // Add updatedAt timestamp
        updateFields.push('updatedAt = ?');
        params.push(new Date().toISOString());

        // Add id for WHERE clause
        params.push(id);

        const sql = `UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ?`;

        try {
            const result = await this.db.runAsync(sql, params);

            if (result.changes === 0) {
                throw new Error('Transaction not found');
            }

            return await this.getTransactionById(id);
        } catch (error) {
            console.error('Failed to update transaction:', error);
            throw new Error('Failed to update transaction');
        }
    }

    /**
     * Delete a transaction
     */
    public async deleteTransaction(id: number): Promise<boolean> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const result = await this.db.runAsync(
                'DELETE FROM transactions WHERE id = ?',
                [id]
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            throw new Error('Failed to delete transaction');
        }
    }

    /**
     * Get transaction statistics
     */
    public async getTransactionStats(
        filters: TransactionFilters = {}
    ): Promise<{
        totalTransactions: number;
        totalAmount: number;
        totalDiscount: number;
        averageTransaction: number;
    }> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        let sql = `
      SELECT 
        COUNT(*) as totalTransactions,
        COALESCE(SUM(totalAmount), 0) as totalAmount,
        COALESCE(SUM(discount), 0) as totalDiscount,
        COALESCE(AVG(totalAmount), 0) as averageTransaction
      FROM transactions 
      WHERE 1=1
    `;
        const params: any[] = [];

        // Apply same filters as getTransactions
        if (filters.cashierID) {
            sql += ' AND cashierID = ?';
            params.push(filters.cashierID);
        }

        if (filters.status) {
            sql += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.type) {
            sql += ' AND type = ?';
            params.push(filters.type);
        }

        if (filters.dateFrom) {
            sql += ' AND createdAt >= ?';
            params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
            sql += ' AND createdAt <= ?';
            params.push(filters.dateTo);
        }

        try {
            const result = await this.db.getFirstAsync<{
                totalTransactions: number;
                totalAmount: number;
                totalDiscount: number;
                averageTransaction: number;
            }>(sql, params);

            return (
                result || {
                    totalTransactions: 0,
                    totalAmount: 0,
                    totalDiscount: 0,
                    averageTransaction: 0,
                }
            );
        } catch (error) {
            console.error('Failed to get transaction stats:', error);
            throw new Error('Failed to retrieve transaction statistics');
        }
    }

    /**
     * Validate transaction data with updated structure
     */
    private validateTransactionData(transaction: TransactionCreateInput): void {
        if (!transaction.cashierID || transaction.cashierID.trim() === '') {
            throw new Error('Cashier ID is required');
        }

        if (
            !transaction.transactionID ||
            transaction.transactionID.trim() === ''
        ) {
            throw new Error('Transaction ID is required');
        }

        if (
            !Array.isArray(transaction.items) ||
            transaction.items.length === 0
        ) {
            throw new Error('Transaction must contain at least one item');
        }

        if (
            !Array.isArray(transaction.paymentMethods) ||
            transaction.paymentMethods.length === 0
        ) {
            throw new Error(
                'Transaction must have at least one payment method'
            );
        }

        if (transaction.totalAmount < 0) {
            throw new Error('Total amount cannot be negative');
        }

        if (transaction.subtotal < 0) {
            throw new Error('Subtotal cannot be negative');
        }

        if (transaction.tax < 0) {
            throw new Error('Tax cannot be negative');
        }

        if (transaction.discount < 0) {
            throw new Error('Discount cannot be negative');
        }

        if (transaction.change < 0) {
            throw new Error('Change cannot be negative');
        }

        if (
            !['issued', 'pending', 'void'].includes(transaction.receiptStatus)
        ) {
            throw new Error('Invalid receipt status');
        }

        if (
            !['completed', 'pending', 'canceled'].includes(transaction.status)
        ) {
            throw new Error('Invalid transaction status');
        }

        if (!['sale', 'refund', 'return'].includes(transaction.type)) {
            throw new Error('Invalid transaction type');
        }

        if (!transaction.currency || transaction.currency.trim() === '') {
            throw new Error('Currency is required');
        }

        if (
            !transaction.currencySymbol ||
            transaction.currencySymbol.trim() === ''
        ) {
            throw new Error('Currency symbol is required');
        }

        // Validate items
        transaction.items.forEach((item, index) => {
            if (!item.id || !item.name) {
                throw new Error(
                    `Item ${index + 1} is missing required fields (id, name)`
                );
            }
            if (typeof item.price !== 'number' || item.price < 0) {
                throw new Error(`Item ${index + 1} has invalid price`);
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                throw new Error(`Item ${index + 1} has invalid quantity`);
            }
        });

        // Validate payment methods
        transaction.paymentMethods.forEach((payment, index) => {
            if (
                !payment.type ||
                typeof payment.amount !== 'number' ||
                payment.amount <= 0
            ) {
                throw new Error(`Payment method ${index + 1} has invalid data`);
            }
        });
    }

    /**
     * PRODUCT OPERATIONS
     */

    /**
     * Create a new product
     */
    public async createProduct(product: {
        id?: string;
        name: string;
        category: string;
        price: number;
        image?: string;
        description?: string;
        badge?: string | null;
        variants?: any;
        inStock?: boolean;
        stockQuantity?: number;
    }): Promise<any> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        const now = new Date().toISOString();
        const productId =
            product.id ||
            `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            const insertSQL = `
        INSERT INTO products (
          id, name, category, price, image, description, badge, 
          variants, inStock, stockQuantity, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            await this.db.runAsync(insertSQL, [
                productId,
                product.name,
                product.category,
                product.price,
                product.image || null,
                product.description || null,
                product.badge || null,
                product.variants ? JSON.stringify(product.variants) : null,
                product.inStock !== false ? 1 : 0,
                product.stockQuantity || 0,
                now,
                now,
            ]);

            return await this.getProductById(productId);
        } catch (error) {
            console.error('Failed to create product:', error);
            throw new Error('Failed to create product');
        }
    }

    /**
     * Get product by ID
     */
    public async getProductById(id: string): Promise<any> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const result = await this.db.getFirstAsync<any>(
                'SELECT * FROM products WHERE id = ?',
                [id]
            );

            if (!result) {
                throw new Error('Product not found');
            }

            return this.parseProductFromDb(result);
        } catch (error) {
            console.error('Failed to get product:', error);
            throw new Error('Failed to retrieve product');
        }
    }

    /**
     * Get all products with optional filters
     */
    public async getProducts(filters?: {
        category?: string;
        inStock?: boolean;
        searchQuery?: string;
        limit?: number;
        offset?: number;
    }): Promise<any[]> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        let sql = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];

        // Apply filters
        if (filters?.category) {
            sql += ' AND category = ?';
            params.push(filters.category);
        }

        if (filters?.inStock !== undefined) {
            sql += ' AND inStock = ?';
            params.push(filters.inStock ? 1 : 0);
        }

        if (filters?.searchQuery) {
            sql +=
                ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
            const searchTerm = `%${filters.searchQuery}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Order by name
        sql += ' ORDER BY name ASC';

        // Apply pagination
        if (filters?.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);

            if (filters?.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        try {
            const result = await this.db.getAllAsync<any>(sql, params);
            return result.map((row) => this.parseProductFromDb(row));
        } catch (error) {
            console.error('Failed to get products:', error);
            throw new Error('Failed to retrieve products');
        }
    }

    /**
     * Update a product
     */
    public async updateProduct(id: string, updates: any): Promise<any> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        if (Object.keys(updates).length === 0) {
            throw new Error('No updates provided');
        }

        const allowedFields = [
            'name',
            'category',
            'price',
            'image',
            'description',
            'badge',
            'variants',
            'inStock',
            'stockQuantity',
        ];

        const updateFields: string[] = [];
        const params: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value !== undefined) {
                updateFields.push(`${key} = ?`);
                if (key === 'variants') {
                    params.push(value ? JSON.stringify(value) : null);
                } else if (key === 'inStock') {
                    params.push(value ? 1 : 0);
                } else {
                    params.push(value);
                }
            }
        });

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        updateFields.push('updatedAt = ?');
        params.push(new Date().toISOString());
        params.push(id);

        const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;

        try {
            const result = await this.db.runAsync(sql, params);

            if (result.changes === 0) {
                throw new Error('Product not found');
            }

            return await this.getProductById(id);
        } catch (error) {
            console.error('Failed to update product:', error);
            throw new Error('Failed to update product');
        }
    }

    /**
     * Delete a product
     */
    public async deleteProduct(id: string): Promise<boolean> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const result = await this.db.runAsync(
                'DELETE FROM products WHERE id = ?',
                [id]
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Failed to delete product:', error);
            throw new Error('Failed to delete product');
        }
    }

    /**
     * Get product statistics
     */
    public async getProductStats(): Promise<{
        totalProducts: number;
        totalValue: number;
        averagePrice: number;
        inStockProducts: number;
        outOfStockProducts: number;
        categories: number;
    }> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const statsResult = await this.db.getFirstAsync<{
                totalProducts: number;
                totalValue: number;
                averagePrice: number;
                inStockProducts: number;
                outOfStockProducts: number;
            }>(`
        SELECT 
          COUNT(*) as totalProducts,
          COALESCE(SUM(price * stockQuantity), 0) as totalValue,
          COALESCE(AVG(price), 0) as averagePrice,
          SUM(CASE WHEN inStock = 1 THEN 1 ELSE 0 END) as inStockProducts,
          SUM(CASE WHEN inStock = 0 THEN 1 ELSE 0 END) as outOfStockProducts
        FROM products
      `);

            const categoriesResult = await this.db.getFirstAsync<{
                categories: number;
            }>('SELECT COUNT(DISTINCT category) as categories FROM products');

            return {
                totalProducts: statsResult?.totalProducts || 0,
                totalValue: statsResult?.totalValue || 0,
                averagePrice: statsResult?.averagePrice || 0,
                inStockProducts: statsResult?.inStockProducts || 0,
                outOfStockProducts: statsResult?.outOfStockProducts || 0,
                categories: categoriesResult?.categories || 0,
            };
        } catch (error) {
            console.error('Failed to get product stats:', error);
            throw new Error('Failed to retrieve product statistics');
        }
    }

    /**
     * Get product categories with counts
     */
    public async getProductCategories(): Promise<
        { category: string; count: number }[]
    > {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const result = await this.db.getAllAsync<{
                category: string;
                count: number;
            }>(
                'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category ASC'
            );
            return result;
        } catch (error) {
            console.error('Failed to get product categories:', error);
            throw new Error('Failed to retrieve product categories');
        }
    }

    /**
     * Parse product from database format
     */
    private parseProductFromDb(dbProduct: any): any {
        try {
            return {
                id: dbProduct.id,
                name: dbProduct.name,
                category: dbProduct.category,
                price: dbProduct.price,
                image: dbProduct.image,
                description: dbProduct.description,
                badge: dbProduct.badge,
                variants: dbProduct.variants
                    ? JSON.parse(dbProduct.variants)
                    : undefined,
                inStock: dbProduct.inStock === 1,
                stockQuantity: dbProduct.stockQuantity,
            };
        } catch (error) {
            console.error('Failed to parse product from database:', error);
            throw new Error('Invalid product data in database');
        }
    }

    /**
     * TRANSACTION ITEMS OPERATIONS (for product relationships)
     */

    /**
     * Save transaction items to transaction_items table
     */
    public async saveTransactionItems(
        transactionId: number,
        items: any[]
    ): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const insertSQL = `
        INSERT INTO transaction_items (
          transactionId, productId, quantity, unitPrice, calculatedPrice,
          variantPrice, totalPrice, selectedVariants, notes, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const now = new Date().toISOString();

            for (const item of items) {
                await this.db.runAsync(insertSQL, [
                    transactionId,
                    item.id, // productId
                    item.quantity,
                    item.price,
                    item.calculatedPrice || item.price,
                    item.variantPrice || 0,
                    item.totalItemPrice,
                    item.selectedVariants
                        ? JSON.stringify(item.selectedVariants)
                        : null,
                    item.notes || null,
                    now,
                ]);
            }

            console.log(
                `✅ Saved ${items.length} transaction items for transaction ${transactionId}`
            );
        } catch (error) {
            console.error('Failed to save transaction items:', error);
            throw new Error('Failed to save transaction items');
        }
    }

    /**
     * Get transaction items with product details
     */
    public async getTransactionItemsWithProducts(
        transactionId: number
    ): Promise<any[]> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const sql = `
        SELECT 
          ti.*,
          p.name as productName,
          p.image as productImage,
          p.description as productDescription,
          p.category as productCategory,
          p.badge as productBadge
        FROM transaction_items ti
        LEFT JOIN products p ON ti.productId = p.id
        WHERE ti.transactionId = ?
        ORDER BY ti.id
      `;

            const result = await this.db.getAllAsync<any>(sql, [transactionId]);

            return result.map((row) => ({
                id: row.id,
                transactionId: row.transactionId,
                productId: row.productId,
                quantity: row.quantity,
                unitPrice: row.unitPrice,
                calculatedPrice: row.calculatedPrice,
                variantPrice: row.variantPrice,
                totalPrice: row.totalPrice,
                selectedVariants: row.selectedVariants
                    ? JSON.parse(row.selectedVariants)
                    : null,
                notes: row.notes,
                createdAt: row.createdAt,
                // Product details
                product: {
                    id: row.productId,
                    name: row.productName,
                    image: row.productImage,
                    description: row.productDescription,
                    category: row.productCategory,
                    badge: row.productBadge,
                },
            }));
        } catch (error) {
            console.error(
                'Failed to get transaction items with products:',
                error
            );
            throw new Error('Failed to retrieve transaction items');
        }
    }

    /**
     * Get product analytics from transaction items
     */
    public async getProductAnalyticsFromTransactions(
        productId: string
    ): Promise<{
        totalSold: number;
        totalRevenue: number;
        averageOrderValue: number;
        lastSold?: string;
    }> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const analyticsResult = await this.db.getFirstAsync<{
                totalSold: number;
                totalRevenue: number;
                lastSold: string;
            }>(
                `
        SELECT 
          COALESCE(SUM(quantity), 0) as totalSold,
          COALESCE(SUM(totalPrice), 0) as totalRevenue,
          MAX(createdAt) as lastSold
        FROM transaction_items 
        WHERE productId = ?
      `,
                [productId]
            );

            const transactionCount = await this.db.getFirstAsync<{
                count: number;
            }>(
                `
        SELECT COUNT(DISTINCT transactionId) as count
        FROM transaction_items 
        WHERE productId = ?
      `,
                [productId]
            );

            const averageOrderValue =
                analyticsResult?.totalRevenue && transactionCount?.count
                    ? analyticsResult.totalRevenue / transactionCount.count
                    : 0;

            return {
                totalSold: analyticsResult?.totalSold || 0,
                totalRevenue: analyticsResult?.totalRevenue || 0,
                averageOrderValue,
                lastSold: analyticsResult?.lastSold,
            };
        } catch (error) {
            console.error('Failed to get product analytics:', error);
            return {
                totalSold: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
            };
        }
    }

    /**
     * Close database connection
     */
    public async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
        }
    }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
