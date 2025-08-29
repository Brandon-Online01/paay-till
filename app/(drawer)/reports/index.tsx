import { Text, View, ScrollView, Pressable, TextInput, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    Calendar,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Package,
    RotateCcw,
} from 'lucide-react-native';
import BaseProvider from '@/providers/base.provider';
import { TransactionService } from '@/@db/transaction.service';
import { useReportsStore, SortPeriod } from '@/store/reports.store';
import { Transaction } from '@/types/transaction.types';
import FilterModal from '@/components/reports/filter-modal';
import TransactionDetailModal from '@/components/reports/transaction-detail-modal';

const SORT_OPTIONS: { value: SortPeriod; label: string }[] = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
];

export default function Reports() {
    const {
        filteredTransactions,
        metrics,
        isLoading,
        isRefreshing,
        error,
        searchQuery,
        sortBy,
        showFilterModal,
        selectedTransaction,
        showTransactionModal,
        lastUpdated,
        setTransactions,
        setLoading,
        setError,
        setSearchQuery,
        setSortBy,
        setShowFilterModal,
        setSelectedTransaction,
        setShowTransactionModal,
        clearCache,
        refreshData,
    } = useReportsStore();

    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const allTransactions = await TransactionService.getTransactions();
            // Sort by most recent first for performance
            const sortedTransactions = allTransactions.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setTransactions(sortedTransactions);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [setTransactions, setLoading, setError]);

    const handleRefresh = useCallback(async () => {
        await refreshData();
    }, [refreshData]);

    const handleClearCache = useCallback(() => {
        clearCache();
        loadData();
    }, [clearCache, loadData]);

    useEffect(() => {
        // Only load if we don't have recent data
        if (!lastUpdated || new Date().getTime() - new Date(lastUpdated).getTime() > 30000) {
            loadData();
        }
    }, [loadData, lastUpdated]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
            }),
            time: date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'pending':
                return 'text-yellow-600';
            case 'canceled':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Delivered';
            case 'pending':
                return 'Shipped';
            case 'canceled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const handleTransactionPress = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowTransactionModal(true);
    };

    const handleSortSelect = (sort: SortPeriod) => {
        setSortBy(sort);
        setShowSortDropdown(false);
    };

    return (
        <BaseProvider>
                         {/* Header */}
             <View className="px-6 py-4 border-b border-gray-200 bg-white">
                 <View className="flex-row justify-between items-center">
                     <View>
                         <Text className="text-2xl font-bold text-gray-900 font-primary">
                             Sales Reports
                         </Text>
                         {lastUpdated && (
                             <Text className="text-sm text-gray-500 font-primary">
                                 Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                             </Text>
                         )}
                     </View>
                     <View className="flex-row gap-2">
                         <Pressable
                             onPress={handleRefresh}
                             disabled={isRefreshing}
                             className="p-2 rounded-lg bg-blue-100"
                         >
                             <RotateCcw size={20} color="#2563eb" />
                         </Pressable>
                         <Pressable
                             onPress={handleClearCache}
                             className="px-3 py-2 rounded-lg bg-gray-100"
                         >
                             <Text className="text-sm text-gray-700 font-primary">Clear Cache</Text>
                         </Pressable>
                     </View>
                 </View>
             </View>

            {/* Metric Cards - All on one line */}
            <View className="px-6 py-4">
                <View className="flex-row gap-3">
                    {/* Total Sales Card */}
                    <View className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row items-center gap-2 mb-2">
                            <DollarSign size={16} color="#059669" />
                            <Text className="text-xs text-gray-600 font-primary">
                                Total Sales
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 font-primary">
                            R{metrics?.totalSales.toFixed(2) || '0.00'}
                        </Text>
                        <Text className="text-xs text-gray-500 font-primary">
                            Largest: R
                            {metrics?.largestSale.toFixed(2) || '0.00'}
                        </Text>
                    </View>

                    {/* Sales Count Card */}
                    <View className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row items-center gap-2 mb-2">
                            <ShoppingBag size={16} color="#2563eb" />
                            <Text className="text-xs text-gray-600 font-primary">
                                Sales
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 font-primary">
                            {metrics?.transactionCount || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 font-primary">
                            Sum: R{metrics?.totalSales.toFixed(2) || '0.00'}
                        </Text>
                    </View>

                    {/* Average Order Card */}
                    <View className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row items-center gap-2 mb-2">
                            <TrendingUp size={16} color="#7c3aed" />
                            <Text className="text-xs text-gray-600 font-primary">
                                Avg Order
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 font-primary">
                            R{metrics?.averageTransaction.toFixed(2) || '0.00'}
                        </Text>
                        <Text className="text-xs text-gray-500 font-primary">
                            Items:{' '}
                            {metrics?.averageItemsPerOrder.toFixed(1) || '0.0'}
                        </Text>
                    </View>

                    {/* Net Sales Card */}
                    <View className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Package size={16} color="#dc2626" />
                            <Text className="text-xs text-gray-600 font-primary">
                                Net Sales
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 font-primary">
                            R{metrics?.netSales.toFixed(2) || '0.00'}
                        </Text>
                        <Text className="text-xs text-gray-500 font-primary">
                            Items: {metrics?.totalItems || 0}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Search and Filters */}
            <View className="px-6 py-4">
                <View className="flex-row items-center gap-4">
                    {/* Search Bar */}
                    <View className="flex-1 flex-row items-center rounded-lg p-3 border border-gray-200 bg-white">
                        <Search size={20} color="#6b7280" />
                        <TextInput
                            placeholder="search sales, customers..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className="flex-1 ml-2 p-2 text-gray-900 font-primary"
                        />
                    </View>

                    {/* Sort By Dropdown */}
                    <View className="relative">
                        <Pressable
                            onPress={() =>
                                setShowSortDropdown(!showSortDropdown)
                            }
                            className="flex-row items-center gap-2 p-4 border w-36 border-gray-200 bg-white rounded-lg"
                        >
                            <Text className="text-gray-700 font-primary">
                                {SORT_OPTIONS.find(
                                    (opt) => opt.value === sortBy
                                )?.label || 'Daily'}
                </Text>
                            <ChevronDown size={16} color="#6b7280" />
                        </Pressable>

                        {showSortDropdown && (
                            <View className="absolute top-16 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                                {SORT_OPTIONS.map((option) => (
                                    <Pressable
                                        key={option.value}
                                        onPress={() =>
                                            handleSortSelect(option.value)
                                        }
                                        className="px-4 py-3 border-b border-gray-100"
                                    >
                                        <Text className="text-gray-700 font-primary">
                                            {option.label}
                </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Filter Button */}
                    <Pressable
                        onPress={() => setShowFilterModal(true)}
                        className="flex-row items-center justify-center gap-2 p-4 border w-36 border-blue-200 bg-blue-600 rounded-lg"
                    >
                        <Filter size={16} color="white" />
                        <Text className="text-white font-primary">Filter</Text>
                    </Pressable>
                </View>
            </View>


                         <ScrollView 
                 className="flex-1"
                 refreshControl={
                     <RefreshControl
                         refreshing={isRefreshing}
                         onRefresh={handleRefresh}
                         colors={['#2563eb']}
                         tintColor="#2563eb"
                     />
                 }
             >
                 {/* Transaction List */}
                 <View className="px-6 py-4">
                     {isLoading && !isRefreshing ? (
                         <View className="flex-1 justify-center items-center py-12">
                             <Text className="text-gray-500 font-primary">
                                 Loading sales...
                             </Text>
                         </View>
                     ) : error ? (
                        <View className="flex-1 justify-center items-center py-12">
                            <Text className="text-red-500 font-primary">
                                {error}
                            </Text>
                        </View>
                    ) : filteredTransactions.length === 0 ? (
                        <View className="flex-1 justify-center items-center py-12">
                            <Text className="text-gray-500 font-primary">
                                No sales found
                            </Text>
                        </View>
                    ) : (
                        filteredTransactions.map((transaction) => {
                            const dateTime = formatDate(transaction.createdAt);

                            return (
                                <Pressable
                                    key={transaction.id}
                                    onPress={() =>
                                        handleTransactionPress(transaction)
                                    }
                                    className="mb-4 p-4 bg-white rounded-lg border border-gray-200 active:bg-gray-50"
                                >
                                    {/* Header Row */}
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Created
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Customer
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Items
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Cost
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Status
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Payment
                                                </Text>
                                            </View>

                                            <View className="flex-row justify-between items-center">
                                                {/* Created */}
                                                <View className="flex-1">
                                                    <Text className="text-sm font-semibold text-gray-900 font-primary">
                                                        {dateTime.date}
                                                    </Text>
                                                    <Text className="text-xs text-gray-500 font-primary">
                                                        {dateTime.time}
                                                    </Text>
                                                </View>

                                                {/* Customer */}
                                                <View className="flex-1">
                                                    <Text className="text-sm font-semibold text-gray-900 font-primary">
                                                        {transaction.customerName ||
                                                            'Walk-in Customer'}
                                                    </Text>
                                                    <Text className="text-xs text-gray-500 font-primary">
                                                        {transaction
                                                            .receiptOptions
                                                            ?.phoneNumber ||
                                                            '+27 XXX XXXX'}
                                                    </Text>
                                                </View>

                                                {/* Items */}
                                                <View className="flex-1">
                                                    {transaction.items
                                                        .slice(0, 2)
                                                        .map((item, index) => (
                                                            <Text
                                                                key={index}
                                                                className="text-xs text-gray-700 font-primary"
                                                            >
                                                                •{' '}
                                                                {item.quantity}x{' '}
                                                                {item.name}
                                                            </Text>
                                                        ))}
                                                    {transaction.items.length >
                                                        2 && (
                                                        <Text className="text-xs text-gray-500 font-primary">
                                                            +
                                                            {transaction.items
                                                                .length -
                                                                2}{' '}
                                                            more
                                                        </Text>
                                                    )}
                                                </View>

                                                {/* Cost */}
                                                <View className="flex-1">
                                                    <Text className="text-sm font-bold text-gray-900 font-primary">
                                                        R
                                                        {transaction.totalAmount.toFixed(
                                                            2
                                                        )}
                                                    </Text>
                                                </View>

                                                {/* Status */}
                                                <View className="flex-1">
                                                    <Text
                                                        className={`text-sm font-semibold font-primary ${getStatusColor(transaction.status)}`}
                                                    >
                                                        {getStatusLabel(
                                                            transaction.status
                                                        )}
                                                    </Text>
                                                </View>

                                                {/* Payment */}
                                                <View className="flex-1">
                                                    <View className="px-2 py-1 bg-green-100 rounded">
                                                        <Text className="text-xs font-semibold text-green-800 font-primary">
                                                            Paid
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Status Options */}
                                    <View className="mt-3 pt-3 border-t border-gray-100">
                                        <Text className="text-xs text-gray-600 mb-2 font-primary">
                                            Status:
                                        </Text>
                                        <View className="flex-row gap-4">
                                            {[
                                                'Shipped',
                                                'Not delivered',
                                                'Delivered',
                                                'Returned',
                                                'Cancelled',
                                            ].map((status) => (
                                                <View
                                                    key={status}
                                                    className="flex-row items-center gap-1"
                                                >
                                                    <View
                                                        className={`w-3 h-3 rounded-full border-2 ${
                                                            getStatusLabel(
                                                                transaction.status
                                                            ) === status
                                                                ? 'bg-green-600 border-green-600'
                                                                : 'border-gray-300'
                                                        }`}
                                                    />
                                                    <Text className="text-xs text-gray-600 font-primary">
                                                        {status}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Filter Modal */}
            <FilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
            />

            {/* Transaction Detail Modal */}
            <TransactionDetailModal
                visible={showTransactionModal}
                transaction={selectedTransaction}
                onClose={() => setShowTransactionModal(false)}
            />
        </BaseProvider>
    );
}
