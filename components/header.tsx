import { Link, useNavigation } from 'expo-router';
import {
    Menu,
    X,
    PrinterCheck,
    ScanLine,
    MapPinHouse,
} from 'lucide-react-native';
import {
    DrawerNavigationProp,
    useDrawerStatus,
} from '@react-navigation/drawer';
import { Text, View, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { NetworkUtils, NetworkStatus } from '../utils/network.util';
import DeviceSelectionModal from './device-selection-modal';
import info from '../data/info.json';

export default function Header() {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const drawerStatus = useDrawerStatus();
    const isDrawerOpen = drawerStatus === 'open';
    
    // Network monitoring state
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
    
    // Device selection modal state
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [selectedDeviceType, setSelectedDeviceType] = useState<'printer' | 'scanner' | 'cloud'>('printer');

    useEffect(() => {
        // Start network monitoring with simplified logging
        const stopMonitoring = NetworkUtils.startMonitoring({
            enableSpeedTest: false, // Disable speed tests for better performance
            logToConsole: false, // We'll handle our own simplified logging
            onStatusChange: (status) => {
                setNetworkStatus(status);
                
                // Simplified network status logging
                const connectionType = NetworkUtils.getConnectionTypeName(status.connectionType);
                const emoji = NetworkUtils.getNetworkStatusEmoji(status);
                console.log(`${emoji} Network: ${connectionType} - ${status.isConnected ? 'Connected' : 'Disconnected'}`);
            },
        });

        // Get initial network status
        NetworkUtils.getCurrentStatus().then(status => {
            setNetworkStatus(status);
            const connectionType = NetworkUtils.getConnectionTypeName(status.connectionType);
            const emoji = NetworkUtils.getNetworkStatusEmoji(status);
            console.log(`${emoji} Network: ${connectionType} - ${status.isConnected ? 'Connected' : 'Disconnected'}`);
        });

        // Cleanup on unmount
        return () => {
            stopMonitoring();
        };
    }, []);

    const toggleDrawer = () => {
        if (isDrawerOpen) {
            navigation.closeDrawer();
        } else {
            navigation.openDrawer();
        }
    };

    // Get color based on connectivity status
    const getConnectivityColor = (status: string, isNetworkConnected?: boolean): string => {
        // If we have real network status, use it; otherwise fall back to info.json
        if (isNetworkConnected !== undefined) {
            return isNetworkConnected ? '#1c8370' : '#FC4A4A';
        }
        
        switch (status) {
            case 'connected':
                return '#1c8370'; // green-700
            case 'connecting':
                return '#d97706'; // amber-600
            case 'disconnected':
            default:
                return '#FC4A4A'; // red-600
        }
    };

    // Get connectivity data from info.json
    const connectivity = info?.till?.connectivity;

    const handleDeviceIconPress = (deviceType: 'printer' | 'scanner') => {
        setSelectedDeviceType(deviceType);
        setShowDeviceModal(true);
    };

    const handleDeviceSelect = (device: any) => {
        console.log('Selected device:', device);
        // Handle device selection logic here
        setShowDeviceModal(false);
    };

    return (
        <View className="flex-row justify-between items-center px-6 py-4">
            <View className="flex-row gap-2 items-center">
                <Pressable
                    onPress={toggleDrawer}
                    className={`p-2 ${isDrawerOpen ? 'bg-red-100 rounded-full' : ''}`}
                >
                    {isDrawerOpen ? (
                        <X size={24} color="#DC2626" />
                    ) : (
                        <Menu size={24} color="#000000" />
                    )}
                </Pressable>
            </View>
            <View className="flex-row gap-6 justify-center items-center">
                <View className="flex-row gap-1 items-center">
                    <MapPinHouse
                        size={20}
                        color={getConnectivityColor(
                            connectivity?.cloud?.status || 'disconnected',
                            networkStatus?.isConnected
                        )}
                        strokeWidth={1.9}
                    />
                    <Text className="text-lg font-semibold font-primary text-primary">
                        {info?.till?.branch?.name}
                    </Text>
                </View>
                <Text className="text-lg font-semibold font-primary text-primary">
                    |
                </Text>
                <View className="flex-row gap-3 items-center">
                    <Pressable onPress={() => handleDeviceIconPress('printer')}>
                        <PrinterCheck
                            size={23}
                            color={getConnectivityColor(
                                connectivity?.printer?.status || 'disconnected'
                            )}
                            strokeWidth={1.9}
                        />
                    </Pressable>
                    <Pressable onPress={() => handleDeviceIconPress('scanner')}>
                        <ScanLine
                            size={23}
                            color={getConnectivityColor(
                                connectivity?.scanner?.status || 'disconnected'
                            )}
                            strokeWidth={1.9}
                        />
                    </Pressable>
                </View>
            </View>
            <View className="flex-row items-center space-x-4">
                <Link
                    href="/settings"
                    className="justify-center items-center w-14 h-14 rounded-full bg-primary"
                >
                    <View className="justify-center items-center w-14 h-14 rounded-full bg-primary">
                        <Text className="text-lg font-semibold text-white font-primary">
                            {info?.user?.initials || info?.company?.logo}
                        </Text>
                    </View>
                </Link>
            </View>

            {/* Device Selection Modal */}
            <DeviceSelectionModal
                visible={showDeviceModal}
                onClose={() => setShowDeviceModal(false)}
                deviceType={selectedDeviceType}
                onDeviceSelect={handleDeviceSelect}
            />
        </View>
    );
}
