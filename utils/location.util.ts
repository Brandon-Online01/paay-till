import { PermissionsAndroid, Platform, Alert } from 'react-native';

/**
 * Location coordinates interface
 */
export interface LocationCoordinates {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
}

/**
 * Location result interface
 */
export interface LocationResult {
    coords: LocationCoordinates;
    timestamp: number;
}

/**
 * Location options interface
 */
export interface LocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    distanceFilter?: number;
}

/**
 * Address information interface
 */
export interface AddressInfo {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    formattedAddress?: string;
}

/**
 * Location status interface
 */
export interface LocationStatus {
    isAvailable: boolean;
    hasPermission: boolean;
    isWatching: boolean;
    hasCurrentLocation: boolean;
    accuracy?: number;
    lastUpdated: string;
    lastError: string | null;
}

/**
 * Location utility class for GPS and geolocation services
 * Provides cross-platform location functionality with proper permissions
 */
export class LocationUtils {
    private static isWatching = false;
    private static watchId: number | null = null;
    private static currentLocation: LocationResult | null = null;
    private static currentStatus: LocationStatus = {
        isAvailable: true, // Assume GPS available on mobile devices
        hasPermission: false,
        isWatching: false,
        hasCurrentLocation: false,
        lastUpdated: new Date().toISOString(),
        lastError: null,
    };

    /**
     * Request location permissions
     */
    static async requestLocationPermissions(): Promise<boolean> {
        if (Platform.OS === 'ios') {
            // iOS handles permissions through Info.plist and runtime prompts
            return true;
        }

        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ]);

            const allGranted = Object.values(granted).every(
                (status) => status === PermissionsAndroid.RESULTS.GRANTED
            );

            if (!allGranted) {
                Alert.alert(
                    'Location Permissions Required',
                    'This app needs location access for delivery tracking, branch identification, and location-based services.',
                    [{ text: 'OK' }]
                );
            }

            return allGranted;
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return false;
        }
    }

    /**
     * Check if location services are enabled
     */
    static async isLocationEnabled(): Promise<boolean> {
        try {
            console.log('📍 Checking location services status...');

            // This would typically use a location library like @react-native-community/geolocation
            // For now, we'll simulate the check
            return true; // Simulated for now
        } catch (error) {
            console.error('Error checking location services:', error);
            return false;
        }
    }

    /**
     * Get current location
     */
    static async getCurrentLocation(
        options?: LocationOptions
    ): Promise<LocationResult> {
        const hasPermissions = await this.requestLocationPermissions();
        if (!hasPermissions) {
            throw new Error('Location permissions not granted');
        }

        const isEnabled = await this.isLocationEnabled();
        if (!isEnabled) {
            throw new Error('Location services are not enabled');
        }

        return new Promise((resolve, reject) => {
            const defaultOptions: LocationOptions = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                ...options,
            };

            console.log('📍 Getting current location...');

            // In a real implementation:
            // navigator.geolocation.getCurrentPosition(
            //   (position) => resolve(position),
            //   (error) => reject(error),
            //   defaultOptions
            // );

            // Simulate location retrieval
            setTimeout(() => {
                const mockLocation: LocationResult = {
                    coords: {
                        latitude: -26.1076, // Johannesburg, South Africa
                        longitude: 28.0567,
                        altitude: 1753,
                        accuracy: 10,
                        altitudeAccuracy: 5,
                        heading: 0,
                        speed: 0,
                    },
                    timestamp: Date.now(),
                };

                this.currentLocation = mockLocation;
                console.log('📍 Current location retrieved successfully');
                resolve(mockLocation);
            }, 2000);
        });
    }

    /**
     * Watch location changes (continuous tracking)
     */
    static async startWatchingLocation(
        onLocationUpdate: (location: LocationResult) => void,
        onError?: (error: any) => void,
        options?: LocationOptions
    ): Promise<boolean> {
        const hasPermissions = await this.requestLocationPermissions();
        if (!hasPermissions) {
            throw new Error('Location permissions not granted');
        }

        if (this.isWatching) {
            console.log('📍 Location watching is already active');
            return false;
        }

        try {
            const watchOptions: LocationOptions = {
                enableHighAccuracy: true,
                distanceFilter: 10, // Update every 10 meters
                ...options,
            };

            console.log('📍 Starting location tracking...');
            this.isWatching = true;

            // In a real implementation:
            // this.watchId = navigator.geolocation.watchPosition(
            //   onLocationUpdate,
            //   onError || ((error) => console.error('Location error:', error)),
            //   watchOptions
            // );

            // Simulate continuous location updates
            const mockUpdates = setInterval(() => {
                if (!this.isWatching) {
                    clearInterval(mockUpdates);
                    return;
                }

                const mockLocation: LocationResult = {
                    coords: {
                        latitude: -26.1076 + (Math.random() - 0.5) * 0.01, // Small random changes
                        longitude: 28.0567 + (Math.random() - 0.5) * 0.01,
                        altitude: 1753 + Math.random() * 10,
                        accuracy: 5 + Math.random() * 10,
                        heading: Math.random() * 360,
                        speed: Math.random() * 5,
                    },
                    timestamp: Date.now(),
                };

                this.currentLocation = mockLocation;
                onLocationUpdate(mockLocation);
            }, 5000); // Update every 5 seconds

            this.watchId = mockUpdates as any;

            console.log('📍 Location tracking started');
            return true;
        } catch (error) {
            console.error('❌ Failed to start location tracking:', error);
            this.isWatching = false;
            throw error;
        }
    }

    /**
     * Stop watching location changes
     */
    static stopWatchingLocation(): void {
        if (!this.isWatching || !this.watchId) {
            return;
        }

        console.log('📍 Stopping location tracking...');

        // In a real implementation:
        // navigator.geolocation.clearWatch(this.watchId);

        clearInterval(this.watchId);
        this.watchId = null;
        this.isWatching = false;

        console.log('📍 Location tracking stopped');
    }

    /**
     * Calculate distance between two points (in kilometers)
     */
    static calculateDistance(
        location1: LocationCoordinates,
        location2: LocationCoordinates
    ): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(location2.latitude - location1.latitude);
        const dLon = this.toRadians(location2.longitude - location1.longitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(location1.latitude)) *
                Math.cos(this.toRadians(location2.latitude)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Convert degrees to radians
     */
    private static toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Get address from coordinates (reverse geocoding)
     */
    static async getAddressFromCoordinates(
        latitude: number,
        longitude: number
    ): Promise<AddressInfo> {
        try {
            console.log(
                `📍 Getting address for coordinates: ${latitude}, ${longitude}`
            );

            // In a real implementation, you would use a geocoding service like:
            // - Google Maps Geocoding API
            // - Mapbox Geocoding API
            // - OpenStreetMap Nominatim

            // Simulate reverse geocoding
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockAddress: AddressInfo = {
                street: '123 Main Street',
                city: 'Johannesburg',
                region: 'Gauteng',
                postalCode: '2000',
                country: 'South Africa',
                formattedAddress:
                    '123 Main Street, Johannesburg, Gauteng 2000, South Africa',
            };

            console.log('📍 Address retrieved successfully');
            return mockAddress;
        } catch (error) {
            console.error('❌ Failed to get address from coordinates:', error);
            throw error;
        }
    }

    /**
     * Get coordinates from address (forward geocoding)
     */
    static async getCoordinatesFromAddress(
        address: string
    ): Promise<LocationCoordinates> {
        try {
            console.log(`📍 Getting coordinates for address: ${address}`);

            // Simulate forward geocoding
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockCoordinates: LocationCoordinates = {
                latitude: -26.1076,
                longitude: 28.0567,
                accuracy: 50,
            };

            console.log('📍 Coordinates retrieved successfully');
            return mockCoordinates;
        } catch (error) {
            console.error('❌ Failed to get coordinates from address:', error);
            throw error;
        }
    }

    /**
     * Get location status information
     */
    static async getLocationStatus(): Promise<{
        enabled: boolean;
        watching: boolean;
        permissionsGranted: boolean;
        currentLocation?: LocationResult;
        accuracy?: number;
    }> {
        const enabled = await this.isLocationEnabled();
        const permissionsGranted = await this.requestLocationPermissions();

        return {
            enabled,
            watching: this.isWatching,
            permissionsGranted,
            currentLocation: this.currentLocation || undefined,
            accuracy: this.currentLocation?.coords.accuracy,
        };
    }

    /**
     * Check if location is within a specified area (geofencing)
     */
    static isLocationInArea(
        location: LocationCoordinates,
        centerPoint: LocationCoordinates,
        radiusKm: number
    ): boolean {
        const distance = this.calculateDistance(location, centerPoint);
        return distance <= radiusKm;
    }

    /**
     * Format coordinates for display
     */
    static formatCoordinates(coords: LocationCoordinates): string {
        const lat = coords.latitude.toFixed(6);
        const lon = coords.longitude.toFixed(6);
        return `${lat}, ${lon}`;
    }

    /**
     * Get cached location (last known position)
     */
    static getCachedLocation(): LocationResult | null {
        return this.currentLocation;
    }

    /**
     * Get current location status
     */
    static getLocationStatus(): LocationStatus {
        this.currentStatus.isWatching = this.isWatching;
        this.currentStatus.hasCurrentLocation = this.currentLocation !== null;
        this.currentStatus.accuracy = this.currentLocation?.coords.accuracy;
        this.currentStatus.lastUpdated = new Date().toISOString();
        return { ...this.currentStatus };
    }

    /**
     * Format location status for logging
     */
    static formatStatusForLogging(): string {
        const status = this.getLocationStatus();
        const emoji = status.isAvailable && status.hasPermission ? '📍' : '📵';
        const available = status.isAvailable ? 'Available' : 'Unavailable';
        const permission = status.hasPermission ? 'Permitted' : 'No Permission';
        const watching = status.isWatching ? 'Tracking' : 'Idle';
        const location = status.hasCurrentLocation 
            ? `Located${status.accuracy ? ` (±${Math.round(status.accuracy)}m)` : ''}`
            : 'No Location';
        
        return `${emoji} Location - ${available} | ${permission} | ${watching} | ${location}`;
    }

    /**
     * Update status when operations complete
     */
    private static updateStatus(updates: Partial<LocationStatus>) {
        this.currentStatus = {
            ...this.currentStatus,
            ...updates,
            lastUpdated: new Date().toISOString(),
        };
    }
}

/**
 * Hook for using location utilities in components
 */
export const useLocationUtils = () => {
    return {
        requestPermissions: LocationUtils.requestLocationPermissions,
        isEnabled: LocationUtils.isLocationEnabled,
        getCurrentLocation: LocationUtils.getCurrentLocation,
        startWatching: LocationUtils.startWatchingLocation,
        stopWatching: LocationUtils.stopWatchingLocation,
        calculateDistance: LocationUtils.calculateDistance,
        getAddressFromCoordinates: LocationUtils.getAddressFromCoordinates,
        getCoordinatesFromAddress: LocationUtils.getCoordinatesFromAddress,
        getStatus: LocationUtils.getLocationStatus,
        isLocationInArea: LocationUtils.isLocationInArea,
        formatCoordinates: LocationUtils.formatCoordinates,
        getCached: LocationUtils.getCachedLocation,
    };
};

export default LocationUtils;
