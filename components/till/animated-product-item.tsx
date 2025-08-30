import { View, Text } from 'react-native';
import { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import ProductCard from './product-card';
import type { MenuItemWithBadge } from '@/store/menu.store';

/**
 * Animated Product Item Component for staggered animations
 */
interface AnimatedProductItemProps {
    item: MenuItemWithBadge;
    index: number;
}

export default function AnimatedProductItem({
    item,
    index,
}: AnimatedProductItemProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        const delay = index * 100; // Stagger by 100ms per item

        setTimeout(() => {
            opacity.value = withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            });
            translateY.value = withSpring(0, {
                damping: 12,
                stiffness: 120,
            });
            scale.value = withSpring(1, {
                damping: 10,
                stiffness: 100,
            });
        }, delay);
    }, [index, opacity, translateY, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    // Validate item data before rendering
    if (!item?.id || !item?.name || typeof item?.price !== 'number') {
        console.warn('Invalid item data:', item);
        return (
            <View style={{ flex: 1, margin: 8 }}>
                <View className="flex-1 justify-center items-center p-4 bg-gray-100 rounded-xl">
                    <Text className="text-sm text-gray-500 font-primary">
                        Invalid item
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <Animated.View
            style={[
                {
                    flex: 1,
                    margin: 8,
                    minHeight: 180, // Ensure consistent height
                },
                animatedStyle,
            ]}
        >
            <ProductCard item={item} />
        </Animated.View>
    );
}
