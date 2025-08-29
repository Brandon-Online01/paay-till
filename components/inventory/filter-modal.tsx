import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { X, Package, DollarSign, CheckSquare, Square, Tag } from 'lucide-react-native';
import { useInventoryStore, FilterOptions } from '@/store/inventory.store';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProductFilterModal({ visible, onClose }: FilterModalProps) {
  const { filters, setFilters } = useInventoryStore();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food & Snacks' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'tools', label: 'Tools & Hardware' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'health', label: 'Health & Beauty' },
    { value: 'sports', label: 'Sports & Outdoor' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'books', label: 'Books & Media' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'pet', label: 'Pet Supplies' },
    { value: 'baby', label: 'Baby & Kids' },
  ];

  const badgeOptions = [
    { value: 'special', label: 'Special' },
    { value: 'limited', label: 'Limited' },
    { value: '20% off', label: '20% Off' },
  ];

  const stockOptions = [
    { value: null, label: 'All Products' },
    { value: true, label: 'In Stock' },
    { value: false, label: 'Out of Stock' },
  ];

  const toggleCategoryFilter = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    
    setLocalFilters(prev => ({
      ...prev,
      categories: newCategories
    }));
  };

  const toggleBadgeFilter = (badge: string) => {
    const newBadges = localFilters.badge.includes(badge)
      ? localFilters.badge.filter(b => b !== badge)
      : [...localFilters.badge, badge];
    
    setLocalFilters(prev => ({
      ...prev,
      badge: newBadges
    }));
  };

  const handleStockFilter = (inStock: boolean | null) => {
    setLocalFilters(prev => ({
      ...prev,
      inStock
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      categories: [],
      priceRange: { min: 0, max: 0 },
      inStock: null,
      badge: [],
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900 font-primary">
            Filter Products
          </Text>
          <Pressable 
            onPress={onClose}
            className="justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
          >
            <X size={22} color="#ffffff" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 p-6">
          {/* Category Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
              Categories
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {categoryOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => toggleCategoryFilter(option.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    localFilters.categories.includes(option.value)
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <Text className={`text-sm font-primary ${
                    localFilters.categories.includes(option.value)
                      ? 'text-blue-700'
                      : 'text-gray-700'
                  }`}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Stock Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
              Stock Status
            </Text>
            {stockOptions.map((option) => (
              <Pressable
                key={option.label}
                onPress={() => handleStockFilter(option.value)}
                className="flex-row items-center py-3"
              >
                {localFilters.inStock === option.value ? (
                  <CheckSquare size={20} color="#2563eb" />
                ) : (
                  <Square size={20} color="#6b7280" />
                )}
                <Text className="ml-3 text-gray-700 font-primary">
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Badge Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
              Badges
            </Text>
            {badgeOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => toggleBadgeFilter(option.value)}
                className="flex-row items-center py-3"
              >
                {localFilters.badge.includes(option.value) ? (
                  <CheckSquare size={20} color="#2563eb" />
                ) : (
                  <Square size={20} color="#6b7280" />
                )}
                <Text className="ml-3 text-gray-700 font-primary">
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Price Range Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
              Price Range
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2 font-primary">Min Price</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                  <DollarSign size={16} color="#6b7280" />
                  <TextInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={localFilters.priceRange.min.toString()}
                    onChangeText={(min) => setLocalFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: parseFloat(min) || 0 }
                    }))}
                    className="flex-1 ml-2 font-primary"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2 font-primary">Max Price</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                  <DollarSign size={16} color="#6b7280" />
                  <TextInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={localFilters.priceRange.max.toString()}
                    onChangeText={(max) => setLocalFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: parseFloat(max) || 0 }
                    }))}
                    className="flex-1 ml-2 font-primary"
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="flex-row gap-4 p-6 border-t border-gray-200">
          <Pressable
            onPress={handleClearFilters}
            className="flex-1 py-3 bg-red-500 rounded-lg"
          >
            <Text className="text-center text-white font-semibold font-primary">
              Clear All
            </Text>
          </Pressable>
          <Pressable
            onPress={handleApplyFilters}
            className="flex-1 py-3 bg-blue-600 rounded-lg"
          >
            <Text className="text-center text-white font-semibold font-primary">
              Apply Filters
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
