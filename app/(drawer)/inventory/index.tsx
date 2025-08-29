import {
    Text,
    View,
    ScrollView,
    Pressable,
    TextInput,
    RefreshControl,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    Package,
    DollarSign,
    Layers,
    Archive,
    RotateCcw,
    Plus,
} from 'lucide-react-native';
import BaseProvider from '@/providers/base.provider';
import { useInventoryStore, SortOption } from '@/store/inventory.store';
import { Product } from '@/types/inventory.types';
import ProductFilterModal from '@/components/inventory/filter-modal';
import ProductDetailModal from '@/components/inventory/product-detail-modal';
import AddItemModal from '@/components/inventory/add-item-modal';
import infoData from '@/data/info.json';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Recent' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'category', label: 'Category' },
];

export default function Inventory() {
    const {
        filteredProducts,
        metrics,
        isLoading,
        isRefreshing,
        error,
        searchQuery,
        sortBy,
        showFilterModal,
        selectedProduct,
        showProductModal,
        lastUpdated,
        setProducts,
        setLoading,
        setError,
        setSearchQuery,
        setSortBy,
        setShowFilterModal,
        setSelectedProduct,
        setShowProductModal,
        clearCache,
        refreshData,
    } = useInventoryStore();

    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Transform info.json products to match our Product interface
            const products: Product[] = infoData.till.items.map((item) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                image: item.image,
                description: item.description,
                badge: item.badge,
                variants: item.variants,
                inStock: true, // Default to in stock, can be updated based on inventory logic
                stockQuantity: Math.floor(Math.random() * 100) + 1, // Random stock for demo
            }));
            setProducts(products);
        } catch (error) {
            console.error('Failed to load products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [setProducts, setLoading, setError]);

    const handleRefresh = useCallback(async () => {
        await refreshData();
    }, [refreshData]);

    useEffect(() => {
        // Only load if we don't have recent data
        if (
            !lastUpdated ||
            new Date().getTime() - new Date(lastUpdated).getTime() > 30000
        ) {
            loadData();
        }
    }, [loadData, lastUpdated]);

    const getBadgeColor = (badge: string | null) => {
        switch (badge) {
            case 'special':
                return 'text-green-600 bg-green-100';
            case 'limited':
                return 'text-purple-600 bg-purple-100';
            case '20% off':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    const handleSortSelect = (sort: SortOption) => {
        setSortBy(sort);
        setShowSortDropdown(false);
    };

    const handleAddItem = () => {
        setShowAddItemModal(true);
    };

    const handleSaveNewProduct = (newProduct: Omit<Product, 'id'>) => {
        // Generate a new ID for the product
        const id = (Date.now() + Math.random()).toString();
        const productWithId: Product = { ...newProduct, id };
        
        // Add to current products list
        const currentProducts = [...filteredProducts, productWithId];
        setProducts(currentProducts);
        
        console.log('New product added:', productWithId);
        setShowAddItemModal(false);
    };

    return (
        <BaseProvider>
            {/* Header */}
            <View className="px-6">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900 font-primary">
                            Inventory
                        </Text>
                        {lastUpdated && (
                            <Text className="text-sm text-gray-500 font-primary">
                                Last updated:{' '}
                                {new Date(lastUpdated).toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2 bg-blue-100 rounded-lg"
                        >
                            <RotateCcw size={20} color="#2563eb" />
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Metric Cards */}
            <View className="px-6 py-4">
                <View className="flex-row gap-3">
                    {/* Total Products Card */}
                    <View className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row gap-2 items-center mb-2">
                            <Package size={16} color="#059669" />
                            <Text className="text-xs text-gray-600 font-primary">
                                Total Products
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 font-primary">
                            {metrics?.totalProducts || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 font-primary">
                            Categories: {metrics?.categories || 0}
                        </Text>
                    </View>

                    {/* Total Value Card */}
                    <View className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row gap-2 items-center mb-2">
                            <DollarSign size={16} color="#2563eb" />
                            <Text className="text-xs text-gray-600 font-primary">
                                Total Value
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 font-primary">
                            R{metrics?.totalValue.toFixed(2) || '0.00'}
                        </Text>
                        <Text className="text-xs text-gray-500 font-primary">
                            Avg: R{metrics?.averagePrice.toFixed(2) || '0.00'}
                        </Text>
                    </View>

                    {/* In Stock Card */}
                    <View className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row gap-2 items-center mb-2">
                            <Layers size={16} color="#7c3aed" />
                            <Text className="text-xs text-gray-600 font-primary">
                                In Stock
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 font-primary">
                            {metrics?.inStockProducts || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 font-primary">
                            Available
                        </Text>
                    </View>

                    {/* Out of Stock Card */}
                    <View className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row gap-2 items-center mb-2">
                            <Archive size={16} color="#dc2626" />
                            <Text className="text-xs text-gray-600 font-primary">
                                Out of Stock
                            </Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 font-primary">
                            {metrics?.outOfStockProducts || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 font-primary">
                            Unavailable
                        </Text>
                    </View>
                </View>
            </View>

            {/* Search and Filters */}
            <View className="px-6 py-4">
                <View className="flex-row gap-4 items-center">
                    {/* Search Bar */}
                    <View className="flex-row flex-1 items-center p-3 bg-white rounded-lg border border-gray-200">
                        <Search size={20} color="#6b7280" />
                        <TextInput
                            placeholder="search products, categories..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className="flex-1 p-2 ml-2 text-gray-900 font-primary"
                        />
                    </View>

                    {/* Sort By Dropdown */}
                    <View className="relative">
                        <Pressable
                            onPress={() =>
                                setShowSortDropdown(!showSortDropdown)
                            }
                            className="flex-row gap-2 items-center p-4 w-36 bg-white rounded-lg border border-gray-200"
                        >
                            <Text className="text-gray-700 font-primary">
                                {SORT_OPTIONS.find(
                                    (opt) => opt.value === sortBy
                                )?.label || 'Recent'}
                </Text>
                            <ChevronDown size={16} color="#6b7280" />
                        </Pressable>

                        {showSortDropdown && (
                            <View className="absolute right-0 top-16 z-10 bg-white rounded-lg border border-gray-200 shadow-lg min-w-32">
                                {SORT_OPTIONS.map((option) => (
                                    <Pressable
                                        key={option.value}
                                        onPress={() =>
                                            handleSortSelect(option.value)
                                        }
                                        className="px-4 py-3 border-b border-gray-100"
                                    >
                                        <Text className="text-gray-700 font-primary">
                                            {option.label}
                </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Filter Button - Coral Red */}
                    <Pressable
                        onPress={() => setShowFilterModal(true)}
                        className="flex-row gap-2 justify-center items-center p-4 w-36 rounded-lg border border-red-200"
                        style={{ backgroundColor: '#ff7875' }}
                    >
                        <Filter size={16} color="white" />
                        <Text className="text-white font-primary">Filter</Text>
                    </Pressable>

                    {/* Add Item Button - Blue */}
                    <Pressable
                        onPress={handleAddItem}
                        className="flex-row gap-2 justify-center items-center p-4 w-36 bg-blue-600 rounded-lg border border-blue-200"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-primary">Add Item</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#2563eb']}
                        tintColor="#2563eb"
                    />
                }
            >
                {/* Product List */}
                <View className="px-6 py-4">
                    {isLoading && !isRefreshing ? (
                        <View className="flex-1 justify-center items-center py-12">
                            <Text className="text-gray-500 font-primary">
                                Loading products...
                            </Text>
                        </View>
                    ) : error ? (
                        <View className="flex-1 justify-center items-center py-12">
                            <Text className="text-red-500 font-primary">
                                {error}
                            </Text>
                        </View>
                    ) : filteredProducts.length === 0 ? (
                        <View className="flex-1 justify-center items-center py-12">
                            <Text className="text-gray-500 font-primary">
                                No products found
                            </Text>
                        </View>
                    ) : (
                        filteredProducts.map((product) => {
                            return (
                                <Pressable
                                    key={product.id}
                                    onPress={() =>
                                        handleProductPress(product)
                                    }
                                    className="p-4 mb-4 bg-white rounded-lg border border-gray-200 active:bg-gray-50"
                                >
                                    {/* Header Row */}
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Product
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Category
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Price
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Stock
                                                </Text>
                                                <Text className="text-sm text-gray-600 font-primary">
                                                    Status
                                                </Text>
                                            </View>

                                            <View className="flex-row justify-between items-center">
                                                {/* Product */}
                                                <View className="flex-1">
                                                    <View className="flex-row items-center">
                                                        <Text className="text-2xl mr-2">
                                                            {product.image}
                                                        </Text>
                                                        <View>
                                                            <Text className="text-sm font-semibold text-gray-900 font-primary">
                                                                {product.name}
                                                            </Text>
                                                            <Text className="text-xs text-gray-500 font-primary">
                                                                ID: {product.id}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* Category */}
                                                <View className="flex-1">
                                                    <Text className="text-sm font-semibold text-gray-900 font-primary capitalize">
                                                        {product.category}
                                                    </Text>
                                                </View>

                                                {/* Price */}
                                                <View className="flex-1">
                                                    <Text className="text-sm font-bold text-gray-900 font-primary">
                                                        R{product.price.toFixed(2)}
                                                    </Text>
                                                </View>

                                                {/* Stock */}
                                                <View className="flex-1">
                                                    <Text className="text-sm text-gray-700 font-primary">
                                                        {product.stockQuantity || 0} units
                                                    </Text>
                                                </View>

                                                {/* Status */}
                                                <View className="flex-1">
                                                    <View className="flex-row gap-1">
                                                        {product.badge && (
                                                            <View
                                                                className={`px-2 py-1 rounded ${getBadgeColor(product.badge)}`}
                                                            >
                                                                <Text className="text-xs font-semibold font-primary">
                                                                    {product.badge}
                                                                </Text>
                                                            </View>
                                                        )}
                                                        <View className="px-2 py-1 bg-green-100 rounded">
                                                            <Text className="text-xs font-semibold text-green-800 font-primary">
                                                                In Stock
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Description */}
                                    <View className="pt-3 mt-3 border-t border-gray-100">
                                        <Text className="text-sm text-gray-600 font-primary">
                                            {product.description}
                                        </Text>
                                        {product.variants && (
                                            <View className="mt-2">
                                                <Text className="text-xs text-gray-500 font-primary">
                                                    Variants available:
                                                    {product.variants.colors && ` ${product.variants.colors.length} colors`}
                                                    {product.variants.sizes && ` ${product.variants.sizes.length} sizes`}
                                                    {product.variants.flavors && ` ${product.variants.flavors.length} flavors`}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Filter Modal */}
            <ProductFilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
            />

            {/* Product Detail Modal */}
            <ProductDetailModal
                visible={showProductModal}
                product={selectedProduct}
                onClose={() => setShowProductModal(false)}
            />

            {/* Add Item Modal */}
            <AddItemModal
                visible={showAddItemModal}
                onClose={() => setShowAddItemModal(false)}
                onSave={handleSaveNewProduct}
            />
        </BaseProvider>
    );
}
