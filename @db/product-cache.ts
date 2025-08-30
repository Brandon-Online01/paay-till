import { Product, ProductCache, ProductCacheEntry, ProductSearchParams } from '@/types/inventory.types';

/**
 * Product Cache Manager
 * Handles intelligent caching of product data with pagination support
 */
export class ProductCacheManager {
    private static instance: ProductCacheManager;
    private cache: ProductCache = {};
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    private readonly MAX_CACHE_SIZE = 100; // Maximum number of cache entries

    private constructor() {}

    public static getInstance(): ProductCacheManager {
        if (!ProductCacheManager.instance) {
            ProductCacheManager.instance = new ProductCacheManager();
        }
        return ProductCacheManager.instance;
    }

    /**
     * Generate cache key from search parameters
     */
    private generateCacheKey(params: ProductSearchParams): string {
        const keyParts: string[] = [];
        
        if (params.query) keyParts.push(`q:${params.query}`);
        if (params.category) keyParts.push(`cat:${params.category}`);
        if (params.brand) keyParts.push(`brand:${params.brand}`);
        if (params.minPrice !== undefined) keyParts.push(`minP:${params.minPrice}`);
        if (params.maxPrice !== undefined) keyParts.push(`maxP:${params.maxPrice}`);
        if (params.inStockOnly) keyParts.push('inStock:true');
        if (params.page) keyParts.push(`p:${params.page}`);
        if (params.limit) keyParts.push(`l:${params.limit}`);
        if (params.sortBy) keyParts.push(`sort:${params.sortBy}`);
        if (params.sortOrder) keyParts.push(`order:${params.sortOrder}`);

        return keyParts.join('|') || 'default';
    }

    /**
     * Check if cache entry is valid (not expired)
     */
    private isValidCacheEntry(entry: ProductCacheEntry): boolean {
        const now = Date.now();
        return (now - entry.timestamp) < this.CACHE_DURATION;
    }

    /**
     * Get cached products if available and valid
     */
    public getCachedProducts(params: ProductSearchParams): ProductCacheEntry | null {
        const cacheKey = this.generateCacheKey(params);
        const entry = this.cache[cacheKey];

        if (entry && this.isValidCacheEntry(entry)) {
            // Compact cache hit logging only for debugging
            return entry;
        }

        if (entry) {
            // Remove expired entry
            delete this.cache[cacheKey];
        }

        return null;
    }

    /**
     * Cache products with search parameters
     */
    public cacheProducts(params: ProductSearchParams, products: Product[], totalCount: number): void {
        const cacheKey = this.generateCacheKey(params);

        // Manage cache size
        if (Object.keys(this.cache).length >= this.MAX_CACHE_SIZE) {
            this.cleanupOldEntries();
        }

        const entry: ProductCacheEntry = {
            data: products,
            timestamp: Date.now(),
            totalCount,
            searchParams: { ...params }
        };

        this.cache[cacheKey] = entry;
    }

    /**
     * Remove expired cache entries
     */
    private cleanupOldEntries(): void {
        const now = Date.now();
        const expiredKeys: string[] = [];

        for (const [key, entry] of Object.entries(this.cache)) {
            if ((now - entry.timestamp) >= this.CACHE_DURATION) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => delete this.cache[key]);
        
        // If still too many entries, remove oldest ones
        const allKeys = Object.keys(this.cache);
        if (allKeys.length >= this.MAX_CACHE_SIZE) {
            const sortedEntries = Object.entries(this.cache)
                .sort(([, a], [, b]) => a.timestamp - b.timestamp);
            
            const toRemove = sortedEntries.slice(0, Math.floor(this.MAX_CACHE_SIZE / 2));
            toRemove.forEach(([key]) => delete this.cache[key]);
            
            console.log(`🧹 Cleaned up ${expiredKeys.length + toRemove.length} old cache entries`);
        }
    }

    /**
     * Invalidate cache entries that might be affected by product updates
     */
    public invalidateProductCache(productId?: string, category?: string, brand?: string): void {
        const keysToInvalidate: string[] = [];

        for (const [key, entry] of Object.entries(this.cache)) {
            // Invalidate general queries or specific category/brand queries
            if (!entry.searchParams.query && !entry.searchParams.category && !entry.searchParams.brand) {
                // General product lists
                keysToInvalidate.push(key);
            } else if (category && entry.searchParams.category === category) {
                // Category-specific queries
                keysToInvalidate.push(key);
            } else if (brand && entry.searchParams.brand === brand) {
                // Brand-specific queries
                keysToInvalidate.push(key);
            } else if (productId && entry.data.some(p => p.id === productId)) {
                // Queries containing the specific product
                keysToInvalidate.push(key);
            }
        }

        keysToInvalidate.forEach(key => delete this.cache[key]);
        console.log(`🗑️  Invalidated ${keysToInvalidate.length} cache entries`);
    }

    /**
     * Clear all cached products
     */
    public clearCache(): void {
        const count = Object.keys(this.cache).length;
        this.cache = {};
        console.log(`🧹 Cleared all ${count} cache entries`);
    }

    /**
     * Get cache statistics
     */
    public getCacheStats(): { size: number; entries: { key: string; count: number; age: number }[] } {
        const now = Date.now();
        const entries = Object.entries(this.cache).map(([key, entry]) => ({
            key,
            count: entry.data.length,
            age: Math.floor((now - entry.timestamp) / 1000) // Age in seconds
        }));

        return {
            size: Object.keys(this.cache).length,
            entries
        };
    }

    /**
     * Preload commonly used product queries for faster access
     */
    public async preloadCommonQueries(productService: any): Promise<void> {
        const commonQueries: ProductSearchParams[] = [
            { page: 1, limit: 50, sortBy: 'name', sortOrder: 'asc' }, // Default view
            { page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }, // Recent products
            { category: 'electronics', page: 1, limit: 50 },
            { category: 'food', page: 1, limit: 50 },
            { inStockOnly: true, page: 1, limit: 50 }
        ];

        try {
            let preloaded = 0;
            await Promise.all(
                commonQueries.map(async (params) => {
                    if (!this.getCachedProducts(params)) {
                        await productService.getProductsPaginated(params);
                        preloaded++;
                    }
                })
            );
            console.log(`  ✅ Cache Preloaded (${preloaded} queries)`);
        } catch (error) {
            console.log('  ⚠️ Cache Preload (partial failure)');
        }
    }
}
