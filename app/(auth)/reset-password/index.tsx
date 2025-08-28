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
import { Link } from 'expo-router';
import { Mail, X } from 'lucide-react-native';
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

export default function ResetPassword() {
    const {
        forgotPassword,
        updateForgotPasswordForm,
        forgotPasswordForm,
        authState,
        clearForms,
    } = useAuthStore();
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [successMessage, setSuccessMessage] = useState('');

    // Animation values
    const formOpacity = useSharedValue(0);
    const formTranslateY = useSharedValue(50);
    const leftPanelScale = useSharedValue(0.8);
    const buttonScale = useSharedValue(1);

    useEffect(() => {
        // Clear forms when component mounts
        clearForms();
        setSuccessMessage('');
        setErrors({});

        // Start entrance animations
        formOpacity.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.exp),
        });
        formTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        leftPanelScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    }, [clearForms, formOpacity, formTranslateY, leftPanelScale]);

    const validateForm = () => {
        const newErrors: { email?: string } = {};

        if (!forgotPasswordForm.email) {
            newErrors.email = 'Email is required';
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordForm.email)
        ) {
            newErrors.email = 'Please enter a valid email address';
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

    const handleResetPassword = async () => {
        if (!validateForm()) return;

        // Button press animation
        buttonScale.value = withTiming(0.95, { duration: 100 });

        try {
            await forgotPassword(forgotPasswordForm.email);
            buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            setSuccessMessage(
                'PIN reset instructions have been sent to your email.'
            );
        } catch {
            buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            Alert.alert(
                'Reset Failed',
                'Please check your email address and try again.'
            );
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
                                {info?.company?.tagline}
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
                                {info?.auth?.resetPassword?.title ||
                                    'Reset PIN'}
                            </Text>
                            <Text className="text-lg text-center text-gray-600 font-primary">
                                {info?.auth?.resetPassword?.subtitle ||
                                    "We'll send you a reset code"}
                            </Text>
                        </View>

                        {/* Success Message */}
                        {successMessage && (
                            <View className="p-4 w-full bg-blue-50 rounded-lg border border-blue-200">
                                <Text className="text-center text-blue-700">
                                    {successMessage}
                                </Text>
                            </View>
                        )}

                        {/* Form */}
                        <View className="flex flex-col gap-6 justify-center items-center w-full">
                            {/* Email Field */}
                            <View className="flex flex-col gap-1 w-full">
                                <Text className="font-semibold text-gray-700 uppercase text-md font-primary">
                                    Email Address
                                </Text>
                                <View className="relative flex-row justify-center items-center w-full">
                                    <TextInput
                                        className={`w-full p-6 border rounded-lg text-base font-primary ${
                                            errors.email
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="business@example.com"
                                        value={forgotPasswordForm.email}
                                        onChangeText={(email) =>
                                            updateForgotPasswordForm({ email })
                                        }
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.email && (
                                    <Text className="text-sm text-red-600">
                                        {errors.email}
                                    </Text>
                                )}
                            </View>

                            {/* Reset Password Button */}
                            <Animated.View
                                style={buttonAnimatedStyle}
                                className="flex-col gap-2 justify-center items-center w-full"
                            >
                                <Pressable
                                    className="justify-center items-center p-5 w-3/4 rounded-lg"
                                    style={{ backgroundColor: '#2d71f8' }}
                                    onPress={handleResetPassword}
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
                                            Reset PIN{' '}
                                            {authState.isLoading ? '...' : ''}
                                        </Text>
                                    )}
                                </Pressable>
                            </Animated.View>

                            {/* Error Message */}
                            {authState.error && (
                                <Text className="text-sm text-red-600 font-primary">
                                    {authState.error}
                                </Text>
                            )}
                        </View>

                        {/* Links */}
                        <View className="absolute right-0 bottom-0 left-0">
                            <View className="flex-row gap-1 justify-center items-center">
                                <Text className="text-gray-600 font-primary">
                                    Remember your PIN?
                                </Text>
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
                    </View>
                </Animated.View>
            </View>
        </ScrollView>
    );
}
