import { databaseService } from './database';
import { TransactionService } from './transaction.service';
import { ProductService } from './product.service';
import { ProductMigration } from './migrations/migrate-products';

/**
 * Consolidated database initialization service
 * Handles all database setup, migrations, and service initialization
 */
export class DatabaseInitService {
    private static initialized = false;
    private static initializationPromise: Promise<void> | null = null;

    /**
     * Initialize all database services and run migrations
     * This should be called once when the app starts
     */
    static async initializeAll(options?: {
        runMigrations?: boolean;
        forceMigrations?: boolean;
    }): Promise<void> {
        // If already initialized, return early
        if (this.initialized) {
            console.log('✅ Database already initialized');
            return;
        }

        // If initialization is in progress, wait for it
        if (this.initializationPromise) {
            console.log('⏳ Database initialization in progress, waiting...');
            return this.initializationPromise;
        }

        // Start initialization
        this.initializationPromise = this._performInitialization(options);

        try {
            await this.initializationPromise;
            this.initialized = true;
            console.log('✅ All database services initialized successfully');
        } catch (error) {
            this.initializationPromise = null; // Reset on error
            throw error;
        }
    }

    /**
     * Perform the actual initialization
     */
    private static async _performInitialization(options?: {
        runMigrations?: boolean;
        forceMigrations?: boolean;
    }): Promise<void> {
        const startTime = Date.now();

        try {
            // Step 1: Core database
            await databaseService.initialize();

            // Step 2: Schema migrations  
            const { MigrationManager } = await import('./migration-manager');
            const db = databaseService.getDb();
            const migrationManager = new MigrationManager(db);
            await migrationManager.runMigrations();

            // Step 2.5: Advanced indexes
            await databaseService.createAdvancedIndexes();

            // Step 3: Transaction service
            await TransactionService.initialize();

            // Step 4: Product service
            await ProductService.initialize();

            // Step 5: Data migrations (only if explicitly requested)
            if (options?.runMigrations === true) {
                try {
                    const migrationType = options?.forceMigrations ? 'FORCE' : 'NORMAL';
                    if (options?.forceMigrations) {
                        await ProductMigration.forceMigration();
                    } else {
                        await ProductMigration.runMigration();
                    }
                } catch (migrationError) {
                    // Silent handling - data already exists
                }
            }

            // Step 6: Final status - single line
            const duration = Date.now() - startTime;
            await this.showCompactStatus();
            console.log(`📊 Database Ready: Products=${await this.getProductCount()} | Transactions=${await this.getTransactionCount()} | Ready in ${duration}ms`);
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Database initialization failed: ${errorMessage}`);
        }
    }

    /**
     * Force re-initialization (useful for development/testing)
     */
    static async reinitialize(options?: {
        runMigrations?: boolean;
        forceMigrations?: boolean;
    }): Promise<void> {
        console.log('🔄 Force re-initializing database...');
        this.initialized = false;
        this.initializationPromise = null;
        await this.initializeAll(options);
    }

    /**
     * Show compact database status (for initialization)
     */
    static async showCompactStatus(): Promise<void> {
        try {
            const [productStats, transactionStats] = await Promise.all([
                ProductService.getProductStats(),
                TransactionService.getTransactionStats()
            ]);

            console.log(`📊 DB Status: Products=${productStats.totalProducts} (${productStats.inStockProducts} in-stock) | Transactions=${transactionStats.totalTransactions} | Value=R${productStats.totalValue.toFixed(0)}`);
        } catch (error) {
            console.log('📊 DB Status: Unable to load statistics');
        }
    }

    /**
     * Show detailed database status (full version) - Only when explicitly requested
     */
    static async showStatus(): Promise<void> {
        // This method is kept for manual debugging but not used in normal flow
        try {
            const productStats = await ProductService.getProductStats();
            const transactionStats = await TransactionService.getTransactionStats();
            
            console.log('📊 Database Status:');
            console.log(`  📦 Products: ${productStats.totalProducts} (${productStats.inStockProducts} in stock)`);
            console.log(`  💳 Transactions: ${transactionStats.totalTransactions} (R${transactionStats.totalAmount.toFixed(2)} total)`);
        } catch (error) {
            console.error('❌ Failed to get database status:', error);
        }
    }

    /**
     * Get product count for compact status
     */
    private static async getProductCount(): Promise<number> {
        try {
            const stats = await ProductService.getProductStats();
            return stats.totalProducts;
        } catch {
            return 0;
        }
    }

    /**
     * Get transaction count for compact status
     */
    private static async getTransactionCount(): Promise<number> {
        try {
            const stats = await TransactionService.getTransactionStats();
            return stats.totalTransactions;
        } catch {
            return 0;
        }
    }

    /**
     * Check if database is initialized
     */
    static getInitializationStatus(): boolean {
        return this.initialized;
    }

    /**
     * Run specific migrations
     */
    static async runMigrations(force = false): Promise<void> {
        console.log('🔄 Running database migrations...');

        try {
            if (force) {
                await ProductMigration.forceMigration();
            } else {
                await ProductMigration.runMigration();
            }
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }

    /**
     * Clear all data (for development/testing)
     */
    static async clearAllData(): Promise<void> {
        console.log('🗑️ Clearing all database data...');

        try {
            await ProductMigration.clearProducts();
            console.log('✅ All data cleared');
        } catch (error) {
            console.error('❌ Failed to clear data:', error);
            throw error;
        }
    }

    /**
     * Reset database (clear + reinitialize + migrate)
     */
    static async resetDatabase(): Promise<void> {
        console.log('🔄 Resetting database...');

        try {
            // Clear existing data
            await this.clearAllData();

            // Reinitialize with fresh data
            await this.reinitialize({
                runMigrations: true,
                forceMigrations: true,
            });

            console.log('✅ Database reset completed');
        } catch (error) {
            console.error('❌ Database reset failed:', error);
            throw error;
        }
    }

    /**
     * Health check for all database services
     */
    static async healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        services: {
            database: boolean;
            products: boolean;
            transactions: boolean;
        };
        error?: string;
    }> {
        try {
            // Test basic database connection
            await ProductService.getProducts({ limit: 1 });
            await TransactionService.getTransactions({ limit: 1 });

            return {
                status: 'healthy',
                services: {
                    database: true,
                    products: true,
                    transactions: true,
                },
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                services: {
                    database: false,
                    products: false,
                    transactions: false,
                },
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}

/**
 * Convenience function for app initialization
 * Call this in your app's main initialization
 */
export async function initializeDatabase(options?: {
    runMigrations?: boolean;
    forceMigrations?: boolean;
    showStatus?: boolean;
}): Promise<void> {
    await DatabaseInitService.initializeAll({
        runMigrations: options?.runMigrations === true, // Only run if explicitly requested
        forceMigrations: options?.forceMigrations || false,
    });

    // Only show detailed status if explicitly requested
    if (options?.showStatus === true) {
        await DatabaseInitService.showStatus();
    }
}

// DatabaseInitService already exported above
