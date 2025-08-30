import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/**
 * Biometrics Authentication Utility
 * Provides fingerprint, face recognition, PIN, and passcode authentication
 */

export interface BiometricStatus {
    isAvailable: boolean;
    isEnrolled: boolean;
    availableTypes: LocalAuthentication.AuthenticationType[];
    securityLevel: LocalAuthentication.SecurityLevel;
    lastError: string | null;
}

export interface AuthenticationOptions {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
    disableDeviceFallback?: boolean;
    requireConfirmation?: boolean;
}

export interface AuthenticationResult {
    success: boolean;
    error?: string;
    warning?: string;
    biometricType?: LocalAuthentication.AuthenticationType;
}

export class BiometricsUtils {
    private static currentStatus: BiometricStatus = {
        isAvailable: false,
        isEnrolled: false,
        availableTypes: [],
        securityLevel: LocalAuthentication.SecurityLevel.NONE,
        lastError: null
    };

    /**
     * Initialize biometrics and check capabilities
     */
    static async initialize(): Promise<BiometricStatus> {
        try {
            // Check if local authentication is available
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            
            if (!hasHardware) {
                this.currentStatus = {
                    isAvailable: false,
                    isEnrolled: false,
                    availableTypes: [],
                    securityLevel: LocalAuthentication.SecurityLevel.NONE,
                    lastError: 'Biometric hardware not available'
                };
                return this.currentStatus;
            }

            // Check if biometrics are enrolled
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            
            // Get available authentication types
            const availableTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            
            // Get security level
            const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

            this.currentStatus = {
                isAvailable: hasHardware,
                isEnrolled,
                availableTypes,
                securityLevel,
                lastError: null
            };

            console.log('🔐 Biometrics initialized successfully');
            console.log(`   Available types: ${this.getAuthTypeNames().join(', ')}`);
            console.log(`   Security level: ${this.getSecurityLevelName()}`);
            
            return this.currentStatus;
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown biometrics initialization error';
            this.currentStatus = {
                isAvailable: false,
                isEnrolled: false,
                availableTypes: [],
                securityLevel: LocalAuthentication.SecurityLevel.NONE,
                lastError: errorMessage
            };
            console.error('❌ Biometrics initialization failed:', error);
            return this.currentStatus;
        }
    }

    /**
     * Authenticate user with biometrics or device credentials
     */
    static async authenticate(options: AuthenticationOptions = {}): Promise<AuthenticationResult> {
        try {
            // Check if authentication is available
            if (!this.currentStatus.isAvailable) {
                return {
                    success: false,
                    error: 'Biometric authentication not available'
                };
            }

            const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
                promptMessage: options.promptMessage || 'Authenticate to continue',
                cancelLabel: options.cancelLabel || 'Cancel',
                fallbackLabel: options.fallbackLabel || 'Use PIN',
                disableDeviceFallback: options.disableDeviceFallback || false,
                requireConfirmation: options.requireConfirmation ?? true
            };

            const result = await LocalAuthentication.authenticateAsync(authOptions);

            if (result.success) {
                console.log('✅ Biometric authentication successful');
                return {
                    success: true,
                    biometricType: this.getPrimaryBiometricType()
                };
            } else {
                const errorMessage = this.getErrorMessage(result.error);
                console.warn(`⚠️ Biometric authentication failed: ${errorMessage}`);
                
                return {
                    success: false,
                    error: errorMessage,
                    warning: result.warning
                };
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
            console.error('❌ Biometric authentication error:', error);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Quick authentication with default settings
     */
    static async quickAuth(promptMessage = 'Please authenticate'): Promise<boolean> {
        const result = await this.authenticate({ promptMessage });
        return result.success;
    }

    /**
     * Check if specific authentication type is available
     */
    static hasAuthenticationType(type: LocalAuthentication.AuthenticationType): boolean {
        return this.currentStatus.availableTypes.includes(type);
    }

    /**
     * Check if fingerprint is available
     */
    static hasFingerprint(): boolean {
        return this.hasAuthenticationType(LocalAuthentication.AuthenticationType.FINGERPRINT);
    }

    /**
     * Check if face recognition is available
     */
    static hasFaceRecognition(): boolean {
        return this.hasAuthenticationType(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    }

    /**
     * Check if iris recognition is available
     */
    static hasIrisRecognition(): boolean {
        return this.hasAuthenticationType(LocalAuthentication.AuthenticationType.IRIS);
    }

    /**
     * Get primary biometric type (most secure available)
     */
    private static getPrimaryBiometricType(): LocalAuthentication.AuthenticationType | undefined {
        const { availableTypes } = this.currentStatus;
        
        // Priority order: Iris > Face > Fingerprint
        if (availableTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            return LocalAuthentication.AuthenticationType.IRIS;
        }
        if (availableTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            return LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;
        }
        if (availableTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            return LocalAuthentication.AuthenticationType.FINGERPRINT;
        }
        
        return undefined;
    }

    /**
     * Get authentication type names
     */
    private static getAuthTypeNames(): string[] {
        return this.currentStatus.availableTypes.map(type => {
            switch (type) {
                case LocalAuthentication.AuthenticationType.FINGERPRINT:
                    return 'Fingerprint';
                case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                    return 'Face ID';
                case LocalAuthentication.AuthenticationType.IRIS:
                    return 'Iris';
                default:
                    return 'Unknown';
            }
        });
    }

    /**
     * Get security level name
     */
    private static getSecurityLevelName(): string {
        switch (this.currentStatus.securityLevel) {
            case LocalAuthentication.SecurityLevel.NONE:
                return 'None';
            case LocalAuthentication.SecurityLevel.SECRET:
                return 'Secret (PIN/Pattern/Password)';
            case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
                return 'Weak Biometric';
            case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
                return 'Strong Biometric';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get error message from authentication error
     */
    private static getErrorMessage(error: string): string {
        switch (error) {
            case 'UserCancel':
                return 'User cancelled authentication';
            case 'UserFallback':
                return 'User chose fallback authentication';
            case 'SystemCancel':
                return 'System cancelled authentication';
            case 'PasscodeNotSet':
                return 'No passcode/PIN set on device';
            case 'BiometricNotAvailable':
                return 'Biometric authentication not available';
            case 'BiometricNotEnrolled':
                return 'No biometrics enrolled on device';
            case 'BiometricLockout':
                return 'Too many failed attempts, biometrics locked';
            case 'BiometricLockoutPermanent':
                return 'Biometrics permanently locked, use device passcode';
            case 'DeviceNotSecure':
                return 'Device is not secure (no lock screen)';
            case 'InvalidContext':
                return 'Invalid authentication context';
            case 'NotInteractive':
                return 'Authentication not interactive';
            default:
                return error || 'Unknown authentication error';
        }
    }

    /**
     * Get current biometric status
     */
    static getCurrentStatus(): BiometricStatus {
        return { ...this.currentStatus };
    }

    /**
     * Refresh biometric status
     */
    static async refreshStatus(): Promise<BiometricStatus> {
        return await this.initialize();
    }

    /**
     * Check if biometric authentication is available
     */
    static async isAvailable(): Promise<boolean> {
        try {
            const status = await this.initialize();
            return status.isAvailable;
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            return false;
        }
    }

    /**
     * Check if biometric authentication is enrolled/configured
     */
    static async isEnrolled(): Promise<boolean> {
        try {
            const status = await this.initialize();
            return status.isEnrolled;
        } catch (error) {
            console.error('Error checking biometric enrollment:', error);
            return false;
        }
    }

    /**
     * Authenticate using biometric or device credentials
     */
    static async authenticate(options: AuthenticationOptions = {}): Promise<AuthenticationResult> {
        try {
            // Initialize first to ensure we have current status
            const status = await this.initialize();
            
            if (!status.isAvailable) {
                return {
                    success: false,
                    error: 'Biometric authentication is not available on this device'
                };
            }

            if (!status.isEnrolled) {
                return {
                    success: false,
                    error: 'No biometric credentials are enrolled on this device'
                };
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: options.promptMessage || 'Authenticate with biometrics',
                cancelLabel: options.cancelLabel || 'Cancel',
                fallbackLabel: options.fallbackLabel || 'Use PIN',
                disableDeviceFallback: options.disableDeviceFallback || false,
                requireConfirmation: options.requireConfirmation || false,
            });

            if (result.success) {
                return {
                    success: true,
                    biometricType: this.getPrimaryBiometricType()
                };
            } else {
                return {
                    success: false,
                    error: result.error === 'UserCancel' ? 'Authentication cancelled by user' : 'Authentication failed'
                };
            }

        } catch (error) {
            console.error('Biometric authentication error:', error);
            return {
                success: false,
                error: 'Biometric authentication failed'
            };
        }
    }

    /**
     * Get biometric capability emoji
     */
    static getBiometricEmoji(): string {
        if (!this.currentStatus.isAvailable) return '🚫';
        if (!this.currentStatus.isEnrolled) return '⚠️';
        
        if (this.hasIrisRecognition()) return '👁️';
        if (this.hasFaceRecognition()) return '🤳';
        if (this.hasFingerprint()) return '👆';
        
        return '🔐';
    }

    /**
     * Get security level emoji
     */
    static getSecurityLevelEmoji(): string {
        switch (this.currentStatus.securityLevel) {
            case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
                return '🛡️';
            case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
                return '🔒';
            case LocalAuthentication.SecurityLevel.SECRET:
                return '🔑';
            case LocalAuthentication.SecurityLevel.NONE:
            default:
                return '🔓';
        }
    }

    /**
     * Check if device is secure enough for sensitive operations
     */
    static isSecureEnough(): boolean {
        return this.currentStatus.securityLevel !== LocalAuthentication.SecurityLevel.NONE;
    }

    /**
     * Format biometric status for logging
     */
    static formatStatusForLogging(): string {
        const emoji = this.getBiometricEmoji();
        const securityEmoji = this.getSecurityLevelEmoji();
        const types = this.getAuthTypeNames().join('/') || 'None';
        const enrolled = this.currentStatus.isEnrolled ? 'Enrolled' : 'Not Enrolled';
        const available = this.currentStatus.isAvailable ? 'Available' : 'Unavailable';
        
        return `${emoji} Biometrics: ${available} | ${types} | ${enrolled} | ${securityEmoji}`;
    }

    /**
     * Get platform-specific authentication prompt
     */
    static getPlatformPrompt(action = 'authenticate'): string {
        if (Platform.OS === 'ios') {
            if (this.hasFaceRecognition()) {
                return `Use Face ID to ${action}`;
            } else if (this.hasFingerprint()) {
                return `Use Touch ID to ${action}`;
            }
        } else if (Platform.OS === 'android') {
            const types = this.getAuthTypeNames();
            if (types.length > 0) {
                return `Use ${types[0]} to ${action}`;
            }
        }
        
        return `Please ${action}`;
    }
}
