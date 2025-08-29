import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: Theme;
    currentTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'system',
            currentTheme: 'light',
            
            setTheme: (theme: Theme) => {
                set({ theme });
                
                // Apply theme logic
                const state = get();
                let actualTheme: 'light' | 'dark';
                
                if (theme === 'system') {
                    // In a real app, you'd check the system theme
                    // For now, default to light
                    actualTheme = 'light';
                } else {
                    actualTheme = theme;
                }
                
                set({ currentTheme: actualTheme });
                colorScheme.set(actualTheme);
            },
            
            toggleTheme: () => {
                const state = get();
                const currentTheme = state.currentTheme;
                const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
                state.setTheme(newTheme);
            },
            
            initializeTheme: () => {
                const state = get();
                // Initialize theme on app start
                state.setTheme(state.theme);
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                // Initialize theme after rehydration
                if (state) {
                    state.initializeTheme();
                }
            },
        }
    )
);
