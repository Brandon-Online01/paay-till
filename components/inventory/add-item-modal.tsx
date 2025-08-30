import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    TextInput,
    Modal,
} from 'react-native';
import { X, Save, Plus, Minus, Loader, Scan, Package, Info } from 'lucide-react-native';
import {
    Product,
    ProductVariant,
    ProductVariants,
} from '@/types/inventory.types';
import { ProductService } from '@/@db';
import { ToastUtils } from '@/utils/toast.util';

interface AddItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (product: Product) => void; // Changed to accept full Product with id
}

const CATEGORIES = [
    'electronics',
    'clothing',
    'food',
    'beverages',
    'toys',
    'tools',
    'home',
    'health',
    'sports',
    'automotive',
    'books',
    'office',
    'pet',
    'baby',
];

const BADGE_OPTIONS = ['special', 'limited', '20% off'];

export default function AddItemModal({
    visible,
    onClose,
    onSave,
}: AddItemModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0],
        price: '',
        image: '📦',
        description: '',
        badge: null as string | null,
        stockQuantity: '0',
        inStock: true,
        // Enhanced inventory fields
        barcode: '',
        qrCode: '',
        reorderQty: '10',
        maxBuyQty: '100',
        minBuyQty: '1',
        resellerName: '',
        brand: '',
        information: '',
    });

    const [variants, setVariants] = useState<ProductVariants>({
        colors: [],
        sizes: [],
        flavors: [],
    });

    const [newVariant, setNewVariant] = useState({
        type: 'colors' as keyof ProductVariants,
        name: '',
        price: '0',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Product description is required';
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) {
            newErrors.price = 'Valid price is required';
        }

        const stockQuantity = parseInt(formData.stockQuantity);
        if (isNaN(stockQuantity) || stockQuantity < 0) {
            newErrors.stockQuantity = 'Valid stock quantity is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            ToastUtils.error('Please fix the form errors');
            return;
        }

        if (saving) {
            return; // Prevent double submission
        }

        setSaving(true);

        try {
            const productData: Omit<Product, 'id'> = {
                name: formData.name.trim(),
                category: formData.category,
                price: parseFloat(formData.price),
                image: formData.image,
                description: formData.description.trim(),
                badge: formData.badge,
                inStock: formData.inStock,
                stockQuantity: parseInt(formData.stockQuantity),
                variants: variants,
                // Enhanced inventory fields
                barcode: formData.barcode.trim() || null,
                qrCode: formData.qrCode.trim() || null,
                reorderQty: parseInt(formData.reorderQty) || 10,
                maxBuyQty: parseInt(formData.maxBuyQty) || 100,
                minBuyQty: parseInt(formData.minBuyQty) || 1,
                resellerName: formData.resellerName.trim() || null,
                brand: formData.brand.trim() || null,
                information: formData.information.trim() || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Save to database
            const savedProduct =
                await ProductService.createProduct(productData);

            // Call parent callback with saved product
            onSave(savedProduct);

            // Reset form and close modal
            handleClose();

            ToastUtils.success('Product added successfully!');
            console.log('✅ Product saved to database:', savedProduct.id);
        } catch (error) {
            console.error('❌ Failed to save product:', error);
            ToastUtils.error('Failed to save product to database');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        // Reset form
        setFormData({
            name: '',
            category: CATEGORIES[0],
            price: '',
            image: '📦',
            description: '',
            badge: null,
            stockQuantity: '0',
            inStock: true,
            // Enhanced inventory fields
            barcode: '',
            qrCode: '',
            reorderQty: '10',
            maxBuyQty: '100',
            minBuyQty: '1',
            resellerName: '',
            brand: '',
            information: '',
        });
        setVariants({
            colors: [],
            sizes: [],
            flavors: [],
        });
        setNewVariant({
            type: 'colors',
            name: '',
            price: '0',
        });
        setErrors({});
        setSaving(false);
        onClose();
    };

    const addVariant = () => {
        if (!newVariant.name.trim()) {
            ToastUtils.error('Variant name is required');
            return;
        }

        const price = parseFloat(newVariant.price);
        if (isNaN(price) || price < 0) {
            ToastUtils.error('Valid variant price is required');
            return;
        }

        const variant: ProductVariant = {
            name: newVariant.name.trim(),
            price: price,
        };

        setVariants((prev) => ({
            ...prev,
            [newVariant.type]: [...(prev[newVariant.type] || []), variant],
        }));

        setNewVariant({
            ...newVariant,
            name: '',
            price: '0',
        });
    };

    const removeVariant = (type: keyof ProductVariants, index: number) => {
        setVariants((prev) => ({
            ...prev,
            [type]: prev[type]?.filter((_, i) => i !== index) || [],
        }));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
                    <Text className="text-xl font-bold text-gray-900 font-primary">
                        Add New Product
                    </Text>
                    <Pressable
                        onPress={handleClose}
                        className="justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
                    >
                        <X size={22} color="#ffffff" />
                    </Pressable>
                </View>

                <ScrollView className="flex-1 p-6">
                    {/* Basic Information */}
                    <View className="mb-6">
                        <Text className="mb-4 text-lg font-semibold text-gray-900 font-primary">
                            Basic Information
                        </Text>

                        {/* Product Name */}
                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                Product Name *
                            </Text>
                            <TextInput
                                value={formData.name}
                                onChangeText={(name) =>
                                    setFormData((prev) => ({ ...prev, name }))
                                }
                                placeholder="Enter product name"
                                className={`p-4 rounded-lg border font-primary ${
                                    errors.name
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.name && (
                                <Text className="mt-1 text-sm text-red-500 font-primary">
                                    {errors.name}
                                </Text>
                            )}
                        </View>

                        {/* Category */}
                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                Category
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {CATEGORIES.map((category) => (
                                    <Pressable
                                        key={category}
                                        onPress={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                category,
                                            }))
                                        }
                                        className={`px-3 py-2 rounded-lg border ${
                                            formData.category === category
                                                ? 'bg-blue-100 border-blue-500'
                                                : 'bg-gray-100 border-gray-300'
                                        }`}
                                    >
                                        <Text
                                            className={`text-sm font-primary capitalize ${
                                                formData.category === category
                                                    ? 'text-blue-700'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {category}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Price and Stock */}
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                    Price (R) *
                                </Text>
                                <TextInput
                                    value={formData.price}
                                    onChangeText={(price) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            price,
                                        }))
                                    }
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    className={`p-4 rounded-lg border font-primary ${
                                        errors.price
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    }`}
                                />
                                {errors.price && (
                                    <Text className="mt-1 text-sm text-red-500 font-primary">
                                        {errors.price}
                                    </Text>
                                )}
                            </View>

                            <View className="flex-1">
                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                    Stock Quantity *
                                </Text>
                                <TextInput
                                    value={formData.stockQuantity}
                                    onChangeText={(stockQuantity) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            stockQuantity,
                                        }))
                                    }
                                    placeholder="0"
                                    keyboardType="numeric"
                                    className={`p-4 rounded-lg border font-primary ${
                                        errors.stockQuantity
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    }`}
                                />
                                {errors.stockQuantity && (
                                    <Text className="mt-1 text-sm text-red-500 font-primary">
                                        {errors.stockQuantity}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Image Emoji */}
                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                Product Emoji
                            </Text>
                            <TextInput
                                value={formData.image}
                                onChangeText={(image) =>
                                    setFormData((prev) => ({ ...prev, image }))
                                }
                                placeholder="📦"
                                maxLength={2}
                                className="p-4 text-2xl text-center rounded-lg border border-gray-300 font-primary"
                                style={{ textAlign: 'center' }}
                            />
                        </View>

                        {/* Description */}
                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                Description *
                            </Text>
                            <TextInput
                                value={formData.description}
                                onChangeText={(description) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description,
                                    }))
                                }
                                placeholder="Enter product description"
                                multiline
                                numberOfLines={3}
                                className={`p-4 rounded-lg border font-primary ${
                                    errors.description
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.description && (
                                <Text className="mt-1 text-sm text-red-500 font-primary">
                                    {errors.description}
                                </Text>
                            )}
                        </View>

                        {/* Badge */}
                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                Badge (Optional)
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                <Pressable
                                    onPress={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            badge: null,
                                        }))
                                    }
                                    className={`px-3 py-2 rounded-lg border ${
                                        formData.badge === null
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'bg-gray-100 border-gray-300'
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-primary ${
                                            formData.badge === null
                                                ? 'text-blue-700'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        None
                                    </Text>
                                </Pressable>
                                {BADGE_OPTIONS.map((badge) => (
                                    <Pressable
                                        key={badge}
                                        onPress={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                badge,
                                            }))
                                        }
                                        className={`px-3 py-2 rounded-lg border ${
                                            formData.badge === badge
                                                ? 'bg-blue-100 border-blue-500'
                                                : 'bg-gray-100 border-gray-300'
                                        }`}
                                    >
                                        <Text
                                            className={`text-sm font-primary ${
                                                formData.badge === badge
                                                    ? 'text-blue-700'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {badge}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Enhanced Inventory Fields Section */}
                        <View className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <View className="flex-row items-center mb-4">
                                <Package size={20} color="#6b7280" />
                                <Text className="ml-2 text-lg font-semibold text-gray-900 font-primary">
                                    Enhanced Inventory Details
                                </Text>
                            </View>

                            {/* Barcode and QR Code */}
                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        Barcode
                                    </Text>
                                    <View className="flex-row">
                                        <TextInput
                                            value={formData.barcode}
                                            onChangeText={(barcode) =>
                                                setFormData((prev) => ({ ...prev, barcode }))
                                            }
                                            placeholder="Enter or scan barcode"
                                            className="flex-1 p-4 rounded-l-lg border border-r-0 border-gray-300 font-primary"
                                        />
                                        <Pressable className="px-4 py-4 bg-blue-500 rounded-r-lg border border-blue-500">
                                            <Scan size={20} color="#ffffff" />
                                        </Pressable>
                                    </View>
                                </View>
                                
                                <View className="flex-1">
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        QR Code
                                    </Text>
                                    <TextInput
                                        value={formData.qrCode}
                                        onChangeText={(qrCode) =>
                                            setFormData((prev) => ({ ...prev, qrCode }))
                                        }
                                        placeholder="QR Code"
                                        className="p-4 rounded-lg border border-gray-300 font-primary"
                                    />
                                </View>
                            </View>

                            {/* Brand and Reseller */}
                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        Brand
                                    </Text>
                                    <TextInput
                                        value={formData.brand}
                                        onChangeText={(brand) =>
                                            setFormData((prev) => ({ ...prev, brand }))
                                        }
                                        placeholder="Product brand"
                                        className="p-4 rounded-lg border border-gray-300 font-primary"
                                    />
                                </View>
                                
                                <View className="flex-1">
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        Reseller Name
                                    </Text>
                                    <TextInput
                                        value={formData.resellerName}
                                        onChangeText={(resellerName) =>
                                            setFormData((prev) => ({ ...prev, resellerName }))
                                        }
                                        placeholder="Reseller/Supplier"
                                        className="p-4 rounded-lg border border-gray-300 font-primary"
                                    />
                                </View>
                            </View>

                            {/* Quantity Limits */}
                            <View className="flex-row gap-2 mb-4">
                                <View className="flex-1">
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        Reorder Qty
                                    </Text>
                                    <TextInput
                                        value={formData.reorderQty}
                                        onChangeText={(reorderQty) =>
                                            setFormData((prev) => ({ ...prev, reorderQty }))
                                        }
                                        placeholder="10"
                                        keyboardType="numeric"
                                        className="p-4 rounded-lg border border-gray-300 font-primary"
                                    />
                                </View>
                                
                                <View className="flex-1">
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        Min Buy Qty
                                    </Text>
                                    <TextInput
                                        value={formData.minBuyQty}
                                        onChangeText={(minBuyQty) =>
                                            setFormData((prev) => ({ ...prev, minBuyQty }))
                                        }
                                        placeholder="1"
                                        keyboardType="numeric"
                                        className="p-4 rounded-lg border border-gray-300 font-primary"
                                    />
                                </View>
                                
                                <View className="flex-1">
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        Max Buy Qty
                                    </Text>
                                    <TextInput
                                        value={formData.maxBuyQty}
                                        onChangeText={(maxBuyQty) =>
                                            setFormData((prev) => ({ ...prev, maxBuyQty }))
                                        }
                                        placeholder="100"
                                        keyboardType="numeric"
                                        className="p-4 rounded-lg border border-gray-300 font-primary"
                                    />
                                </View>
                            </View>

                            {/* Additional Information */}
                            <View>
                                <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                    Additional Information
                                </Text>
                                <TextInput
                                    value={formData.information}
                                    onChangeText={(information) =>
                                        setFormData((prev) => ({ ...prev, information }))
                                    }
                                    placeholder="Any additional product information, notes, or specifications..."
                                    multiline
                                    numberOfLines={3}
                                    className="p-4 rounded-lg border border-gray-300 font-primary"
                                />
                            </View>
                        </View>

                        {/* Stock Status */}
                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                Stock Status
                            </Text>
                            <View className="flex-row gap-4">
                                <Pressable
                                    onPress={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            inStock: true,
                                        }))
                                    }
                                    className={`flex-1 p-3 rounded-lg border ${
                                        formData.inStock
                                            ? 'bg-green-100 border-green-500'
                                            : 'bg-gray-100 border-gray-300'
                                    }`}
                                >
                                    <Text
                                        className={`text-center font-primary ${
                                            formData.inStock
                                                ? 'text-green-700'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        In Stock
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            inStock: false,
                                        }))
                                    }
                                    className={`flex-1 p-3 rounded-lg border ${
                                        !formData.inStock
                                            ? 'bg-red-100 border-red-500'
                                            : 'bg-gray-100 border-gray-300'
                                    }`}
                                >
                                    <Text
                                        className={`text-center font-primary ${
                                            !formData.inStock
                                                ? 'text-red-700'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        Out of Stock
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Product Variants */}
                    <View className="mb-6">
                        <Text className="mb-4 text-lg font-semibold text-gray-900 font-primary">
                            Product Variants (Optional)
                        </Text>

                        {/* Add Variant Form */}
                        <View className="p-4 mb-4 bg-gray-50 rounded-lg">
                            <Text className="mb-3 text-sm font-semibold text-gray-700 font-primary">
                                Add New Variant
                            </Text>

                            {/* Variant Type Selection */}
                            <View className="mb-3">
                                <Text className="mb-2 text-xs text-gray-600 font-primary">
                                    Type
                                </Text>
                                <View className="flex-row gap-2">
                                    {(
                                        ['colors', 'sizes', 'flavors'] as const
                                    ).map((type) => (
                                        <Pressable
                                            key={type}
                                            onPress={() =>
                                                setNewVariant((prev) => ({
                                                    ...prev,
                                                    type,
                                                }))
                                            }
                                            className={`px-3 py-2 rounded-lg border ${
                                                newVariant.type === type
                                                    ? 'bg-blue-100 border-blue-500'
                                                    : 'bg-white border-gray-300'
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm font-primary capitalize ${
                                                    newVariant.type === type
                                                        ? 'text-blue-700'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                {type}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Variant Name and Price */}
                            <View className="flex-row gap-3 mb-3">
                                <View className="flex-1">
                                    <Text className="mb-1 text-xs text-gray-600 font-primary">
                                        Name
                                    </Text>
                                    <TextInput
                                        value={newVariant.name}
                                        onChangeText={(name) =>
                                            setNewVariant((prev) => ({
                                                ...prev,
                                                name,
                                            }))
                                        }
                                        placeholder="e.g., Red, Large, Vanilla"
                                        className="p-3 rounded-lg border border-gray-300 font-primary"
                                    />
                                </View>
                                <View className="w-24">
                                    <Text className="mb-1 text-xs text-gray-600 font-primary">
                                        Extra Price
                                    </Text>
                                    <TextInput
                                        value={newVariant.price}
                                        onChangeText={(price) =>
                                            setNewVariant((prev) => ({
                                                ...prev,
                                                price,
                                            }))
                                        }
                                        placeholder="0"
                                        keyboardType="numeric"
                                        className="p-3 rounded-lg border border-gray-300 font-primary"
                                    />
                                </View>
                            </View>

                            <Pressable
                                onPress={addVariant}
                                className="flex-row justify-center items-center p-3 bg-blue-500 rounded-lg"
                            >
                                <Plus size={16} color="white" />
                                <Text className="ml-2 font-semibold text-white font-primary">
                                    Add Variant
                                </Text>
                            </Pressable>
                        </View>

                        {/* Display Existing Variants */}
                        {Object.entries(variants).map(
                            ([type, variantList]) =>
                                variantList &&
                                variantList.length > 0 && (
                                    <View key={type} className="mb-4">
                                        <Text className="mb-2 text-sm font-semibold text-gray-700 capitalize font-primary">
                                            {type}
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {variantList.map(
                                                (
                                                    variant: ProductVariant,
                                                    index: number
                                                ) => (
                                                    <View
                                                        key={index}
                                                        className="flex-row items-center px-3 py-2 bg-white rounded-lg border border-gray-300"
                                                    >
                                                        <Text className="mr-2 text-sm font-primary">
                                                            {variant.name}
                                                            {variant.price >
                                                                0 &&
                                                                ` (+R${variant.price.toFixed(2)})`}
                                                        </Text>
                                                        <Pressable
                                                            onPress={() =>
                                                                removeVariant(
                                                                    type as keyof ProductVariants,
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <Minus
                                                                size={16}
                                                                color="#ef4444"
                                                            />
                                                        </Pressable>
                                                    </View>
                                                )
                                            )}
                                        </View>
                                    </View>
                                )
                        )}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View className="flex-row gap-4 p-6 border-t border-gray-200">
                    <Pressable
                        onPress={handleClose}
                        className="flex-1 py-3 bg-red-500 rounded-lg"
                    >
                        <Text className="font-semibold text-center text-white font-primary">
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        className={`flex-1 py-3 rounded-lg ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                    >
                        <View className="flex-row justify-center items-center">
                            {saving ? (
                                <Loader size={16} color="white" />
                            ) : (
                                <Save size={16} color="white" />
                            )}
                            <Text className="ml-2 font-semibold text-center text-white font-primary">
                                {saving ? 'Saving...' : 'Save Product'}
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
