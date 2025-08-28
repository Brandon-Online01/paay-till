import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    TextInput,
    Pressable,
    ScrollView,
    Alert,
    ActivityIndicator,
    ImageBackground,
} from 'react-native';
import { Eye, EyeOff, X } from 'lucide-react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '../../../store';
import info from '../../../data/info.json';

export default function NewPassword() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {
        resetPassword,
        updateResetPasswordForm,
        resetPasswordForm,
        authState,
    } = useAuthStore();
    const [errors, setErrors] = useState<{ pin?: string; confirmPin?: string }>(
        {}
    );
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Animation values
    const formOpacity = useSharedValue(0);
    const formTranslateY = useSharedValue(50);
    const leftPanelScale = useSharedValue(0.8);
    const buttonScale = useSharedValue(1);

    useEffect(() => {
        // Start entrance animations
        formOpacity.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.exp),
        });
        formTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        leftPanelScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    }, [formOpacity, formTranslateY, leftPanelScale]);

    const validateForm = () => {
        const newErrors: { pin?: string; confirmPin?: string } = {};

        if (!resetPasswordForm.password) {
            newErrors.pin = 'New password is required';
        } else if (resetPasswordForm.password.length < 8) {
            newErrors.pin = 'Password must be at least 8 characters';
        } else if (
            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(resetPasswordForm.password)
        ) {
            newErrors.pin =
                'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number';
        }

        if (!resetPasswordForm.confirmPassword) {
            newErrors.confirmPin = 'Please confirm your password';
        } else if (
            resetPasswordForm.password !== resetPasswordForm.confirmPassword
        ) {
            newErrors.confirmPin = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Animated styles
    const formAnimatedStyle = useAnimatedStyle(() => ({
        opacity: formOpacity.value,
        transform: [{ translateY: formTranslateY.value }],
    }));

    const leftPanelAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: leftPanelScale.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleUpdatePassword = async () => {
        if (!validateForm()) return;

        // Button press animation
        buttonScale.value = withTiming(0.95, { duration: 100 });

        try {
            await resetPassword({
                token: (params.token as string) || '',
                password: resetPasswordForm.password,
                confirmPassword: resetPasswordForm.confirmPassword,
            });
            buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            Alert.alert('Success', 'Your PIN has been updated successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/(auth)/sign-in'),
                },
            ]);
        } catch {
            buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            Alert.alert('Update Failed', 'Please try again.');
        }
    };

    const handleButtonPress = () => {
        buttonScale.value = withTiming(0.95, { duration: 100 });
    };

    const handleButtonRelease = () => {
        buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    };

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-1 w-full min-h-screen">
                {/* Left Section - Background Image */}
                <Animated.View
                    className="flex flex-1 justify-center items-center w-1/2 h-full"
                    style={leftPanelAnimatedStyle}
                >
                    <ImageBackground
                        source={require('../../../assets/images/waves.jpg')}
                        className="flex-1 justify-center items-center w-full h-full"
                        resizeMode="cover"
                    >
                        <View className="flex flex-col gap-2 justify-center items-center p-6 space-y-2 rounded-lg bg-black/40">
                            <View className="flex flex-col gap-2 items-center">
                                <Image
                                    source={require('../../../assets/images/logo.png')}
                                    className="rounded-2xl"
                                    contentFit="contain"
                                    transition={300}
                                    style={{
                                        width: 200,
                                        height: 200,
                                    }}
                                />
                            </View>
                            <Text className="px-4 -mt-14 max-w-2xl text-xl text-center text-white/80 font-primary">
                                Create your new PIN
                            </Text>
                        </View>
                    </ImageBackground>
                </Animated.View>

                {/* Right Section - Form */}
                <Animated.View
                    className="flex relative flex-col gap-4 justify-center px-8 py-12 w-1/2 bg-white"
                    style={formAnimatedStyle}
                >
                    {/* Home Link */}
                    <View className="absolute left-5 top-10 z-10 rounded-full border border-red-500/30">
                        <Link href="/" asChild>
                            <Pressable className="p-3 rounded-full bg-red-500/10">
                                <X size={18} color="red" />
                            </Pressable>
                        </Link>
                    </View>
                    <View className="flex flex-col gap-10 justify-center items-center p-2 w-full h-full">
                        {/* Header */}
                        <View className="space-y-2">
                            <Text className="text-3xl font-bold text-center text-primary font-primary">
                                {info?.auth?.newPassword?.title || 'New PIN'}
                            </Text>
                            <Text className="text-lg text-center text-gray-600 font-primary">
                                {info?.auth?.newPassword?.subtitle ||
                                    'Set your new 4-digit PIN'}
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="flex flex-col gap-6 justify-center items-center w-full">
                            {/* New Password Field */}
                            <View className="flex flex-col gap-1 w-full">
                                <Text className="font-semibold text-center text-gray-700 uppercase text-md font-primary">
                                    New Password
                                </Text>
                                <View className="relative flex-row justify-center items-center w-full">
                                    <TextInput
                                        className={`w-full h-12 pl-4 pr-12 border rounded-lg text-base ${
                                            errors.pin
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="********"
                                        value={resetPasswordForm.password}
                                        onChangeText={(password) =>
                                            updateResetPasswordForm({
                                                password,
                                            })
                                        }
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <Pressable
                                        className="absolute top-3 right-3"
                                        onPress={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} color="#6b7280" />
                                        ) : (
                                            <Eye size={20} color="#6b7280" />
                                        )}
                                    </Pressable>
                                </View>
                                {errors.pin && (
                                    <Text className="text-sm text-red-600 font-primary">
                                        {errors.pin}
                                    </Text>
                                )}
                            </View>

                            {/* Confirm Password Field */}
                            <View className="flex flex-col gap-1 w-full">
                                <Text className="font-semibold text-center text-gray-700 uppercase text-md font-primary">
                                    Confirm Password
                                </Text>
                                <View className="relative flex-row justify-center items-center w-full">
                                    <TextInput
                                        className={`w-full h-12 pl-4 pr-12 border rounded-lg text-base ${
                                            errors.confirmPin
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="********"
                                        value={
                                            resetPasswordForm.confirmPassword
                                        }
                                        onChangeText={(confirmPassword) =>
                                            updateResetPasswordForm({
                                                confirmPassword,
                                            })
                                        }
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                    />
                                    <Pressable
                                        className="absolute top-3 right-3"
                                        onPress={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={20} color="#6b7280" />
                                        ) : (
                                            <Eye size={20} color="#6b7280" />
                                        )}
                                    </Pressable>
                                </View>
                                {errors.confirmPin && (
                                    <Text className="text-sm text-red-600 font-primary">
                                        {errors.confirmPin}
                                    </Text>
                                )}
                            </View>

                            {/* Update Button */}
                            <Animated.View
                                style={buttonAnimatedStyle}
                                className="flex-col gap-2 justify-center items-center w-full"
                            >
                                <Pressable
                                    className="justify-center items-center p-5 w-3/4 rounded-lg"
                                    style={{ backgroundColor: '#2d71f8' }}
                                    onPress={handleUpdatePassword}
                                    onPressIn={handleButtonPress}
                                    onPressOut={handleButtonRelease}
                                    disabled={authState.isLoading}
                                >
                                    {authState.isLoading ? (
                                        <ActivityIndicator
                                            color="#ffffff"
                                            size="small"
                                        />
                                    ) : (
                                        <Text className="font-semibold text-center text-white uppercase text-md font-primary">
                                            Save New Password{' '}
                                            {authState.isLoading ? '...' : ''}
                                        </Text>
                                    )}
                                </Pressable>
                            </Animated.View>

                            {/* Error Message */}
                            {authState.error && (
                                <Text className="text-sm text-center text-red-600">
                                    {authState.error}
                                </Text>
                            )}
                        </View>

                        {/* Links */}
                        <View className="absolute right-0 bottom-0 left-0">
                            <Link href="/(auth)/sign-in" asChild>
                                <Pressable>
                                    <Text
                                        className="font-semibold text-center font-primary"
                                        style={{ color: '#2d71f8' }}
                                    >
                                        Back to Sign In
                                    </Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </ScrollView>
    );
}
