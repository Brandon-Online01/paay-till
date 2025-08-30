import { PermissionsAndroid, Platform, Alert } from 'react-native';

/**
 * Camera capture result interface
 */
export interface CameraResult {
    uri: string;
    width: number;
    height: number;
    type: string;
    fileName?: string;
    fileSize?: number;
}

/**
 * Camera options interface
 */
export interface CameraOptions {
    quality?: number; // 0-100
    allowsEditing?: boolean;
    aspect?: [number, number];
    mediaTypes?: 'photo' | 'video' | 'mixed';
    videoMaxDuration?: number;
}

/**
 * Camera utility class for photo and video capture
 * Provides cross-platform camera functionality with proper permissions
 */
export class CameraUtils {
    private static isCapturing = false;

    /**
     * Request camera permissions
     */
    static async requestCameraPermissions(): Promise<boolean> {
        if (Platform.OS === 'ios') {
            // iOS handles permissions through Info.plist and runtime prompts
            return true;
        }

        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            ]);

            const allGranted = Object.values(granted).every(
                (status) => status === PermissionsAndroid.RESULTS.GRANTED
            );

            if (!allGranted) {
                Alert.alert(
                    'Camera Permissions Required',
                    'This app needs camera and storage permissions to take photos for receipts and product images.',
                    [{ text: 'OK' }]
                );
            }

            return allGranted;
        } catch (error) {
            console.error('Error requesting camera permissions:', error);
            return false;
        }
    }

    /**
     * Check if camera is available
     */
    static async isCameraAvailable(): Promise<boolean> {
        try {
            // This would typically use ImagePicker or react-native-camera
            // For now, we'll simulate the check
            console.log('📷 Checking camera availability...');

            // In a real implementation:
            // const ImagePicker = require('react-native-image-picker');
            // return ImagePicker.isCameraAvailable();

            return true; // Simulated for now
        } catch (error) {
            console.error('Error checking camera availability:', error);
            return false;
        }
    }

    /**
     * Launch camera to take a photo
     */
    static async takePicture(
        options?: CameraOptions
    ): Promise<CameraResult | null> {
        const hasPermissions = await this.requestCameraPermissions();
        if (!hasPermissions) {
            throw new Error('Camera permissions not granted');
        }

        const isAvailable = await this.isCameraAvailable();
        if (!isAvailable) {
            throw new Error('Camera is not available');
        }

        if (this.isCapturing) {
            console.log('📷 Camera is already in use');
            return null;
        }

        try {
            this.isCapturing = true;
            console.log('📷 Launching camera...');

            // Default options
            const cameraOptions: CameraOptions = {
                quality: 80,
                allowsEditing: false,
                mediaTypes: 'photo',
                ...options,
            };

            // Simulate camera capture
            // In a real implementation:
            // const ImagePicker = require('react-native-image-picker');
            // const result = await ImagePicker.launchCamera(cameraOptions);

            // Simulate capture delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const mockResult: CameraResult = {
                uri: `file://captured-image-${Date.now()}.jpg`,
                width: 1920,
                height: 1080,
                type: 'image/jpeg',
                fileName: `photo_${Date.now()}.jpg`,
                fileSize: 524288, // 512 KB
            };

            console.log('📷 Photo captured successfully');
            return mockResult;
        } catch (error) {
            console.error('❌ Failed to capture photo:', error);
            throw error;
        } finally {
            this.isCapturing = false;
        }
    }

    /**
     * Launch camera to record video
     */
    static async recordVideo(
        options?: CameraOptions
    ): Promise<CameraResult | null> {
        const hasPermissions = await this.requestCameraPermissions();
        if (!hasPermissions) {
            throw new Error('Camera permissions not granted');
        }

        const isAvailable = await this.isCameraAvailable();
        if (!isAvailable) {
            throw new Error('Camera is not available');
        }

        if (this.isCapturing) {
            console.log('📹 Camera is already in use');
            return null;
        }

        try {
            this.isCapturing = true;
            console.log('📹 Launching video recorder...');

            const videoOptions: CameraOptions = {
                quality: 70,
                mediaTypes: 'video',
                videoMaxDuration: 30, // 30 seconds
                ...options,
            };

            // Simulate video recording
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const mockResult: CameraResult = {
                uri: `file://recorded-video-${Date.now()}.mp4`,
                width: 1920,
                height: 1080,
                type: 'video/mp4',
                fileName: `video_${Date.now()}.mp4`,
                fileSize: 2097152, // 2 MB
            };

            console.log('📹 Video recorded successfully');
            return mockResult;
        } catch (error) {
            console.error('❌ Failed to record video:', error);
            throw error;
        } finally {
            this.isCapturing = false;
        }
    }

    /**
     * Pick image from gallery
     */
    static async pickImageFromGallery(
        options?: CameraOptions
    ): Promise<CameraResult | null> {
        const hasPermissions = await this.requestCameraPermissions();
        if (!hasPermissions) {
            throw new Error('Storage permissions not granted');
        }

        try {
            console.log('📱 Opening image gallery...');

            const galleryOptions: CameraOptions = {
                quality: 80,
                allowsEditing: true,
                mediaTypes: 'photo',
                ...options,
            };

            // Simulate gallery selection
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockResult: CameraResult = {
                uri: `file://gallery-image-${Date.now()}.jpg`,
                width: 2048,
                height: 1536,
                type: 'image/jpeg',
                fileName: `gallery_${Date.now()}.jpg`,
                fileSize: 786432, // 768 KB
            };

            console.log('📱 Image selected from gallery');
            return mockResult;
        } catch (error) {
            console.error('❌ Failed to pick image from gallery:', error);
            throw error;
        }
    }

    /**
     * Show action sheet for camera/gallery selection
     */
    static async showImagePickerActionSheet(
        options?: CameraOptions
    ): Promise<CameraResult | null> {
        return new Promise((resolve, reject) => {
            Alert.alert(
                'Select Image',
                'Choose how you want to add an image:',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => resolve(null),
                    },
                    {
                        text: 'Camera',
                        onPress: async () => {
                            try {
                                const result = await this.takePicture(options);
                                resolve(result);
                            } catch (error) {
                                reject(error);
                            }
                        },
                    },
                    {
                        text: 'Gallery',
                        onPress: async () => {
                            try {
                                const result =
                                    await this.pickImageFromGallery(options);
                                resolve(result);
                            } catch (error) {
                                reject(error);
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        });
    }

    /**
     * Get camera status information
     */
    static async getCameraStatus(): Promise<{
        available: boolean;
        capturing: boolean;
        permissionsGranted: boolean;
    }> {
        const available = await this.isCameraAvailable();
        const permissionsGranted = await this.requestCameraPermissions();

        return {
            available,
            capturing: this.isCapturing,
            permissionsGranted,
        };
    }

    /**
     * Compress image for optimized storage/transmission
     */
    static async compressImage(
        imageUri: string,
        quality = 70
    ): Promise<CameraResult> {
        try {
            console.log(
                `🗜️ Compressing image: ${imageUri} with quality ${quality}%`
            );

            // In a real implementation, you would use an image compression library
            // like react-native-image-resizer

            // Simulate compression
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const compressedResult: CameraResult = {
                uri: imageUri.replace('.jpg', '_compressed.jpg'),
                width: 1024,
                height: 768,
                type: 'image/jpeg',
                fileName: `compressed_${Date.now()}.jpg`,
                fileSize: Math.floor(524288 * (quality / 100)), // Approximate compression
            };

            console.log('🗜️ Image compressed successfully');
            return compressedResult;
        } catch (error) {
            console.error('❌ Failed to compress image:', error);
            throw error;
        }
    }

    /**
     * Save image to device gallery
     */
    static async saveImageToGallery(imageUri: string): Promise<boolean> {
        try {
            const hasPermissions = await this.requestCameraPermissions();
            if (!hasPermissions) {
                throw new Error('Storage permissions not granted');
            }

            console.log(`💾 Saving image to gallery: ${imageUri}`);

            // In a real implementation:
            // const CameraRoll = require('@react-native-camera-roll/camera-roll');
            // await CameraRoll.save(imageUri, { type: 'photo' });

            // Simulate save operation
            await new Promise((resolve) => setTimeout(resolve, 500));

            console.log('💾 Image saved to gallery successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save image to gallery:', error);
            return false;
        }
    }
}

/**
 * Hook for using camera utilities in components
 */
export const useCameraUtils = () => {
    return {
        requestPermissions: CameraUtils.requestCameraPermissions,
        isAvailable: CameraUtils.isCameraAvailable,
        takePicture: CameraUtils.takePicture,
        recordVideo: CameraUtils.recordVideo,
        pickFromGallery: CameraUtils.pickImageFromGallery,
        showActionSheet: CameraUtils.showImagePickerActionSheet,
        getStatus: CameraUtils.getCameraStatus,
        compressImage: CameraUtils.compressImage,
        saveToGallery: CameraUtils.saveImageToGallery,
    };
};

export default CameraUtils;
