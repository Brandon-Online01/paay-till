// Individual item sold in a transaction
export interface TransactionItem {
    id: string;
    name: string;
    price: number; // Base price
    quantity: number;
    calculatedPrice?: number; // Price including variants
    variantPrice?: number; // Additional cost from variants
    image?: string;
    category?: string;
    isSpecial?: boolean; // If item was on special/promotion
    notes?: string; // Special instructions or notes
    badge?: string; // Special badge or tag
    selectedVariants?: {
        size?: string;
        flavor?: string;
        color?: string;
    };
    totalItemPrice: number; // Final price for this line item (calculatedPrice * quantity)
}

export interface Transaction {
    id?: number; // Auto-incremented primary key
    cashierID: string;
    transactionID: string; // UUID or custom format
    orderID?: string; // Reference to the order ID from cart
    items: TransactionItem[]; // Array of sold items with full details
    paymentMethods: PaymentMethod[]; // Array of payment methods used
    subtotal: number; // Subtotal before tax and discount
    tax: number; // Tax amount
    discount: number; // Discount applied
    totalAmount: number; // Final total amount
    change: number; // Change given (for cash payments)
    customerName?: string; // Customer name if provided
    receiptStatus: 'issued' | 'pending' | 'void';
    receiptOptions?: {
        print?: boolean;
        sms?: boolean;
        email?: boolean;
        phoneNumber?: string;
        emailAddress?: string;
    };
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
    status: 'completed' | 'pending' | 'canceled';
    type: 'sale' | 'refund' | 'return';
    currency: string; // Currency code (e.g., 'ZAR')
    currencySymbol: string; // Currency symbol (e.g., 'R')
    additionalMetrics?: string; // JSON string for flexible metrics
}

// Payment method details for transactions
export interface PaymentMethod {
    type: 'cash' | 'card' | 'mobile' | 'link' | 'account' | 'split';
    amount: number;
    reference?: string; // Payment reference or change info
    cardLast4?: string; // Last 4 digits of card (for card payments)
    approvalCode?: string; // Approval code (for card payments)
}

export type TransactionCreateInput = Omit<
    Transaction,
    'id' | 'createdAt' | 'updatedAt'
>;

export type TransactionUpdateInput = Partial<
    Omit<Transaction, 'id' | 'createdAt'>
>;

export interface TransactionFilters {
    cashierID?: string;
    status?: Transaction['status'];
    type?: Transaction['type'];
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
}
