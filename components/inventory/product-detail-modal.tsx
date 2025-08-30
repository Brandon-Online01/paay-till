import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import {
    X,
    Package,
    DollarSign,
    Tag,
    Hash,
    Palette,
    Layers,
    Coffee,
    TrendingUp,
    ShoppingCart,
    Calendar,
    BarChart3,
    Edit3,
    Save,
    RotateCcw,
} from 'lucide-react-native';
import { Product } from '@/types/inventory.types';
import { ProductService } from '@/@db';

interface ProductDetailModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
}

export default function ProductDetailModal({
    visible,
    product,
    onClose,
}: ProductDetailModalProps) {
    const [analytics, setAnalytics] = useState<{
        totalSold: number;
        totalRevenue: number;
        averageOrderValue: number;
        lastSold?: string;
    } | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editFormData, setEditFormData] = useState<{
        name: string;
        price: string;
        description: string;
        category: string;
        stockQuantity: string;
        badge: string;
        image: string;
    }>({
        name: '',
        price: '',
        description: '',
        category: '',
        stockQuantity: '',
        badge: '',
        image: '',
    });

    // Load analytics when product changes
    useEffect(() => {
        if (product && visible) {
            loadProductAnalytics();
        }
    }, [product, visible]);

    // Reset edit mode and populate form when product changes
    useEffect(() => {
        if (product) {
            setIsEditMode(false);
            setEditFormData({
                name: product.name || '',
                price: product.price?.toString() || '',
                description: product.description || '',
                category: product.category || '',
                stockQuantity: product.stockQuantity?.toString() || '',
                badge: product.badge || '',
                image: product.image || '',
            });
        }
    }, [product]);

    const loadProductAnalytics = async () => {
        if (!product) return;

        try {
            setLoadingAnalytics(true);
            const analyticsData = await ProductService.getProductAnalytics(
                product.id
            );
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to load product analytics:', error);
            setAnalytics(null);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    /**
     * Handle form field changes
     */
    const handleFormChange = (field: string, value: string) => {
        setEditFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /**
     * Toggle edit mode
     */
    const handleToggleEditMode = () => {
        if (isEditMode) {
            // Reset form data when canceling edit
            setEditFormData({
                name: product.name || '',
                price: product.price?.toString() || '',
                description: product.description || '',
                category: product.category || '',
                stockQuantity: product.stockQuantity?.toString() || '',
                badge: product.badge || '',
                image: product.image || '',
            });
        }
        setIsEditMode(!isEditMode);
    };

    /**
     * Save product changes
     */
    const handleSaveProduct = async () => {
        if (!product || isSaving) return;

        // Validate form data
        if (!editFormData.name.trim()) {
            Alert.alert('Validation Error', 'Product name is required');
            return;
        }

        const price = parseFloat(editFormData.price);
        if (isNaN(price) || price < 0) {
            Alert.alert('Validation Error', 'Please enter a valid price');
            return;
        }

        const stockQuantity = parseInt(editFormData.stockQuantity);
        if (isNaN(stockQuantity) || stockQuantity < 0) {
            Alert.alert(
                'Validation Error',
                'Please enter a valid stock quantity'
            );
            return;
        }

        try {
            setIsSaving(true);

            const updatedProduct = {
                name: editFormData.name.trim(),
                price: price,
                description: editFormData.description.trim(),
                category: editFormData.category.trim(),
                stockQuantity: stockQuantity,
                badge: editFormData.badge.trim() || null,
                image: editFormData.image.trim(),
                inStock: stockQuantity > 0,
                updatedAt: new Date().toISOString(),
            };

            await ProductService.updateProduct(product.id, updatedProduct);

            // Show success message
            Alert.alert('Success', 'Product updated successfully');

            // Exit edit mode
            setIsEditMode(false);

            // Refresh product data (this would require callback from parent)
            // For now, we'll just update local state optimistically
        } catch (error) {
            console.error('Failed to update product:', error);
            Alert.alert('Error', 'Failed to update product. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!product) return null;

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

    const getStockStatus = () => {
        if (product.inStock === false) {
            return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        }
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    const stockStatus = getStockStatus();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 justify-center items-center bg-black-900/80 overflow-scroll"
                style={{ flex: 1 }}
            >
                <View
                    className="flex-1 justify-center items-center overflow-scroll"
                    style={{ width: '90%', maxWidth: 600 }}
                >
                    <View
                        className="bg-white rounded-2xl border border-gray-200 shadow-xl"
                        style={{ height: '70%', width: '100%' }}
                    >
                        {/* Header */}
                        <View className="relative px-6 pt-6 pb-4 border-b border-gray-200">
                            {/* Close Button */}
                            <Pressable
                                onPress={onClose}
                                className="absolute top-2 right-2 z-10 justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
                            >
                                <X size={22} color="#ffffff" />
                            </Pressable>

                            {/* Edit Toggle Button */}
                            <Pressable
                                onPress={handleToggleEditMode}
                                className="absolute top-2 right-16 z-10 justify-center items-center w-12 h-12 rounded-full border border-blue-500 bg-blue-500/80"
                                disabled={isSaving}
                            >
                                {isEditMode ? (
                                    <RotateCcw size={20} color="#ffffff" />
                                ) : (
                                    <Edit3 size={20} color="#ffffff" />
                                )}
                            </Pressable>

                            {/* Save Button (only visible in edit mode) */}
                            {isEditMode && (
                                <Pressable
                                    onPress={handleSaveProduct}
                                    className="absolute top-2 right-32 z-10 justify-center items-center w-12 h-12 rounded-full border border-green-500 bg-green-500/80"
                                    disabled={isSaving}
                                    style={{ opacity: isSaving ? 0.5 : 1 }}
                                >
                                    <Save size={20} color="#ffffff" />
                                </Pressable>
                            )}

                            <View>
                                <Text className="text-xl font-bold text-gray-900 font-primary">
                                    {isEditMode
                                        ? 'Edit Product'
                                        : 'Product Details'}
                                </Text>
                                <Text className="text-sm text-gray-600 font-primary">
                                    {product.id}
                                    {isEditMode && (
                                        <Text className="text-blue-600">
                                            {' '}
                                            • Editing
                                        </Text>
                                    )}
                                </Text>
                            </View>
                        </View>

                        <ScrollView
                            className="flex-1 p-6"
                            showsVerticalScrollIndicator={true}
                        >
                            {/* Product Info */}
                            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
                                {isEditMode ? (
                                    /* Edit Form */
                                    <View className="space-y-4">
                                        {/* Product Name */}
                                        <View>
                                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                Product Name *
                                            </Text>
                                            <TextInput
                                                value={editFormData.name}
                                                onChangeText={(value) =>
                                                    handleFormChange(
                                                        'name',
                                                        value
                                                    )
                                                }
                                                placeholder="Enter product name"
                                                className="p-3 text-lg rounded-lg border border-gray-300 font-primary"
                                            />
                                        </View>

                                        {/* Product Description */}
                                        <View>
                                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                Description
                                            </Text>
                                            <TextInput
                                                value={editFormData.description}
                                                onChangeText={(value) =>
                                                    handleFormChange(
                                                        'description',
                                                        value
                                                    )
                                                }
                                                placeholder="Enter product description"
                                                multiline
                                                numberOfLines={3}
                                                className="p-3 text-lg rounded-lg border border-gray-300 font-primary"
                                                style={{
                                                    textAlignVertical: 'top',
                                                }}
                                            />
                                        </View>

                                        {/* Row: Category and Price */}
                                        <View className="flex-row gap-4">
                                            <View className="flex-1">
                                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                    Category
                                                </Text>
                                                <TextInput
                                                    value={
                                                        editFormData.category
                                                    }
                                                    onChangeText={(value) =>
                                                        handleFormChange(
                                                            'category',
                                                            value
                                                        )
                                                    }
                                                    placeholder="e.g. electronics"
                                                    className="p-3 rounded-lg border border-gray-300 font-primary"
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                    Price (R) *
                                                </Text>
                                                <TextInput
                                                    value={editFormData.price}
                                                    onChangeText={(value) =>
                                                        handleFormChange(
                                                            'price',
                                                            value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    keyboardType="numeric"
                                                    className="p-3 rounded-lg border border-gray-300 font-primary"
                                                />
                                            </View>
                                        </View>

                                        {/* Row: Stock and Badge */}
                                        <View className="flex-row gap-4">
                                            <View className="flex-1">
                                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                    Stock Quantity *
                                                </Text>
                                                <TextInput
                                                    value={
                                                        editFormData.stockQuantity
                                                    }
                                                    onChangeText={(value) =>
                                                        handleFormChange(
                                                            'stockQuantity',
                                                            value
                                                        )
                                                    }
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    className="p-3 rounded-lg border border-gray-300 font-primary"
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                    Badge
                                                </Text>
                                                <TextInput
                                                    value={editFormData.badge}
                                                    onChangeText={(value) =>
                                                        handleFormChange(
                                                            'badge',
                                                            value
                                                        )
                                                    }
                                                    placeholder="special, limited, etc"
                                                    className="p-3 rounded-lg border border-gray-300 font-primary"
                                                />
                                            </View>
                                        </View>

                                        {/* Product Image Emoji */}
                                        <View>
                                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                Product Image (Emoji)
                                            </Text>
                                            <View className="flex-row items-center gap-3">
                                                <TextInput
                                                    value={editFormData.image}
                                                    onChangeText={(value) =>
                                                        handleFormChange(
                                                            'image',
                                                            value
                                                        )
                                                    }
                                                    placeholder="📱"
                                                    maxLength={2}
                                                    className="p-3 w-16 text-center text-2xl rounded-lg border border-gray-300 font-primary"
                                                />
                                                <Text className="text-4xl">
                                                    {editFormData.image}
                                                </Text>
                                            </View>
                                        </View>

                                        {isSaving && (
                                            <View className="p-3 bg-blue-50 rounded-lg">
                                                <Text className="text-center text-blue-600 font-primary">
                                                    Saving product changes...
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    /* View Mode */
                                    <>
                                        <View className="flex-row justify-between items-start mb-4">
                                            <View className="flex-1">
                                                <Text className="text-2xl font-bold text-gray-900 font-primary mb-2">
                                                    {product.name}
                                                </Text>
                                                <Text className="text-lg text-gray-600 font-primary mb-2">
                                                    {product.description}
                                                </Text>
                                            </View>
                                            <Text className="text-4xl ml-4">
                                                {product.image}
                                            </Text>
                                        </View>

                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row gap-2">
                                                {product.badge && (
                                                    <View
                                                        className={`px-3 py-1 rounded-full ${getBadgeColor(product.badge)}`}
                                                    >
                                                        <Text className="text-xs font-semibold font-primary">
                                                            {product.badge.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                )}
                                                <View
                                                    className={`px-3 py-1 rounded-full ${stockStatus.color}`}
                                                >
                                                    <Text className="text-xs font-semibold font-primary">
                                                        {stockStatus.text}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>

                            {/* Pricing Info */}
                            <View className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
                                    Pricing Information
                                </Text>
                                <View className="flex-row items-center mb-2">
                                    <DollarSign size={20} color="#2563eb" />
                                    <Text className="ml-2 text-gray-600 font-primary">
                                        Base Price
                                    </Text>
                                    <Text className="ml-auto text-xl font-bold text-gray-900 font-primary">
                                        R{product.price.toFixed(2)}
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <Hash size={20} color="#6b7280" />
                                    <Text className="ml-2 text-gray-600 font-primary">
                                        Category
                                    </Text>
                                    <Text className="ml-auto text-gray-900 font-primary capitalize">
                                        {product.category}
                                    </Text>
                                </View>

                                {product.stockQuantity !== undefined && (
                                    <View className="flex-row items-center mt-2">
                                        <Package size={20} color="#6b7280" />
                                        <Text className="ml-2 text-gray-600 font-primary">
                                            Stock Quantity
                                        </Text>
                                        <Text className="ml-auto text-gray-900 font-primary">
                                            {product.stockQuantity} units
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Variants */}
                            {product.variants && (
                                <View className="mb-6">
                                    <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
                                        Available Variants
                                    </Text>

                                    {/* Colors */}
                                    {product.variants.colors &&
                                        product.variants.colors.length > 0 && (
                                            <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                <View className="flex-row items-center mb-2">
                                                    <Palette
                                                        size={16}
                                                        color="#6b7280"
                                                    />
                                                    <Text className="ml-2 font-semibold text-gray-700 font-primary">
                                                        Colors
                                                    </Text>
                                                </View>
                                                {product.variants.colors.map(
                                                    (color, index) => (
                                                        <View
                                                            key={index}
                                                            className="flex-row justify-between items-center py-1"
                                                        >
                                                            <Text className="text-gray-600 font-primary">
                                                                {color.name}
                                                            </Text>
                                                            <Text className="text-gray-900 font-primary">
                                                                {color.price > 0
                                                                    ? `+R${color.price.toFixed(2)}`
                                                                    : 'Free'}
                                                            </Text>
                                                        </View>
                                                    )
                                                )}
                                            </View>
                                        )}

                                    {/* Sizes */}
                                    {product.variants.sizes &&
                                        product.variants.sizes.length > 0 && (
                                            <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                <View className="flex-row items-center mb-2">
                                                    <Layers
                                                        size={16}
                                                        color="#6b7280"
                                                    />
                                                    <Text className="ml-2 font-semibold text-gray-700 font-primary">
                                                        Sizes
                                                    </Text>
                                                </View>
                                                {product.variants.sizes.map(
                                                    (size, index) => (
                                                        <View
                                                            key={index}
                                                            className="flex-row justify-between items-center py-1"
                                                        >
                                                            <Text className="text-gray-600 font-primary">
                                                                {size.name}
                                                            </Text>
                                                            <Text className="text-gray-900 font-primary">
                                                                {size.price > 0
                                                                    ? `+R${size.price.toFixed(2)}`
                                                                    : 'Free'}
                                                            </Text>
                                                        </View>
                                                    )
                                                )}
                                            </View>
                                        )}

                                    {/* Flavors */}
                                    {product.variants.flavors &&
                                        product.variants.flavors.length > 0 && (
                                            <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                <View className="flex-row items-center mb-2">
                                                    <Coffee
                                                        size={16}
                                                        color="#6b7280"
                                                    />
                                                    <Text className="ml-2 font-semibold text-gray-700 font-primary">
                                                        Flavors
                                                    </Text>
                                                </View>
                                                {product.variants.flavors.map(
                                                    (flavor, index) => (
                                                        <View
                                                            key={index}
                                                            className="flex-row justify-between items-center py-1"
                                                        >
                                                            <Text className="text-gray-600 font-primary">
                                                                {flavor.name}
                                                            </Text>
                                                            <Text className="text-gray-900 font-primary">
                                                                {flavor.price >
                                                                0
                                                                    ? `+R${flavor.price.toFixed(2)}`
                                                                    : 'Free'}
                                                            </Text>
                                                        </View>
                                                    )
                                                )}
                                            </View>
                                        )}
                                </View>
                            )}

                            {/* Product Information */}
                            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
                                    Additional Information
                                </Text>
                                <View className="space-y-2">
                                    <View className="flex-row items-center">
                                        <Tag size={16} color="#6b7280" />
                                        <Text className="ml-2 text-gray-600 font-primary">
                                            Product ID: {product.id}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Package size={16} color="#6b7280" />
                                        <Text className="ml-2 text-gray-600 font-primary">
                                            Category: {product.category}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Sales Analytics */}
                            <View className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <View className="flex-row items-center mb-3">
                                    <BarChart3 size={20} color="#2563eb" />
                                    <Text className="ml-2 text-lg font-semibold text-gray-900 font-primary">
                                        Sales Analytics
                                    </Text>
                                </View>

                                {loadingAnalytics ? (
                                    <View className="flex-row items-center justify-center py-4">
                                        <Text className="text-gray-500 font-primary">
                                            Loading analytics...
                                        </Text>
                                    </View>
                                ) : analytics ? (
                                    <View className="space-y-3">
                                        {/* Total Sold */}
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <ShoppingCart
                                                    size={16}
                                                    color="#059669"
                                                />
                                                <Text className="ml-2 text-gray-600 font-primary">
                                                    Total Sold
                                                </Text>
                                            </View>
                                            <Text className="text-lg font-bold text-gray-900 font-primary">
                                                {analytics.totalSold} units
                                            </Text>
                                        </View>

                                        {/* Total Revenue */}
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <TrendingUp
                                                    size={16}
                                                    color="#dc2626"
                                                />
                                                <Text className="ml-2 text-gray-600 font-primary">
                                                    Total Revenue
                                                </Text>
                                            </View>
                                            <Text className="text-lg font-bold text-gray-900 font-primary">
                                                R
                                                {analytics.totalRevenue.toFixed(
                                                    2
                                                )}
                                            </Text>
                                        </View>

                                        {/* Average Order Value */}
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <DollarSign
                                                    size={16}
                                                    color="#7c3aed"
                                                />
                                                <Text className="ml-2 text-gray-600 font-primary">
                                                    Avg Order Value
                                                </Text>
                                            </View>
                                            <Text className="text-lg font-bold text-gray-900 font-primary">
                                                R
                                                {analytics.averageOrderValue.toFixed(
                                                    2
                                                )}
                                            </Text>
                                        </View>

                                        {/* Last Sold */}
                                        {analytics.lastSold && (
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center">
                                                    <Calendar
                                                        size={16}
                                                        color="#f59e0b"
                                                    />
                                                    <Text className="ml-2 text-gray-600 font-primary">
                                                        Last Sold
                                                    </Text>
                                                </View>
                                                <Text className="text-sm text-gray-700 font-primary">
                                                    {new Date(
                                                        analytics.lastSold
                                                    ).toLocaleDateString()}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Performance Indicator */}
                                        <View className="mt-3 p-3 bg-white rounded-lg">
                                            <Text className="text-xs text-gray-500 font-primary text-center">
                                                {analytics.totalSold === 0
                                                    ? 'No sales recorded yet'
                                                    : analytics.totalSold > 10
                                                      ? '🔥 Popular product!'
                                                      : analytics.totalSold > 5
                                                        ? '📈 Good performance'
                                                        : '📊 Growing product'}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View className="flex-row items-center justify-center py-4">
                                        <Text className="text-gray-500 font-primary">
                                            No sales data available
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
