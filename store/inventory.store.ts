import { create } from 'zustand';
import { Product, ProductMetrics } from '@/types/inventory.types';

export type SortOption = 'name' | 'price' | 'category' | 'recent';

export interface FilterOptions {
    categories: string[];
    priceRange: { min: number; max: number };
    inStock: boolean | null; // null = all, true = in stock, false = out of stock
    badge: string[];
}

interface InventoryState {
    products: Product[];
    filteredProducts: Product[];
    metrics: ProductMetrics | null;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    searchQuery: string;
    sortBy: SortOption;
    filters: FilterOptions;
    showFilterModal: boolean;
    selectedProduct: Product | null;
    showProductModal: boolean;
    lastUpdated: string | null;
    
    // Actions
    setProducts: (products: Product[]) => void;
    setLoading: (loading: boolean) => void;
    setRefreshing: (refreshing: boolean) => void;
    setError: (error: string | null) => void;
    setSearchQuery: (query: string) => void;
    setSortBy: (sort: SortOption) => void;
    setFilters: (filters: FilterOptions) => void;
    setShowFilterModal: (show: boolean) => void;
    setSelectedProduct: (product: Product | null) => void;
    setShowProductModal: (show: boolean) => void;
    clearCache: () => void;
    refreshData: () => Promise<void>;
}

const initialFilters: FilterOptions = {
    categories: [],
    priceRange: { min: 0, max: 0 },
    inStock: null,
    badge: [],
};

const calculateMetrics = (products: Product[]): ProductMetrics => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + product.price, 0);
    const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;
    const inStockProducts = products.filter(p => p.inStock !== false).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    const categories = [...new Set(products.map(p => p.category))].length;
    
    return {
        totalProducts,
        totalValue,
        averagePrice,
        inStockProducts,
        outOfStockProducts,
        categories,
    };
};

const filterProducts = (
    products: Product[],
    searchQuery: string,
    filters: FilterOptions,
    sortBy: SortOption
): Product[] => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
    }

    // Category filter
    if (filters.categories.length > 0) {
        filtered = filtered.filter(product =>
            filters.categories.includes(product.category)
        );
    }

    // Price range filter
    if (filters.priceRange.max > 0) {
        filtered = filtered.filter(product =>
            product.price >= filters.priceRange.min &&
            product.price <= filters.priceRange.max
        );
    }

    // Stock filter
    if (filters.inStock !== null) {
        filtered = filtered.filter(product =>
            filters.inStock ? product.inStock !== false : product.inStock === false
        );
    }

    // Badge filter
    if (filters.badge.length > 0) {
        filtered = filtered.filter(product =>
            product.badge && filters.badge.includes(product.badge)
        );
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price':
                return a.price - b.price;
            case 'category':
                return a.category.localeCompare(b.category);
            case 'recent':
            default:
                return a.id.localeCompare(b.id);
        }
    });

    return filtered;
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
    products: [],
    filteredProducts: [],
    metrics: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    searchQuery: '',
    sortBy: 'recent',
    filters: initialFilters,
    showFilterModal: false,
    selectedProduct: null,
    showProductModal: false,
    lastUpdated: null,

    setProducts: (products) => {
        const state = get();
        const metrics = calculateMetrics(products);
        const filteredProducts = filterProducts(
            products,
            state.searchQuery,
            state.filters,
            state.sortBy
        );
        
        set({
            products,
            filteredProducts,
            metrics,
            lastUpdated: new Date().toISOString(),
        });
    },

    setLoading: (isLoading) => set({ isLoading }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
    setError: (error) => set({ error }),

    setSearchQuery: (searchQuery) => {
        const state = get();
        const filteredProducts = filterProducts(
            state.products,
            searchQuery,
            state.filters,
            state.sortBy
        );
        set({ searchQuery, filteredProducts });
    },

    setSortBy: (sortBy) => {
        const state = get();
        const filteredProducts = filterProducts(
            state.products,
            state.searchQuery,
            state.filters,
            sortBy
        );
        set({ sortBy, filteredProducts });
    },

    setFilters: (filters) => {
        const state = get();
        const filteredProducts = filterProducts(
            state.products,
            state.searchQuery,
            filters,
            state.sortBy
        );
        set({ filters, filteredProducts });
    },

    setShowFilterModal: (showFilterModal) => set({ showFilterModal }),
    setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
    setShowProductModal: (showProductModal) => set({ showProductModal }),

    clearCache: () => {
        set({
            products: [],
            filteredProducts: [],
            metrics: null,
            lastUpdated: null,
        });
    },

    refreshData: async () => {
        const state = get();
        set({ isRefreshing: true });
        
        try {
            // Re-filter current products
            const filteredProducts = filterProducts(
                state.products,
                state.searchQuery,
                state.filters,
                state.sortBy
            );
            
            set({
                filteredProducts,
                lastUpdated: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Failed to refresh inventory:', error);
        } finally {
            set({ isRefreshing: false });
        }
    },
}));
