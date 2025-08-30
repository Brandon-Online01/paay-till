import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import info from '../data/info.json';
import {
    PaymentType,
    OrderStatus,
    SplitPayment,
    PaymentMethod,
    MenuItem,
    CartItem,
    Order,
    CartStore,
} from '../types';

const TILL_DATA = info.till;

/**
 * Optimized cart store with better performance patterns
 */
export const useCartStore = create<CartStore>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        currentOrder: null,
        selectedPayments: [],
        splitPayment: undefined,
        customerName: '',
        selectedCategory: 'all',
        searchQuery: '',
        isCartOpen: false,
        isPaymentModalVisible: false,
        isReceiptModalVisible: false,
        currency: TILL_DATA.branch.currency,
        symbol: TILL_DATA.branch.symbol,
        tillConfig: {
            ...TILL_DATA,
            payment: {
                types: [
                    PaymentType.CASH,
                    PaymentType.CARD,
                    PaymentType.LINK,
                    PaymentType.ACCOUNT,
                    PaymentType.SPLIT,
                ] as PaymentType[],
            },
        },

        // Actions
        /**
         * Add an item to the cart with optional quantity, notes, and badge
         */
        addItem: (
            item: MenuItem,
            quantity = 1,
            notes,
            badge,
            selectedVariants
        ) => {
            // Validate input parameters
            if (!item?.id || !item?.name || typeof item?.price !== 'number') {
                console.error('Invalid item data provided to addItem');
                return;
            }

            const state = get();

            // Calculate variant price
            let variantPrice = 0;
            if (selectedVariants && item.variants) {
                if (selectedVariants.size && item.variants.sizes) {
                    const sizeVariant = item.variants.sizes.find(
                        (s) => s.name === selectedVariants.size
                    );
                    if (sizeVariant) variantPrice += sizeVariant.price;
                }
                if (selectedVariants.flavor && item.variants.flavors) {
                    const flavorVariant = item.variants.flavors.find(
                        (f) => f.name === selectedVariants.flavor
                    );
                    if (flavorVariant) variantPrice += flavorVariant.price;
                }
                if (selectedVariants.color && item.variants.colors) {
                    const colorVariant = item.variants.colors.find(
                        (c) => c.name === selectedVariants.color
                    );
                    if (colorVariant) variantPrice += colorVariant.price;
                }
            }

            const calculatedPrice = item.price + variantPrice;

            // Check if identical item with same variants already exists
            const existingItemIndex = state.items.findIndex((cartItem) => {
                if (cartItem.id !== item.id) return false;

                // Check if variants match
                const existingVariants = cartItem.selectedVariants;
                if (!selectedVariants && !existingVariants) return true;
                if (!selectedVariants || !existingVariants) return false;

                return (
                    existingVariants.size === selectedVariants.size &&
                    existingVariants.flavor === selectedVariants.flavor &&
                    existingVariants.color === selectedVariants.color
                );
            });

            if (existingItemIndex > -1) {
                // Update existing item quantity and notes
                const updatedItems = [...state.items];
                updatedItems[existingItemIndex].quantity += quantity;
                if (notes) {
                    updatedItems[existingItemIndex].notes = notes;
                }
                set({ items: updatedItems });
            } else {
                // Add new item to cart
                const newItem: CartItem = {
                    ...item,
                    quantity,
                    notes,
                    badge,
                    selectedVariants,
                    variantPrice,
                    calculatedPrice,
                };
                set({ items: [...state.items, newItem] });
            }

            get().calculateTotals();
        },

        /**
         * Update the quantity of an item in the cart
         */
        updateQuantity: (itemId: string, quantity: number) => {
            if (!itemId || typeof quantity !== 'number') {
                console.error('Invalid parameters provided to updateQuantity');
                return;
            }

            if (quantity <= 0) {
                get().removeItem(itemId);
                return;
            }

            const state = get();
            const updatedItems = state.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            );
            set({ items: updatedItems });
            get().calculateTotals();
        },

        /**
         * Remove an item from the cart
         */
        removeItem: (itemId: string) => {
            if (!itemId) {
                console.error('Invalid itemId provided to removeItem');
                return;
            }

            const state = get();
            const updatedItems = state.items.filter(
                (item) => item.id !== itemId
            );
            set({ items: updatedItems });
            get().calculateTotals();
        },

        /**
         * Clear all items from the cart and reset order state
         */
        clearCart: () => {
            console.log('🧹 Cart cleared - ready for next transaction');

            set({
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
                discount: 0,
                selectedPayments: [],
                splitPayment: undefined,
                currentOrder: null,
                customerName: '',
                isPaymentModalVisible: false,
                isReceiptModalVisible: false,
            });
        },

        /**
         * Set the customer name for the order
         */
        setCustomerName: (customerName: string) => {
            set({ customerName });
        },

        /**
         * Apply a discount to the order
         */
        applyDiscount: (amount: number) => {
            if (typeof amount !== 'number' || amount < 0) {
                console.error('Invalid discount amount provided');
                return;
            }
            set({ discount: amount });
            get().calculateTotals();
        },

        /**
         * Remove any applied discount
         */
        removeDiscount: () => {
            set({ discount: 0 });
            get().calculateTotals();
        },

        /**
         * Set selected payment methods for the order
         */
        setSelectedPayments: (payments: PaymentMethod[]) => {
            // Validate payment methods
            if (!Array.isArray(payments)) {
                console.error('Invalid payments array provided');
                return;
            }

            const validPayments = payments.filter(
                (payment) =>
                    payment?.type && typeof payment?.amount === 'number'
            );

            set({ selectedPayments: validPayments });
        },

        /**
         * Set split payment details
         */
        setSplitPayment: (splitPayment: SplitPayment | undefined) => {
            set({ splitPayment });
        },

        /**
         * Calculate split payment amounts and difference
         */
        calculateSplitPayment: (cashAmount: number, cardAmount: number) => {
            const state = get();
            const totalAmount = state.total;
            const totalPaid = cashAmount + cardAmount;
            const difference = totalAmount - totalPaid;

            const splitPayment: SplitPayment = {
                cashAmount,
                cardAmount,
                totalAmount,
                difference,
            };

            set({ splitPayment });
        },

        /**
         * Set the selected category filter
         */
        setSelectedCategory: (category: string) => {
            set({ selectedCategory: category });
        },

        /**
         * Set the search query
         */
        setSearchQuery: (query: string) => {
            set({ searchQuery: query });
        },

        /**
         * Toggle cart sidebar visibility
         */
        toggleCart: () => {
            set((state) => ({ isCartOpen: !state.isCartOpen }));
        },

        /**
         * Show/hide payment modal
         */
        setPaymentModalVisible: (visible: boolean) => {
            set({ isPaymentModalVisible: visible });
        },

        /**
         * Show/hide receipt delivery modal
         */
        setReceiptModalVisible: (visible: boolean) => {
            set({ isReceiptModalVisible: visible });
        },

        /**
         * Recalculate cart totals based on current items
         */
        calculateTotals: () => {
            const state = get();
            const subtotal = state.items.reduce((sum, item) => {
                if (!item?.quantity) return sum;
                // Use calculatedPrice if available (includes variant pricing), otherwise use base price
                const itemPrice = item.calculatedPrice ?? item.price;
                return sum + itemPrice * item.quantity;
            }, 0);

            const tax = subtotal * 0.1; // 10% tax
            const total = subtotal + tax - state.discount;

            set({ subtotal, tax, total });
        },

        /**
         * Create a new order from current cart state
         */
        createOrder: () => {
            const state = get();
            const orderId = `#${String(Date.now()).slice(-6)}`;

            const order: Order = {
                id: orderId,
                items: state.items,
                payments: state.selectedPayments,
                splitPayment: state.splitPayment,
                subtotal: state.subtotal,
                tax: state.tax,
                discount: state.discount,
                total: state.total,
                customerName: state.customerName || undefined,
                status: OrderStatus.PENDING,
                createdAt: new Date(),
            };

            set({ currentOrder: order });
            return order;
        },

        /**
         * Process payment and complete the order
         */
        processPayment: async (payments: PaymentMethod[]) => {
            const state = get();

            const totalPaid = payments.reduce(
                (sum, payment) => sum + payment.amount,
                0
            );

            if (totalPaid < state.total) {
                return;
            }

            // Create or use existing order
            const currentOrder = state.currentOrder || {
                id: `order-${Date.now()}`,
                items: state.items,
                subtotal: state.subtotal,
                tax: state.tax,
                discount: state.discount,
                total: state.total,
                createdAt: new Date(),
                payments: [],
                status: OrderStatus.PENDING,
            };

            const completedOrder: Order = {
                ...currentOrder,
                id: currentOrder.id || `order-${Date.now()}`,
                items: currentOrder.items || state.items,
                subtotal: currentOrder.subtotal || state.subtotal,
                tax: currentOrder.tax || state.tax,
                discount: currentOrder.discount || state.discount,
                total: currentOrder.total || state.total,
                createdAt: currentOrder.createdAt || new Date(),
                payments,
                status: OrderStatus.PAID,
                completedAt: new Date(),
            };

            // Calculate change amount (for cash payments)
            const changeAmount = Math.max(0, totalPaid - state.total);

            // Save transaction to database
            try {
                const { TransactionService } = await import(
                    '../@db/transaction.service'
                );

                await TransactionService.saveTransaction({
                    cashierID: 'current-cashier', // TODO: Get from auth context
                    orderID: completedOrder.id,
                    items: state.items,
                    paymentMethods: payments.map((payment) => ({
                        type: payment.type as any,
                        amount: payment.amount,
                        reference: payment.reference,
                    })),
                    subtotal: state.subtotal,
                    tax: state.tax,
                    discount: state.discount,
                    totalAmount: state.total,
                    change: changeAmount,
                    customerName: state.customerName,
                    currency: state.currency,
                    currencySymbol: state.symbol,
                    additionalMetrics: {
                        itemCount: state.items.length,
                        paymentCount: payments.length,
                        deviceType: 'till',
                        location: state.tillConfig?.branch?.name || 'Unknown',
                    },
                });

                console.log(`💾 Transaction saved to database successfully`);
            } catch (error) {
                console.error(
                    '❌ Failed to save transaction to database:',
                    error
                );

                // Show user notification for failed database save
                setTimeout(() => {
                    if (
                        typeof window !== 'undefined' &&
                        (global as any).showToast
                    ) {
                        (global as any).showToast(
                            'Transaction completed but failed to save to database. Please manually record this sale.',
                            'error',
                            8000,
                            '⚠️'
                        );
                    }
                }, 2000);

                // Log detailed transaction info for manual entry
                console.log(
                    `🔴 MANUAL ENTRY REQUIRED - Transaction ${completedOrder.id}:`
                );
                console.log(
                    `   - Amount: ${state.symbol}${completedOrder.total.toFixed(2)}`
                );
                console.log(
                    `   - Items: ${state.items.map((item) => `${item.name} (${item.quantity})`).join(', ')}`
                );
                console.log(
                    `   - Payment: ${payments.map((p) => `${p.type}: ${state.symbol}${p.amount.toFixed(2)}`).join(', ')}`
                );
                console.log(`   - Time: ${new Date().toLocaleString()}`);

                // Don't block the payment flow if database save fails
                // TODO: Add retry mechanism or queue for offline storage
            }

            // Transaction completion
            console.log(
                `✅ Transaction ${completedOrder.id} completed - ${state.symbol}${completedOrder.total.toFixed(2)}`
            );

            // Clear cart immediately after successful payment
            set({
                // Order completion
                currentOrder: completedOrder,

                // Modal states
                isPaymentModalVisible: false,
                isReceiptModalVisible: false,

                // Cart clearing - immediate reset for next transaction
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
                discount: 0,
                selectedPayments: [],
                splitPayment: undefined,
                customerName: '',
            });

            // Reset UI state for next transaction
            if (typeof window !== 'undefined' && (global as any).resetUIState) {
                (global as any).resetUIState();
            }
        },

        /**
         * Complete receipt delivery and reset cart (legacy function - cart is now cleared immediately after payment)
         */
        completeReceiptDelivery: () => {
            set({ isReceiptModalVisible: false });
            // Cart is already cleared after payment processing
        },
    }))
);
