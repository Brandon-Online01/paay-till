import { databaseService } from './database';
import {
    Transaction,
    TransactionCreateInput,
    TransactionUpdateInput,
    TransactionFilters,
    TransactionItem,
    PaymentMethod,
} from '../types/transaction.types';

/**
 * High-level service for transaction operations
 * This provides a convenient API for the UI components
 */
export class TransactionService {
    /**
     * Initialize the database (call this when the app starts)
     */
    static async initialize(): Promise<void> {
        console.log('🔄 db init...');
        try {
            await databaseService.initialize();
            console.log('✅ db init success');
        } catch (error) {
            console.error('❌ db init failed:', error);
            throw error;
        }
    }

    /**
     * Save a completed transaction from cart data
     */
    static async saveTransaction(transactionData: {
        cashierID: string;
        orderID?: string;
        items: any[]; // Cart items
        paymentMethods: PaymentMethod[];
        subtotal: number;
        tax: number;
        discount: number;
        totalAmount: number;
        change: number;
        customerName?: string;
        currency: string;
        currencySymbol: string;
        receiptOptions?: any;
        additionalMetrics?: any;
    }): Promise<Transaction> {
        console.log('💾 transaction -> db...');

        try {
            // Generate unique transaction ID
            const transactionID = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Convert cart items to transaction items format
            const transactionItems: TransactionItem[] =
                transactionData.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    calculatedPrice: item.calculatedPrice || item.price,
                    variantPrice: item.variantPrice || 0,
                    image: item.image,
                    category: item.category,
                    isSpecial:
                        item.badge === 'Special' || item.isSpecial || false,
                    notes: item.notes,
                    badge: item.badge,
                    selectedVariants: item.selectedVariants
                        ? {
                              size: item.selectedVariants.size,
                              flavor: item.selectedVariants.flavor,
                              color: item.selectedVariants.color,
                          }
                        : undefined,
                    totalItemPrice:
                        (item.calculatedPrice || item.price) * item.quantity,
                }));

            const transaction: TransactionCreateInput = {
                cashierID: transactionData.cashierID,
                transactionID,
                orderID: transactionData.orderID,
                items: transactionItems,
                paymentMethods: transactionData.paymentMethods,
                subtotal: transactionData.subtotal,
                tax: transactionData.tax,
                discount: transactionData.discount,
                totalAmount: transactionData.totalAmount,
                change: transactionData.change,
                customerName: transactionData.customerName,
                receiptStatus: 'issued',
                receiptOptions: transactionData.receiptOptions,
                status: 'completed',
                type: 'sale',
                currency: transactionData.currency,
                currencySymbol: transactionData.currencySymbol,
                additionalMetrics: JSON.stringify(
                    transactionData.additionalMetrics || {}
                ),
            };

            const savedTransaction =
                await databaseService.createTransaction(transaction);
            console.log(
                `✅ transaction ${savedTransaction.transactionID} saved successfully`
            );

            // Also save individual transaction items for product relationships and analytics
            try {
                await databaseService.saveTransactionItems(
                    savedTransaction.id!,
                    transactionItems
                );
                console.log(`✅ transaction items saved for analytics`);
            } catch (itemError) {
                console.warn(
                    '⚠️ Failed to save transaction items (transaction still saved):',
                    itemError
                );
                // Don't fail the whole transaction if items can't be saved
            }

            return savedTransaction;
        } catch (error) {
            console.error('❌ Failed to save transaction:', error);
            throw new Error('Failed to save transaction to database');
        }
    }

    /**
     * Process a refund transaction
     */
    static async processRefund(
        originalTransactionID: string,
        refundAmount: number,
        cashierID: string,
        reason?: string
    ): Promise<Transaction> {
        const refundTransactionID = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const refund: TransactionCreateInput = {
            cashierID,
            transactionID: refundTransactionID,
            items: [], // Empty items array for refunds
            paymentMethods: [{ type: 'cash', amount: refundAmount }], // Array of payment methods
            subtotal: refundAmount,
            tax: 0,
            totalAmount: refundAmount,
            discount: 0,
            change: 0,
            receiptStatus: 'issued',
            status: 'completed',
            type: 'refund',
            currency: 'ZAR',
            currencySymbol: 'R',
            additionalMetrics: JSON.stringify({
                originalTransactionID,
                reason: reason || 'Customer refund request',
            }),
        };

        return await databaseService.createTransaction(refund);
    }

    /**
     * Get transactions for a specific cashier
     */
    static async getCashierTransactions(
        cashierID: string,
        filters?: Omit<TransactionFilters, 'cashierID'>
    ): Promise<Transaction[]> {
        return await databaseService.getTransactions({
            ...filters,
            cashierID,
        });
    }

    /**
     * Get today's transactions
     */
    static async getTodayTransactions(
        cashierID?: string
    ): Promise<Transaction[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await databaseService.getTransactions({
            cashierID,
            dateFrom: today.toISOString(),
            dateTo: tomorrow.toISOString(),
        });
    }

    /**
     * Get sales summary for a date range
     */
    static async getSalesSummary(filters?: TransactionFilters): Promise<{
        totalSales: number;
        totalRefunds: number;
        netSales: number;
        transactionCount: number;
        averageTransaction: number;
        totalDiscount: number;
    }> {
        // Get all transactions for the period
        const allTransactions = await databaseService.getTransactions(filters);

        // Separate sales and refunds
        const sales = allTransactions.filter(
            (t) => t.type === 'sale' && t.status === 'completed'
        );
        const refunds = allTransactions.filter(
            (t) => t.type === 'refund' && t.status === 'completed'
        );

        const totalSales = sales.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalRefunds = refunds.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalDiscount = sales.reduce((sum, t) => sum + t.discount, 0);

        return {
            totalSales,
            totalRefunds,
            netSales: totalSales - totalRefunds,
            transactionCount: sales.length,
            averageTransaction:
                sales.length > 0 ? totalSales / sales.length : 0,
            totalDiscount,
        };
    }

    /**
     * Search transactions by transaction ID or receipt details
     */
    static async searchTransactions(
        searchTerm: string
    ): Promise<Transaction[]> {
        const allTransactions = await databaseService.getTransactions();

        return allTransactions.filter(
            (transaction) =>
                transaction.transactionID
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                JSON.stringify(transaction.items)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (transaction.customerName &&
                    transaction.customerName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
        );
    }

    /**
     * Export transactions to JSON (for backup/reporting)
     */
    static async exportTransactions(
        filters?: TransactionFilters
    ): Promise<string> {
        const transactions = await databaseService.getTransactions(filters);
        return JSON.stringify(transactions, null, 2);
    }

    // Delegate other methods to database service
    static async getTransactionById(id: number): Promise<Transaction> {
        return await databaseService.getTransactionById(id);
    }

    static async getTransactionByTransactionId(
        transactionID: string
    ): Promise<Transaction> {
        return await databaseService.getTransactionByTransactionId(
            transactionID
        );
    }

    static async updateTransaction(
        id: number,
        updates: TransactionUpdateInput
    ): Promise<Transaction> {
        return await databaseService.updateTransaction(id, updates);
    }

    static async deleteTransaction(id: number): Promise<boolean> {
        return await databaseService.deleteTransaction(id);
    }

    static async getTransactionStats(filters?: TransactionFilters) {
        return await databaseService.getTransactionStats(filters);
    }

    static async getTransactions(
        filters?: TransactionFilters
    ): Promise<Transaction[]> {
        return await databaseService.getTransactions(filters);
    }

    /**
     * Get transaction items with full product details
     */
    static async getTransactionItemsWithProducts(
        transactionId: number
    ): Promise<any[]> {
        return await databaseService.getTransactionItemsWithProducts(
            transactionId
        );
    }

    /**
     * Get product analytics from transaction items
     */
    static async getProductAnalytics(productId: string): Promise<{
        totalSold: number;
        totalRevenue: number;
        averageOrderValue: number;
        lastSold?: string;
    }> {
        return await databaseService.getProductAnalyticsFromTransactions(
            productId
        );
    }
}
