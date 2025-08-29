import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Modal,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useState, useRef } from 'react';
import {
    Minus,
    Plus,
    X,
    CreditCard,
    DollarSign,
    Split,
} from 'lucide-react-native';
import { useCartStore } from '@/store/cart.store';
import { useUIStore } from '@/store/ui.store';
import { ToastUtils } from '@/utils/toast.util';
import { PaymentType, PaymentMethod } from '@/types/till.types';

/**
 * CartSidebar Component - Displays cart items, totals, and handles payment processing
 *
 * Features:
 * - Cart item management (add/remove/update quantities)
 * - Promo code application
 * - Payment method selection modal
 * - Split payment functionality
 * - Order processing
 */
export default function CartSidebar() {
    const {
        items,
        subtotal,
        tax,
        discount,
        total,
        symbol,
        isPaymentModalVisible,
        splitPayment,
        updateQuantity,
        removeItem,
        applyDiscount,
        removeDiscount,
        processPayment,
        setPaymentModalVisible,
        clearCart,
    } = useCartStore();
    const { setLoadingState } = useUIStore() || {};

    // Local state for promo code and split payment inputs
    const [promoCode, setPromoCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [selectedPaymentType, setSelectedPaymentType] =
        useState<PaymentType | null>(null);
    const [cashAmount, setCashAmount] = useState('');
    const [cardAmount, setCardAmount] = useState('');
    const [splitPaymentStep, setSplitPaymentStep] = useState<
        'input' | 'cash-processing' | 'card-processing'
    >('input');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Receipt options state
    const [receiptOptions, setReceiptOptions] = useState({
        print: false,
        sms: false,
        email: false,
    });
    const [receiptContact, setReceiptContact] = useState({
        phoneNumber: '',
        email: '',
    });
    const [receiptErrors, setReceiptErrors] = useState({
        phoneNumber: '',
        email: '',
    });

    // Animation refs and state
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;

    /**
     * Simplified transaction logging
     */
    const logBasketData = (payments: PaymentMethod[], paymentType: string) => {
        const totalPaid = payments.reduce(
            (sum, payment) => sum + payment.amount,
            0
        );
        const changeGiven = Math.max(0, totalPaid - total);

        console.log(
            `💰 ${paymentType} Payment: ${symbol}${total.toFixed(2)} | Items: ${items.length} | Change: ${symbol}${changeGiven.toFixed(2)} | items: ${items?.map((item) => item.name).join(', ')}`
        );

        // Show success toast
        setTimeout(() => {
            if ((global as any).showToast) {
                (global as any).showToast(
                    'Ready for Next Sale!',
                    'success',
                    4000,
                    '🎉'
                );
            } else {
                ToastUtils.success('Ready for Next Sale!', 4000, '🎉');
            }
        }, 1000);
    };

    /**
     * Handle promo code application
     */
    const handleApplyPromo = () => {
        if (!promoCode?.trim()) return;

        const code = promoCode.toLowerCase();

        // Simple promo logic - in real app this would be more sophisticated
        if (code === 'save10' || code === 'paay@2025') {
            const discountAmount = subtotal * 0.1;
            applyDiscount(discountAmount);
            setIsPromoApplied(true);
            ToastUtils.success(
                `Promo code "${promoCode}" applied! 10% discount added.`,
                3000,
                '🎉'
            );
        } else {
            ToastUtils.error(
                'Invalid promo code. Please try again.',
                3000,
                '❌'
            );
        }
    };

    /**
     * Handle promo code removal
     */
    const handleRemovePromo = () => {
        removeDiscount();
        setIsPromoApplied(false);
        setPromoCode('');
        ToastUtils.info('Promo code removed.', 2000, 'ℹ️');
    };

    /**
     * Handle place order button click - opens payment modal
     */
    const handlePlaceOrder = () => {
        if (items.length === 0) {
            ToastUtils.cart.emptyCart();
            return;
        }
        setPaymentModalVisible(true);
        animateModalIn();
    };

    /**
     * Animate modal entrance
     */
    const animateModalIn = () => {
        modalOpacity.setValue(0);
        modalScale.setValue(0.9);

        Animated.parallel([
            Animated.timing(modalOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(modalScale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    /**
     * Animate modal exit
     */
    const animateModalOut = () => {
        Animated.parallel([
            Animated.timing(modalOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(modalScale, {
                toValue: 0.9,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setPaymentModalVisible(false);
            setSelectedPaymentType(null);
            setCashAmount('');
            setCardAmount('');
            // Reset receipt options
            setReceiptOptions({
                print: false,
                sms: false,
                email: false,
            });
            setReceiptContact({
                phoneNumber: '',
                email: '',
            });
            setReceiptErrors({
                phoneNumber: '',
                email: '',
            });
            setSplitPaymentStep('input');
            setIsProcessingPayment(false);
        });
    };

    /**
     * Handle split payment calculation and processing
     */
    const handleSplitPayment = async () => {
        // Validate receipt options first
        if (!validateReceiptOptions()) {
            return;
        }

        const cash = parseFloat(cashAmount) || 0;
        const card = parseFloat(cardAmount) || 0;

        // Update split payment calculation before validation
        const { calculateSplitPayment } = useCartStore.getState();
        calculateSplitPayment(cash, card);

        const tolerance = 0.01; // Allow 1 cent tolerance for rounding
        if (Math.abs(cash + card - total) > tolerance) {
            ToastUtils.error('Split payment amounts do not match total');
            return;
        }

        // Start payment processing
        setIsProcessingPayment(true);
        setLoadingState?.('payment', true);

        if (cash > 0 && card > 0) {
            setSplitPaymentStep('cash-processing');

            // Simulate cash processing delay
            setTimeout(async () => {
                setSplitPaymentStep('card-processing');

                // Simulate card processing delay
                setTimeout(async () => {
                    const payments: PaymentMethod[] = [
                        { type: PaymentType.CASH, amount: cash },
                        { type: PaymentType.CARD, amount: card },
                    ];

                    // Log comprehensive basket data BEFORE processing payment
                    logBasketData(payments, 'Split');

                    // Process payment and handle cleanup
                    await processPayment(payments);
                    setSplitPaymentStep('input');
                    setIsProcessingPayment(false);

                    // Small delay to ensure state updates are complete before closing modal
                    setTimeout(() => {
                        // Backup cart clearing - ensure cart is empty for next transaction
                        if (items.length > 0) {
                            clearCart();
                        }

                        animateModalOut();
                    }, 500);
                }, 2000);
            }, 2000);
        } else {
            // Single payment type in split
            const payments: PaymentMethod[] = [];
            if (cash > 0) {
                payments.push({ type: PaymentType.CASH, amount: cash });
            }
            if (card > 0) {
                payments.push({ type: PaymentType.CARD, amount: card });
            }

            // Simulate payment processing delay
            setTimeout(async () => {
                // Log comprehensive basket data BEFORE processing payment
                logBasketData(payments, 'Split Single');

                // Process payment and handle cleanup
                await processPayment(payments);
                setIsProcessingPayment(false);

                // Small delay to ensure state updates are complete before closing modal
                setTimeout(() => {
                    // Backup cart clearing - ensure cart is empty for next transaction
                    if (items.length > 0) {
                        clearCart();
                    }

                    animateModalOut();
                }, 500);
            }, 2000);
        }
    };

    /**
     * Handle cash payment processing with change calculation
     */
    const handleCashPayment = async () => {
        // Validate receipt options first
        if (!validateReceiptOptions()) {
            return;
        }

        const cash = parseFloat(cashAmount) || 0;

        if (cash < total) {
            ToastUtils.error(
                `Cash amount must be at least ${symbol}${total.toFixed(2)}`
            );
            return;
        }

        const change = cash - total;

        const payment: PaymentMethod = {
            type: PaymentType.CASH,
            amount: cash,
            reference:
                change > 0
                    ? `Change: ${symbol}${change.toFixed(2)}`
                    : undefined,
        };

        setIsProcessingPayment(true);
        setLoadingState?.('payment', true);

        // Simulate payment processing delay
        setTimeout(async () => {
            // Log simplified transaction data
            logBasketData([payment], 'Cash');

            // Process payment and handle cleanup
            await processPayment([payment]);
            setIsProcessingPayment(false);

            // Small delay to ensure state updates are complete before closing modal
            setTimeout(() => {
                // Backup cart clearing - ensure cart is empty for next transaction
                if (items.length > 0) {
                    clearCart();
                }

                animateModalOut();
            }, 500);
        }, 2000);
    };

    /**
     * Handle card payment processing
     */
    const handleCardPayment = async () => {
        // Validate receipt options first
        if (!validateReceiptOptions()) {
            return;
        }

        const payment: PaymentMethod = {
            type: PaymentType.CARD,
            amount: total,
        };

        setIsProcessingPayment(true);
        setLoadingState?.('payment', true);

        // Simulate payment processing delay
        setTimeout(async () => {
            // Log simplified transaction data
            logBasketData([payment], 'Card');

            // Process payment and handle cleanup
            await processPayment([payment]);
            setIsProcessingPayment(false);

            // Small delay to ensure state updates are complete before closing modal
            setTimeout(() => {
                // Backup cart clearing - ensure cart is empty for next transaction
                if (items.length > 0) {
                    clearCart();
                }

                animateModalOut();
            }, 500);
        }, 2500);
    };

    /**
     * Handle cash amount change with auto card calculation for split payments
     */
    const handleCashAmountChange = (value: string) => {
        setCashAmount(value);
        if (selectedPaymentType === PaymentType.SPLIT) {
            const cash = parseFloat(value) || 0;
            const remaining = Math.max(0, total - cash);
            setCardAmount(remaining.toFixed(2));

            // Update split payment calculation
            const { calculateSplitPayment } = useCartStore.getState();
            calculateSplitPayment(cash, remaining);
        }
    };

    /**
     * Validate email address
     */
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Validate phone number (South African format)
     */
    const validatePhoneNumber = (phone: string): boolean => {
        const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    };

    /**
     * Handle receipt option change - only one option can be selected
     */
    const handleReceiptOptionChange = (
        option: 'print' | 'sms' | 'email',
        value: boolean
    ) => {
        // If selecting an option, clear all others first
        if (value) {
            setReceiptOptions({
                print: option === 'print',
                sms: option === 'sms',
                email: option === 'email',
            });
        } else {
            // If unselecting, just clear that option
            setReceiptOptions((prev) => ({ ...prev, [option]: false }));

            // Clear errors when unchecking
            if (option === 'sms') {
                setReceiptErrors((prev) => ({ ...prev, phoneNumber: '' }));
                setReceiptContact((prev) => ({ ...prev, phoneNumber: '' }));
            } else if (option === 'email') {
                setReceiptErrors((prev) => ({ ...prev, email: '' }));
                setReceiptContact((prev) => ({ ...prev, email: '' }));
            }
        }
    };

    /**
     * Handle receipt contact change with validation
     */
    const handleReceiptContactChange = (
        field: 'phoneNumber' | 'email',
        value: string
    ) => {
        setReceiptContact((prev) => ({ ...prev, [field]: value }));

        // Clear errors on change
        setReceiptErrors((prev) => ({ ...prev, [field]: '' }));
    };

    /**
     * Validate receipt options
     */
    const validateReceiptOptions = (): boolean => {
        let isValid = true;
        const errors = { phoneNumber: '', email: '' };

        if (
            receiptOptions.sms &&
            !validatePhoneNumber(receiptContact.phoneNumber)
        ) {
            errors.phoneNumber =
                'Please enter a valid South African phone number';
            isValid = false;
        }

        if (receiptOptions.email && !validateEmail(receiptContact.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        setReceiptErrors(errors);
        return isValid;
    };

    /**
     * Handle card amount change with auto cash calculation for split payments
     */
    const handleCardAmountChange = (value: string) => {
        setCardAmount(value);
        if (selectedPaymentType === PaymentType.SPLIT) {
            const card = parseFloat(value) || 0;
            const remaining = Math.max(0, total - card);
            setCashAmount(remaining.toFixed(2));

            // Update split payment calculation
            const { calculateSplitPayment } = useCartStore.getState();
            calculateSplitPayment(remaining, card);
        }
    };

    return (
        <View className="flex-1 p-1 bg-gray-200/20">
            {/* Header */}
            <View className="px-4 py-3 bg-blue-500 rounded border-b border-gray-200">
                <Text className="text-xl font-bold text-white font-primary">
                    Basket Summary{' '}
                    {`(${items.length}) ${items.length > 1 ? 'items' : ''}`}
                </Text>
            </View>

            {/* Cart Items */}
            <ScrollView className="flex-1 p-2">
                {items.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="mb-4 text-4xl font-primary">🛒</Text>
                        <Text className="mb-2 text-lg font-bold text-gray-600 font-primary">
                            No Item Selected
                        </Text>
                        <Text className="text-center text-gray-500 font-primary">
                            Add items from the menu to get started
                        </Text>
                    </View>
                ) : (
                    <View className="flex flex-col gap-2 p-1 w-full">
                        {items.map((item, index) => {
                            // Validate item data before rendering
                            if (
                                !item?.id ||
                                !item?.name ||
                                typeof item?.price !== 'number'
                            ) {
                                console.warn('Invalid item data:', item);
                                return null;
                            }

                            return (
                                <View
                                    key={`${item.id}-${index}`}
                                    className="relative flex-row items-center p-3 bg-white rounded border border-gray-200"
                                >
                                    {/* Item Image */}
                                    <View className="justify-center items-center mr-3 w-14 h-14 bg-gray-100 rounded-lg">
                                        <Text className="text-xl font-primary">
                                            {item.image}
                                        </Text>
                                    </View>

                                    {/* Item Details */}
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900 text-md font-primary">
                                            {item.name}
                                        </Text>
                                        <Text className="text-sm text-gray-500 font-primary">
                                            {symbol}
                                            {(
                                                item.calculatedPrice ??
                                                item.price
                                            ).toFixed(2)}
                                        </Text>
                                        {item.selectedVariants && (
                                            <View className="mt-1">
                                                {item.selectedVariants.size && (
                                                    <Text className="text-xs text-purple-600 font-primary">
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
                                                    <Text className="text-xs text-green-600 font-primary">
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
                                                    <Text className="text-xs text-blue-600 font-primary">
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
                                            <Text className="text-xs text-blue-600 font-primary">
                                                {item.notes}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Quantity Controls */}
                                    <View className="flex-row items-center">
                                        <Pressable
                                            onPress={() =>
                                                updateQuantity(
                                                    item.id,
                                                    Math.max(
                                                        1,
                                                        item.quantity - 1
                                                    )
                                                )
                                            }
                                            className="justify-center items-center w-8 h-8 bg-red-500 rounded-full"
                                        >
                                            <Minus size={16} color="#ffffff" />
                                        </Pressable>

                                        <TextInput
                                            value={item.quantity.toString()}
                                            onChangeText={(value) => {
                                                const numValue =
                                                    parseInt(value) || 1;
                                                updateQuantity(
                                                    item.id,
                                                    Math.max(1, numValue)
                                                );
                                            }}
                                            keyboardType="numeric"
                                            className="flex justify-center items-center p-2 mx-2 w-16 text-lg font-semibold text-center text-gray-900 bg-gray-100 rounded border border-gray-200/50 outline outline-blue-400 font-primary"
                                            selectTextOnFocus
                                        />

                                        <Pressable
                                            onPress={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity + 1
                                                )
                                            }
                                            className="justify-center items-center w-8 h-8 bg-green-500 rounded-full"
                                        >
                                            <Plus size={16} color="white" />
                                        </Pressable>
                                    </View>

                                    {/* Remove Button */}
                                    <Pressable
                                        onPress={() => removeItem(item.id)}
                                        className="flex justify-center items-center p-2 ml-4"
                                    >
                                        <X size={30} color="red" />
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Footer - Totals and Checkout */}
            {items.length > 0 && (
                <View className="px-4 py-4 bg-white rounded-md border border-gray-200">
                    {/* Promo Code */}
                    <View className="mb-4">
                        {!isPromoApplied ? (
                            <View className="flex-row">
                                <TextInput
                                    value={promoCode}
                                    onChangeText={setPromoCode}
                                    placeholder="Add Promo or Voucher"
                                    className="flex-1 p-4 rounded-l-lg border border-gray-200 font-primary"
                                />
                                <Pressable
                                    onPress={handleApplyPromo}
                                    className="px-4 py-4 bg-green-500 rounded-r-lg"
                                >
                                    <Text className="font-semibold text-white font-primary">
                                        Apply Promo
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View className="flex-row justify-between items-center px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                                <Text className="font-semibold text-green-800 font-primary">
                                    Promo Applied
                                </Text>
                                <Pressable onPress={handleRemovePromo}>
                                    <Text className="text-green-600 font-primary">
                                        Remove
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Totals */}
                    <View className="mb-4 space-y-2">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600 font-primary">
                                Subtotal
                            </Text>
                            <Text className="text-xl font-semibold font-primary">
                                {symbol}
                                {subtotal.toFixed(2)}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600 font-primary">
                                Tax (10%)
                            </Text>
                            <Text className="text-xl font-semibold font-primary">
                                {symbol}
                                {tax.toFixed(2)}
                            </Text>
                        </View>
                        {discount > 0 && (
                            <View className="flex-row justify-between">
                                <Text className="text-green-600 font-primary">
                                    Discount
                                </Text>
                                <Text className="text-xl font-semibold text-green-600 font-primary">
                                    -{symbol}
                                    {discount.toFixed(2)}
                                </Text>
                            </View>
                        )}
                        <View className="flex-row justify-between pt-2 border-t border-gray-200">
                            <Text className="text-lg font-bold text-gray-900 font-primary">
                                TOTAL
                            </Text>
                            <Text className="text-2xl font-bold text-gray-900 font-primary">
                                {symbol}
                                {total.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Place Order Button */}
                    <Pressable
                        onPress={handlePlaceOrder}
                        className="items-center py-4 bg-green-500 rounded-lg"
                    >
                        <Text className="text-lg font-bold text-white font-primary">
                            Place Order
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* Payment Modal */}
            <Modal
                visible={isPaymentModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => animateModalOut()}
                presentationStyle="overFullScreen"
            >
                {/* Animated Backdrop Overlay */}
                <Animated.View
                    style={{
                        opacity: modalOpacity,
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }}
                >
                    <Pressable
                        className="flex-1 justify-center items-center p-6"
                        onPress={() => animateModalOut()}
                        style={{ flex: 1 }}
                    >
                        <Pressable
                            onPress={(e) => e.stopPropagation()}
                            style={{ width: '100%', maxWidth: 400 }}
                        >
                            <Animated.View
                                style={{
                                    transform: [{ scale: modalScale }],
                                }}
                                className="bg-white rounded-2xl border border-gray-200 shadow-xl"
                            >
                                {/* Modal Header */}
                                <View className="relative px-6 pt-6 pb-4">
                                    <Pressable
                                        onPress={() =>
                                            setPaymentModalVisible(false)
                                        }
                                        className="absolute top-2 right-2 z-10 justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
                                    >
                                        <X size={22} color="#ffffff" />
                                    </Pressable>

                                    <Text className="mb-2 text-2xl font-bold text-gray-900 font-primary">
                                        Complete your payment
                                    </Text>
                                    <View className="flex flex-row justify-center items-center p-4 my-4 bg-gray-50 rounded-xl">
                                        <Text className="mr-2 text-sm font-semibold text-gray-600 font-primary">
                                            Total Amount:
                                        </Text>
                                        <Text className="text-2xl font-bold text-blue-600 font-primary">
                                            {symbol}
                                            {total.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Modal Content */}
                                <View className="px-6 pb-6">
                                    {(selectedPaymentType as PaymentType) ===
                                    PaymentType.SPLIT ? (
                                        /* Split Payment View */
                                        <View className="space-y-4">
                                            {/* Split Payment Processing Steps */}
                                            {splitPaymentStep ===
                                                'cash-processing' && (
                                                <View className="p-6 mb-4 bg-blue-50 rounded-xl border border-blue-200">
                                                    <View className="items-center">
                                                        <View className="justify-center items-center mb-4 w-16 h-16 bg-blue-100 rounded-full">
                                                            <Text className="text-2xl">
                                                                💵
                                                            </Text>
                                                        </View>
                                                        <Text className="mb-2 text-lg font-bold text-center text-blue-900 font-primary">
                                                            Processing Cash
                                                            Payment
                                                        </Text>
                                                        <Text className="text-center text-blue-700 font-primary">
                                                            Please wait while we
                                                            process the cash
                                                            payment...
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}

                                            {splitPaymentStep ===
                                                'card-processing' && (
                                                <View className="p-6 mb-4 bg-green-50 rounded-xl border border-green-200">
                                                    <View className="items-center">
                                                        <View className="justify-center items-center mb-4 w-16 h-16 bg-green-100 rounded-full">
                                                            <Text className="text-2xl">
                                                                💳
                                                            </Text>
                                                        </View>
                                                        <Text className="mb-2 text-lg font-bold text-center text-green-900 font-primary">
                                                            Cash Payment
                                                            Complete
                                                        </Text>
                                                        <Text className="text-center text-green-700 font-primary">
                                                            Cash payment
                                                            accepted. Now
                                                            processing card
                                                            payment...
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}

                                            {splitPaymentStep === 'input' && (
                                                <>
                                                    <View className="flex flex-row justify-center items-center p-4 mb-4 bg-amber-50 rounded-xl">
                                                        <Text className="mr-2 text-sm font-semibold text-gray-600 font-primary">
                                                            Total Amount:
                                                        </Text>
                                                        <Text className="text-xl font-bold text-amber-600 font-primary">
                                                            {symbol}
                                                            {total.toFixed(2)}
                                                        </Text>
                                                    </View>

                                                    <View className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                        <View className="flex-row items-center mb-3">
                                                            <View className="justify-center items-center mr-4 w-12 h-12 bg-amber-100 rounded-xl">
                                                                <Split
                                                                    size={24}
                                                                    color="#F59E0B"
                                                                />
                                                            </View>
                                                            <View className="flex-1">
                                                                <Text className="text-lg font-bold text-gray-900 font-primary">
                                                                    Split
                                                                    Payment
                                                                </Text>
                                                                <Text className="text-gray-600 font-primary">
                                                                    Divide
                                                                    payment
                                                                    between cash
                                                                    and card
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>

                                                    <View className="mt-6 space-y-4">
                                                        <View>
                                                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                                Cash Amount
                                                            </Text>
                                                            <TextInput
                                                                value={
                                                                    cashAmount
                                                                }
                                                                onChangeText={
                                                                    handleCashAmountChange
                                                                }
                                                                placeholder="0.00"
                                                                keyboardType="numeric"
                                                                className="p-4 text-lg rounded-xl border border-gray-200 font-primary"
                                                            />
                                                        </View>

                                                        <View>
                                                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                                Card Amount
                                                            </Text>
                                                            <TextInput
                                                                value={
                                                                    cardAmount
                                                                }
                                                                onChangeText={
                                                                    handleCardAmountChange
                                                                }
                                                                placeholder="0.00"
                                                                keyboardType="numeric"
                                                                className="p-4 text-lg rounded-xl border border-gray-200 font-primary"
                                                            />
                                                        </View>
                                                    </View>
                                                </>
                                            )}

                                            {splitPayment &&
                                                splitPayment?.difference !==
                                                    0 && (
                                                    <View className="p-3 bg-red-50 rounded-xl border border-red-200">
                                                        <Text className="font-semibold text-center text-red-700 font-primary">
                                                            Amount mismatch:{' '}
                                                            {symbol}
                                                            {Math.abs(
                                                                splitPayment?.difference
                                                            ).toFixed(2)}
                                                            {splitPayment?.difference >
                                                            0
                                                                ? ' short'
                                                                : ' over'}
                                                        </Text>
                                                    </View>
                                                )}

                                            <View className="flex-row gap-3 mt-6">
                                                <Pressable
                                                    onPress={() =>
                                                        setSelectedPaymentType(
                                                            null
                                                        )
                                                    }
                                                    className="flex-1 items-center py-4 bg-red-500 rounded-xl"
                                                    disabled={
                                                        isProcessingPayment
                                                    }
                                                >
                                                    <Text className="font-semibold text-white font-primary">
                                                        Cancel
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={handleSplitPayment}
                                                    className={`flex-1 items-center rounded-xl py-4 ${
                                                        splitPayment?.difference ===
                                                            0 &&
                                                        !isProcessingPayment
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-300'
                                                    }`}
                                                    disabled={
                                                        splitPayment?.difference !==
                                                            0 ||
                                                        isProcessingPayment
                                                    }
                                                >
                                                    <Text className="font-semibold text-white font-primary">
                                                        Pay
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : (selectedPaymentType as PaymentType) ===
                                      PaymentType.CASH ? (
                                        /* Cash Payment View */
                                        <View className="flex flex-col gap-2">
                                            <View className="p-4 bg-green-50 rounded-xl border border-green-200">
                                                <View className="flex-row items-center mb-3">
                                                    <View className="justify-center items-center mr-4 w-12 h-12 bg-green-100 rounded-xl">
                                                        <DollarSign
                                                            size={24}
                                                            color="#10B981"
                                                        />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-lg font-bold text-gray-900 font-primary">
                                                            Cash Payment
                                                        </Text>
                                                        <Text className="text-gray-600 font-primary">
                                                            Enter the cash
                                                            amount received
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="flex flex-col gap-2 justify-start">
                                                <View className="flex flex-row justify-center items-center p-4 mb-4 bg-blue-50 rounded-xl">
                                                    <Text className="mr-2 text-sm font-semibold text-gray-600 font-primary">
                                                        Total Due:
                                                    </Text>
                                                    <Text className="text-xl font-bold text-blue-600 font-primary">
                                                        {symbol}
                                                        {total.toFixed(2)}
                                                    </Text>
                                                </View>

                                                <View className="flex flex-col justify-start">
                                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                        Cash Received ({symbol})
                                                    </Text>
                                                    <TextInput
                                                        value={cashAmount}
                                                        onChangeText={
                                                            setCashAmount
                                                        }
                                                        placeholder="0.00"
                                                        keyboardType="numeric"
                                                        className="p-4 text-xl rounded-xl border border-gray-200 font-primary"
                                                        autoFocus
                                                    />
                                                </View>

                                                <View className="p-4 bg-green-50 rounded-xl border border-green-200">
                                                    <View className="flex-row justify-between items-center">
                                                        <Text className="text-lg font-semibold text-gray-700 font-primary">
                                                            Change Due
                                                        </Text>
                                                        <Text
                                                            className={`text-2xl font-bold font-primary ${
                                                                (parseFloat(
                                                                    cashAmount
                                                                ) || 0) >= total
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                            }`}
                                                        >
                                                            {symbol}
                                                            {Math.max(
                                                                0,
                                                                (parseFloat(
                                                                    cashAmount
                                                                ) || 0) - total
                                                            ).toFixed(2)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Loading Indicator */}
                                            {isProcessingPayment && (
                                                <View className="flex-row justify-center items-center p-4 mb-4 bg-blue-50 rounded-xl border border-blue-200">
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#3B82F6"
                                                    />
                                                    <Text className="ml-3 text-blue-700 font-primary">
                                                        Processing payment...
                                                    </Text>
                                                </View>
                                            )}

                                            <View className="flex-row gap-3 mt-6">
                                                <Pressable
                                                    onPress={() =>
                                                        setSelectedPaymentType(
                                                            null
                                                        )
                                                    }
                                                    className="flex-1 items-center py-4 bg-red-500 rounded-xl"
                                                    disabled={
                                                        isProcessingPayment
                                                    }
                                                >
                                                    <Text className="font-semibold text-white font-primary">
                                                        Cancel
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={handleCashPayment}
                                                    className={`flex-1 items-center rounded-xl py-4 ${
                                                        (parseFloat(
                                                            cashAmount
                                                        ) || 0) >= total &&
                                                        !isProcessingPayment
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-300'
                                                    }`}
                                                    disabled={
                                                        (parseFloat(
                                                            cashAmount
                                                        ) || 0) < total ||
                                                        isProcessingPayment
                                                    }
                                                >
                                                    <Text className="font-semibold text-white font-primary">
                                                        Pay
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : (selectedPaymentType as PaymentType) ===
                                      PaymentType.CARD ? (
                                        /* Card Payment View */
                                        <View className="space-y-4">
                                            <View className="flex flex-row justify-center items-center p-4 mb-4 bg-blue-50 rounded-xl">
                                                <Text className="mr-2 text-sm font-semibold text-gray-600 font-primary">
                                                    Amount to Pay:
                                                </Text>
                                                <Text className="text-xl font-bold text-blue-600 font-primary">
                                                    {symbol}
                                                    {total.toFixed(2)}
                                                </Text>
                                            </View>

                                            <View className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <View className="flex-row items-center mb-3">
                                                    <View className="justify-center items-center mr-4 w-12 h-12 bg-blue-100 rounded-xl">
                                                        <CreditCard
                                                            size={24}
                                                            color="#3B82F6"
                                                        />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-lg font-bold text-gray-900 font-primary">
                                                            Card Payment
                                                        </Text>
                                                        <Text className="text-gray-600 font-primary">
                                                            Prepare card for
                                                            payment
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="p-6 mt-6 bg-gray-50 rounded-xl border border-gray-200">
                                                <View className="items-center">
                                                    <View className="justify-center items-center mb-4 w-20 h-20 bg-blue-100 rounded-full">
                                                        <CreditCard
                                                            size={32}
                                                            color="#3B82F6"
                                                        />
                                                    </View>
                                                    <View className="flex flex-row gap-2">
                                                        <Text className="mb-2 text-lg font-bold text-center text-gray-900 font-primary">
                                                            Amount
                                                        </Text>
                                                        <Text className="mb-2 text-xl font-bold text-center text-gray-900 font-primary">
                                                            {symbol}
                                                            {total.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-center text-gray-600 font-primary">
                                                        Tap or insert card on
                                                        the machine when ready
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Loading Indicator */}
                                            {isProcessingPayment && (
                                                <View className="flex-row justify-center items-center p-4 mb-4 bg-blue-50 rounded-xl border border-blue-200">
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#3B82F6"
                                                    />
                                                    <Text className="ml-3 text-blue-700 font-primary">
                                                        Processing card
                                                        payment...
                                                    </Text>
                                                </View>
                                            )}

                                            <View className="flex-row gap-3 mt-6">
                                                <Pressable
                                                    onPress={() =>
                                                        setSelectedPaymentType(
                                                            null
                                                        )
                                                    }
                                                    className="flex-1 items-center py-4 bg-red-500 rounded-xl"
                                                    disabled={
                                                        isProcessingPayment
                                                    }
                                                >
                                                    <Text className="font-semibold text-white font-primary">
                                                        Cancel
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={handleCardPayment}
                                                    className={`flex-1 items-center rounded-xl py-4 ${
                                                        isProcessingPayment
                                                            ? 'bg-gray-300'
                                                            : 'bg-blue-500'
                                                    }`}
                                                    disabled={
                                                        isProcessingPayment
                                                    }
                                                >
                                                    <Text className="font-semibold text-white font-primary">
                                                        Start Card Payment
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : (
                                        /* Payment Method Selection */
                                        <>
                                            {/* Receipt Options */}
                                            <View className="p-4 mb-6 bg-gray-50 rounded-xl border border-gray-200">
                                                <Text className="mb-4 text-lg font-semibold text-gray-900 font-primary">
                                                    Receipt Options
                                                </Text>

                                                {/* Receipt Type Selection */}
                                                <View className="flex flex-row gap-4 justify-center items-center mb-4">
                                                    {/* Print Option */}
                                                    <Pressable
                                                        onPress={() =>
                                                            handleReceiptOptionChange(
                                                                'print',
                                                                !receiptOptions.print
                                                            )
                                                        }
                                                        className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border-2 ${
                                                            receiptOptions.print
                                                                ? 'bg-blue-500 border-blue-500'
                                                                : 'bg-white border-gray-300'
                                                        }`}
                                                    >
                                                        <Text
                                                            className={`font-semibold font-primary ${
                                                                receiptOptions.print
                                                                    ? 'text-white'
                                                                    : 'text-gray-700'
                                                            }`}
                                                        >
                                                            🖨️ Print
                                                        </Text>
                                                    </Pressable>

                                                    {/* SMS Option */}
                                                    <Pressable
                                                        onPress={() =>
                                                            handleReceiptOptionChange(
                                                                'sms',
                                                                !receiptOptions.sms
                                                            )
                                                        }
                                                        className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border-2 ${
                                                            receiptOptions.sms
                                                                ? 'bg-blue-500 border-blue-500'
                                                                : 'bg-white border-gray-300'
                                                        }`}
                                                    >
                                                        <Text
                                                            className={`font-semibold font-primary ${
                                                                receiptOptions.sms
                                                                    ? 'text-white'
                                                                    : 'text-gray-700'
                                                            }`}
                                                        >
                                                            📱 SMS
                                                        </Text>
                                                    </Pressable>

                                                    {/* Email Option */}
                                                    <Pressable
                                                        onPress={() =>
                                                            handleReceiptOptionChange(
                                                                'email',
                                                                !receiptOptions.email
                                                            )
                                                        }
                                                        className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border-2 ${
                                                            receiptOptions.email
                                                                ? 'bg-blue-500 border-blue-500'
                                                                : 'bg-white border-gray-300'
                                                        }`}
                                                    >
                                                        <Text
                                                            className={`font-semibold font-primary ${
                                                                receiptOptions.email
                                                                    ? 'text-white'
                                                                    : 'text-gray-700'
                                                            }`}
                                                        >
                                                            📧 Email
                                                        </Text>
                                                    </Pressable>
                                                </View>

                                                {/* Contact Input Fields - Side by Side */}
                                                {(receiptOptions.sms ||
                                                    receiptOptions.email) && (
                                                    <View className="flex flex-row gap-3">
                                                        {receiptOptions.sms && (
                                                            <View className="flex-1">
                                                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                                    Phone Number
                                                                </Text>
                                                                <TextInput
                                                                    value={
                                                                        receiptContact.phoneNumber
                                                                    }
                                                                    onChangeText={(
                                                                        value
                                                                    ) =>
                                                                        handleReceiptContactChange(
                                                                            'phoneNumber',
                                                                            value
                                                                        )
                                                                    }
                                                                    placeholder="0712345678"
                                                                    keyboardType="phone-pad"
                                                                    className={`p-3 rounded-lg border font-primary ${
                                                                        receiptErrors.phoneNumber
                                                                            ? 'border-red-500'
                                                                            : 'border-gray-300'
                                                                    }`}
                                                                />
                                                                {receiptErrors.phoneNumber && (
                                                                    <Text className="mt-1 text-sm text-red-500 font-primary">
                                                                        {
                                                                            receiptErrors.phoneNumber
                                                                        }
                                                                    </Text>
                                                                )}
                                                            </View>
                                                        )}

                                                        {receiptOptions.email && (
                                                            <View className="flex-1">
                                                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                                    Email
                                                                    Address
                                                                </Text>
                                                                <TextInput
                                                                    value={
                                                                        receiptContact.email
                                                                    }
                                                                    onChangeText={(
                                                                        value
                                                                    ) =>
                                                                        handleReceiptContactChange(
                                                                            'email',
                                                                            value
                                                                        )
                                                                    }
                                                                    placeholder="customer@example.com"
                                                                    keyboardType="email-address"
                                                                    autoCapitalize="none"
                                                                    className={`p-3 rounded-lg border font-primary ${
                                                                        receiptErrors.email
                                                                            ? 'border-red-500'
                                                                            : 'border-gray-300'
                                                                    }`}
                                                                />
                                                                {receiptErrors.email && (
                                                                    <Text className="mt-1 text-sm text-red-500 font-primary">
                                                                        {
                                                                            receiptErrors.email
                                                                        }
                                                                    </Text>
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                )}
                                            </View>

                                            <View className="flex flex-col gap-2 justify-start">
                                                {/* Cash Payment */}
                                                <Pressable
                                                    onPress={() =>
                                                        setSelectedPaymentType(
                                                            PaymentType.CASH
                                                        )
                                                    }
                                                    className={`rounded-xl border p-4 ${
                                                        selectedPaymentType ===
                                                        PaymentType.CASH
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200'
                                                    }`}
                                                >
                                                    <View className="flex-row justify-between items-center">
                                                        <View className="flex-row flex-1 items-center">
                                                            <View className="justify-center items-center mr-4 w-12 h-12 bg-green-100 rounded-xl">
                                                                <DollarSign
                                                                    size={24}
                                                                    color="#10B981"
                                                                />
                                                            </View>
                                                            <View className="flex-1">
                                                                <Text className="text-lg font-bold text-gray-900 font-primary">
                                                                    Cash Payment
                                                                </Text>
                                                                <Text className="text-gray-600 font-primary">
                                                                    Pay with
                                                                    physical
                                                                    cash at the
                                                                    counter
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View
                                                            className={`h-6 w-6 rounded-full border ${
                                                                selectedPaymentType ===
                                                                PaymentType.CASH
                                                                    ? 'border-green-500 bg-green-500'
                                                                    : 'border-gray-300'
                                                            } items-center justify-center`}
                                                        >
                                                            {selectedPaymentType ===
                                                                PaymentType.CASH && (
                                                                <View className="w-2 h-2 bg-white rounded-full" />
                                                            )}
                                                        </View>
                                                    </View>
                                                </Pressable>

                                                {/* Card Payment */}
                                                <Pressable
                                                    onPress={() =>
                                                        setSelectedPaymentType(
                                                            PaymentType.CARD
                                                        )
                                                    }
                                                    className={`rounded-xl border p-4 ${
                                                        selectedPaymentType ===
                                                        PaymentType.CARD
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200'
                                                    }`}
                                                >
                                                    <View className="flex-row justify-between items-center">
                                                        <View className="flex-row flex-1 items-center">
                                                            <View className="justify-center items-center mr-4 w-12 h-12 bg-blue-100 rounded-xl">
                                                                <CreditCard
                                                                    size={24}
                                                                    color="#3B82F6"
                                                                />
                                                            </View>
                                                            <View className="flex-1">
                                                                <Text className="text-lg font-bold text-gray-900 font-primary">
                                                                    Card Payment
                                                                </Text>
                                                                <Text className="text-gray-600 font-primary">
                                                                    Pay with
                                                                    credit or
                                                                    debit card
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View
                                                            className={`h-6 w-6 rounded-full border ${
                                                                selectedPaymentType ===
                                                                PaymentType.CARD
                                                                    ? 'border-green-500 bg-green-500'
                                                                    : 'border-gray-300'
                                                            } items-center justify-center`}
                                                        >
                                                            {selectedPaymentType ===
                                                                PaymentType.CARD && (
                                                                <View className="w-2 h-2 bg-white rounded-full" />
                                                            )}
                                                        </View>
                                                    </View>
                                                </Pressable>

                                                {/* Split Payment */}
                                                <Pressable
                                                    onPress={() =>
                                                        setSelectedPaymentType(
                                                            PaymentType.SPLIT
                                                        )
                                                    }
                                                    className={`rounded-xl border p-4 ${
                                                        (selectedPaymentType as PaymentType) ===
                                                        PaymentType.SPLIT
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200'
                                                    }`}
                                                >
                                                    <View className="flex-row justify-between items-center">
                                                        <View className="flex-row flex-1 items-center">
                                                            <View className="justify-center items-center mr-4 w-12 h-12 bg-amber-100 rounded-xl">
                                                                <Split
                                                                    size={24}
                                                                    color="#F59E0B"
                                                                />
                                                            </View>
                                                            <View className="flex-1">
                                                                <Text className="text-lg font-bold text-gray-900 font-primary">
                                                                    Split
                                                                    Payment
                                                                </Text>
                                                                <Text className="text-gray-600 font-primary">
                                                                    Combine cash
                                                                    and card
                                                                    payments
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View
                                                            className={`h-6 w-6 rounded-full border ${
                                                                (selectedPaymentType as PaymentType) ===
                                                                PaymentType.SPLIT
                                                                    ? 'border-green-500 bg-green-500'
                                                                    : 'border-gray-300'
                                                            } items-center justify-center`}
                                                        >
                                                            {(selectedPaymentType as PaymentType) ===
                                                                PaymentType.SPLIT && (
                                                                <View className="w-2 h-2 bg-white rounded-full" />
                                                            )}
                                                        </View>
                                                    </View>
                                                </Pressable>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </Animated.View>
                        </Pressable>
                    </Pressable>
                </Animated.View>
            </Modal>
        </View>
    );
}
