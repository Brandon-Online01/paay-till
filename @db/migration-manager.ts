import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

/**
 * Database Migration Manager
 * Handles database schema updates and migrations
 */
export class MigrationManager {
    private db: SQLite.SQLiteDatabase;
    private static readonly MIGRATION_TABLE = 'schema_migrations';

    constructor(database: SQLite.SQLiteDatabase) {
        this.db = database;
    }

    /**
     * Initialize the migration tracking table
     */
    async initializeMigrationTable(): Promise<void> {
        const createMigrationTableSQL = `
            CREATE TABLE IF NOT EXISTS ${MigrationManager.MIGRATION_TABLE} (
                version TEXT PRIMARY KEY,
                applied_at TEXT NOT NULL,
                description TEXT
            );
        `;
        
        await this.db.execAsync(createMigrationTableSQL);
        console.log('📄 Migration table initialized');
    }

    /**
     * Get list of applied migrations
     */
    async getAppliedMigrations(): Promise<string[]> {
        try {
            const result = await this.db.getAllAsync(
                `SELECT version FROM ${MigrationManager.MIGRATION_TABLE} ORDER BY version`
            );
            return result.map((row: any) => row.version);
        } catch (error) {
            console.warn('Could not fetch applied migrations:', error);
            return [];
        }
    }

    /**
     * Mark a migration as applied
     */
    async markMigrationApplied(version: string, description?: string): Promise<void> {
        const insertSQL = `
            INSERT OR REPLACE INTO ${MigrationManager.MIGRATION_TABLE} 
            (version, applied_at, description) 
            VALUES (?, ?, ?)
        `;
        
        await this.db.runAsync(insertSQL, [version, new Date().toISOString(), description || '']);
        console.log(`✅ Migration ${version} marked as applied`);
    }

    /**
     * Apply migration 001: Add new product fields
     */
    async applyMigration001(): Promise<void> {
        const version = '001';
        const description = 'Add enhanced product fields: barcode, qrCode, reorderQty, etc.';
        
        console.log(`🔄 Applying migration ${version}: ${description}`);

        try {
            // Check if columns already exist to avoid errors
            const tableInfo = await this.db.getAllAsync("PRAGMA table_info(products)");
            const existingColumns = tableInfo.map((col: any) => col.name);

            const newColumns = [
                { name: 'barcode', sql: 'ALTER TABLE products ADD COLUMN barcode TEXT' },
                { name: 'qrCode', sql: 'ALTER TABLE products ADD COLUMN qrCode TEXT' },
                { name: 'reorderQty', sql: 'ALTER TABLE products ADD COLUMN reorderQty INTEGER NOT NULL DEFAULT 10 CHECK (reorderQty >= 0)' },
                { name: 'maxBuyQty', sql: 'ALTER TABLE products ADD COLUMN maxBuyQty INTEGER NOT NULL DEFAULT 100 CHECK (maxBuyQty > 0)' },
                { name: 'minBuyQty', sql: 'ALTER TABLE products ADD COLUMN minBuyQty INTEGER NOT NULL DEFAULT 1 CHECK (minBuyQty > 0)' },
                { name: 'resellerName', sql: 'ALTER TABLE products ADD COLUMN resellerName TEXT' },
                { name: 'brand', sql: 'ALTER TABLE products ADD COLUMN brand TEXT' },
                { name: 'information', sql: 'ALTER TABLE products ADD COLUMN information TEXT' },
                { name: 'createdAt', sql: 'ALTER TABLE products ADD COLUMN createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP' },
                { name: 'updatedAt', sql: 'ALTER TABLE products ADD COLUMN updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP' }
            ];

            // Add missing columns
            for (const column of newColumns) {
                if (!existingColumns.includes(column.name)) {
                    await this.db.execAsync(column.sql);
                    console.log(`➕ Added column: ${column.name}`);
                }
            }

            // Create indexes for performance
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
                'CREATE INDEX IF NOT EXISTS idx_products_qrcode ON products(qrCode)',
                'CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)',
                'CREATE INDEX IF NOT EXISTS idx_products_category_brand ON products(category, brand)',
                'CREATE INDEX IF NOT EXISTS idx_products_reseller ON products(resellerName)',
                'CREATE INDEX IF NOT EXISTS idx_products_stock_reorder ON products(stockQuantity, reorderQty)',
                'CREATE INDEX IF NOT EXISTS idx_products_created ON products(createdAt)',
                'CREATE INDEX IF NOT EXISTS idx_products_updated ON products(updatedAt)'
            ];

            for (const indexSQL of indexes) {
                await this.db.execAsync(indexSQL);
            }

            // Update existing products with default values
            const updateDefaultsSQL = `
                UPDATE products SET 
                    reorderQty = CASE 
                        WHEN category = 'food' THEN 20
                        WHEN category = 'electronics' THEN 5
                        WHEN category = 'clothing' THEN 15
                        ELSE 10
                    END,
                    maxBuyQty = CASE
                        WHEN category = 'food' THEN 50
                        WHEN category = 'electronics' THEN 10
                        WHEN category = 'clothing' THEN 25
                        ELSE 100
                    END,
                    minBuyQty = 1,
                    createdAt = COALESCE(createdAt, datetime('now')),
                    updatedAt = COALESCE(updatedAt, datetime('now'))
                WHERE (reorderQty IS NULL OR reorderQty = 0) OR createdAt IS NULL
            `;

            await this.db.execAsync(updateDefaultsSQL);

            await this.markMigrationApplied(version, description);
            console.log(`✅ Migration ${version} applied successfully`);

        } catch (error) {
            console.error(`❌ Failed to apply migration ${version}:`, error);
            throw error;
        }
    }

    /**
     * Run all pending migrations
     */
    async runMigrations(): Promise<void> {
        console.log('🔄 Starting database migrations...');
        
        await this.initializeMigrationTable();
        const appliedMigrations = await this.getAppliedMigrations();
        
        // Define available migrations
        const migrations = [
            { version: '001', handler: () => this.applyMigration001() }
        ];

        // Apply pending migrations
        for (const migration of migrations) {
            if (!appliedMigrations.includes(migration.version)) {
                await migration.handler();
            } else {
                console.log(`⏭️  Migration ${migration.version} already applied, skipping`);
            }
        }

        console.log('✅ All migrations completed');
    }
}
