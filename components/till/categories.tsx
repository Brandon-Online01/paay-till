import { View, Text, Pressable, FlatList } from 'react-native';
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
 * Categories Component - Horizontal scrolling list of product categories
 *
 * Features:
 * - FlatList for optimized horizontal scrolling
 * - Visual selection states
 * - Item count display
 * - Responsive touch targets
 */
export default function Categories() {
    const { categories } = useMenuStore();
    const { selectedCategory, setSelectedCategory } = useCartStore();

    /**
     * Render individual category item
     * @param item - Category item to render
     * @returns JSX element for the category button
     */
    const renderCategory = ({ item }: { item: CategoryItem }) => {
        // Validate category data
        if (!item?.id || !item?.name) {
            console.warn('Invalid category data:', item);
            return null;
        }

        const isSelected = selectedCategory === item.id;

        return (
            <Pressable
                onPress={() => setSelectedCategory(item.id)}
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
        );
    };

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
        <View className="px-4 mb-4 bg-gray-200/20">
            <FlatList
                data={categories}
                renderItem={renderCategory}
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
        </View>
    );
}
