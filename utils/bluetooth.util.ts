import { PermissionsAndroid, Platform, Alert } from 'react-native';

/**
 * Bluetooth device information interface
 */
export interface BluetoothDevice {
    id: string;
    name: string;
    address: string;
    paired: boolean;
    connected: boolean;
}

/**
 * Bluetooth utility class for device discovery and management
 * Provides cross-platform Bluetooth functionality with proper permissions
 */
export class BluetoothUtils {
    private static isScanning = false;
    private static connectedDevices: BluetoothDevice[] = [];

    /**
     * Request Bluetooth permissions for Android
     */
    static async requestBluetoothPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return true; // iOS handles permissions differently
        }

        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);

            const allGranted = Object.values(granted).every(
                (status) => status === PermissionsAndroid.RESULTS.GRANTED
            );

            if (!allGranted) {
                Alert.alert(
                    'Bluetooth Permissions Required',
                    'This app needs Bluetooth permissions to connect to devices like printers and card readers.',
                    [{ text: 'OK' }]
                );
            }

            return allGranted;
        } catch (error) {
            console.error('Error requesting Bluetooth permissions:', error);
            return false;
        }
    }

    /**
     * Check if Bluetooth is enabled
     */
    static async isBluetoothEnabled(): Promise<boolean> {
        try {
            // This would need a proper Bluetooth library like react-native-bluetooth-classic
            // For now, we'll simulate the check
            console.log('📶 Checking Bluetooth status...');

            // In a real implementation, you would use:
            // const BluetoothModule = require('react-native-bluetooth-classic');
            // return await BluetoothModule.isBluetoothEnabled();

            return true; // Simulated for now
        } catch (error) {
            console.error('Error checking Bluetooth status:', error);
            return false;
        }
    }

    /**
     * Scan for nearby Bluetooth devices
     */
    static async scanForDevices(duration = 10000): Promise<BluetoothDevice[]> {
        const hasPermissions = await this.requestBluetoothPermissions();
        if (!hasPermissions) {
            throw new Error('Bluetooth permissions not granted');
        }

        const isEnabled = await this.isBluetoothEnabled();
        if (!isEnabled) {
            throw new Error('Bluetooth is not enabled');
        }

        if (this.isScanning) {
            console.log('📡 Bluetooth scan already in progress');
            return [];
        }

        try {
            this.isScanning = true;
            console.log(
                `📡 Starting Bluetooth device scan for ${duration}ms...`
            );

            // Simulate device discovery
            // In a real implementation, you would use a proper Bluetooth library
            const mockDevices: BluetoothDevice[] = [
                {
                    id: 'printer-001',
                    name: 'Receipt Printer',
                    address: '00:11:22:33:44:55',
                    paired: true,
                    connected: false,
                },
                {
                    id: 'cardreader-001',
                    name: 'Card Reader Terminal',
                    address: '00:11:22:33:44:66',
                    paired: false,
                    connected: false,
                },
            ];

            // Simulate scan duration
            await new Promise((resolve) => setTimeout(resolve, duration));

            console.log(
                `📡 Bluetooth scan completed. Found ${mockDevices.length} devices`
            );
            return mockDevices;
        } catch (error) {
            console.error('Error scanning for Bluetooth devices:', error);
            throw error;
        } finally {
            this.isScanning = false;
        }
    }

    /**
     * Connect to a specific Bluetooth device
     */
    static async connectToDevice(device: BluetoothDevice): Promise<boolean> {
        try {
            console.log(
                `🔗 Connecting to device: ${device.name} (${device.address})`
            );

            // Simulate connection process
            // In a real implementation:
            // const BluetoothModule = require('react-native-bluetooth-classic');
            // const connected = await BluetoothModule.connectToDevice(device.address);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Update device status
            const deviceIndex = this.connectedDevices.findIndex(
                (d) => d.id === device.id
            );
            const updatedDevice = { ...device, connected: true };

            if (deviceIndex >= 0) {
                this.connectedDevices[deviceIndex] = updatedDevice;
            } else {
                this.connectedDevices.push(updatedDevice);
            }

            console.log(`✅ Connected to device: ${device.name}`);
            return true;
        } catch (error) {
            console.error(
                `❌ Failed to connect to device ${device.name}:`,
                error
            );
            return false;
        }
    }

    /**
     * Disconnect from a Bluetooth device
     */
    static async disconnectFromDevice(
        device: BluetoothDevice
    ): Promise<boolean> {
        try {
            console.log(`🔌 Disconnecting from device: ${device.name}`);

            // Simulate disconnection
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Update connected devices list
            this.connectedDevices = this.connectedDevices.filter(
                (d) => d.id !== device.id
            );

            console.log(`✅ Disconnected from device: ${device.name}`);
            return true;
        } catch (error) {
            console.error(
                `❌ Failed to disconnect from device ${device.name}:`,
                error
            );
            return false;
        }
    }

    /**
     * Get list of connected devices
     */
    static getConnectedDevices(): BluetoothDevice[] {
        return [...this.connectedDevices];
    }

    /**
     * Get Bluetooth status information
     */
    static async getBluetoothStatus(): Promise<{
        enabled: boolean;
        scanning: boolean;
        connectedDevicesCount: number;
        lastScanTime?: string;
    }> {
        const enabled = await this.isBluetoothEnabled();

        return {
            enabled,
            scanning: this.isScanning,
            connectedDevicesCount: this.connectedDevices.length,
            lastScanTime: new Date().toISOString(),
        };
    }

    /**
     * Send data to a connected device (for printers, etc.)
     */
    static async sendDataToDevice(
        deviceId: string,
        data: string
    ): Promise<boolean> {
        const device = this.connectedDevices.find(
            (d) => d.id === deviceId && d.connected
        );

        if (!device) {
            console.error(`❌ Device ${deviceId} not found or not connected`);
            return false;
        }

        try {
            console.log(
                `📤 Sending data to ${device.name}: ${data.substring(0, 50)}...`
            );

            // In a real implementation:
            // const BluetoothModule = require('react-native-bluetooth-classic');
            // await BluetoothModule.writeToDevice(device.address, data);

            // Simulate data transmission
            await new Promise((resolve) => setTimeout(resolve, 500));

            console.log(`✅ Data sent successfully to ${device.name}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send data to ${device.name}:`, error);
            return false;
        }
    }
}

/**
 * Hook for using Bluetooth utilities in components
 */
export const useBluetoothUtils = () => {
    return {
        requestPermissions: BluetoothUtils.requestBluetoothPermissions,
        isEnabled: BluetoothUtils.isBluetoothEnabled,
        scanForDevices: BluetoothUtils.scanForDevices,
        connectToDevice: BluetoothUtils.connectToDevice,
        disconnectFromDevice: BluetoothUtils.disconnectFromDevice,
        getConnectedDevices: BluetoothUtils.getConnectedDevices,
        getStatus: BluetoothUtils.getBluetoothStatus,
        sendData: BluetoothUtils.sendDataToDevice,
    };
};

export default BluetoothUtils;
