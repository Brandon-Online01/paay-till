/**
 * Centralized Utils Export
 * Exports all utility modules for easy importing
 */

// Network and connectivity
export { NetworkUtils } from './network.util';
export type { NetworkStatus } from './network.util';

// Bluetooth utilities
export { BluetoothUtils } from './bluetooth.util';
export type { BluetoothDevice } from './bluetooth.util';

// Camera utilities
export { CameraUtils } from './camera.util';
export type { CameraResult } from './camera.util';

// Location utilities
export { LocationUtils } from './location.util';
export type { LocationResult, LocationCoordinates } from './location.util';

// Device utilities (combined)
export { DeviceUtils } from './device.util';
export type { DeviceStatus } from './device.util';

// Device info utilities
export { DeviceInfoUtils } from './device-info.util';
export type { DeviceInfo, ServerRegistrationPayload } from './device-info.util';

// Screen size utilities
export { ScreenSizeUtils, useScreenSize } from './screen.size.util';
export type { ScreenSize } from './screen.size.util';

// Toast utilities
export { ToastUtils } from './toast.util';

// Print utilities
export { PrintUtils } from './print.util';
export type { PrintStatus, ReceiptData } from './print.util';

// Battery utilities
export { BatteryUtils } from './battery.util';
export type { BatteryStatus, BatteryAlert } from './battery.util';

// Biometrics utilities
export { BiometricsUtils } from './biometrics.util';
export type { BiometricStatus, AuthenticationResult } from './biometrics.util';

// System utilities (master controller)
export { SystemUtils } from './system.util';
export type { SystemStatus, SystemStatusTable } from './system.util';

/**
 * Quick access to commonly used utilities
 */
export const Utils = {
    Network: NetworkUtils,
    Bluetooth: BluetoothUtils,
    Camera: CameraUtils,
    Location: LocationUtils,
    Device: DeviceUtils,
    DeviceInfo: DeviceInfoUtils,
    Screen: ScreenSizeUtils,
    Toast: ToastUtils,
    Print: PrintUtils,
    Battery: BatteryUtils,
    Biometrics: BiometricsUtils,
    System: SystemUtils
};

/**
 * Initialize all system utilities
 * Call this once when the app starts
 */
export const initializeAllUtils = async () => {
    console.log('🔄 Initializing all utilities...');
    
    try {
        const systemStatus = await SystemUtils.initialize();
        console.log('✅ All utilities initialized successfully');
        
        // Start monitoring with tabular logging
        SystemUtils.startMonitoring(undefined, 30000);
        
        return systemStatus;
    } catch (error) {
        console.error('❌ Failed to initialize utilities:', error);
        throw error;
    }
};

/**
 * Get comprehensive system health report
 */
export const getSystemHealthReport = () => {
    const status = SystemUtils.getCurrentStatus();
    const healthCheck = SystemUtils.performHealthCheck();
    const statusTable = SystemUtils.getStatusTable();
    
    return {
        status,
        health: healthCheck,
        statusTable,
        timestamp: new Date().toISOString()
    };
};

export default Utils;
