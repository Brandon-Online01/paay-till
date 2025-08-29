import { create } from 'zustand';
import { Transaction } from '@/types/transaction.types';

export type SortPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface FilterOptions {
  status: string[];
  dateRange: {
    from: string;
    to: string;
  };
  paymentMethod: string[];
  amountRange: {
    min: number;
    max: number;
  };
}

export interface SalesMetrics {
  totalSales: number;
  totalRefunds: number;
  netSales: number;
  transactionCount: number;
  averageTransaction: number;
  totalDiscount: number;
  largestSale: number;
  averageItemsPerOrder: number;
  totalItems: number;
}

interface ReportsState {
  // Data
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  metrics: SalesMetrics | null;
  
  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: SortPeriod;
  filters: FilterOptions;
  showFilterModal: boolean;
  selectedTransaction: Transaction | null;
  showTransactionModal: boolean;
  lastUpdated: string | null;
  
  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  setFilteredTransactions: (transactions: Transaction[]) => void;
  setMetrics: (metrics: SalesMetrics) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortPeriod) => void;
  setFilters: (filters: FilterOptions) => void;
  setShowFilterModal: (show: boolean) => void;
  setSelectedTransaction: (transaction: Transaction | null) => void;
  setShowTransactionModal: (show: boolean) => void;
  clearState: () => void;
  clearCache: () => void;
  refreshData: () => Promise<void>;
  
  // Computed Actions
  applyFiltersAndSort: () => void;
  calculateMetrics: () => void;
}

const initialFilters: FilterOptions = {
  status: [],
  dateRange: {
    from: '',
    to: '',
  },
  paymentMethod: [],
  amountRange: {
    min: 0,
    max: 0,
  },
};

export const useReportsStore = create<ReportsState>((set, get) => ({
  // Initial state
  transactions: [],
  filteredTransactions: [],
  metrics: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  searchQuery: '',
  sortBy: 'daily',
  filters: initialFilters,
  showFilterModal: false,
  selectedTransaction: null,
  showTransactionModal: false,
  lastUpdated: null,
  
  // Actions
  setTransactions: (transactions) => {
    set({ 
      transactions, 
      lastUpdated: new Date().toISOString(),
      error: null 
    });
    get().applyFiltersAndSort();
    get().calculateMetrics();
  },
  
  setFilteredTransactions: (filteredTransactions) => {
    set({ filteredTransactions });
    get().calculateMetrics();
  },
  
  setMetrics: (metrics) => set({ metrics }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  
  setError: (error) => set({ error }),
  
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().applyFiltersAndSort();
  },
  
  setSortBy: (sortBy) => {
    set({ sortBy });
    get().applyFiltersAndSort();
  },
  
  setFilters: (filters) => {
    set({ filters });
    get().applyFiltersAndSort();
  },
  
  setShowFilterModal: (showFilterModal) => set({ showFilterModal }),
  
  setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
  
  setShowTransactionModal: (showTransactionModal) => set({ showTransactionModal }),
  
  clearState: () => set({
    transactions: [],
    filteredTransactions: [],
    metrics: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    searchQuery: '',
    sortBy: 'daily',
    filters: initialFilters,
    showFilterModal: false,
    selectedTransaction: null,
    showTransactionModal: false,
    lastUpdated: null,
  }),
  
  clearCache: () => {
    set({ 
      transactions: [], 
      filteredTransactions: [], 
      metrics: null,
      lastUpdated: null 
    });
  },
  
  refreshData: async () => {
    const { TransactionService } = await import('@/@db/transaction.service');
    
    set({ isRefreshing: true, error: null });
    try {
      const allTransactions = await TransactionService.getTransactions();
      // Sort by most recent first for fast loading
      const sortedTransactions = allTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      set({ 
        transactions: sortedTransactions,
        lastUpdated: new Date().toISOString(),
        error: null 
      });
      get().applyFiltersAndSort();
      get().calculateMetrics();
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
      set({ error: 'Failed to refresh transactions' });
    } finally {
      set({ isRefreshing: false });
    }
  },
  
  applyFiltersAndSort: () => {
    const { transactions, searchQuery, sortBy, filters } = get();
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.transactionID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(t => filters.status.includes(t.status));
    }
    
    // Apply date range filter
    if (filters.dateRange.from && filters.dateRange.to) {
      const fromDate = new Date(filters.dateRange.from);
      const toDate = new Date(filters.dateRange.to);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= fromDate && transactionDate <= toDate;
      });
    }
    
    // Apply payment method filter
    if (filters.paymentMethod.length > 0) {
      filtered = filtered.filter(t => 
        t.paymentMethods.some(pm => filters.paymentMethod.includes(pm.type))
      );
    }
    
    // Apply amount range filter
    if (filters.amountRange.max > 0) {
      filtered = filtered.filter(t => 
        t.totalAmount >= filters.amountRange.min && 
        t.totalAmount <= filters.amountRange.max
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aDate = new Date(a.createdAt);
      const bDate = new Date(b.createdAt);
      
      switch (sortBy) {
        case 'hourly':
        case 'daily':
        case 'weekly':
        case 'monthly':
        case 'quarterly':
        case 'yearly':
          return bDate.getTime() - aDate.getTime(); // Most recent first
        default:
          return bDate.getTime() - aDate.getTime();
      }
    });
    
    set({ filteredTransactions: filtered });
  },
  
  calculateMetrics: () => {
    const { filteredTransactions } = get();
    
    if (filteredTransactions.length === 0) {
      set({ 
        metrics: {
          totalSales: 0,
          totalRefunds: 0,
          netSales: 0,
          transactionCount: 0,
          averageTransaction: 0,
          totalDiscount: 0,
          largestSale: 0,
          averageItemsPerOrder: 0,
          totalItems: 0,
        }
      });
      return;
    }
    
    const sales = filteredTransactions.filter(t => t.type === 'sale' && t.status === 'completed');
    const refunds = filteredTransactions.filter(t => t.type === 'refund' && t.status === 'completed');
    
    const totalSales = sales.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalRefunds = refunds.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalDiscount = sales.reduce((sum, t) => sum + t.discount, 0);
    const largestSale = sales.length > 0 ? Math.max(...sales.map(t => t.totalAmount)) : 0;
    const totalItems = sales.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    const metrics: SalesMetrics = {
      totalSales,
      totalRefunds,
      netSales: totalSales - totalRefunds,
      transactionCount: sales.length,
      averageTransaction: sales.length > 0 ? totalSales / sales.length : 0,
      totalDiscount,
      largestSale,
      averageItemsPerOrder: sales.length > 0 ? totalItems / sales.length : 0,
      totalItems,
    };
    
    set({ metrics });
  },
}));
