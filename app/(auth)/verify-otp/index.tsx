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
import { Link, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '../../../store';
import info from '../../../data/info.json';

export default function VerifyOTP() {
    const router = useRouter();
    const { verifyOtp, updateOtpForm, otpForm, authState, uiState, setErrors } = useAuthStore();

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
        const newErrors: { code?: string } = {};

        if (!otpForm.code) {
            newErrors.code = 'Verification code is required';
        } else if (otpForm.code.length !== 6) {
            newErrors.code = 'Code must be exactly 6 digits';
        } else if (!/^\d{6}$/.test(otpForm.code)) {
            newErrors.code = 'Code must contain only numbers';
        }

        setErrors('otpVerification', newErrors);
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

    const handleVerifyOTP = async () => {
        if (!validateForm()) return;

        // Button press animation
        buttonScale.value = withTiming(0.95, { duration: 100 });

        try {
            await verifyOtp(otpForm.code);
            buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            Alert.alert(
                'Success',
                'Your account has been verified successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(auth)/sign-in'),
                    },
                ]
            );
        } catch {
            buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            Alert.alert(
                'Verification Failed',
                'Please check your code and try again.'
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
                        source={require('../../../assets/images/waves.webp')}
                        className="flex-1 justify-center items-center w-full h-full"
                        resizeMode="cover"
                    >
                        <View className="items-center p-6 space-y-2 rounded-lg bg-black/40">
                            <Text className="text-2xl font-bold text-center text-white font-primary">
                                {info?.company?.name}
                            </Text>
                            <Text className="px-4 text-lg text-center text-white/80 font-primary">
                                Verify your account
                            </Text>
                        </View>
                    </ImageBackground>
                </Animated.View>

                {/* Right Section - Form */}
                <Animated.View
                    className="flex flex-col gap-4 justify-center px-8 py-12 w-1/2 bg-white"
                    style={formAnimatedStyle}
                >
                    {/* Home Link */}
                    <View className="flex-row justify-end w-full">
                        <Link href="/" asChild>
                            <Pressable className="p-2">
                                <Text className="text-gray-600 font-primary">
                                    Home
                                </Text>
                            </Pressable>
                        </Link>
                    </View>
                    <View className="flex flex-col gap-10 justify-center items-center p-2 w-full h-full">
                        {/* Back Button */}
                        <View className="w-full">
                            <Link href="/(auth)/sign-up" asChild>
                                <Pressable className="p-2 w-fit">
                                    <ArrowLeft size={24} color="#6b7280" />
                                </Pressable>
                            </Link>
                        </View>

                        {/* Header */}
                        <View className="space-y-2">
                            <Text className="text-3xl font-bold text-center text-primary font-primary">
                                {info?.auth?.verifyOtp?.title || 'Verify Code'}
                            </Text>
                            <Text className="text-lg text-center text-gray-600 font-primary">
                                {info?.auth?.verifyOtp?.subtitle ||
                                    'Enter the code sent to your device'}
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="flex flex-col gap-6 justify-center items-center w-full">
                            {/* OTP Code Field */}
                            <View className="flex flex-col gap-1 w-full">
                                <Text className="font-semibold text-center text-gray-700 uppercase text-md font-primary">
                                    Verification Code
                                </Text>
                                <View className="relative flex-row justify-center items-center w-full">
                                    <TextInput
                                        className={`w-full h-12 pl-4 pr-4 border rounded-lg text-center text-2xl font-mono tracking-widest ${
                                            uiState.errors.otpVerification?.code
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="123456"
                                        value={otpForm.code}
                                        onChangeText={(code) =>
                                            updateOtpForm({ code })
                                        }
                                        keyboardType="numeric"
                                        maxLength={6}
                                        autoCapitalize="none"
                                    />
                                </View>
                                {uiState.errors.otpVerification?.code && (
                                    <Text className="text-sm text-red-600 font-primary">
                                        {uiState.errors.otpVerification.code}
                                    </Text>
                                )}
                            </View>

                            {/* Verify Button */}
                            <Animated.View
                                style={buttonAnimatedStyle}
                                className="flex-col gap-2 justify-center items-center w-full"
                            >
                                <Pressable
                                    className="justify-center items-center p-4 w-3/4 rounded-lg"
                                    style={{ backgroundColor: '#2d71f8' }}
                                    onPress={handleVerifyOTP}
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
                                            Verify OTP{' '}
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
                        <View className="space-y-4">
                            <View className="flex-row gap-1 justify-center items-center">
                                <Text className="text-gray-600 font-primary">
                                    Didn&apos;t receive the code?
                                </Text>
                                <Pressable>
                                    <Text
                                        className="font-semibold text-center font-primary"
                                        style={{ color: '#2d71f8' }}
                                    >
                                        Resend OTP
                                    </Text>
                                </Pressable>
                            </View>
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
