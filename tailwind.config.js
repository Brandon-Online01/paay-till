/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './lib/**/*.{js,jsx,ts,tsx}',
        './modules/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            fontFamily: {
                primary: ['Urbanist_400Regular', 'sans-serif'],
                secondary: ['Urbanist_500Medium', 'sans-serif'],
                semibold: ['Urbanist_600SemiBold', 'sans-serif'],
                bold: ['Urbanist_700Bold', 'sans-serif'],
                extrabold: ['Urbanist_800ExtraBold', 'sans-serif'],
                black: ['Urbanist_900Black', 'sans-serif'],
            },
            colors: {
                // Main colors
                primary: '#000000',
                secondary: '#1a1a1a',

                // Coral Blue - Base color #2d71f8
                blue: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2d71f8', // Base color
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },

                // Elf Green - Base color #1c8370
                green: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#1c8370', // Base color
                    800: '#115e59',
                    900: '#134e4a',
                },

                // Coral Red - Base color #FC4A4A
                red: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#FC4A4A', // Base color
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },

                // Black shades for dark themes
                black: {
                    50: '#f8f8f8',
                    100: '#e9e9e9',
                    200: '#d3d3d3',
                    300: '#b0b0b0',
                    400: '#8a8a8a',
                    500: '#6b6b6b',
                    600: '#4d4d4d',
                    700: '#3a3a3a',
                    800: '#2a2a2a',
                    900: '#1a1a1a',
                },

                // White and off-white
                white: {
                    DEFAULT: '#ffffff',
                    50: '#fefefe',
                    100: '#fdfdfd',
                    200: '#fafafa',
                    300: '#f5f5f5',
                    400: '#f0f0f0',
                    500: '#e8e8e8',
                },

                // Amber variants
                amber: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },

                // Gray variants for subtle backgrounds and text
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },

                // Faint variants for subtle UI elements
                faint: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e8e8e8',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                },
            },
        },
    },
    plugins: [],
};
