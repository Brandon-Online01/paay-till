import { View, Text, Pressable } from 'react-native';
import { useCallback, useMemo } from 'react';
import { useCartStore } from '@/store/cart.store';
import { useUIStore } from '@/store/ui.store';
import { MenuItemWithBadge } from '@/store/menu.store';

/**
 * Props interface for ProductCard component
 */
interface ProductCardProps {
    /** Product item to display with badge information */
    item: MenuItemWithBadge;
}

/**
 * ProductCard Component - Individual product display with add to cart functionality
 *
 * Features:
 * - Instant add to cart for simple items
 * - Opens full-screen modal for customizable items with quantity and notes
 * - Product badges for special pricing/status
 * - Currency display consistency
 * - Item validation and error handling
 */
export default function ProductCard({ item }: ProductCardProps) {
    const { addItem, symbol } = useCartStore();
    const { openProductModal } = useUIStore();

    /**
     * Handle product click - either add directly or open customization modal
     * Opens modal ONLY for items with variants (colors, sizes, flavors)
     * Adds directly to basket for items WITHOUT variants
     */
    const handleProductClick = useCallback(() => {
        // Validate item data
        if (!item?.id || !item?.name || typeof item?.price !== 'number') {
            console.error('Invalid item data provided to handleProductClick');
            return;
        }

        // Check if item has any variants (colors, sizes, or flavors)
        const hasVariants =
            item.variants &&
            ((item.variants.colors && item.variants.colors.length > 0) ||
                (item.variants.sizes && item.variants.sizes.length > 0) ||
                (item.variants.flavors && item.variants.flavors.length > 0));

        if (hasVariants) {
            // Item has variants - open customization modal
            console.log(`Opening modal for ${item.name} - has variants`);
            openProductModal(item.id);
        } else {
            // Item has no variants - add directly to basket
            try {
                addItem(item, 1, '', item.badge);
            } catch (error) {}
        }
    }, [item, addItem, openProductModal]);

    /**
     * Memoized badge color classes based on badge type
     */
    const badgeColor = useMemo(() => {
        switch (item.badge) {
            case 'special':
                return 'bg-purple-100 text-purple-800';
            case 'limited':
                return 'bg-orange-100 text-orange-800';
            case 'low stock':
                return 'bg-red-100 text-red-800';
            case '20% off':
                return 'bg-green-100 text-green-800';
            case 'needs rewards':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }, [item.badge]);

    return (
        <Pressable
            onPress={handleProductClick}
            className="relative p-4 bg-white rounded-xl border border-gray-100 shadow-sm h-62 active:scale-95"
        >
            {/* Product Badge */}
            {item.badge && (
                <View
                    className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full ${badgeColor}`}
                >
                    <Text className="text-xs font-semibold font-primary">
                        {item.badge}
                    </Text>
                </View>
            )}

            {/* Product Image */}
            <View className="justify-center items-center mb-3 w-full h-32 bg-gray-100 rounded-lg">
                <Text className="text-4xl font-primary">{item.image}</Text>
            </View>

            {/* Product Info */}
            <View className="">
                <Text className="mb-1 text-sm font-semibold text-blue-600 capitalize font-primary">
                    {item.category}
                </Text>
                <Text className="mb-2 text-lg font-bold text-gray-900 font-primary">
                    {item.name}
                </Text>
                <Text className="text-2xl font-bold text-blue-600 font-primary">
                    {symbol}
                    {item.price.toFixed(2)}
                </Text>
            </View>
        </Pressable>
    );
}
