import * as Battery from 'expo-battery';
import { Platform } from 'react-native';

/**
 * Battery Monitoring Utility
 * Provides battery status, level, and power management information
 */

export interface BatteryStatus {
    isAvailable: boolean;
    batteryLevel: number; // 0-1 or -1 if unknown
    batteryState: Battery.BatteryState;
    lowPowerMode: boolean;
    isCharging: boolean;
    lastUpdated: string;
    lastError: string | null;
}

export interface BatteryAlert {
    type: 'low_battery' | 'critical_battery' | 'low_power_mode';
    level: number;
    message: string;
    timestamp: string;
}

export class BatteryUtils {
    private static currentStatus: BatteryStatus = {
        isAvailable: false,
        batteryLevel: -1,
        batteryState: Battery.BatteryState.UNKNOWN,
        lowPowerMode: false,
        isCharging: false,
        lastUpdated: '',
        lastError: null
    };
    
    private static listeners: Array<() => void> = [];
    private static statusSubscription: any = null;
    private static levelSubscription: any = null;
    private static lowPowerSubscription: any = null;
    private static alertCallbacks: Array<(alert: BatteryAlert) => void> = [];

    /**
     * Initialize battery monitoring
     */
    static async initialize(): Promise<BatteryStatus> {
        try {
            const isAvailable = await Battery.isAvailableAsync();
            
            if (!isAvailable) {
                this.currentStatus = {
                    ...this.currentStatus,
                    isAvailable: false,
                    lastError: 'Battery monitoring not available on this device',
                    lastUpdated: new Date().toISOString()
                };
                return this.currentStatus;
            }

            // Get initial battery status
            await this.updateStatus();
            
            // Set up listeners for battery changes
            this.setupListeners();
            
            console.log('🔋 Battery monitoring initialized successfully');
            return this.currentStatus;
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown battery initialization error';
            this.currentStatus = {
                ...this.currentStatus,
                isAvailable: false,
                lastError: errorMessage,
                lastUpdated: new Date().toISOString()
            };
            console.error('❌ Battery initialization failed:', error);
            return this.currentStatus;
        }
    }

    /**
     * Update current battery status
     */
    private static async updateStatus(): Promise<void> {
        try {
            const [level, state, lowPowerMode] = await Promise.all([
                Battery.getBatteryLevelAsync(),
                Battery.getBatteryStateAsync(),
                Battery.isLowPowerModeEnabledAsync()
            ]);

            const previousLevel = this.currentStatus.batteryLevel;
            
            this.currentStatus = {
                isAvailable: true,
                batteryLevel: level,
                batteryState: state,
                lowPowerMode,
                isCharging: state === Battery.BatteryState.CHARGING,
                lastUpdated: new Date().toISOString(),
                lastError: null
            };

            // Check for battery alerts
            this.checkBatteryAlerts(previousLevel, level, lowPowerMode);
            
            // Notify listeners
            this.notifyListeners();

        } catch (error) {
            this.currentStatus = {
                ...this.currentStatus,
                lastError: error instanceof Error ? error.message : 'Failed to update battery status',
                lastUpdated: new Date().toISOString()
            };
            console.error('❌ Failed to update battery status:', error);
        }
    }

    /**
     * Set up battery event listeners
     */
    private static setupListeners(): void {
        try {
            // Battery level changes
            this.levelSubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
                const previousLevel = this.currentStatus.batteryLevel;
                this.currentStatus.batteryLevel = batteryLevel;
                this.currentStatus.lastUpdated = new Date().toISOString();
                this.checkBatteryAlerts(previousLevel, batteryLevel, this.currentStatus.lowPowerMode);
                this.notifyListeners();
            });

            // Battery state changes (charging/unplugged/full)
            this.statusSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
                this.currentStatus.batteryState = batteryState;
                this.currentStatus.isCharging = batteryState === Battery.BatteryState.CHARGING;
                this.currentStatus.lastUpdated = new Date().toISOString();
                this.notifyListeners();
            });

            // Low power mode changes
            this.lowPowerSubscription = Battery.addLowPowerModeListener(({ lowPowerMode }) => {
                const previousLowPower = this.currentStatus.lowPowerMode;
                this.currentStatus.lowPowerMode = lowPowerMode;
                this.currentStatus.lastUpdated = new Date().toISOString();
                
                // Alert when low power mode is enabled
                if (!previousLowPower && lowPowerMode) {
                    this.triggerAlert({
                        type: 'low_power_mode',
                        level: this.currentStatus.batteryLevel,
                        message: 'Low Power Mode has been enabled',
                        timestamp: new Date().toISOString()
                    });
                }
                
                this.notifyListeners();
            });

            console.log('🔋 Battery listeners setup complete');
        } catch (error) {
            console.error('❌ Failed to setup battery listeners:', error);
        }
    }

    /**
     * Check for battery level alerts
     */
    private static checkBatteryAlerts(previousLevel: number, currentLevel: number, lowPowerMode: boolean): void {
        // Only check if we have valid levels
        if (previousLevel < 0 || currentLevel < 0) return;

        // Critical battery alert (5%)
        if (currentLevel <= 0.05 && previousLevel > 0.05) {
            this.triggerAlert({
                type: 'critical_battery',
                level: currentLevel,
                message: `Critical battery level: ${Math.round(currentLevel * 100)}%`,
                timestamp: new Date().toISOString()
            });
        }
        // Low battery alert (15%)
        else if (currentLevel <= 0.15 && previousLevel > 0.15) {
            this.triggerAlert({
                type: 'low_battery',
                level: currentLevel,
                message: `Low battery level: ${Math.round(currentLevel * 100)}%`,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Trigger battery alert
     */
    private static triggerAlert(alert: BatteryAlert): void {
        console.warn(`🔋⚠️ Battery Alert: ${alert.message}`);
        this.alertCallbacks.forEach(callback => {
            try {
                callback(alert);
            } catch (error) {
                console.error('❌ Error in battery alert callback:', error);
            }
        });
    }

    /**
     * Add status change listener
     */
    static addStatusListener(callback: () => void): () => void {
        this.listeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Add battery alert listener
     */
    static addAlertListener(callback: (alert: BatteryAlert) => void): () => void {
        this.alertCallbacks.push(callback);
        
        return () => {
            const index = this.alertCallbacks.indexOf(callback);
            if (index > -1) {
                this.alertCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Notify all listeners
     */
    private static notifyListeners(): void {
        this.listeners.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('❌ Error in battery status callback:', error);
            }
        });
    }

    /**
     * Get current battery status
     */
    static getCurrentStatus(): BatteryStatus {
        return { ...this.currentStatus };
    }

    /**
     * Refresh battery status manually
     */
    static async refreshStatus(): Promise<BatteryStatus> {
        await this.updateStatus();
        return this.getCurrentStatus();
    }

    /**
     * Get battery level as percentage
     */
    static getBatteryPercentage(): number {
        return this.currentStatus.batteryLevel >= 0 
            ? Math.round(this.currentStatus.batteryLevel * 100)
            : -1;
    }

    /**
     * Get battery state description
     */
    static getBatteryStateDescription(): string {
        switch (this.currentStatus.batteryState) {
            case Battery.BatteryState.CHARGING:
                return 'Charging';
            case Battery.BatteryState.FULL:
                return 'Full';
            case Battery.BatteryState.UNPLUGGED:
                return 'Unplugged';
            case Battery.BatteryState.UNKNOWN:
            default:
                return 'Unknown';
        }
    }

    /**
     * Get battery status emoji
     */
    static getBatteryEmoji(): string {
        const level = this.currentStatus.batteryLevel;
        const isCharging = this.currentStatus.isCharging;
        
        if (isCharging) return '🔌';
        if (level >= 0.8) return '🔋';
        if (level >= 0.5) return '🔋';
        if (level >= 0.2) return '🪫';
        if (level >= 0) return '🪫';
        return '❓';
    }

    /**
     * Check if battery optimization is enabled (Android)
     */
    static async isBatteryOptimizationEnabled(): Promise<boolean | null> {
        try {
            if (Platform.OS !== 'android') return null;
            return await Battery.isBatteryOptimizationEnabledAsync();
        } catch (error) {
            console.error('❌ Failed to check battery optimization:', error);
            return null;
        }
    }

    /**
     * Format battery status for logging
     */
    static formatStatusForLogging(): string {
        const status = this.currentStatus;
        const percentage = this.getBatteryPercentage();
        const stateDesc = this.getBatteryStateDescription();
        const emoji = this.getBatteryEmoji();
        const lowPower = status.lowPowerMode ? 'Low Power' : 'Normal';
        
        return `${emoji} Battery: ${percentage >= 0 ? `${percentage}%` : 'Unknown'} | ${stateDesc} | ${lowPower}`;
    }

    /**
     * Stop monitoring and cleanup
     */
    static stopMonitoring(): void {
        try {
            if (this.levelSubscription) {
                this.levelSubscription.remove();
                this.levelSubscription = null;
            }
            
            if (this.statusSubscription) {
                this.statusSubscription.remove();
                this.statusSubscription = null;
            }
            
            if (this.lowPowerSubscription) {
                this.lowPowerSubscription.remove();
                this.lowPowerSubscription = null;
            }
            
            this.listeners.length = 0;
            this.alertCallbacks.length = 0;
            
            console.log('🔋 Battery monitoring stopped');
        } catch (error) {
            console.error('❌ Failed to stop battery monitoring:', error);
        }
    }
}
