import { View, Dimensions } from 'react-native';
import BaseProvider from '@/providers/base.provider';
import SearchBar from '@/components/till/search-bar';
import Categories from '@/components/till/categories';
import ProductGrid from '@/components/till/product-grid';
import CartSidebar from '@/components/till/cart-sidebar';
import ProductModal from '@/components/till/product-modal';
import { useScreenSize, getFlexDirection } from '@/utils/screen.size.util';
import { useCartStore } from '@/store/cart.store';
import { useLayoutStore } from '@/store/layout.store';

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
    const { cartPosition } = useLayoutStore();

    // Determine if we should show split layout or full width
    const hasItems = items.length > 0;
    const isMobile = width <= 480;
    const flexDirection =
        getFlexDirection(screenSize) === 'column' ? 'flex-col' : 'flex-row';
    const isCartOnLeft = cartPosition === 'left';

    /**
     * Render full width layout when basket is empty
     */
    if (!hasItems) {
        return (
            <BaseProvider>
                <View className="flex-1 bg-gray-50">
                    {/* Full Width Content Area when basket is empty */}
                    <View className="flex-1">
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
            <View className={`flex-1 p-2 ${flexDirection}`}>
                {/* Conditional ordering based on cart position */}
                {!isMobile && isCartOnLeft ? (
                    <>
                        {/* Cart/Order Sidebar - Left side */}
                        <View className="w-1/3 h-full">
                            <CartSidebar />
                        </View>

                        {/* Main Content Area - Right side */}
                        <View className="flex-1 w-2/3 h-full">
                            <SearchBar />
                            <Categories />
                            <View className="flex-1">
                                <ProductGrid />
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        {/* Mobile layout or cart on right */}
                        {!isMobile && (
                            /* Main Content Area - Left side on desktop */
                            <View className="flex-1 w-2/3 h-full">
                                <SearchBar />
                                <Categories />
                                <View className="flex-1">
                                    <ProductGrid />
                                </View>
                            </View>
                        )}
                        
                        {/* Cart/Order Sidebar - Right side on desktop, top on mobile */}
                        <View
                            className={`${isMobile ? 'w-full h-2/5' : 'w-1/3 h-full'}`}
                        >
                            <CartSidebar />
                        </View>

                        {/* Main Content Area - Bottom on mobile */}
                        {isMobile && (
                            <View className="flex-1 w-full h-3/5">
                                <SearchBar />
                                <Categories />
                                <View className="flex-1">
                                    <ProductGrid />
                                </View>
                            </View>
                        )}
                    </>
                )}

                {/* Product Modal - Full screen overlay */}
                <ProductModal />
            </View>
        </BaseProvider>
    );
}
