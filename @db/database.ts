import * as SQLite from 'expo-sqlite';
import { Transaction, TransactionCreateInput, TransactionUpdateInput, TransactionFilters } from '../types/transaction.types';

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
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  /**
   * Create the transactions table with optimized schema
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const createTableSQL = `
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

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions(cashierID);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(createdAt);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(orderID);
    `;

    await this.db.execAsync(createTableSQL);
    await this.db.execAsync(createIndexSQL);
  }

  /**
   * Create a new transaction with optimized data structure
   */
  public async createTransaction(transaction: TransactionCreateInput): Promise<Transaction> {
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
        transaction.receiptOptions ? JSON.stringify(transaction.receiptOptions) : null,
        now,
        now,
        transaction.status,
        transaction.type,
        transaction.currency,
        transaction.currencySymbol,
        transaction.additionalMetrics || ''
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
  public async getTransactionByTransactionId(transactionID: string): Promise<Transaction> {
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
        paymentMethods: JSON.parse(dbTransaction.paymentMethods || '[]'),
        receiptOptions: dbTransaction.receiptOptions ? JSON.parse(dbTransaction.receiptOptions) : undefined,
      };
    } catch (error) {
      console.error('Failed to parse transaction from database:', error);
      throw new Error('Invalid transaction data in database');
    }
  }

  /**
   * Get transactions with filters and proper JSON parsing
   */
  public async getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
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
      return result.map(row => this.parseTransactionFromDb(row));
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  /**
   * Update a transaction
   */
  public async updateTransaction(id: number, updates: TransactionUpdateInput): Promise<Transaction> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Validate updates
    if (Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }

    const allowedFields = [
      'cashierID', 'transactionID', 'paymentMethod', 'totalAmount', 'discount',
      'change', 'receiptStatus', 'receiptDetails', 'status', 'type', 'additionalMetrics'
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
      const result = await this.db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  }

  /**
   * Get transaction statistics
   */
  public async getTransactionStats(filters: TransactionFilters = {}): Promise<{
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

      return result || {
        totalTransactions: 0,
        totalAmount: 0,
        totalDiscount: 0,
        averageTransaction: 0
      };
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

    if (!transaction.transactionID || transaction.transactionID.trim() === '') {
      throw new Error('Transaction ID is required');
    }

    if (!Array.isArray(transaction.items) || transaction.items.length === 0) {
      throw new Error('Transaction must contain at least one item');
    }

    if (!Array.isArray(transaction.paymentMethods) || transaction.paymentMethods.length === 0) {
      throw new Error('Transaction must have at least one payment method');
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

    if (!['issued', 'pending', 'void'].includes(transaction.receiptStatus)) {
      throw new Error('Invalid receipt status');
    }

    if (!['completed', 'pending', 'canceled'].includes(transaction.status)) {
      throw new Error('Invalid transaction status');
    }

    if (!['sale', 'refund', 'return'].includes(transaction.type)) {
      throw new Error('Invalid transaction type');
    }

    if (!transaction.currency || transaction.currency.trim() === '') {
      throw new Error('Currency is required');
    }

    if (!transaction.currencySymbol || transaction.currencySymbol.trim() === '') {
      throw new Error('Currency symbol is required');
    }

    // Validate items
    transaction.items.forEach((item, index) => {
      if (!item.id || !item.name) {
        throw new Error(`Item ${index + 1} is missing required fields (id, name)`);
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
      if (!payment.type || typeof payment.amount !== 'number' || payment.amount <= 0) {
        throw new Error(`Payment method ${index + 1} has invalid data`);
      }
    });
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
