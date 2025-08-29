import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    ScrollView,
    Dimensions,
} from 'react-native';
import { X, Check, Printer, Scan, MapPin } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import info from '../data/info.json';

interface Device {
    id: string;
    name: string;
    model: string;
    status: 'connected' | 'connecting' | 'disconnected' | string;
    type: 'printer' | 'scanner' | 'cloud' | string;
    isActive?: boolean;
}

interface DeviceSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    deviceType: 'printer' | 'scanner' | 'cloud';
    onDeviceSelect: (device: Device) => void;
}

const mockDevices: Record<string, Device[]> = {
    printer: [
        {
            id: 'printer-1',
            name: 'Receipt Printer',
            model: 'Epson TM-20',
            status: 'connected',
            type: 'printer',
        },
        {
            id: 'printer-2',
            name: 'Label Printer',
            model: 'Brother QL-800',
            status: 'disconnected',
            type: 'printer',
        },
        {
            id: 'printer-3',
            name: 'Thermal Printer',
            model: 'Star TSP143III',
            status: 'connecting',
            type: 'printer',
        },
        {
            id: 'printer-4',
            name: 'Mobile Printer',
            model: 'Zebra ZQ520',
            status: 'disconnected',
            type: 'printer',
        },
    ],
    scanner: [
        {
            id: 'scanner-1',
            name: 'Barcode Scanner',
            model: 'Honeywell 1470',
            status: 'connected',
            type: 'scanner',
        },
        {
            id: 'scanner-2',
            name: 'QR Code Scanner',
            model: 'Zebra DS2208',
            status: 'disconnected',
            type: 'scanner',
        },
        {
            id: 'scanner-3',
            name: 'Handheld Scanner',
            model: 'Symbol LS2208',
            status: 'connecting',
            type: 'scanner',
        },
        {
            id: 'scanner-4',
            name: 'Wireless Scanner',
            model: 'Datalogic QD2430',
            status: 'disconnected',
            type: 'scanner',
        },
    ],
    cloud: [
        {
            id: 'cloud-1',
            name: 'Main Server',
            model: 'AWS EC2',
            status: 'connected',
            type: 'cloud',
        },
        {
            id: 'cloud-2',
            name: 'Backup Server',
            model: 'Digital Ocean',
            status: 'disconnected',
            type: 'cloud',
        },
        {
            id: 'cloud-3',
            name: 'Local Sync',
            model: 'Synology NAS',
            status: 'connecting',
            type: 'cloud',
        },
    ],
};

export default function DeviceSelectionModal({
    visible,
    onClose,
    deviceType,
    onDeviceSelect,
}: DeviceSelectionModalProps) {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const { width } = Dimensions.get('window');

    // Animation values
    const modalOpacity = useSharedValue(0);
    const modalScale = useSharedValue(0.9);

    React.useEffect(() => {
        if (visible) {
            modalOpacity.value = withTiming(1, {
                duration: 300,
                easing: Easing.out(Easing.cubic),
            });
            modalScale.value = withSpring(1, { damping: 15, stiffness: 120 });
        } else {
            modalOpacity.value = withTiming(0, {
                duration: 250,
                easing: Easing.in(Easing.cubic),
            });
            modalScale.value = withTiming(0.9, { duration: 250 });
        }
    }, [visible]);

    const modalAnimatedStyle = useAnimatedStyle(() => ({
        opacity: modalOpacity.value,
        transform: [{ scale: modalScale.value }],
    }));

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'connected':
                return '#10B981'; // green-500
            case 'connecting':
                return '#F59E0B'; // amber-500
            case 'disconnected':
            default:
                return '#EF4444'; // red-500
        }
    };

    const getDeviceIcon = () => {
        switch (deviceType) {
            case 'printer':
                return <Printer size={24} color="#6B7280" />;
            case 'scanner':
                return <Scan size={24} color="#6B7280" />;
            case 'cloud':
                return <MapPin size={24} color="#6B7280" />;
        }
    };

    const getModalTitle = () => {
        switch (deviceType) {
            case 'printer':
                return 'Select Printer';
            case 'scanner':
                return 'Select Scanner';
            case 'cloud':
                return 'Select Cloud Connection';
        }
    };

    // Get devices from info.json if available, otherwise use mock data
    const devicesFromInfo =
        deviceType === 'printer'
            ? info?.till?.devices?.printers
            : deviceType === 'scanner'
              ? info?.till?.devices?.scanners
              : [];

    const devices =
        devicesFromInfo && devicesFromInfo.length > 0
            ? devicesFromInfo
            : mockDevices[deviceType] || [];

    const handleDeviceSelect = (device: Device) => {
        setSelectedDevice(device);
        onDeviceSelect(device);

        // Show toast
        if ((global as any).showToast) {
            (global as any).showToast(
                `${device.name} selected as active ${deviceType}`,
                'success',
                3000,
                '✅'
            );
        }

        // Close modal after short delay
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 justify-center items-center bg-black-900/80"
                style={{ flex: 1 }}
            >
                <View style={{ width: '90%', maxWidth: 600 }}>
                    <Animated.View
                        style={modalAnimatedStyle}
                        className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full"
                    >
                        {/* Header */}
                        <View className="relative p-6 border-b border-gray-200">
                            <Pressable
                                onPress={onClose}
                                className="absolute top-2 right-2 z-10 justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
                            >
                                <X size={22} color="#ffffff" />
                            </Pressable>

                            <View className="flex-row items-center gap-3">
                                {getDeviceIcon()}
                                <Text className="text-xl font-bold text-gray-800 font-primary">
                                    {getModalTitle()}
                                </Text>
                            </View>
                        </View>

                        {/* Device List */}
                        <ScrollView className="max-h-80">
                            <View className="p-4 flex-col gap-3">
                                {devices.map((device) => (
                                    <View
                                        key={device.id}
                                        className="flex-row items-center justify-between p-4 rounded-lg border border-gray-200 bg-white"
                                    >
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <Text className="text-lg font-semibold text-gray-800 font-primary">
                                                    {device.name}
                                                </Text>
                                                <View
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            getStatusColor(
                                                                device.status
                                                            ),
                                                    }}
                                                />
                                            </View>
                                            <Text className="text-sm text-gray-600 font-primary">
                                                {device.model}
                                            </Text>
                                            <Text
                                                className="text-xs font-medium mt-1 font-primary"
                                                style={{
                                                    color: getStatusColor(
                                                        device.status
                                                    ),
                                                }}
                                            >
                                                {device.status.toUpperCase()}
                                            </Text>
                                        </View>

                                        {/* Selection Radio Button */}
                                        <Pressable
                                            onPress={() =>
                                                handleDeviceSelect(device)
                                            }
                                            className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
                                                selectedDevice?.id ===
                                                    device.id || device.isActive
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            {(selectedDevice?.id ===
                                                device.id ||
                                                device.isActive) && (
                                                <Check
                                                    size={14}
                                                    color="#FFFFFF"
                                                />
                                            )}
                                        </Pressable>
                                    </View>
                                ))}

                                {/* Tap instruction */}
                                <Text className="text-center text-sm text-gray-500 font-primary mt-2">
                                    Tap on a device to set it as active
                                </Text>
                            </View>
                        </ScrollView>
                    </Animated.View>
                </View>
            </View>
        </Modal>
    );
}
