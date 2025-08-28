/**
 * Simplified till types for better performance and reusability
 */

/**
 * Payment method types
 */
export enum PaymentType {
    CASH = 'cash',
    CARD = 'card',
    LINK = 'link',
    ACCOUNT = 'account',
    SPLIT = 'split',
}

/**
 * Order status
 */
export enum OrderStatus {
    PENDING = 'pending',
    PREPARING = 'preparing',
    READY = 'ready',
    SERVED = 'served',
    PAID = 'paid',
}

/**
 * Till operation modes
 */
export enum TillMode {
    SALE = 'sale',
    RETURN = 'return',
    VOID = 'void',
    TRAINING = 'training',
}

/**
 * Split payment details
 */
export interface SplitPayment {
    cashAmount: number;
    cardAmount: number;
    totalAmount: number;
    difference: number;
}

/**
 * Payment method
 */
export interface PaymentMethod {
    type: PaymentType;
    amount: number;
    reference?: string;
}

/**
 * Variant option
 */
export interface VariantOption {
    name: string;
    price: number;
}

/**
 * Product variants
 */
export interface ProductVariants {
    sizes?: VariantOption[];
    flavors?: VariantOption[];
    colors?: VariantOption[];
}

/**
 * Menu item
 */
export interface MenuItem {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    description?: string;
    customizable?: boolean;
    variants?: ProductVariants;
    badge?: string | null;
}

/**
 * Selected variants
 */
export interface SelectedVariants {
    size?: string;
    flavor?: string;
    color?: string;
}

/**
 * Cart item
 */
export interface CartItem extends MenuItem {
    quantity: number;
    notes?: string;
    selectedVariants?: SelectedVariants;
    variantPrice?: number;
    calculatedPrice?: number;
}

/**
 * Order information
 */
export interface Order {
    id: string;
    items: CartItem[];
    payments?: PaymentMethod[];
    splitPayment?: SplitPayment;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    customerName?: string;
    status: OrderStatus;
    createdAt: Date;
    completedAt?: Date;
}

/**
 * Till configuration
 */
export interface TillConfig {
    branch: {
        name: string;
        tradingHours: string;
        currency: string;
        symbol: string;
    };
    payment: {
        types: PaymentType[];
    };
    categories: Array<{
        id: string;
        name: string;
        icon: string;
    }>;
    items: MenuItem[];
}

/**
 * Receipt options
 */
export interface ReceiptOptions {
    sms: boolean;
    email: boolean;
    phoneNumber?: string;
    emailAddress?: string;
}

/**
 * Payment modal state
 */
export interface PaymentModalState {
    visible: boolean;
    selectedMethod: string;
    amount: number;
    cashReceived: number;
    change: number;
}

/**
 * Receipt modal state
 */
export interface ReceiptModalState {
    visible: boolean;
    options: ReceiptOptions;
}

/**
 * Till preferences
 */
export interface TillPreferences {
    defaultReceipt: 'print' | 'email' | 'sms' | 'none';
    autoPrint: boolean;
    showImages: boolean;
    hapticFeedback: boolean;
    currencyFormat: 'symbol' | 'code';
}

/**
 * Cart store interface
 */
export interface CartStore {
    // State
    items: CartItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    currentOrder: Partial<Order> | null;
    selectedPayments: PaymentMethod[];
    splitPayment: SplitPayment | undefined;
    customerName: string;
    selectedCategory: string;
    searchQuery: string;
    isCartOpen: boolean;
    isPaymentModalVisible: boolean;
    isReceiptModalVisible: boolean;
    currency: string;
    symbol: string;
    tillConfig: TillConfig;

    // Actions
    addItem: (
        item: MenuItem,
        quantity?: number,
        notes?: string,
        badge?: string | null,
        selectedVariants?: SelectedVariants
    ) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    setCustomerName: (name: string) => void;
    applyDiscount: (amount: number) => void;
    removeDiscount: () => void;
    setSelectedPayments: (payments: PaymentMethod[]) => void;
    setSplitPayment: (splitPayment: SplitPayment | undefined) => void;
    calculateSplitPayment: (cashAmount: number, cardAmount: number) => void;
    setSelectedCategory: (category: string) => void;
    setSearchQuery: (query: string) => void;
    toggleCart: () => void;
    setPaymentModalVisible: (visible: boolean) => void;
    setReceiptModalVisible: (visible: boolean) => void;
    calculateTotals: () => void;
    createOrder: () => Order;
    processPayment: (payments: PaymentMethod[]) => void;
    completeReceiptDelivery: () => void;
}
