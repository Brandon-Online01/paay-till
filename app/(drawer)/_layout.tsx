import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, Dimensions, Platform } from 'react-native';
import React, { useMemo, useCallback } from 'react';
import {
    Barcode,
    Settings,
    CirclePower,
    Receipt,
    ChartArea,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import info from '../../data/info.json';

// Memoized drawer content for better performance
const DrawerContent = React.memo(() => {
    const router = useRouter();

    // Memoized navigation handlers to prevent recreating functions on every render
    const navigateToSettings = useCallback(() => {
        router.push('/(drawer)/settings');
    }, [router]);

    const navigateToTill = useCallback(() => {
        router.push('/(drawer)/till');
    }, [router]);

    const navigateToTransactions = useCallback(() => {
        router.push('/(drawer)/inventory');
    }, [router]);

    const navigateToReports = useCallback(() => {
        router.push('/(drawer)/reports');
    }, [router]);

    const handleSignOut = useCallback(() => {
        router.push('/');
    }, [router]);

    return (
        <View className="flex-1 px-8 py-20 bg-black-900">
            {/* Floating Sidebar Container */}
            <View className="flex-1 bg-white rounded-xl">
                {/* Top Section - Company Info */}
                <View className="px-6 pt-16 pb-6 rounded-t-xl border-b border-green-200/50 bg-green-500/10">
                    <View className="justify-center items-center">
                        <View className="justify-center items-center mb-3 w-16 h-16 rounded-full bg-primary">
                            <Text className="text-xl font-bold text-white">
                                {info?.user?.initials}
                            </Text>
                        </View>
                        <Text className="mb-1 text-xl font-bold text-primary">
                            {info?.user?.fullName}
                        </Text>
                        <Text className="text-sm text-center text-gray-600 font-primary">
                            {info?.user?.title}
                        </Text>
                    </View>
                </View>

                {/* Middle Section - Navigation */}
                <View className="flex-1 px-6 py-6">
                    <View style={{ gap: 16 }}>
                        <Pressable
                            onPress={navigateToTill}
                            className="flex-row items-center px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                        >
                            <Barcode size={24} color="#374151" />
                            <Text className="ml-3 text-lg text-gray-700 font-primary">
                                {info?.navigation?.home?.label}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={navigateToSettings}
                            className="flex-row items-center px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                        >
                            <Settings size={24} color="#374151" />
                            <Text className="ml-3 text-lg text-gray-700 font-primary">
                                {info?.navigation?.settings?.label}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={navigateToReports}
                            className="flex-row items-center px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                        >
                            <ChartArea size={24} color="#374151" />
                            <Text className="ml-3 text-lg text-gray-700 font-primary">
                                {info?.navigation?.reports?.label}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={navigateToTransactions}
                            className="flex-row items-center px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                        >
                            <Receipt size={24} color="#374151" />
                            <Text className="ml-3 text-lg text-gray-700 font-primary">
                                {info?.navigation?.inventory?.label}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Bottom Section - Sign Out */}
                <View className="flex px-6 pt-6 pb-14 border-t border-gray-200">
                    <Pressable
                        onPress={handleSignOut}
                        className="flex-row justify-center items-center p-3 mx-auto w-3/4 bg-red-500 rounded-lg shadow-sm"
                    >
                        <CirclePower
                            size={24}
                            color="#ffffff"
                            strokeWidth={1.5}
                        />
                        <Text className="ml-3 text-lg font-semibold text-white uppercase font-primary">
                            {info?.common?.buttons?.signOut}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
});

DrawerContent.displayName = 'DrawerContent';


export default function DrawerLayout() {
    const { width } = Dimensions.get('window');

    // Memoized drawer width calculation for performance with safety checks
    const drawerWidth = useMemo(() => {
        // Ensure width is a valid number and greater than 0
        const safeWidth = typeof width === 'number' && width > 0 ? width : 350; // Fallback to 350px
        
        if (safeWidth > 480) {
            return Math.min(safeWidth * 0.3, 400); // Cap at 400px for very large screens
        }
        return safeWidth * 0.83; // 83% on mobile screens
    }, [width]);

    // Memoized drawer style to prevent recreation on every render
    const drawerStyle = useMemo(() => ({
        width: drawerWidth,
        backgroundColor: 'transparent',
    }), [drawerWidth]);

    // Memoized screen options for performance
    const screenOptions = useMemo(() => ({
        headerShown: false,
        drawerStyle,
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        sceneStyle: {
            backgroundColor: '#f8fafc',
        },
        // Performance optimizations for drawer
        swipeEnabled: true,
        swipeEdgeWidth: Platform.OS === 'ios' ? 50 : 20,
        drawerType: Platform.select({
            ios: 'slide' as const,
            default: 'front' as const,
        }),
    }), [drawerStyle]);

    return (
        <>
            <StatusBar style="dark" />
            <Drawer
                drawerContent={() => <DrawerContent />}
                screenOptions={screenOptions}
            >
                <Drawer.Screen
                    name="till/index"
                    options={{
                        title: 'Till',
                    }}
                />
                <Drawer.Screen
                    name="settings/index"
                    options={{
                        title: 'Settings',
                    }}
                />
                <Drawer.Screen
                    name="inventory/index"
                    options={{
                        title: 'Inventory',
                    }}
                />
                <Drawer.Screen
                    name="reports/index"
                    options={{
                        title: 'Reports',
                    }}
                />
            </Drawer>
        </>
    );
}
