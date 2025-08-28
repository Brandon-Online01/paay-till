/**
 * Toast Utility Functions
 *
 * Provides consistent toast notifications with proper icons and styling
 * matching the app's design language and color scheme
 *
 * Uses custom React Native compatible toast system via ToastProvider
 * (react-hot-toast is web-only and doesn't work in React Native)
 */

declare global {
    var showToast: (
        message: string,
        type?: 'success' | 'error' | 'info' | 'warning',
        duration?: number,
        icon?: string
    ) => void;
}

export const ToastUtils = {
    /**
     * Success toast with green checkmark icon
     */
    success: (message: string, duration: number = 3000, icon?: string) => {
        if ((global as any).showToast) {
            (global as any).showToast(message, 'success', duration, icon || '✅');
            console.log('✅ ToastUtils: Success toast shown:', message);
        } else {
            console.warn('⚠️ ToastUtils: Global showToast not available');
        }
    },

    /**
     * Error toast with red X icon
     */
    error: (message: string, duration: number = 5000, icon?: string) => {
        if ((global as any).showToast) {
            (global as any).showToast(message, 'error', duration, icon || '❌');
            console.log('❌ ToastUtils: Error toast shown:', message);
        } else {
            console.warn('⚠️ ToastUtils: Global showToast not available for error');
        }
    },

    /**
     * Loading toast with spinner icon
     */
    loading: (message: string, duration: number = 4000, icon?: string) => {
        if ((global as any).showToast) {
            (global as any).showToast(message, 'info', duration, icon || '⏳');
            console.log('⏳ ToastUtils: Loading toast shown:', message);
        }
    },

    /**
     * Info toast with blue info icon
     */
    info: (message: string, duration: number = 4000, icon?: string) => {
        if ((global as any).showToast) {
            (global as any).showToast(message, 'info', duration, icon || 'ℹ️');
            console.log('ℹ️ ToastUtils: Info toast shown:', message);
        }
    },

    /**
     * Warning toast with orange warning icon
     */
    warning: (message: string, duration: number = 4000, icon?: string) => {
        if ((global as any).showToast) {
            (global as any).showToast(message, 'warning', duration, icon || '⚠️');
            console.log('⚠️ ToastUtils: Warning toast shown:', message);
        }
    },

    /**
     * Payment-specific toasts
     */
    payment: {
        processing: (
            message = 'Processing payment...',
            duration: number = 4000
        ) => ToastUtils.loading(message, duration),

        success: (message = 'Payment successful!', duration: number = 3000) =>
            ToastUtils.success(message, duration),

        error: (message = 'Payment failed', duration: number = 5000) =>
            ToastUtils.error(message, duration),

        cardReady: (
            message = 'Tap or insert card on the machine',
            duration: number = 6000
        ) => ToastUtils.info(message, duration),

        change: (changeAmount: number, symbol = 'R', duration: number = 3000) =>
            ToastUtils.success(
                `Payment successful! Change: ${symbol}${changeAmount.toFixed(2)}`,
                duration
            ),

        exactAmount: (
            message = 'Payment successful - exact amount!',
            duration: number = 3000
        ) => ToastUtils.success(message, duration),
    },

    /**
     * Cart-specific toasts
     */
    cart: {
        itemAdded: (itemName: string, duration: number = 3000) =>
            ToastUtils.success(`${itemName} added to cart`, duration),

        itemRemoved: (itemName: string, duration: number = 4000) =>
            ToastUtils.info(`${itemName} removed from cart`, duration),

        cartCleared: (duration: number = 4000) =>
            ToastUtils.warning('Cart cleared', duration),

        emptyCart: (duration: number = 4000) =>
            ToastUtils.warning(
                'Add items to cart before placing order',
                duration
            ),
    },
};
