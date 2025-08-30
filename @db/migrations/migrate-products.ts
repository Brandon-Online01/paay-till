import { ProductService } from '../product.service';
import { Product } from '../../types/inventory.types';
import productsData from '../../data/products.json';

/**
 * Migration script to import products from JSON to database
 */
export class ProductMigration {
    /**
     * Run the migration to import products from JSON to database
     */
    static async runMigration(): Promise<void> {
        try {
            // Initialize the database
            await ProductService.initialize();

            // Check if products already exist
            const existingProducts = await ProductService.getProducts();
            if (existingProducts.length > 0) {
                return; // Migration not needed
            }

            // Transform JSON products to match our Product interface
            const products: (Omit<Product, 'id'> & { id?: string })[] =
                productsData.map((item: any) => ({
                    id: item.id, // Keep original IDs from JSON
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    image: item.image,
                    description: item.description,
                    badge: item.badge,
                    variants: item.variants,
                    inStock: true, // Default to in stock
                    stockQuantity: Math.floor(Math.random() * 100) + 1, // Random stock for demo
                }));

            console.log(`📦 Found ${products.length} products to migrate`);

            // Bulk import products
            const importedCount = await ProductService.bulkImportProducts(products);
            
            console.log(`  ✅ Migration Complete (${importedCount}/${products.length} products)`);

            // Verify migration
            const verificationProducts = await ProductService.getProducts();
            console.log(
                `🔍 Verification: Database now contains ${verificationProducts.length} products`
            );

            // Show product statistics
            const stats = await ProductService.getProductStats();
            console.log('📊 Product Statistics:');
            console.log(`   - Total Products: ${stats.totalProducts}`);
            console.log(`   - Categories: ${stats.categories}`);
            console.log(`   - Total Value: R${stats.totalValue.toFixed(2)}`);
            console.log(
                `   - Average Price: R${stats.averagePrice.toFixed(2)}`
            );
            console.log(`   - In Stock: ${stats.inStockProducts}`);
            console.log(`   - Out of Stock: ${stats.outOfStockProducts}`);
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }

    /**
     * Force migration - overwrite existing products
     */
    static async forceMigration(): Promise<void> {
        console.log('🔄 Starting FORCE migration from JSON to database...');
        console.log('⚠️ This will overwrite existing products!');

        try {
            // Initialize the database
            await ProductService.initialize();

            // Transform JSON products to match our Product interface
            const products: (Omit<Product, 'id'> & { id?: string })[] =
                productsData.map((item: any) => ({
                    id: item.id, // Keep original IDs from JSON
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    image: item.image,
                    description: item.description,
                    badge: item.badge,
                    variants: item.variants,
                    inStock: true, // Default to in stock
                    stockQuantity: Math.floor(Math.random() * 100) + 1, // Random stock for demo
                }));

            console.log(`📦 Found ${products.length} products to migrate`);

            // Bulk import products (this will replace existing ones with same IDs)
            const importedCount =
                await ProductService.bulkImportProducts(products);

            console.log(`✅ Force migration completed successfully!`);
            console.log(`   - Total products processed: ${products.length}`);
            console.log(`   - Successfully imported/updated: ${importedCount}`);

            // Verify migration
            const verificationProducts = await ProductService.getProducts();
            console.log(
                `🔍 Verification: Database now contains ${verificationProducts.length} products`
            );
        } catch (error) {
            console.error('❌ Force migration failed:', error);
            throw error;
        }
    }

    /**
     * Clear all products from database
     */
    static async clearProducts(): Promise<void> {
        console.log('🗑️ Clearing all products from database...');

        try {
            await ProductService.initialize();

            const existingProducts = await ProductService.getProducts();
            console.log(`Found ${existingProducts.length} products to delete`);

            let deletedCount = 0;
            for (const product of existingProducts) {
                const deleted = await ProductService.deleteProduct(product.id);
                if (deleted) deletedCount++;
            }

            console.log(`✅ Cleared ${deletedCount} products from database`);
        } catch (error) {
            console.error('❌ Failed to clear products:', error);
            throw error;
        }
    }

    /**
     * Show current database status
     */
    static async showStatus(): Promise<void> {
        console.log('📊 Database Status:');

        try {
            await ProductService.initialize();

            const products = await ProductService.getProducts();
            const stats = await ProductService.getProductStats();
            const categories = await ProductService.getProductCategories();

            console.log(`\n📦 Products: ${products.length} total`);
            console.log(`💰 Total Value: R${stats.totalValue.toFixed(2)}`);
            console.log(`📊 Average Price: R${stats.averagePrice.toFixed(2)}`);
            console.log(`✅ In Stock: ${stats.inStockProducts}`);
            console.log(`❌ Out of Stock: ${stats.outOfStockProducts}`);

            console.log(`\n🏷️ Categories (${categories.length}):`);
            categories.forEach((cat) => {
                console.log(`   - ${cat.category}: ${cat.count} products`);
            });

            if (products.length > 0) {
                console.log(`\n🏪 Sample Products:`);
                products.slice(0, 5).forEach((product) => {
                    console.log(
                        `   - ${product.name} (${product.category}) - R${product.price.toFixed(2)}`
                    );
                });
                if (products.length > 5) {
                    console.log(`   ... and ${products.length - 5} more`);
                }
            }
        } catch (error) {
            console.error('❌ Failed to get database status:', error);
            throw error;
        }
    }
}

// CLI interface for running migrations
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'migrate';

    (async () => {
        try {
            switch (command) {
                case 'migrate':
                    await ProductMigration.runMigration();
                    break;
                case 'force':
                    await ProductMigration.forceMigration();
                    break;
                case 'clear':
                    await ProductMigration.clearProducts();
                    break;
                case 'status':
                    await ProductMigration.showStatus();
                    break;
                default:
                    console.log(
                        'Usage: npm run migrate-products [migrate|force|clear|status]'
                    );
                    console.log(
                        '  migrate - Import products from JSON (skip if products exist)'
                    );
                    console.log(
                        '  force   - Force import products from JSON (overwrite existing)'
                    );
                    console.log('  clear   - Clear all products from database');
                    console.log('  status  - Show current database status');
            }
        } catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }
    })();
}
