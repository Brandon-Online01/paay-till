import { useWindowDimensions, Dimensions } from 'react-native';

export interface ScreenSize {
    width: number;
    height: number;
    isSmall: boolean;
    isMedium: boolean;
    isLarge: boolean;
    isXLarge: boolean;
    isTablet: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    orientation: 'portrait' | 'landscape';
    deviceCategory: 'mobile' | 'tablet' | 'desktop';
}

export interface ScreenBreakpoints {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
}

// Default breakpoints (can be customized)
export const defaultBreakpoints: ScreenBreakpoints = {
    small: 480, // Mobile phones
    medium: 768, // Tablets
    large: 1024, // Small laptops
    xlarge: 1280, // Desktop
};

export function useScreenSize(
    customBreakpoints?: Partial<ScreenBreakpoints>
): ScreenSize {
    const { width, height } = useWindowDimensions();

    const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };

    const isSmall = width < breakpoints.small;
    const isMedium = width >= breakpoints.small && width < breakpoints.medium;
    const isLarge = width >= breakpoints.medium && width < breakpoints.large;
    const isXLarge = width >= breakpoints.large;

    const isMobile = width < breakpoints.small;
    const isTablet = width >= breakpoints.small && width < breakpoints.large;
    const isDesktop = width >= breakpoints.large;

    const orientation = width > height ? 'landscape' : 'portrait';

    let deviceCategory: 'mobile' | 'tablet' | 'desktop';
    if (isMobile) {
        deviceCategory = 'mobile';
    } else if (isTablet) {
        deviceCategory = 'tablet';
    } else {
        deviceCategory = 'desktop';
    }

    return {
        width,
        height,
        isSmall,
        isMedium,
        isLarge,
        isXLarge,
        isTablet,
        isMobile,
        isDesktop,
        orientation,
        deviceCategory,
    };
}

// Helper functions for common responsive patterns
export const getResponsiveValue = <T>(
    values: {
        mobile?: T;
        tablet?: T;
        desktop?: T;
        default: T;
    },
    screenSize: ScreenSize
): T => {
    if (screenSize.isMobile && values.mobile !== undefined) {
        return values.mobile;
    }
    if (screenSize.isTablet && values.tablet !== undefined) {
        return values.tablet;
    }
    if (screenSize.isDesktop && values.desktop !== undefined) {
        return values.desktop;
    }
    return values.default;
};

export const getFlexDirection = (
    screenSize: ScreenSize,
    mobileDirection: 'row' | 'column' = 'column'
): 'row' | 'column' => {
    return screenSize.isMobile ? mobileDirection : 'row';
};

export const getContainerWidth = (screenSize: ScreenSize): string => {
    if (screenSize.isMobile) return 'w-full';
    if (screenSize.isTablet) return 'w-11/12';
    return 'w-10/12';
};

/**
 * ScreenSizeUtils - Static utility class for screen size information
 * Can be used outside of React components
 */
export class ScreenSizeUtils {
    /**
     * Get current screen information without React hooks
     */
    static getScreenInfo(customBreakpoints?: Partial<ScreenBreakpoints>): ScreenSize {
        const { width, height } = Dimensions.get('window');
        
        const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
        
        const isSmall = width < breakpoints.small;
        const isMedium = width >= breakpoints.small && width < breakpoints.medium;
        const isLarge = width >= breakpoints.medium && width < breakpoints.large;
        const isXLarge = width >= breakpoints.large;
        
        const isMobile = width < breakpoints.small;
        const isTablet = width >= breakpoints.small && width < breakpoints.large;
        const isDesktop = width >= breakpoints.large;
        
        const orientation = width > height ? 'landscape' : 'portrait';
        
        let deviceCategory: 'mobile' | 'tablet' | 'desktop';
        if (isMobile) {
            deviceCategory = 'mobile';
        } else if (isTablet) {
            deviceCategory = 'tablet';
        } else {
            deviceCategory = 'desktop';
        }
        
        return {
            width,
            height,
            isSmall,
            isMedium,
            isLarge,
            isXLarge,
            isTablet,
            isMobile,
            isDesktop,
            orientation,
            deviceCategory,
        };
    }

    /**
     * Format screen info for logging
     */
    static formatForLogging(screenInfo: ScreenSize): string {
        const emoji = screenInfo.isMobile ? '📱' : screenInfo.isTablet ? '📟' : '💻';
        return `${emoji} Screen: ${screenInfo.deviceCategory} ${screenInfo.width}x${screenInfo.height} (${screenInfo.orientation})`;
    }
}
