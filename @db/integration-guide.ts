/**
 * Integration Guide for Transaction Database
 * 
 * This file shows how to integrate the transaction database with your existing till system
 */

import { TransactionService } from './transaction.service';
import type { Transaction } from './index';

/**
 * 1. Initialize the database when your app starts
 * Add this to your main App.tsx or _layout.tsx
 */
export const initializeApp = async () => {
  try {
    await TransactionService.initialize();
    console.log('✅ Transaction database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Handle initialization error (show error to user, retry, etc.)
  }
};

/**
 * 2. Integration with Cart/Checkout System
 * This example shows how to save transactions when checkout is completed
 */
export const processCheckoutWithDatabase = async (
  cartItems: any[],
  paymentMethod: 'cash' | 'card' | 'mobile',
  cashierID: string,
  customerId?: string
) => {
  try {
    // Calculate totals (your existing logic)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.15; // 15% tax
    const discount = 0; // Calculate based on your business logic
    const totalAmount = subtotal + taxAmount - discount;
    
    // Process payment (your existing payment logic)
    const paymentResult = await processPayment(paymentMethod, totalAmount);
    
    if (paymentResult.success) {
      // Save transaction to database
      const transaction = await TransactionService.processTransaction({
        cashierID,
        paymentMethod,
        totalAmount,
        discount,
        change: paymentResult.change || 0,
        receiptDetails: {
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
          })),
          subtotal,
          tax: taxAmount,
          total: totalAmount,
          paymentReference: paymentResult.reference
        },
        additionalMetrics: {
          customerId,
          itemCount: cartItems.length,
          storeId: 'store_001',
          deviceId: 'till_001'
        }
      });

      console.log('✅ Transaction saved:', transaction.transactionID);
      
      // Return both payment result and transaction for receipt generation
      return {
        success: true,
        transaction,
        paymentResult
      };
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    console.error('❌ Checkout failed:', error);
    throw error;
  }
};

/**
 * 3. Integration with Reports/Analytics
 * Generate daily sales reports
 */
export const generateDailyReport = async (date: Date, cashierID?: string) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [transactions, summary] = await Promise.all([
      TransactionService.getTransactions({
        cashierID,
        dateFrom: startOfDay.toISOString(),
        dateTo: endOfDay.toISOString(),
        status: 'completed'
      }),
      TransactionService.getSalesSummary({
        cashierID,
        dateFrom: startOfDay.toISOString(),
        dateTo: endOfDay.toISOString(),
        status: 'completed'
      })
    ]);

    return {
      date: date.toISOString().split('T')[0],
      cashier: cashierID || 'All Cashiers',
      summary: {
        totalSales: summary.totalSales,
        totalRefunds: summary.totalRefunds,
        netSales: summary.netSales,
        transactionCount: summary.transactionCount,
        averageTransaction: summary.averageTransaction,
        totalDiscount: summary.totalDiscount
      },
      transactions,
      hourlyBreakdown: generateHourlyBreakdown(transactions)
    };
  } catch (error) {
    console.error('❌ Report generation failed:', error);
    throw error;
  }
};

/**
 * 4. Integration with Search/Lookup
 * Find transactions for customer service
 */
export const findTransactionForCustomer = async (searchTerm: string): Promise<Transaction[]> => {
  try {
    // Try exact transaction ID first
    if (searchTerm.match(/^(TXN-|REF-)/)) {
      try {
        const transaction = await TransactionService.getTransactionByTransactionId(searchTerm);
        return [transaction];
      } catch {
        // Continue with general search if exact match fails
      }
    }

    // General search through receipt details and transaction IDs
    return await TransactionService.searchTransactions(searchTerm);
  } catch (error) {
    console.error('❌ Transaction search failed:', error);
    return [];
  }
};

/**
 * 5. Integration with Refund System
 */
export const processRefundWithDatabase = async (
  originalTransactionID: string,
  refundAmount: number,
  cashierID: string,
  reason: string
) => {
  try {
    // Verify original transaction exists and is valid for refund
    const originalTransaction = await TransactionService.getTransactionByTransactionId(originalTransactionID);
    
    if (originalTransaction.type !== 'sale' || originalTransaction.status !== 'completed') {
      throw new Error('Invalid transaction for refund');
    }

    if (refundAmount > originalTransaction.totalAmount) {
      throw new Error('Refund amount cannot exceed original transaction amount');
    }

    // Process the refund payment (your existing refund logic)
    const refundResult = await processRefundPayment(originalTransaction.paymentMethod, refundAmount);
    
    if (refundResult.success) {
      // Save refund transaction to database
      const refundTransaction = await TransactionService.processRefund(
        originalTransactionID,
        refundAmount,
        cashierID,
        reason
      );

      console.log('✅ Refund processed:', refundTransaction.transactionID);
      
      return {
        success: true,
        refundTransaction,
        originalTransaction,
        refundResult
      };
    } else {
      throw new Error('Refund payment failed');
    }
  } catch (error) {
    console.error('❌ Refund failed:', error);
    throw error;
  }
};

/**
 * Helper functions (implement these based on your existing payment system)
 */
async function processPayment(method: string, amount: number) {
  // Your existing payment processing logic
  return {
    success: true,
    reference: `PAY-${Date.now()}`,
    change: method === 'cash' ? 0 : 0 // Calculate actual change for cash payments
  };
}

async function processRefundPayment(method: string, amount: number) {
  // Your existing refund processing logic
  return {
    success: true,
    reference: `REF-${Date.now()}`
  };
}

function generateHourlyBreakdown(transactions: Transaction[]) {
  const breakdown = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
    total: 0
  }));

  transactions.forEach(transaction => {
    const hour = new Date(transaction.createdAt).getHours();
    breakdown[hour].count++;
    breakdown[hour].total += transaction.totalAmount;
  });

  return breakdown;
}

/**
 * 6. React Hook for easy integration in components
 */
export function useTransactionDatabase() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const processTransaction = async (transactionData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processCheckoutWithDatabase(
        transactionData.items,
        transactionData.paymentMethod,
        transactionData.cashierID,
        transactionData.customerId
      );
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchTransactions = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await findTransactionForCustomer(searchTerm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (date: Date, cashierID?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await generateDailyReport(date, cashierID);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Report generation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    processTransaction,
    searchTransactions,
    generateReport,
    clearError: () => setError(null)
  };
}

// Note: Import React if you plan to use the hook:
// import React from 'react';
