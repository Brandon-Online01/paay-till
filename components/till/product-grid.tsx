import { View, Text, FlatList, Dimensions } from 'react-native';
import { useMemo, useCallback, useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useMenuStore } from '@/store/menu.store';
import { useCartStore } from '@/store/cart.store';
import ProductCard from './product-card';
import type { MenuItemWithBadge } from '@/store/menu.store';

/**
 * Individual Product Item Component with animation
 */
function ProductItemComponent({ 
    item, 
    index 
}: { 
    item: MenuItemWithBadge; 
    index: number; 
}) {
    // Individual product animation values
    const itemOpacity = useSharedValue(0);
    const itemScale = useSharedValue(0.8);
    const itemTranslateY = useSharedValue(15);

    // Staggered animation for each product
    useEffect(() => {
        const delay = Math.min(index * 80, 800) + 200; // Stagger by 80ms each, max 800ms delay, start after 200ms
        setTimeout(() => {
            itemOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.exp) });
            itemScale.value = withSpring(1, { damping: 12, stiffness: 150 });
            itemTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        }, delay);
    }, [index]);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
        opacity: itemOpacity.value,
        transform: [
            { scale: itemScale.value },
            { translateY: itemTranslateY.value }
        ],
    }));

    return (
        <Animated.View
            style={[
                {
                    flex: 1,
                    margin: 8,
                    minHeight: 180, // Ensure consistent height
                },
                itemAnimatedStyle
            ]}
        >
            <ProductCard item={item} />
        </Animated.View>
    );
}

/**
 * ProductGrid Component - Displays products in a responsive grid layout with staggered animations
 *
 * Features:
 * - Responsive grid with dynamic column count based on screen width
 * - FlatList for optimized rendering with initial num to render
 * - Empty state with search/category feedback
 * - Item validation and error handling
 * - Staggered entrance animations for product cards
 */
export default function ProductGrid() {
    const { getItemsByCategory, searchItems } = useMenuStore();
    const { selectedCategory, searchQuery } = useCartStore();
    const { width } = Dimensions.get('window');

    // Animation values for grid container
    const containerOpacity = useSharedValue(0);
    const containerTranslateY = useSharedValue(20);

    /**
     * Memoized filtered items to prevent unnecessary recalculations
     */
    const filteredItems = useMemo(() => {
        try {
            if (searchQuery?.trim()) {
                return searchItems(searchQuery);
            }
            return getItemsByCategory(selectedCategory);
        } catch (error) {
            console.error('Error filtering items:', error);
            return [];
        }
    }, [searchQuery, selectedCategory, searchItems, getItemsByCategory]);

    // Trigger animation when items change
    useEffect(() => {
        // Reset animation
        containerOpacity.value = 0;
        containerTranslateY.value = 20;
        
        // Animate in new items
        setTimeout(() => {
            containerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) });
            containerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        }, 100);
    }, [filteredItems.length, selectedCategory, searchQuery]);

    // Animated style for container
    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
        transform: [{ translateY: containerTranslateY.value }],
    }));

    /**
     * Memoized number of columns to prevent unnecessary recalculations
     */
    const numColumns = useMemo(() => {
        if (width > 1200) return 4;
        if (width > 900) return 3;
        if (width > 600) return 2;
        return 2;
    }, [width]);

    /**
     * Memoized render function for individual product items
     * Optimized for smooth rendering without glitches
     */
    const renderItem = useCallback(({ item, index }: { item: MenuItemWithBadge; index: number }) => {
        // Validate item data before rendering
        if (!item?.id || !item?.name || typeof item?.price !== 'number') {
            console.warn('Invalid item data:', item);
            return (
                <View style={{ flex: 1, margin: 8 }}>
                    <View className="flex-1 justify-center items-center p-4 bg-gray-100 rounded-xl">
                        <Text className="text-sm text-gray-500 font-primary">Invalid item</Text>
                    </View>
                </View>
            );
        }

        return (
            <ProductItemComponent
                item={item}
                index={index}
            />
        );
    }, []);

    /**
     * Memoized empty state component
     */
    const renderEmptyState = useCallback(
        () => (
            <View className="flex-1 justify-center items-center py-20">
                <Text className="mb-4 text-6xl font-primary">🔍</Text>
                <Text className="mb-2 text-xl font-bold text-gray-600 font-primary">
                    No items found
                </Text>
                <Text className="text-center text-gray-500 font-primary">
                    {searchQuery
                        ? `No results for "${searchQuery}"`
                        : `No items in ${selectedCategory} category`}
                </Text>
            </View>
        ),
        [searchQuery, selectedCategory]
    );

    /**
     * Memoized key extractor for FlatList
     */
    const getItemKey = useCallback(
        (item: MenuItemWithBadge, index: number): string => {
            return `${item.id}-${index}`;
        },
        []
    );

    /**
     * Memoized initial number of items to render
     */
    const initialNumToRender = useMemo(() => {
        return Math.min(filteredItems.length, numColumns * 3); // Show 3 rows initially
    }, [filteredItems.length, numColumns]);

    return (
        <Animated.View className="flex-1 px-4 bg-gray-200/20" style={containerAnimatedStyle}>
            <FlatList
                data={filteredItems}
                renderItem={({ item, index }) => renderItem({ item, index })}
                keyExtractor={getItemKey}
                numColumns={numColumns}
                key={`${numColumns}-${selectedCategory}-${searchQuery}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 100,
                    paddingTop: 8,
                    flexGrow: 1,
                }}
                columnWrapperStyle={
                    numColumns > 1
                        ? {
                            justifyContent: 'space-between',
                            marginBottom: 8,
                        }
                        : undefined
                }
                ListEmptyComponent={renderEmptyState}
                ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
                initialNumToRender={initialNumToRender}
                maxToRenderPerBatch={8}
                windowSize={10}
                removeClippedSubviews={false} // Disable to ensure animations work properly
                updateCellsBatchingPeriod={50}
                extraData={`${numColumns}-${selectedCategory}-${searchQuery}`}
            />
        </Animated.View>
    );
}
