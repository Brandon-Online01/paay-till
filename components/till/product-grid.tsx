import { View, Text, FlatList, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { useMemo, useCallback, useEffect, useState } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useCartStore } from '@/store/cart.store';
import { ProductService } from '@/@db/product.service';
import { Product, ProductSearchParams } from '@/types/inventory.types';
import ProductCard from './product-card';

// Transform Product to MenuItemWithBadge for compatibility
interface MenuItemWithBadge {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
    badge?: string | null;
    customizable?: boolean;
    variants?: any;
}

/**
 * Individual Product Item Component with animation
 */
function ProductItemComponent({
    item,
    index,
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
            itemOpacity.value = withTiming(1, {
                duration: 400,
                easing: Easing.out(Easing.exp),
            });
            itemScale.value = withSpring(1, { damping: 12, stiffness: 150 });
            itemTranslateY.value = withSpring(0, {
                damping: 15,
                stiffness: 100,
            });
        }, delay);
    }, [index]);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
        opacity: itemOpacity.value,
        transform: [
            { scale: itemScale.value },
            { translateY: itemTranslateY.value },
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
                itemAnimatedStyle,
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
 * - Database-driven product loading
 */
export default function ProductGrid() {
    const { selectedCategory, searchQuery } = useCartStore();
    const { width } = Dimensions.get('window');

    // State for database products with pagination
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    // Animation values for grid container
    const containerOpacity = useSharedValue(0);
    const containerTranslateY = useSharedValue(20);

    /**
     * Load products from database with pagination
     */
    const loadProducts = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
        try {
            if (page === 1) {
                setLoading(true);
                setError(null);
            } else {
                setLoadingMore(true);
            }

            const searchParams: ProductSearchParams = {
                page,
                limit: pageSize,
                sortBy: 'name',
                sortOrder: 'asc'
            };

            // Add search/filter conditions
            if (searchQuery?.trim()) {
                searchParams.query = searchQuery;
            }
            if (selectedCategory && selectedCategory !== 'all') {
                searchParams.category = selectedCategory;
            }

            const response = await ProductService.getProductsPaginated(searchParams);
            
            if (page === 1 || isRefresh) {
                setProducts(response.products);
                setCurrentPage(1);
            } else {
                setProducts(prev => [...prev, ...response.products]);
                setCurrentPage(page);
            }
            
            setHasMoreProducts(response.hasNextPage);
            
            console.log(`📦 Loaded ${response.products.length} products (page ${page}/${response.totalPages})`);

        } catch (err) {
            console.error('Error loading products:', err);
            setError('Failed to load products');
            if (page === 1) {
                setProducts([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [searchQuery, selectedCategory, pageSize]);

        /**
     * Render footer for loading more indicator
     */
        const renderFooter = useCallback(() => {
            if (!loadingMore) return null;
            
            return (
                <View className="justify-center items-center py-4">
                    <ActivityIndicator size="small" color="#2563eb" />
                    <Text className="mt-2 text-sm text-gray-500 font-primary">
                        Loading more products...
                    </Text>
                </View>
            );
        }, [loadingMore]);
    

    /**
     * Load more products for infinite scroll
     */
    const loadMoreProducts = useCallback(() => {
        if (!loadingMore && hasMoreProducts && !loading) {
            loadProducts(currentPage + 1);
        }
    }, [hasMoreProducts, loading, currentPage, loadProducts]);

    /**
     * Refresh products
     */
    const refreshProducts = useCallback(() => {
        setRefreshing(true);
        loadProducts(1, true);
    }, [loadProducts]);

    // Load products when category or search changes
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    /**
     * Transform products to MenuItemWithBadge format for compatibility
     */
    const filteredItems = useMemo(() => {
        return products.map(
            (product): MenuItemWithBadge => ({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                image: product.image,
                description: product.description,
                badge: product.badge,
                customizable: !!product.variants, // Mark as customizable if has variants
                variants: product.variants,
            })
        );
    }, [products]);

    // Trigger animation when items change
    useEffect(() => {
        // Reset animation
        containerOpacity.value = 0;
        containerTranslateY.value = 20;

        // Animate in new items
        setTimeout(() => {
            containerOpacity.value = withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.exp),
            });
            containerTranslateY.value = withSpring(0, {
                damping: 15,
                stiffness: 100,
            });
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
    const renderItem = useCallback(
        ({ item, index }: { item: MenuItemWithBadge; index: number }) => {
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

            return <ProductItemComponent item={item} index={index} />;
        },
        []
    );

    /**
     * Memoized loading state component
     */
    const renderLoadingState = useCallback(
        () => (
            <View className="flex-1 justify-center items-center py-20">
                <Text className="mb-4 text-6xl font-primary">⏳</Text>
                <Text className="mb-2 text-xl font-bold text-gray-600 font-primary">
                    Loading products...
                </Text>
                <Text className="text-center text-gray-500 font-primary">
                    Please wait while we fetch products from database
                </Text>
            </View>
        ),
        []
    );

    /**
     * Memoized error state component
     */
    const renderErrorState = useCallback(
        () => (
            <View className="flex-1 justify-center items-center py-20">
                <Text className="mb-4 text-6xl font-primary">❌</Text>
                <Text className="mb-2 text-xl font-bold text-red-600 font-primary">
                    Error loading products
                </Text>
                <Text className="text-center text-gray-500 font-primary">
                    {error || 'Failed to load products from database'}
                </Text>
            </View>
        ),
        [error]
    );

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

    // Show loading state
    if (loading) {
        return (
            <Animated.View
                className="flex-1 px-4"
                style={containerAnimatedStyle}
            >
                {renderLoadingState()}
            </Animated.View>
        );
    }

    // Show error state
    if (error) {
        return (
            <Animated.View
                className="flex-1 px-4"
                style={containerAnimatedStyle}
            >
                {renderErrorState()}
            </Animated.View>
        );
    }


    return (
        <Animated.View className="flex-1 px-4" style={containerAnimatedStyle}>
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
                ListFooterComponent={renderFooter}
                ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
                initialNumToRender={Math.min(20, pageSize)} // Load initial batch
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={false} // Keep for animations
                updateCellsBatchingPeriod={50}
                onEndReached={loadMoreProducts}
                onEndReachedThreshold={0.1}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshProducts}
                        colors={['#2563eb']}
                        tintColor="#2563eb"
                    />
                }
                extraData={`${numColumns}-${selectedCategory}-${searchQuery}-${products.length}-${loadingMore}`}
                // Performance optimizations for large lists
                getItemLayout={undefined} // Let FlatList calculate dynamically
                legacyImplementation={false}
            />
        </Animated.View>
    );
}
