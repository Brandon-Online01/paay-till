import { create } from 'zustand';
import { 
    Product, 
    ProductMetrics, 
    PaginatedProductResponse, 
    ProductSearchParams,
    ProductReorderAlert 
} from '@/types/inventory.types';
import { ProductService } from '@/@db/product.service';

export type SortOption = 'name' | 'price' | 'category' | 'createdAt' | 'updatedAt' | 'stockQuantity';
export type ViewMode = 'list' | 'cards';

export interface FilterOptions {
    categories: string[];
    brands: string[];
    priceRange: { min: number; max: number };
    inStock: boolean | null; // null = all, true = in stock, false = out of stock
    badge: string[];
    needsReorder: boolean;
}

interface InventoryState {
    // Core data
    products: Product[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    
    // UI state
    metrics: ProductMetrics | null;
    reorderAlerts: ProductReorderAlert[];
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    error: string | null;
    
    // Filter/search state
    searchQuery: string;
    sortBy: SortOption;
    sortOrder: 'asc' | 'desc';
    filters: FilterOptions;
    showFilterModal: boolean;
    selectedProduct: Product | null;
    showProductModal: boolean;
    viewMode: ViewMode;
    
    // Pagination settings
    pageSize: number;
    
    // Cache management
    lastUpdated: string | null;
    cacheKey: string;

    // Actions - Data management
    loadProducts: (params?: Partial<ProductSearchParams>) => Promise<void>;
    loadMoreProducts: () => Promise<void>;
    refreshProducts: () => Promise<void>;
    setProducts: (response: PaginatedProductResponse) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;
    
    // Actions - UI state
    setLoading: (loading: boolean) => void;
    setRefreshing: (refreshing: boolean) => void;
    setLoadingMore: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Actions - Filters and search
    setSearchQuery: (query: string) => void;
    setSortBy: (sort: SortOption, order?: 'asc' | 'desc') => void;
    setFilters: (filters: Partial<FilterOptions>) => void;
    resetFilters: () => void;
    
    // Actions - UI modals and view
    setShowFilterModal: (show: boolean) => void;
    setSelectedProduct: (product: Product | null) => void;
    setShowProductModal: (show: boolean) => void;
    setViewMode: (mode: ViewMode) => void;
    
    // Actions - Cache and utilities
    clearCache: () => void;
    getSearchParams: () => ProductSearchParams;
    loadReorderAlerts: () => Promise<void>;
}

const initialFilters: FilterOptions = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 },
    inStock: null,
    badge: [],
    needsReorder: false,
};

const calculateMetrics = (products: Product[], totalCount: number): ProductMetrics => {
    const totalValue = products.reduce((sum, product) => sum + product.price * (product.stockQuantity || 0), 0);
    const averagePrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;
    const inStockProducts = products.filter((p) => p.inStock !== false && (p.stockQuantity || 0) > 0).length;
    const outOfStockProducts = products.filter((p) => p.inStock === false || (p.stockQuantity || 0) === 0).length;
    const categories = [...new Set(products.map((p) => p.category))].length;

    return {
        totalProducts: totalCount, // Use total count from server, not just loaded products
        totalValue,
        averagePrice,
        inStockProducts,
        outOfStockProducts,
        categories,
    };
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
    // Initial state
    products: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    metrics: null,
    reorderAlerts: [],
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
    error: null,
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    filters: initialFilters,
    showFilterModal: false,
    selectedProduct: null,
    showProductModal: false,
    viewMode: 'list',
    pageSize: 50,
    lastUpdated: null,
    cacheKey: '',

    // Get current search parameters
    getSearchParams: (): ProductSearchParams => {
        const state = get();
        return {
            query: state.searchQuery || undefined,
            category: state.filters.categories.length === 1 ? state.filters.categories[0] : undefined,
            brand: state.filters.brands.length === 1 ? state.filters.brands[0] : undefined,
            minPrice: state.filters.priceRange.min > 0 ? state.filters.priceRange.min : undefined,
            maxPrice: state.filters.priceRange.max > 0 ? state.filters.priceRange.max : undefined,
            inStockOnly: state.filters.inStock === true ? true : undefined,
            page: state.currentPage,
            limit: state.pageSize,
            sortBy: state.sortBy,
            sortOrder: state.sortOrder
        };
    },

    // Load products with pagination
    loadProducts: async (params?: Partial<ProductSearchParams>) => {
        const state = get();
        set({ isLoading: true, error: null });

        try {
            const searchParams: ProductSearchParams = {
                ...state.getSearchParams(),
                ...params,
                page: params?.page || 1 // Reset to page 1 for new searches
            };

            const response = await ProductService.getProductsPaginated(searchParams);
            
            set({
                products: response.products,
                totalCount: response.totalCount,
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                hasNextPage: response.hasNextPage,
                hasPreviousPage: response.hasPreviousPage,
                metrics: calculateMetrics(response.products, response.totalCount),
                lastUpdated: new Date().toISOString(),
                isLoading: false
            });

            console.log(`📦 Loaded ${response.products.length} products (page ${response.currentPage}/${response.totalPages})`);

        } catch (error) {
            console.error('❌ Error loading products:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to load products',
                isLoading: false
            });
        }
    },

    // Load more products (pagination)
    loadMoreProducts: async () => {
        const state = get();
        if (!state.hasNextPage || state.isLoadingMore) return;

        set({ isLoadingMore: true });

        try {
            const searchParams: ProductSearchParams = {
                ...state.getSearchParams(),
                page: state.currentPage + 1
            };

            const response = await ProductService.getProductsPaginated(searchParams);
            
            set({
                products: [...state.products, ...response.products],
                currentPage: response.currentPage,
                hasNextPage: response.hasNextPage,
                hasPreviousPage: response.hasPreviousPage,
                isLoadingMore: false
            });

            console.log(`📦 Loaded ${response.products.length} more products (page ${response.currentPage})`);

        } catch (error) {
            console.error('❌ Error loading more products:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to load more products',
                isLoadingMore: false
            });
        }
    },

    // Refresh current data
    refreshProducts: async () => {
        const state = get();
        set({ isRefreshing: true });
        
        try {
            await state.loadProducts({ page: 1 });
            await state.loadReorderAlerts();
            console.log('🔄 Products refreshed successfully');
        } catch (error) {
            console.error('❌ Error refreshing products:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to refresh products' });
        } finally {
            set({ isRefreshing: false });
        }
    },

    // Load reorder alerts
    loadReorderAlerts: async () => {
        try {
            const alerts = await ProductService.getReorderAlerts();
            set({ reorderAlerts: alerts });
            console.log(`⚠️  Found ${alerts.length} products needing reorder`);
        } catch (error) {
            console.error('❌ Error loading reorder alerts:', error);
        }
    },

    // Set products from paginated response
    setProducts: (response: PaginatedProductResponse) => {
        set({
            products: response.products,
            totalCount: response.totalCount,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPreviousPage: response.hasPreviousPage,
            metrics: calculateMetrics(response.products, response.totalCount),
            lastUpdated: new Date().toISOString()
        });
    },

    // Add new product
    addProduct: (product: Product) => {
        set(state => ({
            products: [product, ...state.products],
            totalCount: state.totalCount + 1,
            metrics: calculateMetrics([product, ...state.products], state.totalCount + 1)
        }));
    },

    // Update existing product
    updateProduct: (updatedProduct: Product) => {
        set(state => {
            const products = state.products.map(p => 
                p.id === updatedProduct.id ? updatedProduct : p
            );
            return {
                products,
                metrics: calculateMetrics(products, state.totalCount)
            };
        });
    },

    // Remove product
    removeProduct: (productId: string) => {
        set(state => {
            const products = state.products.filter(p => p.id !== productId);
            return {
                products,
                totalCount: Math.max(0, state.totalCount - 1),
                metrics: calculateMetrics(products, Math.max(0, state.totalCount - 1))
            };
        });
    },

    // UI state actions
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setRefreshing: (refreshing: boolean) => set({ isRefreshing: refreshing }),
    setLoadingMore: (loading: boolean) => set({ isLoadingMore: loading }),
    setError: (error: string | null) => set({ error }),

    // Search and filter actions
    setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
        // Automatically trigger search after a short delay
        const state = get();
        setTimeout(() => {
            if (state.searchQuery === query) {
                state.loadProducts();
            }
        }, 300);
    },

    setSortBy: (sort: SortOption, order: 'asc' | 'desc' = 'asc') => {
        set({ sortBy: sort, sortOrder: order, currentPage: 1 });
        get().loadProducts();
    },

    setFilters: (newFilters: Partial<FilterOptions>) => {
        set(state => ({ 
            filters: { ...state.filters, ...newFilters },
            currentPage: 1 
        }));
        get().loadProducts();
    },

    resetFilters: () => {
        set({ filters: initialFilters, currentPage: 1 });
        get().loadProducts();
    },

    // Modal and view actions
    setShowFilterModal: (show: boolean) => set({ showFilterModal: show }),
    setSelectedProduct: (product: Product | null) => set({ selectedProduct: product }),
    setShowProductModal: (show: boolean) => set({ showProductModal: show }),
    setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

    // Cache management
    clearCache: () => {
        ProductService.clearCache();
        set({ lastUpdated: null, cacheKey: '' });
        console.log('🧹 Product cache cleared');
    }
}));