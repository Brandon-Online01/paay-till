import { View, Text, FlatList, Dimensions } from 'react-native';
import { useMemo, useCallback } from 'react';
import { useMenuStore } from '@/store/menu.store';
import { useCartStore } from '@/store/cart.store';
import ProductCard from './product-card';
import type { MenuItemWithBadge } from '@/store/menu.store';

/**
 * ProductGrid Component - Displays products in a responsive grid layout
 *
 * Features:
 * - Responsive grid with dynamic column count based on screen width
 * - FlatList for optimized rendering with initial num to render
 * - Empty state with search/category feedback
 * - Item validation and error handling
 */
export default function ProductGrid() {
    const { getItemsByCategory, searchItems } = useMenuStore();
    const { selectedCategory, searchQuery } = useCartStore();
    const { width } = Dimensions.get('window');

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
    const renderItem = useCallback(({ item }: { item: MenuItemWithBadge }) => {
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
            <View
                style={{
                    flex: 1,
                    margin: 8,
                    minHeight: 180, // Ensure consistent height
                }}
            >
                <ProductCard item={item} />
            </View>
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
        <View className="flex-1 px-4 bg-gray-200/20">
            <FlatList
                data={filteredItems}
                renderItem={renderItem}
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
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
                getItemLayout={(data, index) => ({
                    length: 200, // Approximate item height
                    offset: 200 * index,
                    index,
                })}
                extraData={`${numColumns}-${selectedCategory}-${searchQuery}`}
            />
        </View>
    );
}
