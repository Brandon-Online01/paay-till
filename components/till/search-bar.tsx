import { Search, X } from 'lucide-react-native';
import { useCartStore } from '@/store/cart.store';
import { View, TextInput, Pressable } from 'react-native';

/**
 * SearchBar Component - Search input for filtering products
 *
 * Features:
 * - Real-time search functionality
 * - Clear search button when text is entered
 * - Consistent styling with padding and shadows
 * - Proper font family usage
 */
export default function SearchBar() {
    const { searchQuery, setSearchQuery } = useCartStore();

    /**
     * Clear search query and reset search state
     */
    const clearSearch = (): void => {
        try {
            setSearchQuery('');
        } catch (error) {
            console.error('Error clearing search:', error);
        }
    };

    /**
     * Handle search query changes
     * @param query - New search query string
     */
    const handleSearchChange = (query: string): void => {
        try {
            setSearchQuery(query);
        } catch (error) {
            console.error('Error updating search query:', error);
        }
    };

    return (
        <View className="flex-row items-center px-6 py-4 mx-4 mb-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Search Icon */}
            <Search size={20} color="#9CA3AF" />

            {/* Search Input */}
            <TextInput
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="search products by category, name, brand ..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 p-1 ml-2 text-gray-900 font-primary"
                style={{ fontSize: 16 }}
                maxLength={100} // Limit search query length
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Clear Search Button - Only show when there's text */}
            {searchQuery?.length > 0 && (
                <Pressable
                    onPress={clearSearch}
                    className="p-2"
                    accessibilityLabel="Clear search"
                >
                    <X size={18} color="#9CA3AF" />
                </Pressable>
            )}
        </View>
    );
}
