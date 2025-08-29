import { Text, View, ScrollView, Pressable, TextInput } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, Calendar, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react-native';
import BaseProvider from '@/providers/base.provider';
import { TransactionService } from '@/@db/transaction.service';
import { Transaction } from '@/types/transaction.types';

interface SalesMetrics {
    totalSales: number;
    totalRefunds: number;
    netSales: number;
    transactionCount: number;
    averageTransaction: number;
    totalDiscount: number;
}

export default function Reports() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
    const [activeTab, setActiveTab] = useState<'Orders' | 'Reviews' | 'Social Media'>('Orders');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const allTransactions = await TransactionService.getTransactions();
            
            setTransactions(allTransactions);
            setFilteredTransactions(allTransactions);
            
            const salesMetrics = await TransactionService.getSalesSummary();
            setMetrics(salesMetrics);
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    };

    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = filteredTransactions;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(t => 
                t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.transactionID.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(t => t.status === selectedStatus);
        }

        // Sort transactions
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'amount':
                    return b.totalAmount - a.totalAmount;
                case 'customer':
                    return (a.customerName || '').localeCompare(b.customerName || '');
                default:
                    return 0;
            }
        });

        return filtered;
    }, [filteredTransactions, searchQuery, sortBy, selectedStatus]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
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

    return (
        <BaseProvider>
            <ScrollView className="flex-1 bg-gray-200/20">
                {/* Header */}
                <View className="px-6 py-4">
                    <Text className="text-2xl font-bold text-gray-900 font-primary">
                        Sales Dashboard
                    </Text>
                </View>

                {/* Metric Cards */}
                <View className="px-6 py-4">
                    <View className="flex-row gap-4">
                        <View className="flex-1 p-4 bg-white rounded-lg border border-gray-200">
                            <View className="flex-row items-center gap-2 mb-2">
                                <DollarSign size={20} color="#059669" />
                                <Text className="text-sm text-gray-600 font-primary">Total Sales</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 font-primary">
                                R{metrics?.totalSales.toFixed(2) || '0.00'}
                            </Text>
                        </View>
                        
                        <View className="flex-1 p-4 bg-white rounded-lg border border-gray-200">
                            <View className="flex-row items-center gap-2 mb-2">
                                <ShoppingBag size={20} color="#2563eb" />
                                <Text className="text-sm text-gray-600 font-primary">Orders</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 font-primary">
                                {metrics?.transactionCount || 0}
                            </Text>
                        </View>
                    </View>
                    
                    <View className="flex-row gap-4 mt-4">
                        <View className="flex-1 p-4 bg-white rounded-lg border border-gray-200">
                            <View className="flex-row items-center gap-2 mb-2">
                                <TrendingUp size={20} color="#7c3aed" />
                                <Text className="text-sm text-gray-600 font-primary">Avg Order</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 font-primary">
                                R{metrics?.averageTransaction.toFixed(2) || '0.00'}
                            </Text>
                        </View>
                        
                        <View className="flex-1 p-4 bg-white rounded-lg border border-gray-200">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Calendar size={20} color="#dc2626" />
                                <Text className="text-sm text-gray-600 font-primary">Net Sales</Text>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 font-primary">
                                R{metrics?.netSales.toFixed(2) || '0.00'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View className="px-6 py-2">
                    <View className="flex-row gap-6">
                        {(['Orders', 'Reviews', 'Social Media'] as const).map((tab) => (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`pb-2 border-b-2 ${
                                    activeTab === tab ? 'border-blue-600' : 'border-transparent'
                                }`}
                            >
                                <Text className={`font-primary ${
                                    activeTab === tab ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                }`}>
                                    {tab}
                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Search and Filters */}
                <View className="px-6 py-4 bg-white">
                    <View className="flex-row items-center gap-4">
                        {/* Search Bar */}
                        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
                            <Search size={20} color="#6b7280" />
                            <TextInput
                                placeholder="Search orders, customers..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                className="flex-1 ml-2 text-gray-900 font-primary"
                            />
                        </View>

                        {/* Time Filter */}
                        <Pressable className="flex-row items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                            <Calendar size={16} color="#6b7280" />
                            <Text className="text-gray-700 font-primary">This Month</Text>
                            <ChevronDown size={16} color="#6b7280" />
                        </Pressable>

                        {/* Sort By */}
                        <Pressable className="flex-row items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                            <Text className="text-gray-700 font-primary">Sort by</Text>
                            <ChevronDown size={16} color="#6b7280" />
                        </Pressable>

                        {/* Filter Button */}
                        <Pressable className="flex-row items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg">
                            <Filter size={16} color="white" />
                            <Text className="text-white font-primary">Filter</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Transaction List */}
                <View className="px-6 py-4">
                    {filteredAndSortedTransactions.map((transaction) => {
                        const dateTime = formatDate(transaction.createdAt);
                        
                        return (
                            <View key={transaction.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                {/* Header Row */}
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-sm text-gray-600 font-primary">Created</Text>
                                            <Text className="text-sm text-gray-600 font-primary">Customer</Text>
                                            <Text className="text-sm text-gray-600 font-primary">Items</Text>
                                            <Text className="text-sm text-gray-600 font-primary">Cost</Text>
                                            <Text className="text-sm text-gray-600 font-primary">Status</Text>
                                            <Text className="text-sm text-gray-600 font-primary">Payment</Text>
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
                                                    {transaction.customerName || 'Walk-in Customer'}
                                                </Text>
                                                <Text className="text-xs text-gray-500 font-primary">
                                                    {transaction.receiptOptions?.phoneNumber || '+27 XXX XXXX'}
                                                </Text>
                                            </View>

                                            {/* Items */}
                                            <View className="flex-1">
                                                {transaction.items.slice(0, 2).map((item, index) => (
                                                    <Text key={index} className="text-xs text-gray-700 font-primary">
                                                        • {item.quantity}x {item.name}
                                                    </Text>
                                                ))}
                                                {transaction.items.length > 2 && (
                                                    <Text className="text-xs text-gray-500 font-primary">
                                                        +{transaction.items.length - 2} more
                                                    </Text>
                                                )}
                                            </View>

                                            {/* Cost */}
                                            <View className="flex-1">
                                                <Text className="text-sm font-bold text-gray-900 font-primary">
                                                    R{transaction.totalAmount.toFixed(2)}
                                                </Text>
                                            </View>

                                            {/* Status */}
                                            <View className="flex-1">
                                                <Text className={`text-sm font-semibold font-primary ${getStatusColor(transaction.status)}`}>
                                                    {getStatusLabel(transaction.status)}
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
                                    <Text className="text-xs text-gray-600 mb-2 font-primary">Status:</Text>
                                    <View className="flex-row gap-4">
                                        {['Shipped', 'Not delivered', 'Delivered', 'Returned', 'Cancelled'].map((status) => (
                                            <View key={status} className="flex-row items-center gap-1">
                                                <View className={`w-3 h-3 rounded-full border-2 ${
                                                    getStatusLabel(transaction.status) === status ? 'bg-green-600 border-green-600' : 'border-gray-300'
                                                }`} />
                                                <Text className="text-xs text-gray-600 font-primary">{status}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {filteredAndSortedTransactions.length === 0 && (
                        <View className="py-12 text-center">
                            <Text className="text-gray-500 font-primary">No transactions found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </BaseProvider>
    );
}
