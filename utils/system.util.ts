import { NetworkUtils, NetworkStatus } from './network.util';
import { BluetoothUtils } from './bluetooth.util';
import { CameraUtils } from './camera.util';
import { LocationUtils } from './location.util';
import { DeviceUtils, DeviceStatus } from './device.util';
import { DeviceInfoUtils, DeviceInfo } from './device-info.util';
import { PrintUtils, PrintStatus } from './print.util';
import { BatteryUtils, BatteryStatus } from './battery.util';
import { BiometricsUtils, BiometricStatus } from './biometrics.util';
import { ScreenSizeUtils, ScreenSize } from './screen.size.util';

/**
 * System Status Interface combining all utilities
 */
export interface SystemStatus {
    network: NetworkStatus;
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
    deviceInfo: DeviceInfo | null;
    print: PrintStatus;
    battery: BatteryStatus;
    biometrics: BiometricStatus;
    screen: ScreenSize;
    lastUpdated: string;
    initializationErrors: string[];
}

/**
 * System Status Table for Logging
 */
export interface SystemStatusTable {
    timestamp: string;
    network: string;
    bluetooth: string;
    camera: string;
    location: string;
    battery: string;
    biometrics: string;
    print: string;
    device: string;
    screen: string;
}

/**
 * Master System Utilities Manager
 * Provides unified access to all device utilities and system status
 */
export class SystemUtils {
    private static currentStatus: SystemStatus | null = null;
    private static statusListeners: Array<(status: SystemStatus) => void> = [];
    private static monitoringInterval: NodeJS.Timeout | null = null;
    private static isInitialized = false;

    /**
     * Initialize all system utilities
     */
    static async initialize(): Promise<SystemStatus> {
        console.log('🔄 Initializing system utilities...');
        const startTime = Date.now();
        const errors: string[] = [];

        try {
            // Initialize all utilities in parallel for better performance
            const [
                networkStatus,
                deviceStatus,
                deviceInfo,
                printStatus,
                batteryStatus,
                biometricStatus
            ] = await Promise.allSettled([
                NetworkUtils.getCurrentStatus(),
                DeviceUtils.getDeviceStatus(),
                DeviceInfoUtils.getDeviceInfo(),
                PrintUtils.initialize(),
                BatteryUtils.initialize(),
                BiometricsUtils.initialize()
            ]);

            // Get screen info synchronously
            const screenInfo = ScreenSizeUtils.getScreenInfo();

            // Process results and collect errors
            const network = networkStatus.status === 'fulfilled' 
                ? networkStatus.value 
                : this.getDefaultNetworkStatus();
            if (networkStatus.status === 'rejected') {
                errors.push(`Network: ${networkStatus.reason}`);
            }

            const bluetooth = deviceStatus.status === 'fulfilled'
                ? deviceStatus.value.bluetooth
                : { enabled: false, scanning: false, connectedDevicesCount: 0 };

            const camera = deviceStatus.status === 'fulfilled'
                ? deviceStatus.value.camera
                : { available: false, capturing: false, permissionsGranted: false };

            const location = deviceStatus.status === 'fulfilled'
                ? deviceStatus.value.location
                : { enabled: false, watching: false, permissionsGranted: false };

            if (deviceStatus.status === 'rejected') {
                errors.push(`Device: ${deviceStatus.reason}`);
            }

            const device = deviceInfo.status === 'fulfilled'
                ? deviceInfo.value
                : null;
            if (deviceInfo.status === 'rejected') {
                errors.push(`DeviceInfo: ${deviceInfo.reason}`);
            }

            const print = printStatus.status === 'fulfilled'
                ? printStatus.value
                : { isAvailable: false, selectedPrinter: null, lastError: 'Initialization failed' };
            if (printStatus.status === 'rejected') {
                errors.push(`Print: ${printStatus.reason}`);
            }

            const battery = batteryStatus.status === 'fulfilled'
                ? batteryStatus.value
                : this.getDefaultBatteryStatus();
            if (batteryStatus.status === 'rejected') {
                errors.push(`Battery: ${batteryStatus.reason}`);
            }

            const biometrics = biometricStatus.status === 'fulfilled'
                ? biometricStatus.value
                : this.getDefaultBiometricStatus();
            if (biometricStatus.status === 'rejected') {
                errors.push(`Biometrics: ${biometricStatus.reason}`);
            }

            // Create consolidated status
            this.currentStatus = {
                network,
                bluetooth,
                camera,
                location,
                deviceInfo: device,
                print,
                battery,
                biometrics,
                screen: screenInfo,
                lastUpdated: new Date().toISOString(),
                initializationErrors: errors
            };

            this.isInitialized = true;
            const duration = Date.now() - startTime;

            console.log(`✅ System utilities initialized in ${duration}ms`);
            if (errors.length > 0) {
                console.warn(`⚠️ Initialization errors: ${errors.length}`);
                errors.forEach(error => console.warn(`   - ${error}`));
            }

            // Notify listeners
            this.notifyStatusListeners();

            return this.currentStatus;

        } catch (error) {
            console.error('❌ System initialization failed:', error);
            
            // Create fallback status
            this.currentStatus = {
                network: this.getDefaultNetworkStatus(),
                bluetooth: { enabled: false, scanning: false, connectedDevicesCount: 0 },
                camera: { available: false, capturing: false, permissionsGranted: false },
                location: { enabled: false, watching: false, permissionsGranted: false },
                deviceInfo: null,
                print: { isAvailable: false, selectedPrinter: null, lastError: 'System initialization failed' },
                battery: this.getDefaultBatteryStatus(),
                biometrics: this.getDefaultBiometricStatus(),
                screen: ScreenSizeUtils.getScreenInfo(),
                lastUpdated: new Date().toISOString(),
                initializationErrors: [`System initialization failed: ${error}`]
            };

            return this.currentStatus;
        }
    }

    /**
     * Start continuous system monitoring
     */
    static startMonitoring(
        updateCallback?: (status: SystemStatus) => void,
        intervalMs = 30000 // 30 seconds
    ): () => void {
        if (!this.isInitialized) {
            console.warn('⚠️ System not initialized, call initialize() first');
        }

        // Add callback to listeners
        if (updateCallback) {
            this.statusListeners.push(updateCallback);
        }

        // Start monitoring interval
        if (!this.monitoringInterval) {
            this.monitoringInterval = setInterval(async () => {
                await this.refreshStatus();
            }, intervalMs);

            console.log(`📊 System monitoring started (${intervalMs}ms interval)`);
        }

        // Return stop function
        return () => {
            if (updateCallback) {
                const index = this.statusListeners.indexOf(updateCallback);
                if (index > -1) {
                    this.statusListeners.splice(index, 1);
                }
            }
        };
    }

    /**
     * Stop system monitoring
     */
    static stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('📊 System monitoring stopped');
        }

        this.statusListeners.length = 0;
    }

    /**
     * Refresh system status
     */
    static async refreshStatus(): Promise<SystemStatus> {
        if (!this.currentStatus) {
            return await this.initialize();
        }

        try {
            // Quick status updates
            const [networkStatus, deviceStatus] = await Promise.all([
                NetworkUtils.getCurrentStatus(),
                DeviceUtils.getDeviceStatus()
            ]);

            // Update current status
            this.currentStatus = {
                ...this.currentStatus,
                network: networkStatus,
                bluetooth: deviceStatus.bluetooth,
                camera: deviceStatus.camera,
                location: deviceStatus.location,
                battery: BatteryUtils.getCurrentStatus(),
                screen: ScreenSizeUtils.getScreenInfo(),
                lastUpdated: new Date().toISOString()
            };

            // Notify listeners
            this.notifyStatusListeners();

            return this.currentStatus;

        } catch (error) {
            console.error('❌ Failed to refresh system status:', error);
            return this.currentStatus;
        }
    }

    /**
     * Get current system status
     */
    static getCurrentStatus(): SystemStatus | null {
        return this.currentStatus ? { ...this.currentStatus } : null;
    }

    /**
     * Generate system status table for logging
     */
    static getStatusTable(): SystemStatusTable {
        const status = this.currentStatus;
        
        if (!status) {
            return {
                timestamp: new Date().toISOString(),
                network: 'Not initialized',
                bluetooth: 'Not initialized',
                camera: 'Not initialized',
                location: 'Not initialized',
                battery: 'Not initialized',
                biometrics: 'Not initialized',
                print: 'Not initialized',
                device: 'Not initialized',
                screen: 'Not initialized'
            };
        }

        return {
            timestamp: status.lastUpdated,
            network: NetworkUtils.formatStatusForLogging(status.network),
            bluetooth: BluetoothUtils.formatStatusForLogging(),
            camera: CameraUtils.formatStatusForLogging(),
            location: LocationUtils.formatStatusForLogging(),
            battery: BatteryUtils.formatStatusForLogging(),
            biometrics: BiometricsUtils.formatStatusForLogging(),
            print: PrintUtils.formatStatusForLogging(),
            device: DeviceInfoUtils.formatForLogging(status.deviceInfo),
            screen: ScreenSizeUtils.formatForLogging(status.screen)
        };
    }

    /**
     * Log system status table to console
     */
    static logStatusTable(): void {
        const table = this.getStatusTable();
        
        console.log('');
        console.log('┌─ SYSTEM STATUS TABLE ─────────────────────────────────────┐');
        console.log(`│ Timestamp: ${table.timestamp.slice(11, 19)}                               │`);
        console.log('├───────────────────────────────────────────────────────────┤');
        console.log(`│ ${table.network.padEnd(57)} │`);
        console.log(`│ ${table.bluetooth.padEnd(57)} │`);
        console.log(`│ ${table.camera.padEnd(57)} │`);
        console.log(`│ ${table.location.padEnd(57)} │`);
        console.log(`│ ${table.battery.padEnd(57)} │`);
        console.log(`│ ${table.biometrics.padEnd(57)} │`);
        console.log(`│ ${table.print.padEnd(57)} │`);
        console.log(`│ ${table.device.padEnd(57)} │`);
        console.log(`│ ${table.screen.padEnd(57)} │`);
        console.log('└───────────────────────────────────────────────────────────┘');
        console.log('');
    }

    /**
     * Notify all status listeners
     */
    private static notifyStatusListeners(): void {
        if (!this.currentStatus) return;

        this.statusListeners.forEach(callback => {
            try {
                callback(this.currentStatus!);
            } catch (error) {
                console.error('❌ Error in system status callback:', error);
            }
        });
    }

    /**
     * Get default network status
     */
    private static getDefaultNetworkStatus(): NetworkStatus {
        return {
            isConnected: false,
            connectionType: 'unknown',
            isInternetReachable: null,
            isWifiEnabled: null,
            strength: { level: 0, dbm: null },
            ipAddress: null,
            subnet: null,
            ssid: null,
            bssid: null,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Get default battery status
     */
    private static getDefaultBatteryStatus(): BatteryStatus {
        return {
            isAvailable: false,
            batteryLevel: -1,
            batteryState: 0, // UNKNOWN
            lowPowerMode: false,
            isCharging: false,
            lastUpdated: new Date().toISOString(),
            lastError: 'Not initialized'
        };
    }

    /**
     * Get default biometric status
     */
    private static getDefaultBiometricStatus(): BiometricStatus {
        return {
            isAvailable: false,
            isEnrolled: false,
            availableTypes: [],
            securityLevel: 0, // NONE
            lastError: 'Not initialized'
        };
    }

    /**
     * Export system status as JSON
     */
    static exportStatus(): string {
        return JSON.stringify(this.currentStatus, null, 2);
    }

    /**
     * Check system health
     */
    static performHealthCheck(): {
        healthy: boolean;
        warnings: string[];
        errors: string[];
    } {
        const status = this.currentStatus;
        const warnings: string[] = [];
        const errors: string[] = [];

        if (!status) {
            errors.push('System not initialized');
            return { healthy: false, warnings, errors };
        }

        // Network health
        if (!status.network.isConnected) {
            warnings.push('No network connection');
        }

        // Battery health
        if (status.battery.isAvailable && status.battery.batteryLevel < 0.15) {
            warnings.push('Low battery level');
        }

        // Storage and performance checks could be added here

        // Check initialization errors
        errors.push(...status.initializationErrors);

        const healthy = errors.length === 0 && warnings.length < 3;

        return { healthy, warnings, errors };
    }
}
