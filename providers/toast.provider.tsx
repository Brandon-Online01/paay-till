import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Animated,
    Dimensions,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { useUIStore } from '@/store/ui.store';

/**
 * Toast Component - Individual toast message
 */
interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
    icon?: string;
}

interface ToastProps {
    toast: ToastMessage;
    onHide: (id: string) => void;
}

function Toast({ toast, onHide }: ToastProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        // Animate in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide after duration
        const timer = setTimeout(() => {
            animateOut();
        }, toast.duration);

        return () => clearTimeout(timer);
    }, []);

    const animateOut = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide(toast.id);
        });
    };

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    backgroundColor: '#10B981',
                    icon: '✅',
                };
            case 'error':
                return {
                    backgroundColor: '#EF4444',
                    icon: '❌',
                };
            case 'warning':
                return {
                    backgroundColor: '#F59E0B',
                    icon: '⚠️',
                };
            case 'info':
            default:
                return {
                    backgroundColor: '#3B82F6',
                    icon: 'ℹ️',
                };
        }
    };

    const { backgroundColor, icon } = getToastStyles();

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                {
                    backgroundColor,
                    opacity: fadeAnim,
                    transform: [{ translateY: translateYAnim }],
                },
            ]}
        >
            <View style={styles.emojiContainer}>
                <Text style={styles.emojiText}>{toast.icon || icon}</Text>
            </View>
            <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
    );
}

/**
 * ToastProvider Component - React Native compatible toast system
 *
 * Features:
 * - Bottom positioning for mobile-friendly experience
 * - Custom styling matching app theme
 * - Proper font family usage
 * - Icons for different toast types
 * - Fade in/out animations
 * - No DOM dependencies (React Native compatible)
 */
export default function ToastProvider() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const { resetAllUIState } = useUIStore();

    const showToast = (
        message: string,
        type: ToastMessage['type'] = 'info',
        duration: number = 4000,
        icon?: string
    ) => {
        const id =
            Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const toast: ToastMessage = {
            id,
            message,
            type,
            duration,
            icon,
        };

        setToasts((prev) => [...prev, toast]);
    };

    const hideToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // Expose functions globally for easy access (only once)
    useEffect(() => {
        if (!(global as any).showToast) {
            // Store the showToast function globally
            (global as any).showToast = showToast;
            console.log('🎉 ToastProvider: Global showToast function initialized');
        }

        if (!(global as any).resetUIState) {
            // Store the resetUIState function globally
            (global as any).resetUIState = resetAllUIState;
            console.log('🔄 ToastProvider: Global resetUIState function initialized');
        }
    }, []); // Empty dependency array to run only once

    if (toasts.length === 0) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.toastWrapper}>
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onHide={hideToast} />
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    toastWrapper: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginVertical: 8,
        borderRadius: 16,
        minWidth: 300,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastIcon: {
        fontSize: 20,
        marginRight: 14,
        color: '#fff',
    },
    toastText: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Urbanist',
        fontWeight: '500',
        lineHeight: 20,
    },
    emojiContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    emojiText: {
        fontSize: 16,
    },
});
