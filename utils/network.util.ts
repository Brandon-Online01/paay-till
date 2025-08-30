/**
 * Network Utility Functions
 *
 * Provides comprehensive network monitoring including connectivity status,
 * network type detection, and speed testing capabilities
 *
 * Uses @react-native-community/netinfo for real-time network monitoring
 * and custom speed testing implementation
 */

import NetInfo, {
    NetInfoState,
    NetInfoStateType,
} from '@react-native-community/netinfo';

export interface NetworkStatus {
    isConnected: boolean;
    connectionType: NetInfoStateType;
    isInternetReachable: boolean | null;
    details: any;
    speed?: NetworkSpeed;
    timestamp: Date;
}

export interface NetworkSpeed {
    downloadSpeed: number; // Mbps
    uploadSpeed?: number; // Mbps
    latency: number; // ms
    testDuration: number; // ms
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
}

export interface NetworkMonitorOptions {
    enableSpeedTest?: boolean;
    speedTestInterval?: number; // ms
    speedTestUrl?: string;
    onStatusChange?: (status: NetworkStatus) => void;
    logToConsole?: boolean;
}

/**
 * Get current network status
 */
export const getCurrentNetworkStatus = async (
    includeSpeedTest: boolean = false
): Promise<NetworkStatus> => {
    const netInfo = await NetInfo.fetch();
    const status: NetworkStatus = {
        isConnected: netInfo.isConnected ?? false,
        connectionType: netInfo.type,
        isInternetReachable: netInfo.isInternetReachable,
        details: netInfo.details,
        timestamp: new Date(),
    };

    if (includeSpeedTest && status.isConnected) {
        try {
            status.speed = await testNetworkSpeed();
        } catch (error) {
            console.warn('⚠️ Network speed test failed:', error);
        }
    }

    return status;
};

/**
 * Test network speed by downloading a test file
 */
export const testNetworkSpeed = async (
    testUrl: string = 'https://httpbin.org/bytes/1048576' // 1MB test file
): Promise<NetworkSpeed> => {
    const startTime = Date.now();
    const testSize = 1048576; // 1MB in bytes

    try {
        const response = await fetch(testUrl, {
            method: 'GET',
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        await response.blob();
        const endTime = Date.now();
        const duration = endTime - startTime;
        const downloadSpeed = (testSize * 8) / (duration / 1000) / 1000000; // Convert to Mbps

        const speed: NetworkSpeed = {
            downloadSpeed: Math.round(downloadSpeed * 100) / 100,
            latency: Math.min(duration, 100), // Estimate latency
            testDuration: duration,
            quality: getNetworkQuality(downloadSpeed),
        };

        return speed;
    } catch (error) {
        throw new Error(`Speed test failed: ${error}`);
    }
};

/**
 * Determine network quality based on download speed
 */
export const getNetworkQuality = (
    downloadSpeedMbps: number
): NetworkSpeed['quality'] => {
    if (downloadSpeedMbps >= 25) return 'excellent';
    if (downloadSpeedMbps >= 10) return 'good';
    if (downloadSpeedMbps >= 2) return 'fair';
    if (downloadSpeedMbps > 0) return 'poor';
    return 'offline';
};

/**
 * Get human-readable connection type
 */
export const getConnectionTypeName = (type: NetInfoStateType): string => {
    switch (type) {
        case NetInfoStateType.wifi:
            return 'WiFi';
        case NetInfoStateType.cellular:
            return 'Cellular';
        case NetInfoStateType.ethernet:
            return 'Ethernet';
        case NetInfoStateType.bluetooth:
            return 'Bluetooth';
        case NetInfoStateType.wimax:
            return 'WiMAX';
        case NetInfoStateType.vpn:
            return 'VPN';
        case NetInfoStateType.other:
            return 'Other';
        case NetInfoStateType.unknown:
            return 'Unknown';
        case NetInfoStateType.none:
        default:
            return 'No Connection';
    }
};

/**
 * Get network status emoji for UI display
 */
export const getNetworkStatusEmoji = (status: NetworkStatus): string => {
    if (!status.isConnected) return '📵';

    if (status.speed) {
        switch (status.speed.quality) {
            case 'excellent':
                return '📶';
            case 'good':
                return '📶';
            case 'fair':
                return '📳';
            case 'poor':
                return '📶';
            default:
                return '📵';
        }
    }

    switch (status.connectionType) {
        case NetInfoStateType.wifi:
            return '📶';
        case NetInfoStateType.cellular:
            return '📱';
        default:
            return '🌐';
    }
};

/**
 * Start continuous network monitoring
 */
export const startNetworkMonitoring = (
    options: NetworkMonitorOptions = {}
): (() => void) => {
    const {
        enableSpeedTest = false,
        speedTestInterval = 30000, // 30 seconds
        onStatusChange,
        logToConsole = true,
    } = options;

    let speedTestTimer: ReturnType<typeof setInterval> | null = null;

    // Listen for network state changes
    const unsubscribe = NetInfo.addEventListener(
        async (state: NetInfoState) => {
            const status: NetworkStatus = {
                isConnected: state.isConnected ?? false,
                connectionType: state.type,
                isInternetReachable: state.isInternetReachable,
                details: state.details,
                timestamp: new Date(),
            };

            if (logToConsole) {
                logNetworkStatus(status);
            }

            if (onStatusChange) {
                onStatusChange(status);
            }
        }
    );

    // Start periodic speed testing if enabled
    if (enableSpeedTest) {
        const runSpeedTest = async () => {
            try {
                const currentStatus = await getCurrentNetworkStatus(false);
                if (currentStatus.isConnected) {
                    const speed = await testNetworkSpeed();
                    const statusWithSpeed = { ...currentStatus, speed };

                    if (logToConsole) {
                        console.log('🚀 Speed Test Results:', {
                            downloadSpeed: `${speed.downloadSpeed} Mbps`,
                            quality: speed.quality,
                            latency: `${speed.latency}ms`,
                            duration: `${speed.testDuration}ms`,
                        });
                    }

                    if (onStatusChange) {
                        onStatusChange(statusWithSpeed);
                    }
                }
            } catch (error) {
                if (logToConsole) {
                    console.warn('⚠️ Periodic speed test failed:', error);
                }
            }
        };

        speedTestTimer = setInterval(runSpeedTest, speedTestInterval);
    }

    // Return cleanup function
    return () => {
        unsubscribe();
        if (speedTestTimer) {
            clearInterval(speedTestTimer);
        }
    };
};

/**
 * Log network status to console with detailed information
 */
export const logNetworkStatus = (status: NetworkStatus): void => {
    const connectionName = getConnectionTypeName(status.connectionType);
    const statusEmoji = getNetworkStatusEmoji(status);

    console.log(`${statusEmoji} Network Status:`, {
        connected: status.isConnected,
        type: connectionName,
        internetReachable: status.isInternetReachable,
        timestamp: status.timestamp.toISOString(),
    });

    if (status.details) {
        console.log('📋 Network Details:', status.details);
    }

    if (status.speed) {
        console.log('🚀 Network Speed:', {
            download: `${status.speed.downloadSpeed} Mbps`,
            quality: status.speed.quality,
            latency: `${status.speed.latency}ms`,
        });
    }
};

/**
 * Check if current connection is cellular/mobile data
 */
export const isCellularConnection = (status: NetworkStatus): boolean => {
    return status.connectionType === NetInfoStateType.cellular;
};

/**
 * Check if current connection is WiFi
 */
export const isWiFiConnection = (status: NetworkStatus): boolean => {
    return status.connectionType === NetInfoStateType.wifi;
};

/**
 * Get cellular network generation (2G, 3G, 4G, 5G) if available
 */
export const getCellularGeneration = (status: NetworkStatus): string | null => {
    if (!isCellularConnection(status) || !status.details) {
        return null;
    }

    const cellularType = status.details.cellularGeneration;
    return cellularType || 'Unknown';
};

/**
 * Get WiFi signal strength if available
 */
export const getWiFiSignalStrength = (status: NetworkStatus): number | null => {
    if (!isWiFiConnection(status) || !status.details) {
        return null;
    }

    return status.details.strength || null;
};

/**
 * Format network status for logging
 */
export const formatStatusForLogging = (status: NetworkStatus): string => {
    const emoji = getNetworkStatusEmoji(status);
    const connectionName = getConnectionTypeName(status.connectionType);
    const connected = status.isConnected ? 'Connected' : 'Disconnected';
    const reachable = status.isInternetReachable === true ? 'Internet: Yes' : 
                      status.isInternetReachable === false ? 'Internet: No' : 
                      'Internet: Unknown';
    
    let speedInfo = '';
    if (status.speed) {
        speedInfo = ` | Speed: ${status.speed.downloadSpeed}Mbps (${status.speed.quality})`;
    }
    
    let detailInfo = '';
    if (isCellularConnection(status)) {
        const generation = getCellularGeneration(status);
        if (generation && generation !== 'Unknown') {
            detailInfo = ` | ${generation}`;
        }
    } else if (isWiFiConnection(status)) {
        const strength = getWiFiSignalStrength(status);
        if (strength !== null) {
            detailInfo = ` | Signal: ${strength}dBm`;
        }
    }
    
    return `${emoji} ${connectionName} - ${connected} | ${reachable}${speedInfo}${detailInfo}`;
};

export const NetworkUtils = {
    getCurrentStatus: getCurrentNetworkStatus,
    testSpeed: testNetworkSpeed,
    startMonitoring: startNetworkMonitoring,
    getConnectionTypeName,
    getNetworkQuality,
    getNetworkStatusEmoji,
    logNetworkStatus,
    isCellularConnection,
    isWiFiConnection,
    getCellularGeneration,
    getWiFiSignalStrength,
    formatStatusForLogging,
};
