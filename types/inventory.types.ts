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
