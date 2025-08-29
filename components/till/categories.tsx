import { View, Text, Pressable, FlatList } from 'react-native';
import { useEffect, useCallback } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useMenuStore } from '@/store/menu.store';
import { useCartStore } from '@/store/cart.store';

/**
 * Interface for category item
 */
interface CategoryItem {
    /** Unique identifier for the category */
    id: string;
    /** Display name of the category */
    name: string;
    /** Icon emoji for the category */
    icon: string;
    /** Number of items in this category */
    count: number;
}

/**
 * Individual Category Item Component with animation
 */
function CategoryItemComponent({ 
    item, 
    index, 
    isSelected, 
    onPress 
}: { 
    item: CategoryItem; 
    index: number; 
    isSelected: boolean; 
    onPress: (id: string) => void; 
}) {
    // Individual category animation values
    const itemOpacity = useSharedValue(0);
    const itemScale = useSharedValue(0.8);
    const itemTranslateY = useSharedValue(10);

    // Staggered animation for each category
    useEffect(() => {
        const delay = index * 100 + 300; // Stagger by 100ms each, start after 300ms
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
        <Animated.View style={itemAnimatedStyle}>
            <Pressable
                onPress={() => onPress(item.id)}
                className={`min-w-[120px] px-4 py-3 rounded-xl border mr-3 ${
                    isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-200'
                }`}
            >
                <View className="items-center">
                    <Text className="mb-1 text-2xl font-primary">
                        {item.icon}
                    </Text>
                    <Text
                        className={`text-sm font-semibold font-primary ${
                            isSelected ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                        {item.name}
                    </Text>
                    <Text
                        className={`text-xs font-primary ${
                            isSelected ? 'text-blue-100' : 'text-gray-500'
                        }`}
                    >
                        {item.count} Items
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
}

/**
 * Categories Component - Horizontal scrolling list of product categories with staggered animations
 *
 * Features:
 * - FlatList for optimized horizontal scrolling
 * - Visual selection states
 * - Item count display
 * - Responsive touch targets
 * - Staggered entrance animations
 */
export default function Categories() {
    const { categories } = useMenuStore();
    const { selectedCategory, setSelectedCategory } = useCartStore();

    // Animation values for staggered category entrance
    const containerOpacity = useSharedValue(0);
    const containerTranslateY = useSharedValue(-20);

    useEffect(() => {
        // Container animation
        setTimeout(() => {
            containerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });
            containerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        }, 100);
    }, []);

    // Animated style for container
    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
        transform: [{ translateY: containerTranslateY.value }],
    }));

    /**
     * Render individual category item
     * @param item - Category item to render
     * @param index - Index for staggered animation delay
     * @returns JSX element for the category button
     */
    const renderCategory = useCallback(({ item, index }: { item: CategoryItem; index: number }) => {
        // Validate category data
        if (!item?.id || !item?.name) {
            console.warn('Invalid category data:', item);
            return null;
        }

        const isSelected = selectedCategory === item.id;

        return (
            <CategoryItemComponent
                item={item}
                index={index}
                isSelected={isSelected}
                onPress={setSelectedCategory}
            />
        );
    }, [selectedCategory, setSelectedCategory]);

    /**
     * Get key for FlatList item
     * @param item - Category item
     * @returns Unique key string
     */
    const getCategoryKey = (item: CategoryItem): string => {
        return item.id;
    };

    /**
     * Get initial number of categories to render
     * @returns Initial num to render
     */
    const getInitialNumToRender = (): number => {
        return Math.min(categories.length, 8); // Show up to 8 categories initially
    };

    return (
        <Animated.View className="px-4 mb-4" style={containerAnimatedStyle}>
            <FlatList
                data={categories}
                renderItem={({ item, index }) => renderCategory({ item, index })}
                keyExtractor={getCategoryKey}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 0,
                    paddingRight: 16, // Add some padding at the end
                }}
                initialNumToRender={getInitialNumToRender()}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
            />
        </Animated.View>
    );
}
