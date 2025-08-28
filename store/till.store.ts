import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
    ConnectivityStatus,
    TillMode,
    ReceiptOptions,
    PaymentModalState,
    ReceiptModalState,
    TillPreferences,
    TillConnectivity,
    TillStore,
} from '../types';

/**
 * Optimized till store with better performance patterns
 */
export const useTillStore = create<TillStore>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        mode: TillMode.SALE,
        isSearchActive: false,
        isCategoryExpanded: false,
        selectedCategory: 'all',

        paymentModal: {
            visible: false,
            selectedMethod: '',
            amount: 0,
            cashReceived: 0,
            change: 0,
        },

        receiptModal: {
            visible: false,
            options: {
                sms: false,
                email: false,
                phoneNumber: '',
                emailAddress: '',
            },
        },

        preferences: {
            defaultReceipt: 'print',
            autoPrint: true,
            showImages: true,
            hapticFeedback: true,
            currencyFormat: 'symbol',
        },

        connectivity: {
            printer: ConnectivityStatus.CONNECTED,
            scanner: ConnectivityStatus.CONNECTED,
            cloud: ConnectivityStatus.CONNECTED,
            lastSync: new Date(),
        },

        // Optimized UI Actions
        setMode: (mode: TillMode) => {
            set({ mode });
        },

        toggleSearch: () => {
            set((state) => ({ isSearchActive: !state.isSearchActive }));
        },

        setSearchActive: (active: boolean) => {
            set({ isSearchActive: active });
        },

        toggleCategoryExpanded: () => {
            set((state) => ({ isCategoryExpanded: !state.isCategoryExpanded }));
        },

        setSelectedCategory: (category: string) => {
            set({ selectedCategory: category });
        },

        // Optimized Payment Actions
        showPaymentModal: (amount: number) => {
            set((state) => ({
                paymentModal: {
                    ...state.paymentModal,
                    visible: true,
                    amount,
                    cashReceived: 0,
                    change: 0,
                },
            }));
        },

        hidePaymentModal: () => {
            set((state) => ({
                paymentModal: {
                    ...state.paymentModal,
                    visible: false,
                },
            }));
        },

        setPaymentMethod: (method: string) => {
            set((state) => ({
                paymentModal: {
                    ...state.paymentModal,
                    selectedMethod: method,
                },
            }));
        },

        setCashReceived: (amount: number) => {
            set((state) => ({
                paymentModal: {
                    ...state.paymentModal,
                    cashReceived: amount,
                },
            }));
            get().calculateChange();
        },

        calculateChange: () => {
            const state = get();
            const { amount, cashReceived } = state.paymentModal;
            const change = Math.max(0, cashReceived - amount);

            set((state) => ({
                paymentModal: {
                    ...state.paymentModal,
                    change,
                },
            }));
        },

        // Optimized Receipt Actions
        showReceiptModal: () => {
            set((state) => ({
                receiptModal: {
                    ...state.receiptModal,
                    visible: true,
                },
            }));
        },

        hideReceiptModal: () => {
            set((state) => ({
                receiptModal: {
                    ...state.receiptModal,
                    visible: false,
                },
            }));
        },

        setReceiptOption: (option: keyof ReceiptOptions) => {
            set((state) => ({
                receiptModal: {
                    ...state.receiptModal,
                    options: {
                        ...state.receiptModal.options,
                        [option]: !state.receiptModal.options[option],
                    },
                },
            }));
        },

        setReceiptContact: (
            type: 'phoneNumber' | 'emailAddress',
            value: string
        ) => {
            set((state) => ({
                receiptModal: {
                    ...state.receiptModal,
                    options: {
                        ...state.receiptModal.options,
                        [type]: value,
                    },
                },
            }));
        },

        // Optimized Preferences Actions
        updatePreferences: (preferences: Partial<TillPreferences>) => {
            set((state) => ({
                preferences: {
                    ...state.preferences,
                    ...preferences,
                },
            }));
        },

        // Optimized Connectivity Actions
        updateConnectivity: (
            device: keyof TillConnectivity,
            status: ConnectivityStatus
        ) => {
            set((state) => ({
                connectivity: {
                    ...state.connectivity,
                    [device]: status,
                },
            }));
        },

        setLastSync: (timestamp: Date) => {
            set((state) => ({
                connectivity: {
                    ...state.connectivity,
                    lastSync: timestamp,
                },
            }));
        },

        // Optimized Reset Actions
        resetAfterTransaction: () => {
            set((state) => ({
                paymentModal: {
                    visible: false,
                    selectedMethod: '',
                    amount: 0,
                    cashReceived: 0,
                    change: 0,
                },
                receiptModal: {
                    visible: false,
                    options: {
                        sms: false,
                        email: false,
                        phoneNumber: '',
                        emailAddress: '',
                    },
                },
                mode: TillMode.SALE,
                isSearchActive: false,
            }));
        },

        resetTill: () => {
            set({
                mode: TillMode.SALE,
                isSearchActive: false,
                isCategoryExpanded: false,
                selectedCategory: 'all',
                paymentModal: {
                    visible: false,
                    selectedMethod: '',
                    amount: 0,
                    cashReceived: 0,
                    change: 0,
                },
                receiptModal: {
                    visible: false,
                    options: {
                        sms: false,
                        email: false,
                        phoneNumber: '',
                        emailAddress: '',
                    },
                },
            });
        },
    }))
);
