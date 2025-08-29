import React from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import {
    X,
    Package,
    DollarSign,
    Tag,
    Hash,
    Palette,
    Layers,
    Coffee,
} from 'lucide-react-native';
import { Product } from '@/types/inventory.types';

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
                            <Pressable
                                onPress={onClose}
                                className="absolute top-2 right-2 z-10 justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
                            >
                                <X size={22} color="#ffffff" />
                            </Pressable>

                            <View>
                                <Text className="text-xl font-bold text-gray-900 font-primary">
                                    Product Details
                                </Text>
                                <Text className="text-sm text-gray-600 font-primary">
                                    {product.id}
                                </Text>
                            </View>
                        </View>

                        <ScrollView
                            className="flex-1 p-6"
                            showsVerticalScrollIndicator={true}
                        >
                            {/* Product Info */}
                            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
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
                                    {product.variants.colors && product.variants.colors.length > 0 && (
                                        <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <View className="flex-row items-center mb-2">
                                                <Palette size={16} color="#6b7280" />
                                                <Text className="ml-2 font-semibold text-gray-700 font-primary">
                                                    Colors
                                                </Text>
                                            </View>
                                            {product.variants.colors.map((color, index) => (
                                                <View
                                                    key={index}
                                                    className="flex-row justify-between items-center py-1"
                                                >
                                                    <Text className="text-gray-600 font-primary">
                                                        {color.name}
                                                    </Text>
                                                    <Text className="text-gray-900 font-primary">
                                                        {color.price > 0 ? `+R${color.price.toFixed(2)}` : 'Free'}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Sizes */}
                                    {product.variants.sizes && product.variants.sizes.length > 0 && (
                                        <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <View className="flex-row items-center mb-2">
                                                <Layers size={16} color="#6b7280" />
                                                <Text className="ml-2 font-semibold text-gray-700 font-primary">
                                                    Sizes
                                                </Text>
                                            </View>
                                            {product.variants.sizes.map((size, index) => (
                                                <View
                                                    key={index}
                                                    className="flex-row justify-between items-center py-1"
                                                >
                                                    <Text className="text-gray-600 font-primary">
                                                        {size.name}
                                                    </Text>
                                                    <Text className="text-gray-900 font-primary">
                                                        {size.price > 0 ? `+R${size.price.toFixed(2)}` : 'Free'}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Flavors */}
                                    {product.variants.flavors && product.variants.flavors.length > 0 && (
                                        <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <View className="flex-row items-center mb-2">
                                                <Coffee size={16} color="#6b7280" />
                                                <Text className="ml-2 font-semibold text-gray-700 font-primary">
                                                    Flavors
                                                </Text>
                                            </View>
                                            {product.variants.flavors.map((flavor, index) => (
                                                <View
                                                    key={index}
                                                    className="flex-row justify-between items-center py-1"
                                                >
                                                    <Text className="text-gray-600 font-primary">
                                                        {flavor.name}
                                                    </Text>
                                                    <Text className="text-gray-900 font-primary">
                                                        {flavor.price > 0 ? `+R${flavor.price.toFixed(2)}` : 'Free'}
                                                    </Text>
                                                </View>
                                            ))}
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
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
