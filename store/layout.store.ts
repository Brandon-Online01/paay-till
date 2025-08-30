import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LayoutDirection = 'ltr' | 'rtl';
export type CartPosition = 'left' | 'right';

interface LayoutState {
    direction: LayoutDirection;
    cartPosition: CartPosition;
    setDirection: (direction: LayoutDirection) => void;
    setCartPosition: (position: CartPosition) => void;
    toggleCartPosition: () => void;
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set, get) => ({
            direction: 'ltr',
            cartPosition: 'right',

            setDirection: (direction: LayoutDirection) => {
                set({ direction });
                
                // Auto-adjust cart position based on direction
                // In LTR, cart typically goes on the right
                // In RTL, cart typically goes on the left
                const newCartPosition: CartPosition = direction === 'ltr' ? 'right' : 'left';
                set({ cartPosition: newCartPosition });
            },

            setCartPosition: (position: CartPosition) => {
                set({ cartPosition: position });
            },

            toggleCartPosition: () => {
                const state = get();
                const newPosition: CartPosition = 
                    state.cartPosition === 'left' ? 'right' : 'left';
                state.setCartPosition(newPosition);
            },
        }),
        {
            name: 'layout-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
