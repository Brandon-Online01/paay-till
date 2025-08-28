import { View, Dimensions } from 'react-native';
import BaseProvider from '@/providers/base.provider';
import SearchBar from '@/components/till/search-bar';
import Categories from '@/components/till/categories';
import ProductGrid from '@/components/till/product-grid';
import CartSidebar from '@/components/till/cart-sidebar';
import ProductModal from '@/components/till/product-modal';
import { useScreenSize, getFlexDirection } from '@/utils/screen.size.util';
import { useCartStore } from '@/store/cart.store';

/**
 * TillPage Component - Main till interface with dynamic layout
 *
 * Features:
 * - Dynamic layout: full width when basket empty, split layout when items exist
 * - Responsive design for mobile and desktop
 * - Integrated search, categories, product grid, and cart sidebar
 */
export default function TillPage() {
    const screenSize = useScreenSize();
    const { width } = Dimensions.get('window');
    const { items } = useCartStore();

    // Determine if we should show split layout or full width
    const hasItems = items.length > 0;
    const isMobile = width <= 480;
    const flexDirection =
        getFlexDirection(screenSize) === 'column' ? 'flex-col' : 'flex-row';

    /**
     * Render full width layout when basket is empty
     */
    if (!hasItems) {
        return (
            <BaseProvider>
                <View className="flex-1 bg-gray-50">
                    {/* Full Width Content Area when basket is empty */}
                    <View className="flex-1 bg-white">
                        {/* Search Bar */}
                        <SearchBar />

                        {/* Categories */}
                        <Categories />

                        {/* Product Grid - Takes full width when no items */}
                        <View className="flex-1">
                            <ProductGrid />
                        </View>
                    </View>

                    {/* Product Modal - Full screen overlay */}
                    <ProductModal />
                </View>
            </BaseProvider>
        );
    }

    /**
     * Render split layout when basket has items
     */
    return (
        <BaseProvider>
            <View className={`flex-1 p-2 bg-gray-200/20 ${flexDirection}`}>
                {/* Cart/Order Sidebar - Left side on desktop, top on mobile */}
                <View
                    className={`${isMobile ? 'w-full h-2/5' : 'w-1/3 h-full'}`}
                >
                    <CartSidebar />
                </View>

                {/* Main Content Area - Right side on desktop, bottom on mobile */}
                <View
                    className={`flex-1 ${isMobile ? 'w-full h-3/5' : 'w-2/3 h-full'}`}
                >
                    {/* Search Bar */}
                    <SearchBar />

                    {/* Categories */}
                    <Categories />

                    {/* Product Grid */}
                    <View className="flex-1">
                        <ProductGrid />
                    </View>
                </View>

                {/* Product Modal - Full screen overlay */}
                <ProductModal />
            </View>
        </BaseProvider>
    );
}
