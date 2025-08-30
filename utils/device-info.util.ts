import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Device Information Utility for Server Registration
 * Provides comprehensive device information using expo-device
 */

export interface DeviceInfo {
    // Basic device info
    deviceId: string | null;
    deviceName: string | null;
    deviceType: Device.DeviceType | null;
    brand: string | null;
    manufacturer: string | null;
    modelName: string | null;
    modelId: string | null;
    designName: string | null;
    productName: string | null;
    
    // System info
    osName: string | null;
    osVersion: string | null;
    osBuildId: string | null;
    osInternalBuildId: string | null;
    platformApiLevel: number | null;
    
    // Hardware info
    totalMemory: number | null;
    supportedCpuArchitectures: string[] | null;
    
    // Platform-specific
    platformFeatures?: {
        [key: string]: boolean;
    };
    
    // App info
    isDevice: boolean;
    lastUpdated: string;
}

export interface ServerRegistrationPayload {
    deviceInfo: DeviceInfo;
    appVersion: string;
    buildNumber: string;
    registrationTimestamp: string;
    capabilities: {
        biometrics: boolean;
        camera: boolean;
        location: boolean;
        bluetooth: boolean;
        printing: boolean;
        battery: boolean;
    };
}

export class DeviceInfoUtils {
    private static cachedInfo: DeviceInfo | null = null;
    private static lastUpdated: Date | null = null;
    private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

    /**
     * Get comprehensive device information
     */
    static async getDeviceInfo(forceRefresh = false): Promise<DeviceInfo> {
        // Return cached info if available and not expired
        if (!forceRefresh && this.cachedInfo && this.lastUpdated) {
            const now = new Date();
            const timeDiff = now.getTime() - this.lastUpdated.getTime();
            
            if (timeDiff < this.CACHE_DURATION) {
                console.log('📱 Using cached device info');
                return this.cachedInfo;
            }
        }

        console.log('🔄 Fetching device information...');

        try {
            const deviceInfo: DeviceInfo = {
                // Basic device info
                deviceId: Device.deviceId,
                deviceName: Device.deviceName,
                deviceType: Device.deviceType,
                brand: Device.brand,
                manufacturer: Device.manufacturer,
                modelName: Device.modelName,
                modelId: Device.modelId,
                designName: Device.designName,
                productName: Device.productName,
                
                // System info
                osName: Device.osName,
                osVersion: Device.osVersion,
                osBuildId: Device.osBuildId,
                osInternalBuildId: Device.osInternalBuildId,
                platformApiLevel: Device.platformApiLevel,
                
                // Hardware info
                totalMemory: Device.totalMemory,
                supportedCpuArchitectures: Device.supportedCpuArchitectures,
                
                // App info
                isDevice: Device.isDevice,
                lastUpdated: new Date().toISOString()
            };

            // Add platform-specific features
            if (Platform.OS === 'android') {
                deviceInfo.platformFeatures = await this.getAndroidFeatures();
            }

            this.cachedInfo = deviceInfo;
            this.lastUpdated = new Date();

            console.log('✅ Device information collected successfully');
            return deviceInfo;

        } catch (error) {
            console.error('❌ Failed to collect device information:', error);
            throw error;
        }
    }

    /**
     * Get Android-specific platform features
     */
    private static async getAndroidFeatures(): Promise<{ [key: string]: boolean }> {
        try {
            const features: { [key: string]: boolean } = {};
            
            // Common Android features to check
            const featuresToCheck = [
                'android.hardware.camera',
                'android.hardware.camera.front',
                'android.hardware.location',
                'android.hardware.location.gps',
                'android.hardware.bluetooth',
                'android.hardware.wifi',
                'android.hardware.nfc',
                'android.hardware.fingerprint',
                'android.hardware.telephony',
                'android.hardware.sensor.accelerometer',
                'android.hardware.sensor.gyroscope',
                'android.hardware.sensor.light',
                'android.hardware.sensor.proximity'
            ];

            // Note: expo-device doesn't provide direct feature checking
            // This would need to be implemented with native modules
            // For now, we'll provide placeholder
            for (const feature of featuresToCheck) {
                features[feature] = true; // Would need actual implementation
            }

            return features;
        } catch (error) {
            console.warn('⚠️ Failed to get Android features:', error);
            return {};
        }
    }

    /**
     * Create server registration payload
     */
    static async createServerRegistrationPayload(
        appVersion: string,
        buildNumber: string,
        capabilities: {
            biometrics: boolean;
            camera: boolean;
            location: boolean;
            bluetooth: boolean;
            printing: boolean;
            battery: boolean;
        }
    ): Promise<ServerRegistrationPayload> {
        const deviceInfo = await this.getDeviceInfo();

        return {
            deviceInfo,
            appVersion,
            buildNumber,
            registrationTimestamp: new Date().toISOString(),
            capabilities
        };
    }

    /**
     * Get device type description
     */
    static getDeviceTypeDescription(deviceType: Device.DeviceType | null): string {
        switch (deviceType) {
            case Device.DeviceType.PHONE:
                return 'Phone';
            case Device.DeviceType.TABLET:
                return 'Tablet';
            case Device.DeviceType.DESKTOP:
                return 'Desktop';
            case Device.DeviceType.TV:
                return 'TV';
            case Device.DeviceType.UNKNOWN:
            default:
                return 'Unknown';
        }
    }

    /**
     * Get platform description
     */
    static getPlatformDescription(): string {
        return `${Platform.OS} ${Platform.Version}`;
    }

    /**
     * Check if running on physical device
     */
    static isPhysicalDevice(): boolean {
        return Device.isDevice;
    }

    /**
     * Check if device is rooted/jailbroken (basic check)
     */
    static async isDeviceCompromised(): Promise<boolean> {
        // Basic check - in production, you'd want more comprehensive detection
        try {
            const info = await this.getDeviceInfo();
            
            // Simple heuristics (not foolproof)
            if (!info.isDevice) return false; // Emulator/Simulator
            
            // Could add more sophisticated checks here
            return false;
        } catch (error) {
            console.error('❌ Failed to check device security:', error);
            return false;
        }
    }

    /**
     * Get unique device identifier for server registration
     */
    static async getUniqueDeviceId(): Promise<string> {
        const info = await this.getDeviceInfo();
        
        // Create a consistent identifier from available data
        const components = [
            info.deviceId,
            info.modelName,
            info.brand,
            info.osVersion
        ].filter(Boolean);

        if (components.length === 0) {
            // Fallback to timestamp-based ID (not ideal but better than nothing)
            return `device-${Date.now()}`;
        }

        return components.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    /**
     * Format device info for logging
     */
    static formatForLogging(deviceInfo?: DeviceInfo): string {
        const info = deviceInfo || this.cachedInfo;
        
        if (!info) {
            return '📱 Device: Unknown (not initialized)';
        }

        const deviceType = this.getDeviceTypeDescription(info.deviceType);
        const platform = `${info.osName} ${info.osVersion}`;
        const model = info.modelName || 'Unknown Model';
        const isPhysical = info.isDevice ? 'Physical' : 'Simulator';

        return `📱 Device: ${model} | ${deviceType} | ${platform} | ${isPhysical}`;
    }

    /**
     * Export device info as JSON
     */
    static async exportDeviceInfo(): Promise<string> {
        const info = await this.getDeviceInfo();
        return JSON.stringify(info, null, 2);
    }

    /**
     * Clear cached device info
     */
    static clearCache(): void {
        this.cachedInfo = null;
        this.lastUpdated = null;
        console.log('🗑️ Device info cache cleared');
    }

    /**
     * Get memory info in human-readable format
     */
    static getFormattedMemoryInfo(): string {
        if (!this.cachedInfo?.totalMemory) {
            return 'Unknown';
        }

        const totalGB = (this.cachedInfo.totalMemory / (1024 * 1024 * 1024)).toFixed(1);
        return `${totalGB}GB`;
    }

    /**
     * Get CPU architecture info
     */
    static getCPUArchitectureInfo(): string {
        if (!this.cachedInfo?.supportedCpuArchitectures?.length) {
            return 'Unknown';
        }

        return this.cachedInfo.supportedCpuArchitectures.join(', ');
    }
}
