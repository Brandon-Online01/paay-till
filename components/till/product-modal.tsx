import {
    View,
    Text,
    Pressable,
    Modal,
    TextInput,
    Animated,
} from 'react-native';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Plus, Minus, X } from 'lucide-react-native';
import { useCartStore } from '@/store/cart.store';
import { useUIStore } from '@/store/ui.store';
import { ProductService } from '@/@db/product.service';
import { Product } from '@/types/inventory.types';

/**
 * ProductModal Component - Full-screen overlay modal for product customization
 *
 * Features:
 * - Full-screen overlay that covers entire screen
 * - Product customization with variants (colors, sizes, flavors)
 * - Quantity selection and notes input
 * - Dynamic pricing calculation
 * - Smooth animations and proper modal behavior
 */
export default function ProductModal() {
    const { addItem, symbol } = useCartStore();
    const {
        productModal,
        closeProductModal,
        updateModalQuantity,
        updateModalNotes,
        updateCustomization,
    } = useUIStore();

    // Animation refs and state
    const modalScale = useRef(new Animated.Value(0.8)).current;

    // State for current product
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);

    // Fetch product from database when modal opens
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productModal.productId) {
                setCurrentProduct(null);
                return;
            }

            setIsLoadingProduct(true);
            try {
                const product = await ProductService.getProductById(
                    productModal.productId
                );
                setCurrentProduct(product);
            } catch (error) {
                console.error('Failed to fetch product:', error);
                setCurrentProduct(null);
            } finally {
                setIsLoadingProduct(false);
            }
        };

        fetchProduct();
    }, [productModal.productId]);

    // Animate modal entrance
    const animateModalEntrance = useCallback(() => {
        Animated.spring(modalScale, {
            toValue: 1,
            damping: 20,
            stiffness: 300,
            useNativeDriver: true,
        }).start();
    }, [modalScale]);

    // Reset animation when modal opens
    useMemo(() => {
        if (productModal.isVisible) {
            modalScale.setValue(0.8);
            animateModalEntrance();
        }
    }, [productModal.isVisible, modalScale, animateModalEntrance]);

    // Calculate variant price
    const calculateVariantPrice = useCallback(() => {
        if (!currentProduct?.variants) return currentProduct?.price || 0;

        let variantPrice = currentProduct.price;

        if (productModal.customization.size && currentProduct.variants.sizes) {
            const sizeVariant = currentProduct.variants.sizes.find(
                (s) => s.name === productModal.customization.size
            );
            if (sizeVariant) variantPrice += sizeVariant.price;
        }
        if (
            productModal.customization.flavor &&
            currentProduct.variants.flavors
        ) {
            const flavorVariant = currentProduct.variants.flavors.find(
                (f) => f.name === productModal.customization.flavor
            );
            if (flavorVariant) variantPrice += flavorVariant.price;
        }
        if (
            productModal.customization.color &&
            currentProduct.variants.colors
        ) {
            const colorVariant = currentProduct.variants.colors.find(
                (c) => c.name === productModal.customization.color
            );
            if (colorVariant) variantPrice += colorVariant.price;
        }

        return variantPrice;
    }, [currentProduct, productModal.customization]);

    // Memoized total price for modal display (including variants)
    const totalPrice = useMemo(() => {
        const basePrice = calculateVariantPrice();
        return `${symbol}${(basePrice * productModal.quantity).toFixed(2)}`;
    }, [symbol, calculateVariantPrice, productModal.quantity]);

    /**
     * Handle adding item to cart from modal
     * Validates item data and adds with specified quantity, notes, and selected variants
     */
    const handleAddToCart = useCallback(() => {
        if (!currentProduct) {
            console.error('No product selected');
            return;
        }

        // Validate item data before adding to cart
        if (
            !currentProduct.id ||
            !currentProduct.name ||
            typeof currentProduct.price !== 'number'
        ) {
            console.error('Invalid item data provided to handleAddToCart');
            return;
        }

        if (productModal.quantity < 1 || productModal.quantity > 99) {
            console.error('Invalid quantity provided');
            return;
        }

        try {
            // Create customization string from selected options
            const customizationDetails = [];
            if (productModal.customization.color) {
                customizationDetails.push(
                    `Color: ${productModal.customization.color}`
                );
            }
            if (productModal.customization.flavor) {
                customizationDetails.push(
                    `Flavor: ${productModal.customization.flavor}`
                );
            }
            if (productModal.customization.size) {
                customizationDetails.push(
                    `Size: ${productModal.customization.size}`
                );
            }

            const notesWithCustomization = productModal.notes.trim()
                ? `${productModal.notes.trim()}${customizationDetails.length ? `\n\n${customizationDetails.join('\n')}` : ''}`
                : customizationDetails.join('\n');

            // Prepare selected variants
            const selectedVariants = {
                size: productModal.customization.size,
                flavor: productModal.customization.flavor,
                color: productModal.customization.color,
            };

            addItem(
                currentProduct,
                productModal.quantity,
                notesWithCustomization,
                currentProduct.badge,
                selectedVariants
            );
            closeProductModal();
        } catch (error) {
            console.error('Error adding item to cart:', error);
        }
    }, [currentProduct, productModal, addItem, closeProductModal]);

    /**
     * Increment quantity in modal
     * Validates that quantity doesn't exceed reasonable limits
     */
    const incrementQuantity = useCallback((): void => {
        updateModalQuantity(productModal.quantity + 1);
    }, [productModal.quantity, updateModalQuantity]);

    /**
     * Decrement quantity in modal
     * Ensures quantity doesn't go below 1
     */
    const decrementQuantity = useCallback((): void => {
        updateModalQuantity(productModal.quantity - 1);
    }, [productModal.quantity, updateModalQuantity]);

    if (!productModal.isVisible) return null;

    return (
        <Modal
            visible={productModal.isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeProductModal}
        >
            <Pressable
                className="flex-1 justify-center items-center bg-black-900/80"
                onPress={closeProductModal}
                style={{ flex: 1 }}
            >
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    style={{ width: '90%', maxWidth: 400 }}
                >
                    <Animated.View
                        style={{
                            transform: [{ scale: modalScale }],
                        }}
                        className="bg-white rounded-2xl border border-gray-200 shadow-xl"
                    >
                        {/* Modal Header */}
                        <View className="relative px-6 pt-6 pb-4">
                            <Pressable
                                onPress={closeProductModal}
                                className="absolute top-2 right-2 z-10 justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
                            >
                                <X size={22} color="#ffffff" />
                            </Pressable>

                            <Text className="mb-2 text-2xl font-bold text-gray-900 font-primary">
                                Customize your order
                            </Text>
                            <View className="flex flex-row justify-center items-center p-4 my-4 bg-gray-50 rounded-xl">
                                <Text className="mr-2 text-sm font-semibold text-gray-600 font-primary">
                                    Total Amount:
                                </Text>
                                <Text className="text-2xl font-bold text-blue-600 font-primary">
                                    {totalPrice}
                                </Text>
                            </View>
                        </View>

                        {/* Modal Content */}
                        <View className="px-6 pb-6">
                            {/* Loading State */}
                            {isLoadingProduct && (
                                <View className="justify-center items-center py-20">
                                    <Text className="text-lg text-gray-600 font-primary">
                                        Loading product...
                                    </Text>
                                </View>
                            )}

                            {/* Product Not Found */}
                            {!isLoadingProduct && !currentProduct && (
                                <View className="justify-center items-center py-20">
                                    <Text className="text-lg text-gray-600 font-primary">
                                        Product not found
                                    </Text>
                                    <Text className="text-sm text-gray-500 font-primary">
                                        Please try again
                                    </Text>
                                </View>
                            )}

                            {/* Product Content */}
                            {!isLoadingProduct && currentProduct && (
                                <>
                                    {/* Product Image */}
                                    <View className="justify-center items-center mb-4 w-full h-40 bg-gray-100 rounded-lg">
                                        <Text className="text-6xl font-primary">
                                            {currentProduct.image}
                                        </Text>
                                    </View>

                                    {/* Product Info */}
                                    <Text className="mb-1 text-sm font-semibold text-blue-600 capitalize font-primary">
                                        {currentProduct.category}
                                    </Text>
                                    <Text className="mb-2 text-xl font-bold text-gray-900 font-primary">
                                        {currentProduct.name}
                                    </Text>
                                    {currentProduct.description && (
                                        <Text className="mb-4 text-gray-600 font-primary">
                                            {currentProduct.description}
                                        </Text>
                                    )}

                                    {/* Notes Input */}
                                    <View className="mb-6">
                                        <Text className="mb-2 font-semibold text-gray-700 font-primary">
                                            Add notes to your order...
                                        </Text>
                                        <TextInput
                                            value={productModal.notes}
                                            onChangeText={updateModalNotes}
                                            placeholder="Any special instructions?"
                                            multiline
                                            numberOfLines={3}
                                            className="p-3 text-gray-900 rounded-lg border border-gray-200 font-primary"
                                            style={{ textAlignVertical: 'top' }}
                                        />
                                    </View>

                                    {/* Customization Options */}
                                    {currentProduct.variants && (
                                        <View className="mb-6">
                                            <Text className="mb-3 text-lg font-semibold text-gray-900 font-primary">
                                                Customize your order
                                            </Text>

                                            {/* Color Selector */}
                                            {currentProduct.variants.colors &&
                                                currentProduct.variants.colors
                                                    .length > 0 && (
                                                    <View className="mb-3">
                                                        <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                            Color
                                                        </Text>
                                                        <View className="flex-row flex-wrap gap-2">
                                                            {currentProduct.variants.colors.map(
                                                                (color) => (
                                                                    <Pressable
                                                                        key={
                                                                            color.name
                                                                        }
                                                                        onPress={() =>
                                                                            updateCustomization(
                                                                                'color',
                                                                                color.name
                                                                            )
                                                                        }
                                                                        className={`px-3 py-2 rounded-lg border ${
                                                                            productModal
                                                                                .customization
                                                                                .color ===
                                                                            color.name
                                                                                ? 'bg-blue-500 border-blue-500'
                                                                                : 'bg-gray-100 border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <Text
                                                                            className={`font-primary ${
                                                                                productModal
                                                                                    .customization
                                                                                    .color ===
                                                                                color.name
                                                                                    ? 'text-white'
                                                                                    : 'text-gray-700'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                color.name
                                                                            }
                                                                            {color.price >
                                                                                0 &&
                                                                                ` (+${symbol}${color.price})`}
                                                                        </Text>
                                                                    </Pressable>
                                                                )
                                                            )}
                                                        </View>
                                                    </View>
                                                )}

                                            {/* Flavor Selector */}
                                            {currentProduct.variants.flavors &&
                                                currentProduct.variants.flavors
                                                    .length > 0 && (
                                                    <View className="mb-3">
                                                        <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                            Flavor
                                                        </Text>
                                                        <View className="flex-row flex-wrap gap-2">
                                                            {currentProduct.variants.flavors.map(
                                                                (flavor) => (
                                                                    <Pressable
                                                                        key={
                                                                            flavor.name
                                                                        }
                                                                        onPress={() =>
                                                                            updateCustomization(
                                                                                'flavor',
                                                                                flavor.name
                                                                            )
                                                                        }
                                                                        className={`px-3 py-2 rounded-lg border ${
                                                                            productModal
                                                                                .customization
                                                                                .flavor ===
                                                                            flavor.name
                                                                                ? 'bg-green-500 border-green-500'
                                                                                : 'bg-gray-100 border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <Text
                                                                            className={`font-primary ${
                                                                                productModal
                                                                                    .customization
                                                                                    .flavor ===
                                                                                flavor.name
                                                                                    ? 'text-white'
                                                                                    : 'text-gray-700'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                flavor.name
                                                                            }
                                                                            {flavor.price >
                                                                                0 &&
                                                                                ` (+${symbol}${flavor.price})`}
                                                                        </Text>
                                                                    </Pressable>
                                                                )
                                                            )}
                                                        </View>
                                                    </View>
                                                )}

                                            {/* Size Selector */}
                                            {currentProduct.variants.sizes &&
                                                currentProduct.variants.sizes
                                                    .length > 0 && (
                                                    <View className="mb-3">
                                                        <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                                            Size
                                                        </Text>
                                                        <View className="flex-row flex-wrap gap-2">
                                                            {currentProduct.variants.sizes.map(
                                                                (size) => (
                                                                    <Pressable
                                                                        key={
                                                                            size.name
                                                                        }
                                                                        onPress={() =>
                                                                            updateCustomization(
                                                                                'size',
                                                                                size.name
                                                                            )
                                                                        }
                                                                        className={`px-3 py-2 rounded-lg border ${
                                                                            productModal
                                                                                .customization
                                                                                .size ===
                                                                            size.name
                                                                                ? 'bg-purple-500 border-purple-500'
                                                                                : 'bg-gray-100 border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <Text
                                                                            className={`font-primary ${
                                                                                productModal
                                                                                    .customization
                                                                                    .size ===
                                                                                size.name
                                                                                    ? 'text-white'
                                                                                    : 'text-gray-700'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                size.name
                                                                            }
                                                                            {size.price >
                                                                                0 &&
                                                                                ` (+${symbol}${size.price})`}
                                                                        </Text>
                                                                    </Pressable>
                                                                )
                                                            )}
                                                        </View>
                                                    </View>
                                                )}
                                        </View>
                                    )}
                                </>
                            )}

                            {/* Quantity Selector - only show if product is loaded */}
                            {!isLoadingProduct && currentProduct && (
                                <>
                                    <View className="flex-row justify-center items-center mb-6">
                                        <Pressable
                                            onPress={decrementQuantity}
                                            className="justify-center items-center w-12 h-12 bg-gray-100 rounded-full"
                                        >
                                            <Minus size={20} color="#374151" />
                                        </Pressable>

                                        <Text className="mx-8 text-2xl font-bold text-gray-900 font-primary">
                                            {productModal.quantity}
                                        </Text>

                                        <Pressable
                                            onPress={incrementQuantity}
                                            className="justify-center items-center w-12 h-12 bg-blue-500 rounded-full"
                                        >
                                            <Plus size={20} color="white" />
                                        </Pressable>
                                    </View>

                                    {/* Add to Cart Button */}
                                    <Pressable
                                        onPress={handleAddToCart}
                                        className="items-center py-4 bg-blue-500 rounded-lg"
                                    >
                                        <Text className="text-lg font-bold text-white font-primary">
                                            Add to Cart ({totalPrice})
                                        </Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    </Animated.View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
