import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, Dimensions } from 'react-native';
import {
    Home,
    Settings,
    CirclePower,
    Receipt,
    ChartArea,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import info from '../../data/info.json';
import { useScreenSize } from '@/utils/screen.size.util';

function DrawerContent() {
    const router = useRouter();

    const navigateToSettings = () => {
        router.push('/(drawer)/settings');
    };

    const navigateToTill = () => {
        router.push('/(drawer)/till');
    };

    const navigateToTransactions = () => {
        router.push('/(drawer)/inventory');
    };

    const navigateToReports = () => {
        router.push('/(drawer)/reports');
    };

    const handleSignOut = () => {
        router.push('/');
    };

    return (
        <View className="flex-1 px-8 py-20 bg-black-900">
            {/* Floating Sidebar Container */}
            <View className="flex-1 bg-white rounded-xl">
                {/* Top Section - Company Info */}
                <View className="px-6 pt-16 pb-6 rounded-t-xl border-b border-green-200/50 bg-green-500/10">
                    <View className="justify-center items-center">
                        <View className="justify-center items-center mb-3 w-16 h-16 rounded-full bg-primary">
                            <Text className="text-xl font-bold text-white">
                                {info?.company?.logo}
                            </Text>
                        </View>
                        <Text className="mb-1 text-xl font-bold text-primary">
                            {info?.company?.name}
                        </Text>
                        <Text className="text-sm text-center text-gray-600 font-primary">
                            {info?.company?.tagline}
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
                            <Home size={24} color="#374151" />
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
}

export default function DrawerLayout() {
    const screenSize = useScreenSize();
    const { width } = Dimensions.get('window');

    // Calculate drawer width based on screen size
    const getDrawerWidth = () => {
        if (width > 480) {
            return width * 0.3; // 50% on larger screens
        }
        return width * 0.83; // 83% on mobile screens
    };

    console.log('Screen size:', screenSize, 'Width:', width);

    return (
        <>
            <StatusBar style="dark" />
            <Drawer
                drawerContent={DrawerContent}
                screenOptions={{
                    headerShown: false, // Will be handled per page
                    drawerStyle: {
                        width: getDrawerWidth(),
                        backgroundColor: 'transparent',
                    },
                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                    sceneStyle: {
                        backgroundColor: '#f8fafc',
                    },
                }}
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
            </Drawer>
        </>
    );
}
