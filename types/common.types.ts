/**
 * Common type definitions used across the application
 * Simplified and optimized for better performance and reusability
 */

/**
 * Enum for connectivity status
 */
export enum ConnectivityStatus {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    ERROR = 'error',
}

/**
 * Simplified connectivity info
 */
export interface ConnectivityInfo {
    printer: ConnectivityStatus;
    scanner: ConnectivityStatus;
    cloud: ConnectivityStatus;
}

/**
 * Base app configuration interface
 */
export interface AppConfig {
    company: {
        name: string;
        logo: string;
        tagline: string;
        description: string;
    };
    till: {
        branch: {
            name: string;
            tradingHours: string;
            currency: string;
            symbol: string;
        };
        payment: {
            types: string[];
        };
        connectivity: ConnectivityInfo;
        categories: Array<{
            id: string;
            name: string;
            icon: string;
        }>;
        items: Array<{
            id: string;
            name: string;
            category: string;
            price: number;
            image: string;
            description?: string;
            badge?: string | null;
            variants?: any;
        }>;
    };
    navigation: Record<string, { label: string; icon: string }>;
    auth: Record<string, any>;
    pages: Record<string, { title: string; subtitle: string }>;
    common: {
        buttons: Record<string, string>;
    };
}

/**
 * Form validation errors
 */
export interface FormErrors {
    [key: string]: string;
}

/**
 * Generic API response
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

/**
 * Toast notification options
 */
export interface ToastOptions {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    icon?: string;
}

/**
 * Animation config for Reanimated
 */
export interface AnimationConfig {
    duration?: number;
    easing?: any;
    delay?: number;
}

/**
 * Generic loading state
 */
export interface LoadingState {
    isLoading: boolean;
    error?: string;
    data?: any;
}
