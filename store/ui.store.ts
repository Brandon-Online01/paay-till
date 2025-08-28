import { create } from 'zustand';

/**
 * Interface for customization options
 */
export interface CustomizationOptions {
    /** Selected color option */
    color: string;
    /** Selected flavor option */
    flavor: string;
    /** Selected size option */
    size: string;
}

/**
 * Interface for product modal state
 */
export interface ProductModalState {
    /** Whether the modal is visible */
    isVisible: boolean;
    /** ID of the product being customized */
    productId: string | null;
    /** Current quantity selected */
    quantity: number;
    /** Special notes */
    notes: string;
    /** Customization options */
    customization: CustomizationOptions;
}

/**
 * Interface for UI store state and actions
 */
interface UIStore {
    // Product modal state
    productModal: ProductModalState;

    // UI state
    /** Whether the cart is expanded */
    isCartExpanded: boolean;
    /** Loading states for different operations */
    loadingStates: {
        payment: boolean;
        search: boolean;
        categoryFilter: boolean;
    };

    // Actions
    /**
     * Open product modal for customization
     * @param productId - ID of the product to customize
     */
    openProductModal: (productId: string) => void;

    /**
     * Close product modal and reset state
     */
    closeProductModal: () => void;

    /**
     * Update product modal quantity
     * @param quantity - New quantity value
     */
    updateModalQuantity: (quantity: number) => void;

    /**
     * Update product modal notes
     * @param notes - New notes value
     */
    updateModalNotes: (notes: string) => void;

    /**
     * Update customization option
     * @param option - Option type ('color', 'flavor', 'size')
     * @param value - New value for the option
     */
    updateCustomization: (
        option: keyof CustomizationOptions,
        value: string
    ) => void;

    /**
     * Reset customization options
     */
    resetCustomization: () => void;

    /**
     * Toggle cart expansion
     */
    toggleCartExpansion: () => void;

    /**
     * Set cart expansion state
     * @param expanded - Whether cart should be expanded
     */
    setCartExpansion: (expanded: boolean) => void;

    /**
     * Set loading state for a specific operation
     * @param operation - Operation type
     * @param loading - Loading state
     */
    setLoadingState: (
        operation: keyof UIStore['loadingStates'],
        loading: boolean
    ) => void;

    /**
     * Reset all loading states
     */
    resetLoadingStates: () => void;

    /**
     * Reset all UI state (for new transaction)
     */
    resetAllUIState: () => void;
}

/**
 * Default customization options
 */
const defaultCustomization: CustomizationOptions = {
    color: '',
    flavor: '',
    size: '',
};

/**
 * Default product modal state
 */
const defaultProductModalState: ProductModalState = {
    isVisible: false,
    productId: null,
    quantity: 1,
    notes: '',
    customization: { ...defaultCustomization },
};

/**
 * UI store for managing modal states, loading states, and other UI-related state
 * Centralizes state management for better predictability and easier debugging
 */
export const useUIStore = create<UIStore>((set, get) => ({
    // Initial state
    productModal: { ...defaultProductModalState },
    isCartExpanded: false,
    loadingStates: {
        payment: false,
        search: false,
        categoryFilter: false,
    },

    // Actions
    /**
     * Open product modal for customization
     */
    openProductModal: (productId: string) => {
        set({
            productModal: {
                ...defaultProductModalState,
                isVisible: true,
                productId,
            },
        });
    },

    /**
     * Close product modal and reset state
     */
    closeProductModal: () => {
        set({
            productModal: { ...defaultProductModalState },
        });
    },

    /**
     * Update product modal quantity
     */
    updateModalQuantity: (quantity: number) => {
        set((state) => ({
            productModal: {
                ...state.productModal,
                quantity: Math.max(1, Math.min(99, quantity)), // Clamp between 1-99
            },
        }));
    },

    /**
     * Update product modal notes
     */
    updateModalNotes: (notes: string) => {
        set((state) => ({
            productModal: {
                ...state.productModal,
                notes,
            },
        }));
    },

    /**
     * Update customization option
     */
    updateCustomization: (
        option: keyof CustomizationOptions,
        value: string
    ) => {
        set((state) => ({
            productModal: {
                ...state.productModal,
                customization: {
                    ...state.productModal.customization,
                    [option]: value,
                },
            },
        }));
    },

    /**
     * Reset customization options
     */
    resetCustomization: () => {
        set((state) => ({
            productModal: {
                ...state.productModal,
                customization: { ...defaultCustomization },
            },
        }));
    },

    /**
     * Toggle cart expansion
     */
    toggleCartExpansion: () => {
        set((state) => ({
            isCartExpanded: !state.isCartExpanded,
        }));
    },

    /**
     * Set cart expansion state
     */
    setCartExpansion: (expanded: boolean) => {
        set({ isCartExpanded: expanded });
    },

    /**
     * Set loading state for a specific operation
     */
    setLoadingState: (
        operation: keyof UIStore['loadingStates'],
        loading: boolean
    ) => {
        set((state) => ({
            loadingStates: {
                ...state.loadingStates,
                [operation]: loading,
            },
        }));
    },

    /**
     * Reset all loading states
     */
    resetLoadingStates: () => {
        set({
            loadingStates: {
                payment: false,
                search: false,
                categoryFilter: false,
            },
        });
    },

    /**
     * Reset all UI state (for new transaction)
     */
    resetAllUIState: () => {
        set({
            productModal: { ...defaultProductModalState },
            isCartExpanded: false,
            loadingStates: {
                payment: false,
                search: false,
                categoryFilter: false,
            },
        });
    },
}));
