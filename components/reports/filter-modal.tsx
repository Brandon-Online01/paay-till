import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { X, Calendar, DollarSign, CreditCard, CheckSquare, Square } from 'lucide-react-native';
import { useReportsStore, FilterOptions } from '@/store/reports.store';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FilterModal({ visible, onClose }: FilterModalProps) {
  const { filters, setFilters } = useReportsStore();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'mobile', label: 'Mobile Payment' },
    { value: 'link', label: 'Payment Link' },
    { value: 'account', label: 'Account' },
  ];

  const toggleStatusFilter = (status: string) => {
    const newStatus = localFilters.status.includes(status)
      ? localFilters.status.filter(s => s !== status)
      : [...localFilters.status, status];
    
    setLocalFilters(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  const togglePaymentMethodFilter = (method: string) => {
    const newMethods = localFilters.paymentMethod.includes(method)
      ? localFilters.paymentMethod.filter(m => m !== method)
      : [...localFilters.paymentMethod, method];
    
    setLocalFilters(prev => ({
      ...prev,
      paymentMethod: newMethods
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      status: [],
      dateRange: { from: '', to: '' },
      paymentMethod: [],
      amountRange: { min: 0, max: 0 },
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
            Filter Sales
          </Text>
          <Pressable onPress={onClose} className="p-2">
            <X size={24} color="#6b7280" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 p-6">
          {/* Status Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
              Status
            </Text>
            {statusOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => toggleStatusFilter(option.value)}
                className="flex-row items-center py-3"
              >
                {localFilters.status.includes(option.value) ? (
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

          {/* Date Range Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
              Date Range
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2 font-primary">From</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                  <Calendar size={16} color="#6b7280" />
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={localFilters.dateRange.from}
                    onChangeText={(from) => setLocalFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from }
                    }))}
                    className="flex-1 ml-2 font-primary"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2 font-primary">To</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                  <Calendar size={16} color="#6b7280" />
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={localFilters.dateRange.to}
                    onChangeText={(to) => setLocalFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to }
                    }))}
                    className="flex-1 ml-2 font-primary"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Payment Method Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
              Payment Method
            </Text>
            {paymentMethodOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => togglePaymentMethodFilter(option.value)}
                className="flex-row items-center py-3"
              >
                {localFilters.paymentMethod.includes(option.value) ? (
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

          {/* Amount Range Filter */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 font-primary">
              Amount Range
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2 font-primary">Min Amount</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                  <DollarSign size={16} color="#6b7280" />
                  <TextInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={localFilters.amountRange.min.toString()}
                    onChangeText={(min) => setLocalFilters(prev => ({
                      ...prev,
                      amountRange: { ...prev.amountRange, min: parseFloat(min) || 0 }
                    }))}
                    className="flex-1 ml-2 font-primary"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-2 font-primary">Max Amount</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                  <DollarSign size={16} color="#6b7280" />
                  <TextInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={localFilters.amountRange.max.toString()}
                    onChangeText={(max) => setLocalFilters(prev => ({
                      ...prev,
                      amountRange: { ...prev.amountRange, max: parseFloat(max) || 0 }
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
            className="flex-1 py-3 border border-gray-300 rounded-lg"
          >
            <Text className="text-center text-gray-700 font-semibold font-primary">
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
