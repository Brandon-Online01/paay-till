/**
 * Usage examples for the Transaction Database
 * 
 * This file demonstrates how to use the TransactionService in your app
 * Copy these examples into your components as needed
 */

import { TransactionService } from './transaction.service';
import type { Transaction, TransactionFilters } from './index';

/**
 * Example: Initialize database when app starts
 * Call this in your App.tsx or main component
 */
export async function initializeDatabase() {
  try {
    await TransactionService.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

/**
 * Example: Process a sale transaction (e.g., after checkout)
 */
export async function handleCheckout(cartItems: any[], cashierID: string, paymentMethod: 'cash' | 'card' | 'mobile') {
  try {
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = 0; // Calculate based on your business logic
    
    const transaction = await TransactionService.processTransaction({
      cashierID,
      paymentMethod,
      totalAmount,
      discount,
      change: paymentMethod === 'cash' ? calculateChange(totalAmount, discount) : 0,
      receiptDetails: {
        items: cartItems,
        timestamp: new Date().toISOString(),
        store: 'Main Store'
      },
      additionalMetrics: {
        itemCount: cartItems.length,
        storeID: 'store_001'
      }
    });

    console.log('Transaction completed:', transaction.transactionID);
    return transaction;
  } catch (error) {
    console.error('Checkout failed:', error);
    throw error;
  }
}

/**
 * Example: Process a refund
 */
export async function handleRefund(originalTransactionID: string, refundAmount: number, cashierID: string) {
  try {
    const refund = await TransactionService.processRefund(
      originalTransactionID,
      refundAmount,
      cashierID,
      'Customer request'
    );

    console.log('Refund processed:', refund.transactionID);
    return refund;
  } catch (error) {
    console.error('Refund failed:', error);
    throw error;
  }
}

/**
 * Example: Get daily sales report
 */
export async function getDailySalesReport(date: Date, cashierID?: string) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filters: TransactionFilters = {
      dateFrom: startOfDay.toISOString(),
      dateTo: endOfDay.toISOString(),
      status: 'completed'
    };

    if (cashierID) {
      filters.cashierID = cashierID;
    }

    const [transactions, summary] = await Promise.all([
      TransactionService.getTransactions(filters),
      TransactionService.getSalesSummary(filters)
    ]);

    return {
      date: date.toISOString().split('T')[0],
      transactions,
      summary,
      totalTransactions: transactions.length
    };
  } catch (error) {
    console.error('Failed to generate sales report:', error);
    throw error;
  }
}

/**
 * Example: Search for a specific transaction
 */
export async function findTransaction(searchTerm: string): Promise<Transaction[]> {
  try {
    // Search by transaction ID
    if (searchTerm.startsWith('TXN-') || searchTerm.startsWith('REF-')) {
      try {
        const transaction = await TransactionService.getTransactionByTransactionId(searchTerm);
        return [transaction];
      } catch {
        // Transaction not found, continue with general search
      }
    }

    // General search
    return await TransactionService.searchTransactions(searchTerm);
  } catch (error) {
    console.error('Transaction search failed:', error);
    return [];
  }
}

/**
 * Example: Export transactions for backup
 */
export async function exportDailyTransactions(date: Date): Promise<string> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await TransactionService.exportTransactions({
      dateFrom: startOfDay.toISOString(),
      dateTo: endOfDay.toISOString()
    });
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

/**
 * Helper function to calculate change for cash payments
 */
function calculateChange(totalAmount: number, discount: number, amountPaid?: number): number {
  const finalAmount = totalAmount - discount;
  return amountPaid ? Math.max(0, amountPaid - finalAmount) : 0;
}

/**
 * Example React Hook for transaction management
 */
export function useTransactions(cashierID?: string) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadTransactions = async (filters?: TransactionFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await TransactionService.getTransactions({
        ...filters,
        cashierID
      });
      setTransactions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const processTransaction = async (transactionData: any) => {
    setError(null);
    
    try {
      const transaction = await TransactionService.processTransaction({
        ...transactionData,
        cashierID: cashierID || 'unknown'
      });
      
      // Reload transactions to include the new one
      await loadTransactions();
      
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process transaction');
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    loadTransactions,
    processTransaction
  };
}

// Note: Import React if you plan to use the hook:
// import React from 'react';
