import { databaseService } from './database';
import { 
    Product, 
    PaginatedProductResponse, 
    ProductSearchParams, 
    ProductAnalytics, 
    ProductReorderAlert 
} from '../types/inventory.types';
import { ProductCacheManager } from './product-cache';
import { MigrationManager } from './migration-manager';

/**
 * Enhanced Product Service with caching and pagination
 * Provides high-performance product operations with intelligent caching
 */
export class ProductService {
    private static cacheManager = ProductCacheManager.getInstance();

    /**
     * Initialize the product service (migrations should already be run)
     */
    static async initialize(): Promise<void> {
        try {
            // Database should already be initialized with proper schema
            // Just verify we have a connection
            databaseService.getDb();
            
            // Preload common queries for better performance
            setTimeout(() => {
                this.cacheManager.preloadCommonQueries(this);
            }, 1000);
            
        } catch (error) {
            console.error('❌ ProductService initialization failed:', error);
            throw error;
        }
    }

    /**
     * Get products with pagination and caching
     */
    static async getProductsPaginated(params: ProductSearchParams = {}): Promise<PaginatedProductResponse> {
        // Set defaults
        const searchParams: ProductSearchParams = {
            page: 1,
            limit: 50,
            sortBy: 'name',
            sortOrder: 'asc',
            ...params
        };

        // Check cache first
        const cachedResult = this.cacheManager.getCachedProducts(searchParams);
        if (cachedResult) {
            const totalPages = Math.ceil(cachedResult.totalCount / (searchParams.limit || 50));
            return {
                products: cachedResult.data,
                totalCount: cachedResult.totalCount,
                currentPage: searchParams.page || 1,
                totalPages,
                hasNextPage: (searchParams.page || 1) < totalPages,
                hasPreviousPage: (searchParams.page || 1) > 1
            };
        }

        // Fetch from database
        try {
            const offset = ((searchParams.page || 1) - 1) * (searchParams.limit || 50);
            
            let whereClause = 'WHERE 1=1';
            let params: any[] = [];

            // Build dynamic query
            if (searchParams.query) {
                whereClause += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)';
                const queryPattern = `%${searchParams.query}%`;
                params.push(queryPattern, queryPattern, queryPattern);
            }

            if (searchParams.category) {
                whereClause += ' AND category = ?';
                params.push(searchParams.category);
            }

            if (searchParams.brand) {
                whereClause += ' AND brand = ?';
                params.push(searchParams.brand);
            }

            if (searchParams.minPrice !== undefined) {
                whereClause += ' AND price >= ?';
                params.push(searchParams.minPrice);
            }

            if (searchParams.maxPrice !== undefined) {
                whereClause += ' AND price <= ?';
                params.push(searchParams.maxPrice);
            }

            if (searchParams.inStockOnly) {
                whereClause += ' AND inStock = 1 AND stockQuantity > 0';
            }

            const orderClause = `ORDER BY ${searchParams.sortBy} ${searchParams.sortOrder?.toUpperCase()}`;
            const limitClause = `LIMIT ? OFFSET ?`;

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
            const countResult = await databaseService.getDb().getFirstAsync(countQuery, params);
            const totalCount = (countResult as any)?.total || 0;

            // Get products
            const query = `
                SELECT id, name, category, price, image, description, badge, variants,
                       inStock, stockQuantity, barcode, qrCode, reorderQty, maxBuyQty,
                       minBuyQty, resellerName, brand, information, createdAt, updatedAt
                FROM products 
                ${whereClause} 
                ${orderClause} 
                ${limitClause}
            `;

            params.push(searchParams.limit, offset);
            const rows = await databaseService.getDb().getAllAsync(query, params);

            const products: Product[] = rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                category: row.category,
                price: row.price,
                image: row.image,
                description: row.description,
                badge: row.badge,
                variants: row.variants ? JSON.parse(row.variants) : undefined,
                inStock: Boolean(row.inStock),
                stockQuantity: row.stockQuantity || 0,
                barcode: row.barcode,
                qrCode: row.qrCode,
                reorderQty: row.reorderQty,
                maxBuyQty: row.maxBuyQty,
                minBuyQty: row.minBuyQty,
                resellerName: row.resellerName,
                brand: row.brand,
                information: row.information,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            }));

            // Cache the results
            this.cacheManager.cacheProducts(searchParams, products, totalCount);

            const totalPages = Math.ceil(totalCount / (searchParams.limit || 50));
            
            return {
                products,
                totalCount,
                currentPage: searchParams.page || 1,
                totalPages,
                hasNextPage: (searchParams.page || 1) < totalPages,
                hasPreviousPage: (searchParams.page || 1) > 1
            };

        } catch (error) {
            console.error('❌ Error fetching paginated products:', error);
            throw error;
        }
    }

    /**
     * Legacy method for backward compatibility
     */
    static async getProducts(filters?: {
        category?: string;
        inStock?: boolean;
        searchQuery?: string;
        limit?: number;
        offset?: number;
    }): Promise<Product[]> {
        const searchParams: ProductSearchParams = {
            category: filters?.category,
            inStockOnly: filters?.inStock,
            query: filters?.searchQuery,
            limit: filters?.limit || 50,
            page: filters?.offset ? Math.floor(filters.offset / (filters.limit || 50)) + 1 : 1
        };

        const result = await this.getProductsPaginated(searchParams);
        return result.products;
    }

    /**
     * Get product by ID with caching
     */
    static async getProductById(id: string): Promise<Product> {
        return await databaseService.getProductById(id);
    }

    /**
     * Create a new product
     */
    static async createProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
        const now = new Date().toISOString();
        const enhancedProduct = {
            ...product,
            createdAt: now,
            updatedAt: now,
            reorderQty: product.reorderQty || 10,
            maxBuyQty: product.maxBuyQty || 100,
            minBuyQty: product.minBuyQty || 1
        };

        const result = await databaseService.createProduct(enhancedProduct);
        
        // Invalidate cache
        this.cacheManager.invalidateProductCache(result.id, result.category, result.brand);
        
        return result;
    }

    /**
     * Update product
     */
    static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
        const enhancedUpdates = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const result = await databaseService.updateProduct(id, enhancedUpdates);
        
        // Invalidate cache
        this.cacheManager.invalidateProductCache(id, result.category, result.brand);
        
        return result;
    }

    /**
     * Delete product
     */
    static async deleteProduct(id: string): Promise<void> {
        const product = await this.getProductById(id);
        await databaseService.deleteProduct(id);
        
        // Invalidate cache
        this.cacheManager.invalidateProductCache(id, product.category, product.brand || undefined);
    }

    /**
     * Search products by name/description
     */
    static async searchProducts(query: string, limit = 50): Promise<Product[]> {
        const result = await this.getProductsPaginated({
            query,
            limit,
            page: 1
        });
        return result.products;
    }

    /**
     * Get products by category with caching
     */
    static async getProductsByCategory(category: string, limit = 50): Promise<Product[]> {
        const result = await this.getProductsPaginated({
            category,
            limit,
            page: 1
        });
        return result.products;
    }

    /**
     * Get products by brand
     */
    static async getProductsByBrand(brand: string, limit = 50): Promise<Product[]> {
        const result = await this.getProductsPaginated({
            brand,
            limit,
            page: 1
        });
        return result.products;
    }

    /**
     * Get products that need reordering
     */
    static async getReorderAlerts(): Promise<ProductReorderAlert[]> {
        try {
            const query = `
                SELECT id, name, category, price, stockQuantity, reorderQty, brand, image
                FROM products 
                WHERE stockQuantity <= reorderQty AND inStock = 1
                ORDER BY (stockQuantity - reorderQty) ASC
            `;

            const rows = await databaseService.getDb().getAllAsync(query);
            
            return rows.map((row: any) => ({
                product: {
                    id: row.id,
                    name: row.name,
                    category: row.category,
                    price: row.price,
                    brand: row.brand,
                    image: row.image,
                    stockQuantity: row.stockQuantity,
                    reorderQty: row.reorderQty
                } as Product,
                currentStock: row.stockQuantity,
                reorderLevel: row.reorderQty,
                suggested: Math.max(row.reorderQty * 2, 50) // Suggest 2x reorder qty or minimum 50
            }));

        } catch (error) {
            console.error('❌ Error fetching reorder alerts:', error);
            return [];
        }
    }

    // Removed duplicate - using the version at line 504 that calls databaseService

    /**
     * Clear product cache
     */
    static clearCache(): void {
        this.cacheManager.clearCache();
    }

    /**
     * Get cache statistics
     */
    static getCacheStats() {
        return this.cacheManager.getCacheStats();
    }

    /**
     * Get product by barcode
     */
    static async getProductByBarcode(barcode: string): Promise<Product | null> {
        try {
            const query = 'SELECT * FROM products WHERE barcode = ? LIMIT 1';
            const row = await databaseService.getDb().getFirstAsync(query, [barcode]);
            
            if (!row) return null;

            return this.mapRowToProduct(row);
        } catch (error) {
            console.error('❌ Error fetching product by barcode:', error);
            return null;
        }
    }

    /**
     * Get product by QR code
     */
    static async getProductByQRCode(qrCode: string): Promise<Product | null> {
        try {
            const query = 'SELECT * FROM products WHERE qrCode = ? LIMIT 1';
            const row = await databaseService.getDb().getFirstAsync(query, [qrCode]);
            
            if (!row) return null;

            return this.mapRowToProduct(row);
        } catch (error) {
            console.error('❌ Error fetching product by QR code:', error);
            return null;
        }
    }

    /**
     * Bulk import products - for data migration
     */
    static async bulkImportProducts(products: (Omit<Product, 'id'> & { id?: string })[]): Promise<number> {
        let importedCount = 0;
        
        try {
            const db = databaseService.getDb();
            
            // Use a transaction for better performance
            await db.runAsync('BEGIN TRANSACTION');
            
            for (const product of products) {
                try {
                    await this.createProduct(product);
                    importedCount++;
                } catch (error) {
                    console.warn(`⚠️ Skipping product ${product.name}: ${error}`);
                }
            }
            
            await db.runAsync('COMMIT');
            
            // Clear cache after bulk import
            this.cacheManager.clearCache();
            
            return importedCount;
            
        } catch (error) {
            try {
                await databaseService.getDb().runAsync('ROLLBACK');
            } catch (rollbackError) {
                console.error('❌ Rollback failed:', rollbackError);
            }
            console.error('❌ Bulk import failed:', error);
            throw error;
        }
    }

    /**
     * Get product statistics
     */
    static async getProductStats(): Promise<{
        totalProducts: number;
        inStockProducts: number;
        outOfStockProducts: number;
        totalValue: number;
        averagePrice: number;
        categories: number;
        lowStockCount: number;
    }> {
        try {
            const db = databaseService.getDb();
            
            // Get basic stats
            const basicStatsQuery = `
                SELECT 
                    COUNT(*) as totalProducts,
                    COUNT(CASE WHEN inStock = 1 AND stockQuantity > 0 THEN 1 END) as inStockProducts,
                    COUNT(CASE WHEN inStock = 0 OR stockQuantity = 0 THEN 1 END) as outOfStockProducts,
                    SUM(price * stockQuantity) as totalValue,
                    AVG(price) as averagePrice,
                    COUNT(CASE WHEN stockQuantity <= reorderQty THEN 1 END) as lowStockCount
                FROM products
            `;
            
            const basicStats = await db.getFirstAsync(basicStatsQuery);
            
            // Get unique categories count
            const categoryQuery = 'SELECT COUNT(DISTINCT category) as categories FROM products';
            const categoryStats = await db.getFirstAsync(categoryQuery);
            
            return {
                totalProducts: (basicStats as any)?.totalProducts || 0,
                inStockProducts: (basicStats as any)?.inStockProducts || 0,
                outOfStockProducts: (basicStats as any)?.outOfStockProducts || 0,
                totalValue: (basicStats as any)?.totalValue || 0,
                averagePrice: (basicStats as any)?.averagePrice || 0,
                categories: (categoryStats as any)?.categories || 0,
                lowStockCount: (basicStats as any)?.lowStockCount || 0
            };
            
        } catch (error) {
            console.error('❌ Error getting product stats:', error);
            return {
                totalProducts: 0,
                inStockProducts: 0,
                outOfStockProducts: 0,
                totalValue: 0,
                averagePrice: 0,
                categories: 0,
                lowStockCount: 0
            };
        }
    }

    /**
     * Get product analytics from transaction data
     */
    static async getProductAnalytics(productId: string): Promise<{
        totalSold: number;
        totalRevenue: number;
        averageOrderValue: number;
        lastSold?: string;
    }> {
        try {
            return await databaseService.getProductAnalyticsFromTransactions(productId);
        } catch (error) {
            console.error('❌ Error fetching product analytics:', error);
            // Return default values instead of throwing
            return {
                totalSold: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
            };
        }
    }

    /**
     * Helper method to map database row to Product object
     */
    private static mapRowToProduct(row: any): Product {
        return {
            id: row.id,
            name: row.name,
            category: row.category,
            price: row.price,
            image: row.image,
            description: row.description,
            badge: row.badge,
            variants: row.variants ? JSON.parse(row.variants) : undefined,
            inStock: Boolean(row.inStock),
            stockQuantity: row.stockQuantity || 0,
            barcode: row.barcode,
            qrCode: row.qrCode,
            reorderQty: row.reorderQty,
            maxBuyQty: row.maxBuyQty,
            minBuyQty: row.minBuyQty,
            resellerName: row.resellerName,
            brand: row.brand,
            information: row.information,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        };
    }
}