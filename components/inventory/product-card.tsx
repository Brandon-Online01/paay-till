import { View, Text, Pressable } from 'react-native';
import { useCallback, useMemo } from 'react';
import { Package, DollarSign, Tag, TrendingUp } from 'lucide-react-native';
import { Product } from '@/types/inventory.types';

/**
 * Props interface for ProductCard component
 */
interface ProductCardProps {
    /** Product data to display */
    product: Product;
    /** Callback for when card is pressed */
    onPress: (product: Product) => void;
}

/**
 * ProductCard Component - Card layout for product display in inventory
 *
 * Features:
 * - Compact product overview
 * - Visual badge indicators
 * - Stock status display
 * - Price and category information
 */
export default function ProductCard({ product, onPress }: ProductCardProps) {
    /**
     * Handle card press
     */
    const handlePress = useCallback(() => {
        onPress(product);
    }, [product, onPress]);

    /**
     * Get badge color classes
     */
    const badgeColor = useMemo(() => {
        switch (product.badge) {
            case 'special':
                return 'bg-green-100 text-green-800';
            case 'limited':
                return 'bg-purple-100 text-purple-800';
            case '20% off':
                return 'bg-red-100 text-red-800';
            case 'low stock':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }, [product.badge]);

    /**
     * Get stock status color
     */
    const stockColor = useMemo(() => {
        if (!product.inStock) return 'text-red-600';
        if (product.stockQuantity <= 5) return 'text-orange-600';
        return 'text-green-600';
    }, [product.inStock, product.stockQuantity]);

    /**
     * Get stock status text
     */
    const stockText = useMemo(() => {
        if (!product.inStock) return 'Out of Stock';
        if (product.stockQuantity <= 5) return 'Low Stock';
        return 'In Stock';
    }, [product.inStock, product.stockQuantity]);

    return (
        <Pressable
            onPress={handlePress}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-95"
        >
            {/* Badge */}
            {product.badge && (
                <View className="absolute top-2 right-2 z-10">
                    <View className={`px-2 py-1 rounded-full ${badgeColor}`}>
                        <Text className="text-xs font-semibold font-primary">
                            {product.badge}
                        </Text>
                    </View>
                </View>
            )}

            {/* Product Image */}
            <View className="justify-center items-center mb-3 w-full h-20 bg-gray-100 rounded-lg">
                <Text className="text-3xl font-primary">{product.image}</Text>
            </View>

            {/* Product Name */}
            <Text
                className="mb-1 text-lg font-bold text-gray-900 font-primary"
                numberOfLines={2}
            >
                {product.name}
            </Text>

            {/* Category */}
            <View className="flex-row items-center mb-2">
                <Tag size={12} color="#6b7280" />
                <Text className="ml-1 text-sm text-blue-600 capitalize font-primary">
                    {product.category}
                </Text>
            </View>

            {/* Description */}
            {product.description && (
                <Text
                    className="mb-2 text-xs text-gray-600 font-primary"
                    numberOfLines={2}
                >
                    {product.description}
                </Text>
            )}

            {/* Price */}
            <View className="flex-row items-center mb-2">
                <DollarSign size={14} color="#059669" />
                <Text className="text-xl font-bold text-blue-600 font-primary">
                    R{product.price.toFixed(2)}
                </Text>
            </View>

            {/* Stock Information */}
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                    <Package size={12} color="#6b7280" />
                    <Text
                        className={`ml-1 text-sm font-semibold font-primary ${stockColor}`}
                    >
                        {stockText}
                    </Text>
                </View>
                <Text className="text-sm text-gray-500 font-primary">
                    Qty: {product.stockQuantity || 0}
                </Text>
            </View>

            {/* Timestamps */}
            <View className="pt-2 border-t border-gray-100">
                <Text className="text-xs text-gray-400 font-primary">
                    Created:{' '}
                    {new Date(product.createdAt || '').toLocaleDateString()}
                </Text>
                {product.updatedAt && (
                    <Text className="text-xs text-gray-400 font-primary">
                        Updated:{' '}
                        {new Date(product.updatedAt).toLocaleDateString()}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}
