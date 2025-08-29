import React, { useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, Modal, Animated, ActivityIndicator } from 'react-native';
import { X, ShieldCheck, Scan, Key, AlertTriangle } from 'lucide-react-native';
import { ToastUtils } from '@/utils/toast.util';

interface VoidTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onVoidConfirmed: () => void;
  itemName: string;
}

export default function VoidTokenModal({ 
  visible, 
  onClose, 
  onVoidConfirmed, 
  itemName 
}: VoidTokenModalProps) {
  const [voidToken, setVoidToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authMethod, setAuthMethod] = useState<'token' | 'scan'>('token');
  const [errors, setErrors] = useState<string>('');

  // Animation refs
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;

  // Valid void tokens for demo - in production this would be more secure
  const VALID_VOID_TOKENS = ['VOID123', 'MANAGER', 'ADMIN2024', 'VOID@2025'];

  React.useEffect(() => {
    if (visible) {
      animateModalIn();
    }
  }, [visible]);

  const animateModalIn = () => {
    modalOpacity.setValue(0);
    modalScale.setValue(0.9);

    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModalOut = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleClose();
    });
  };

  const handleClose = () => {
    setVoidToken('');
    setIsProcessing(false);
    setAuthMethod('token');
    setErrors('');
    onClose();
  };

  const validateVoidToken = (): boolean => {
    if (!voidToken.trim()) {
      setErrors('Void token is required');
      return false;
    }

    if (!VALID_VOID_TOKENS.includes(voidToken.toUpperCase())) {
      setErrors('Invalid void token. Please contact a manager.');
      return false;
    }

    setErrors('');
    return true;
  };

  const handleVoidSubmit = async () => {
    if (!validateVoidToken()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing delay
      setTimeout(() => {
        // Log the void action
        const voidAction = {
          timestamp: new Date().toISOString(),
          itemName,
          voidToken: voidToken.toUpperCase(),
          operator: 'Current User', // In production, get from auth context
          reason: 'Manual void via POS',
        };

        console.log('🗑️ VOID ACTION:', voidAction);

        // Show success message
        ToastUtils.success(`Item "${itemName}" has been voided`, 3000, '🗑️');

        // Call the void confirmation callback
        onVoidConfirmed();
        
        setIsProcessing(false);
        animateModalOut();
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      setErrors('Failed to process void token. Please try again.');
      console.error('Void processing error:', error);
    }
  };

  const handleScanQR = () => {
    // Simulate QR/Barcode scan - in production this would open camera
    ToastUtils.info('QR/Barcode scanner would open here', 2000, '📷');
    
    // For demo, simulate a successful scan after delay
    setTimeout(() => {
      setVoidToken('VOID123');
      setAuthMethod('token');
      ToastUtils.success('Void token scanned successfully!', 2000, '✅');
    }, 1500);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={animateModalOut}
    >
      <Animated.View
        style={{
          opacity: modalOpacity,
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <Pressable
          className="flex-1 justify-center items-center p-6"
          onPress={animateModalOut}
          style={{ flex: 1 }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 400 }}
          >
            <Animated.View
              style={{
                transform: [{ scale: modalScale }],
              }}
              className="bg-white rounded-2xl border border-gray-200 shadow-xl"
            >
              {/* Header */}
              <View className="relative px-6 pt-6 pb-4 border-b border-gray-200">
                <Pressable
                  onPress={animateModalOut}
                  className="absolute top-2 right-2 z-10 justify-center items-center w-12 h-12 rounded-full border border-red-500 bg-red-500/80"
                >
                  <X size={22} color="#ffffff" />
                </Pressable>

                <View className="items-center">
                  <View className="justify-center items-center mb-4 w-16 h-16 bg-red-100 rounded-full">
                    <AlertTriangle size={32} color="#dc2626" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900 font-primary mb-2">
                    Void Item Authorization
                  </Text>
                  <Text className="text-center text-gray-600 font-primary">
                    Authorization required to void item from cart
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View className="p-6">
                {/* Item Info */}
                <View className="p-4 mb-6 bg-red-50 rounded-lg border border-red-200">
                  <Text className="text-sm text-red-600 font-primary mb-1">
                    Item to be voided:
                  </Text>
                  <Text className="text-lg font-bold text-red-800 font-primary">
                    {itemName}
                  </Text>
                </View>

                {/* Auth Method Selection */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-3 font-primary">
                    Authorization Method
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setAuthMethod('token')}
                      className={`flex-1 flex-row items-center justify-center p-3 rounded-lg border-2 ${
                        authMethod === 'token'
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Key size={16} color={authMethod === 'token' ? 'white' : '#6b7280'} />
                      <Text
                        className={`ml-2 font-semibold font-primary ${
                          authMethod === 'token' ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        Enter Token
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setAuthMethod('scan')}
                      className={`flex-1 flex-row items-center justify-center p-3 rounded-lg border-2 ${
                        authMethod === 'scan'
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Scan size={16} color={authMethod === 'scan' ? 'white' : '#6b7280'} />
                      <Text
                        className={`ml-2 font-semibold font-primary ${
                          authMethod === 'scan' ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        Scan QR
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Token Input or Scan */}
                {authMethod === 'token' ? (
                  <View className="mb-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-2 font-primary">
                      Void Authorization Token
                    </Text>
                    <TextInput
                      value={voidToken}
                      onChangeText={(text) => {
                        setVoidToken(text);
                        setErrors('');
                      }}
                      placeholder="Enter void token..."
                      autoCapitalize="characters"
                      className={`p-4 rounded-lg border font-primary ${
                        errors ? 'border-red-500' : 'border-gray-300'
                      }`}
                      autoFocus
                    />
                    {errors && (
                      <Text className="mt-2 text-sm text-red-500 font-primary">
                        {errors}
                      </Text>
                    )}
                    <Text className="mt-2 text-xs text-gray-500 font-primary">
                      Contact your manager for a void authorization token
                    </Text>
                  </View>
                ) : (
                  <View className="mb-6">
                    <Pressable
                      onPress={handleScanQR}
                      className="flex-row items-center justify-center p-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300"
                    >
                      <Scan size={32} color="#3B82F6" />
                      <Text className="ml-3 text-lg font-semibold text-blue-700 font-primary">
                        Tap to Scan QR Code
                      </Text>
                    </Pressable>
                    <Text className="mt-2 text-xs text-center text-gray-500 font-primary">
                      Scan the void authorization QR code or barcode
                    </Text>
                  </View>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <View className="flex-row justify-center items-center p-4 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="ml-3 text-blue-700 font-primary">
                      Processing void authorization...
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={animateModalOut}
                    className="flex-1 items-center py-4 bg-gray-500 rounded-lg"
                    disabled={isProcessing}
                  >
                    <Text className="font-semibold text-white font-primary">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleVoidSubmit}
                    className={`flex-1 items-center rounded-lg py-4 ${
                      !voidToken.trim() || isProcessing
                        ? 'bg-gray-300'
                        : 'bg-red-600'
                    }`}
                    disabled={!voidToken.trim() || isProcessing}
                  >
                    <View className="flex-row items-center">
                      <ShieldCheck size={16} color="white" />
                      <Text className="ml-2 font-semibold text-white font-primary">
                        Authorize Void
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* Demo Tokens Info */}
                <View className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Text className="text-xs text-yellow-800 font-primary font-semibold mb-1">
                    Demo Tokens (Remove in production):
                  </Text>
                  <Text className="text-xs text-yellow-700 font-primary">
                    VOID123, MANAGER, ADMIN2024, VOID@2025
                  </Text>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}
