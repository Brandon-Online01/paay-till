import { View, Text, Pressable } from 'react-native';
import { useCallback, useMemo } from 'react';
import { Calendar, User, Package } from 'lucide-react-native';
import { Transaction } from '@/types/transaction.types';

/**
 * Props interface for TransactionCard component
 */
interface TransactionCardProps {
    /** Transaction data to display */
    transaction: Transaction;
    /** Callback for when card is pressed */
    onPress: (transaction: Transaction) => void;
}

/**
 * TransactionCard Component - Card layout for transaction display
 *
 * Features:
 * - Compact transaction overview
 * - Visual status indicators
 * - Payment method display
 * - Customer information
 * - Item preview
 */
export default function TransactionCard({
    transaction,
    onPress,
}: TransactionCardProps) {
    /**
     * Handle card press
     */
    const handlePress = useCallback(() => {
        onPress(transaction);
    }, [transaction, onPress]);

    /**
     * Format date for display
     */
    const formatDate = useMemo(() => {
        const date = new Date(transaction.createdAt);
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
    }, [transaction.createdAt]);

    /**
     * Get status color classes
     */
    const statusColor = useMemo(() => {
        switch (transaction.status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }, [transaction.status]);

    /**
     * Get status label
     */
    const statusLabel = useMemo(() => {
        switch (transaction.status) {
            case 'completed':
                return 'Delivered';
            case 'pending':
                return 'Shipped';
            case 'canceled':
                return 'Cancelled';
            default:
                return transaction.status;
        }
    }, [transaction.status]);

    /**
     * Get payment method icon
     */
    const getPaymentMethodIcon = (type: string) => {
        switch (type) {
            case 'cash':
                return '💵';
            case 'card':
                return '💳';
            case 'mobile':
                return '📱';
            case 'link':
                return '🔗';
            case 'account':
                return '🏦';
            default:
                return '💳';
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-95"
        >
            {/* Status Badge */}
            <View className="absolute top-2 right-2 z-10">
                <View className={`px-2 py-1 rounded-full ${statusColor}`}>
                    <Text className="text-xs font-semibold font-primary">
                        {statusLabel}
                    </Text>
                </View>
            </View>

            {/* Transaction ID */}
            <Text className="mb-2 text-xs text-gray-500 font-primary">
                {transaction.transactionID}
            </Text>

            {/* Date and Time */}
            <View className="flex-row items-center mb-2">
                <Calendar size={14} color="#6b7280" />
                <Text className="ml-1 text-sm font-semibold text-gray-900 font-primary">
                    {formatDate.date}
                </Text>
                <Text className="ml-1 text-sm text-gray-500 font-primary">
                    {formatDate.time}
                </Text>
            </View>

            {/* Customer */}
            <View className="flex-row items-center mb-2">
                <User size={14} color="#6b7280" />
                <Text className="ml-1 text-sm text-gray-700 font-primary">
                    {transaction.customerName || 'Walk-in Customer'}
                </Text>
            </View>

            {/* Items Preview */}
            <View className="flex-row items-center mb-3">
                <Package size={14} color="#6b7280" />
                <View className="flex-1 ml-1">
                    {transaction.items.slice(0, 2).map((item, index) => (
                        <Text
                            key={index}
                            className="text-xs text-gray-600 font-primary"
                        >
                            {item.image} {item.quantity}× {item.name}
                        </Text>
                    ))}
                    {transaction.items.length > 2 && (
                        <Text className="text-xs text-gray-500 font-primary">
                            +{transaction.items.length - 2} more
                        </Text>
                    )}
                </View>
            </View>

            {/* Total Amount */}
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-blue-600 font-primary">
                    R{transaction.totalAmount.toFixed(2)}
                </Text>
                <Text className="text-sm text-gray-500 font-primary">
                    {transaction.items.length} item
                    {transaction.items.length > 1 ? 's' : ''}
                </Text>
            </View>

            {/* Payment Methods */}
            <View className="flex-row flex-wrap gap-1">
                {transaction.paymentMethods.map((payment, index) => (
                    <View key={index} className="flex-row items-center">
                        <Text className="text-sm mr-1">
                            {getPaymentMethodIcon(payment.type)}
                        </Text>
                        <Text className="text-xs text-gray-600 font-primary">
                            R{payment.amount.toFixed(2)}
                        </Text>
                        {index < transaction.paymentMethods.length - 1 && (
                            <Text className="text-xs text-gray-400 mx-1">
                                •
                            </Text>
                        )}
                    </View>
                ))}
            </View>

            {/* Cashier Info */}
            <Text className="mt-2 text-xs text-gray-400 font-primary">
                👨‍💼 {transaction.cashierID || 'Unknown'}
            </Text>
        </Pressable>
    );
}
