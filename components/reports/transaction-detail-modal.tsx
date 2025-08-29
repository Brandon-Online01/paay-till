import React from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import {
    X,
    Calendar,
    User,
    CreditCard,
    Package,
    MapPin,
    Truck,
} from 'lucide-react-native';
import { Transaction } from '@/types/transaction.types';

interface TransactionDetailModalProps {
    visible: boolean;
    transaction: Transaction | null;
    onClose: () => void;
}

export default function TransactionDetailModal({
    visible,
    transaction,
    onClose,
}: TransactionDetailModalProps) {
    if (!transaction) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }),
        };
    };

    const dateTime = formatDate(transaction.createdAt);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'canceled':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

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
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 justify-center items-center bg-black-900/80 overflow-scroll"
                style={{ flex: 1 }}
            >
                <View
                    className="flex-1 justify-center items-center overflow-scroll"
                    style={{ width: '90%', maxWidth: 600 }}
                >
                    <View
                        className="bg-white rounded-2xl border border-gray-200 shadow-xl"
                        style={{ height: '70%', width: '100%' }}
                    >
                        {/* Header */}
                        <View className="relative px-6 pt-6 pb-4 border-b border-gray-200">
                            <Pressable
                                onPress={onClose}
                                className="absolute top-2 right-2 z-10 justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
                            >
                                <X size={22} color="#ffffff" />
                            </Pressable>

                            <View>
                                <Text className="text-xl font-bold text-gray-900 font-primary">
                                    Sale Details
                                </Text>
                                <Text className="text-sm text-gray-600 font-primary">
                                    {transaction.transactionID}
                                </Text>
                            </View>
                        </View>

                        <ScrollView
                            className="flex-1 p-6"
                            showsVerticalScrollIndicator={true}
                        >
                            {/* Transaction Info */}
                            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-lg font-semibold text-gray-900 font-primary">
                                        Transaction Information
                                    </Text>
                                    <View
                                        className={`px-3 py-1 rounded-full ${getStatusColor(transaction.status)}`}
                                    >
                                        <Text className="text-xs font-semibold font-primary">
                                            {transaction.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View className="space-y-2">
                                    <View className="flex-row items-center">
                                        <Calendar size={16} color="#6b7280" />
                                        <Text className="ml-2 text-gray-600 font-primary">
                                            {dateTime.date} at {dateTime.time}
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center">
                                        <User size={16} color="#6b7280" />
                                        <Text className="ml-2 text-gray-600 font-primary">
                                            {transaction.customerName ||
                                                'Walk-in Customer'}
                                        </Text>
                                    </View>

                                    {transaction.receiptOptions
                                        ?.phoneNumber && (
                                        <View className="flex-row items-center">
                                            <Text className="ml-6 text-gray-500 font-primary">
                                                {
                                                    transaction.receiptOptions
                                                        .phoneNumber
                                                }
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Items */}
                            <View className="mb-6">
                                <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
                                    Items Purchased
                                </Text>
                                {transaction.items.map((item, index) => (
                                    <View
                                        key={index}
                                        className="flex-row justify-between items-center py-3 border-b border-gray-200"
                                    >
                                        <View className="flex-1">
                                            <Text className="font-semibold text-gray-900 font-primary">
                                                {item.name}
                                            </Text>
                                            <Text className="text-sm text-gray-600 font-primary">
                                                Qty: {item.quantity} × R
                                                {item.calculatedPrice?.toFixed(
                                                    2
                                                ) || item.price.toFixed(2)}
                                            </Text>
                                            {item.selectedVariants && (
                                                <View className="mt-1">
                                                    {item.selectedVariants
                                                        .size && (
                                                        <Text className="text-xs text-gray-500 font-primary">
                                                            Size:{' '}
                                                            {
                                                                item
                                                                    .selectedVariants
                                                                    .size
                                                            }
                                                        </Text>
                                                    )}
                                                    {item.selectedVariants
                                                        .flavor && (
                                                        <Text className="text-xs text-gray-500 font-primary">
                                                            Flavor:{' '}
                                                            {
                                                                item
                                                                    .selectedVariants
                                                                    .flavor
                                                            }
                                                        </Text>
                                                    )}
                                                    {item.selectedVariants
                                                        .color && (
                                                        <Text className="text-xs text-gray-500 font-primary">
                                                            Color:{' '}
                                                            {
                                                                item
                                                                    .selectedVariants
                                                                    .color
                                                            }
                                                        </Text>
                                                    )}
                                                </View>
                                            )}
                                            {item.notes && (
                                                <Text className="text-xs text-blue-600 mt-1 font-primary">
                                                    Note: {item.notes}
                                                </Text>
                                            )}
                                        </View>
                                        <Text className="font-semibold text-gray-900 font-primary">
                                            R{item.totalItemPrice.toFixed(2)}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Payment Methods */}
                            <View className="mb-6">
                                <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
                                    Payment Details
                                </Text>
                                {transaction.paymentMethods.map(
                                    (payment, index) => (
                                        <View
                                            key={index}
                                            className="flex-row justify-between items-center py-2"
                                        >
                                            <View className="flex-row items-center">
                                                <Text className="text-lg mr-2">
                                                    {getPaymentMethodIcon(
                                                        payment.type
                                                    )}
                                                </Text>
                                                <Text className="text-gray-700 font-primary capitalize">
                                                    {payment.type}
                                                </Text>
                                                {payment.cardLast4 && (
                                                    <Text className="text-gray-500 ml-2 font-primary">
                                                        ****{payment.cardLast4}
                                                    </Text>
                                                )}
                                            </View>
                                            <Text className="font-semibold text-gray-900 font-primary">
                                                R{payment.amount.toFixed(2)}
                                            </Text>
                                        </View>
                                    )
                                )}
                            </View>

                            {/* Price Breakdown */}
                            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
                                    Price Breakdown
                                </Text>

                                <View className="space-y-2">
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 font-primary">
                                            Subtotal
                                        </Text>
                                        <Text className="text-gray-900 font-primary">
                                            R{transaction.subtotal.toFixed(2)}
                                        </Text>
                                    </View>

                                    {transaction.discount > 0 && (
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-600 font-primary">
                                                Discount
                                            </Text>
                                            <Text className="text-green-600 font-primary">
                                                -R
                                                {transaction.discount.toFixed(
                                                    2
                                                )}
                                            </Text>
                                        </View>
                                    )}

                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600 font-primary">
                                            Tax
                                        </Text>
                                        <Text className="text-gray-900 font-primary">
                                            R{transaction.tax.toFixed(2)}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between pt-2 border-t border-gray-300">
                                        <Text className="text-lg font-semibold text-gray-900 font-primary">
                                            Total
                                        </Text>
                                        <Text className="text-lg font-semibold text-gray-900 font-primary">
                                            R
                                            {transaction.totalAmount.toFixed(2)}
                                        </Text>
                                    </View>

                                    {transaction.change > 0 && (
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-600 font-primary">
                                                Change Given
                                            </Text>
                                            <Text className="text-gray-900 font-primary">
                                                R{transaction.change.toFixed(2)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Receipt Options */}
                            {transaction.receiptOptions && (
                                <View className="mb-6">
                                    <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
                                        Receipt Options
                                    </Text>
                                    <View className="space-y-1">
                                        {transaction.receiptOptions.print && (
                                            <Text className="text-gray-600 font-primary">
                                                ✓ Printed receipt
                                            </Text>
                                        )}
                                        {transaction.receiptOptions.sms && (
                                            <Text className="text-gray-600 font-primary">
                                                ✓ SMS receipt
                                            </Text>
                                        )}
                                        {transaction.receiptOptions.email && (
                                            <Text className="text-gray-600 font-primary">
                                                ✓ Email receipt
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
