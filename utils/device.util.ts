import { BluetoothUtils, BluetoothDevice } from './bluetooth.util';
import { CameraUtils, CameraResult } from './camera.util';
import {
    LocationUtils,
    LocationResult,
    LocationCoordinates,
} from './location.util';

/**
 * Device status interface combining all device utilities
 */
export interface DeviceStatus {
    bluetooth: {
        enabled: boolean;
        scanning: boolean;
        connectedDevicesCount: number;
    };
    camera: {
        available: boolean;
        capturing: boolean;
        permissionsGranted: boolean;
    };
    location: {
        enabled: boolean;
        watching: boolean;
        permissionsGranted: boolean;
        accuracy?: number;
    };
    lastUpdated: string;
}

/**
 * Combined device utilities for managing all hardware features
 * Provides a unified interface for Bluetooth, Camera, and Location services
 */
export class DeviceUtils {
    private static statusUpdateInterval: NodeJS.Timeout | null = null;
    private static statusCallback: ((status: DeviceStatus) => void) | null =
        null;

    /**
     * Initialize all device utilities
     */
    static async initialize(): Promise<void> {
        console.log('🔄 Initializing device utilities...');

        try {
            // Request all permissions upfront
            const [
                bluetoothPermissions,
                cameraPermissions,
                locationPermissions,
            ] = await Promise.allSettled([
                BluetoothUtils.requestBluetoothPermissions(),
                CameraUtils.requestCameraPermissions(),
                LocationUtils.requestLocationPermissions(),
            ]);

            console.log('📋 Device permissions status:');
            console.log(
                `  - Bluetooth: ${bluetoothPermissions.status === 'fulfilled' ? bluetoothPermissions.value : 'Failed'}`
            );
            console.log(
                `  - Camera: ${cameraPermissions.status === 'fulfilled' ? cameraPermissions.value : 'Failed'}`
            );
            console.log(
                `  - Location: ${locationPermissions.status === 'fulfilled' ? locationPermissions.value : 'Failed'}`
            );

            console.log('✅ Device utilities initialized');
        } catch (error) {
            console.error('❌ Failed to initialize device utilities:', error);
            throw error;
        }
    }

    /**
     * Get comprehensive device status
     */
    static async getDeviceStatus(): Promise<DeviceStatus> {
        try {
            const [bluetoothStatus, cameraStatus, locationStatus] =
                await Promise.all([
                    BluetoothUtils.getBluetoothStatus(),
                    CameraUtils.getCameraStatus(),
                    LocationUtils.getLocationStatus(),
                ]);

            return {
                bluetooth: {
                    enabled: bluetoothStatus.enabled,
                    scanning: bluetoothStatus.scanning,
                    connectedDevicesCount:
                        bluetoothStatus.connectedDevicesCount,
                },
                camera: {
                    available: cameraStatus.available,
                    capturing: cameraStatus.capturing,
                    permissionsGranted: cameraStatus.permissionsGranted,
                },
                location: {
                    enabled: locationStatus.enabled,
                    watching: locationStatus.watching,
                    permissionsGranted: locationStatus.permissionsGranted,
                    accuracy: locationStatus.accuracy,
                },
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.error('❌ Failed to get device status:', error);
            throw error;
        }
    }

    /**
     * Start periodic status monitoring
     */
    static startStatusMonitoring(
        callback: (status: DeviceStatus) => void,
        intervalMs = 10000
    ): void {
        if (this.statusUpdateInterval) {
            console.log('📊 Device status monitoring is already running');
            return;
        }

        this.statusCallback = callback;
        console.log(
            `📊 Starting device status monitoring (${intervalMs}ms interval)`
        );

        this.statusUpdateInterval = setInterval(async () => {
            try {
                const status = await this.getDeviceStatus();
                callback(status);
            } catch (error) {
                console.error('❌ Error in status monitoring:', error);
            }
        }, intervalMs);
    }

    /**
     * Stop status monitoring
     */
    static stopStatusMonitoring(): void {
        if (this.statusUpdateInterval) {
            clearInterval(this.statusUpdateInterval);
            this.statusUpdateInterval = null;
            this.statusCallback = null;
            console.log('📊 Device status monitoring stopped');
        }
    }

    /**
     * Quick health check for all devices
     */
    static async performHealthCheck(): Promise<{
        overall: 'healthy' | 'warning' | 'error';
        issues: string[];
        recommendations: string[];
    }> {
        const issues: string[] = [];
        const recommendations: string[] = [];

        try {
            const status = await this.getDeviceStatus();

            // Check Bluetooth
            if (!status.bluetooth.enabled) {
                issues.push('Bluetooth is disabled');
                recommendations.push(
                    'Enable Bluetooth for printer and card reader connectivity'
                );
            }

            // Check Camera
            if (!status.camera.available) {
                issues.push('Camera is not available');
                recommendations.push(
                    'Camera access needed for receipt photos and product images'
                );
            } else if (!status.camera.permissionsGranted) {
                issues.push('Camera permissions not granted');
                recommendations.push(
                    'Grant camera permissions in device settings'
                );
            }

            // Check Location
            if (!status.location.enabled) {
                issues.push('Location services are disabled');
                recommendations.push(
                    'Enable location services for delivery tracking'
                );
            } else if (!status.location.permissionsGranted) {
                issues.push('Location permissions not granted');
                recommendations.push(
                    'Grant location permissions in device settings'
                );
            }

            const overall =
                issues.length === 0
                    ? 'healthy'
                    : issues.length <= 2
                      ? 'warning'
                      : 'error';

            return { overall, issues, recommendations };
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return {
                overall: 'error',
                issues: ['Failed to perform health check'],
                recommendations: [
                    'Restart the application and check device connectivity',
                ],
            };
        }
    }

    /**
     * Format device status for logging
     */
    static formatStatusForLogging(status: DeviceStatus): string {
        const bluetooth = status.bluetooth.enabled
            ? `BT: ON (${status.bluetooth.connectedDevicesCount} devices)${status.bluetooth.scanning ? ' [SCANNING]' : ''}`
            : 'BT: OFF';

        const camera =
            status.camera.available && status.camera.permissionsGranted
                ? `CAM: OK${status.camera.capturing ? ' [CAPTURING]' : ''}`
                : 'CAM: UNAVAILABLE';

        const location =
            status.location.enabled && status.location.permissionsGranted
                ? `LOC: OK${status.location.watching ? ` [TRACKING] ±${status.location.accuracy?.toFixed(0)}m` : ''}`
                : 'LOC: UNAVAILABLE';

        return `📱 Device Status: ${bluetooth} | ${camera} | ${location}`;
    }

    /**
     * Export device status to JSON (for debugging)
     */
    static async exportDeviceStatusLog(): Promise<string> {
        try {
            const status = await this.getDeviceStatus();
            const healthCheck = await this.performHealthCheck();

            const log = {
                timestamp: new Date().toISOString(),
                deviceStatus: status,
                healthCheck,
                platform: require('react-native').Platform.OS,
                version: require('react-native').Platform.Version,
            };

            return JSON.stringify(log, null, 2);
        } catch (error) {
            console.error('❌ Failed to export device status log:', error);
            return JSON.stringify(
                { error: 'Failed to export status' },
                null,
                2
            );
        }
    }

    // Convenience methods that delegate to individual utilities
    static bluetooth = BluetoothUtils;
    static camera = CameraUtils;
    static location = LocationUtils;
}

/**
 * Hook for using device utilities in React components
 */
export const useDeviceUtils = () => {
    return {
        initialize: DeviceUtils.initialize,
        getStatus: DeviceUtils.getDeviceStatus,
        startMonitoring: DeviceUtils.startStatusMonitoring,
        stopMonitoring: DeviceUtils.stopStatusMonitoring,
        healthCheck: DeviceUtils.performHealthCheck,
        formatStatus: DeviceUtils.formatStatusForLogging,
        exportLog: DeviceUtils.exportDeviceStatusLog,
        bluetooth: {
            scanDevices: BluetoothUtils.scanForDevices,
            connectDevice: BluetoothUtils.connectToDevice,
            disconnectDevice: BluetoothUtils.disconnectFromDevice,
            getConnectedDevices: BluetoothUtils.getConnectedDevices,
            sendData: BluetoothUtils.sendDataToDevice,
        },
        camera: {
            takePicture: CameraUtils.takePicture,
            recordVideo: CameraUtils.recordVideo,
            pickFromGallery: CameraUtils.pickImageFromGallery,
            showActionSheet: CameraUtils.showImagePickerActionSheet,
            compressImage: CameraUtils.compressImage,
        },
        location: {
            getCurrentLocation: LocationUtils.getCurrentLocation,
            startWatching: LocationUtils.startWatchingLocation,
            stopWatching: LocationUtils.stopWatchingLocation,
            calculateDistance: LocationUtils.calculateDistance,
            getAddress: LocationUtils.getAddressFromCoordinates,
        },
    };
};

export default DeviceUtils;

// Re-export types for convenience
export type {
    BluetoothDevice,
    CameraResult,
    LocationResult,
    LocationCoordinates,
};

export { BluetoothUtils, CameraUtils, LocationUtils };
