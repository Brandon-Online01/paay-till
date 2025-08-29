import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastProvider from '@/providers/toast.provider';
import '../styles/theme.css';
import {
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
} from '@expo-google-fonts/urbanist';
import { useFonts } from 'expo-font';

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
    useEffect(() => {
        // Initialize the transaction database when the app starts
        const initializeDatabase = async () => {
            try {
                const { TransactionService } = await import(
                    '../@db/transaction.service'
                );
                await TransactionService.initialize();
            } catch (error) {
                console.error(
                    'Failed to initialize database on app startup:',
                    error
                );
                // Don't crash the app if database initialization fails
                // The database will be initialized on first transaction attempt
            }
        };

        initializeDatabase();
    }, []);

    const [loaded, error] = useFonts({
        Urbanist_400Regular,
        Urbanist_500Medium,
        Urbanist_600SemiBold,
        Urbanist_700Bold,
        Urbanist_800ExtraBold,
        Urbanist_900Black,
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <ToastProvider />
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(drawer)" />
                </Stack>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
