export interface ProductVariant {
    name: string;
    price: number;
}

export interface ProductVariants {
    colors?: ProductVariant[];
    sizes?: ProductVariant[];
    flavors?: ProductVariant[];
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
    badge?: string | null;
    variants?: ProductVariants;
    inStock?: boolean;
    stockQuantity?: number;
    // New enhanced inventory fields
    barcode?: string | null;
    qrCode?: string | null;
    reorderQty?: number;
    maxBuyQty?: number;
    minBuyQty?: number;
    resellerName?: string | null;
    brand?: string | null;
    information?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductMetrics {
    totalProducts: number;
    totalValue: number;
    averagePrice: number;
    inStockProducts: number;
    outOfStockProducts: number;
    categories: number;
}

export interface SelectedVariants {
    size?: string;
    color?: string;
    flavor?: string;
}

// Pagination and caching interfaces
export interface PaginatedProductResponse {
    products: Product[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ProductSearchParams {
    query?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'stockQuantity';
    sortOrder?: 'asc' | 'desc';
}

export interface ProductCacheEntry {
    data: Product[];
    timestamp: number;
    totalCount: number;
    searchParams: ProductSearchParams;
}

export interface ProductCache {
    [key: string]: ProductCacheEntry;
}

// Product analytics and reorder alerts
export interface ProductReorderAlert {
    product: Product;
    currentStock: number;
    reorderLevel: number;
    suggested: number;
}

export interface ProductAnalytics {
    totalSold: number;
    totalRevenue: number;
    averageOrderValue: number;
    lastSold?: string;
    topSellingVariants?: { [key: string]: number };
}
