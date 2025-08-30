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

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '../../../store';
import info from '../../../data/info.json';
import { X, Fingerprint } from 'lucide-react-native';
import { Image } from 'expo-image';
import { BiometricsUtils } from '../../../utils/biometrics.util';

export default function SignIn() {
    const router = useRouter();
    const { 
        signIn, 
        updateSignInForm, 
        signInForm, 
        authState, 
        clearForms,
        uiState,
        setErrors,
        clearErrors,
        setUseBiometrics,
        checkBiometricAvailability
    } = useAuthStore();

    // Enhanced animation values for staggered entry
    const leftPanelOpacity = useSharedValue(0);
    const leftPanelScale = useSharedValue(0.8);
    const leftPanelTranslateX = useSharedValue(-100);

    const headerOpacity = useSharedValue(0);
    const headerTranslateY = useSharedValue(30);

    const formOpacity = useSharedValue(0);
    const formTranslateY = useSharedValue(50);

    const inputOpacity = useSharedValue(0);
    const inputTranslateY = useSharedValue(20);

    const buttonOpacity = useSharedValue(0);
    const buttonScale = useSharedValue(0.8);

    const linksOpacity = useSharedValue(0);
    const linksTranslateY = useSharedValue(20);

    const logoScale = useSharedValue(0);
    const logoRotate = useSharedValue(-45);

    useEffect(() => {
        // Clear forms when component mounts
        clearForms();

        // Check biometric availability
        checkBiometricAvailability();

        // Staggered entrance animations with proper delays
        // 1. Left panel slides in and scales
        setTimeout(() => {
            leftPanelOpacity.value = withTiming(1, {
                duration: 600,
                easing: Easing.out(Easing.exp),
            });
            leftPanelTranslateX.value = withSpring(0, {
                damping: 15,
                stiffness: 100,
            });
            leftPanelScale.value = withSpring(1, {
                damping: 12,
                stiffness: 120,
            });
        }, 100);

        // 2. Logo appears with scale and rotation
        setTimeout(() => {
            logoScale.value = withSpring(1, { damping: 10, stiffness: 150 });
            logoRotate.value = withTiming(0, {
                duration: 800,
                easing: Easing.out(Easing.back(1.2)),
            });
        }, 300);

        // 3. Header text fades in from top
        setTimeout(() => {
            headerOpacity.value = withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.exp),
            });
            headerTranslateY.value = withSpring(0, {
                damping: 15,
                stiffness: 100,
            });
        }, 600);

        // 4. Form container appears
        setTimeout(() => {
            formOpacity.value = withTiming(1, {
                duration: 600,
                easing: Easing.out(Easing.exp),
            });
            formTranslateY.value = withSpring(0, {
                damping: 15,
                stiffness: 100,
            });
        }, 800);

        // 5. Input field slides in
        setTimeout(() => {
            inputOpacity.value = withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.exp),
            });
            inputTranslateY.value = withSpring(0, {
                damping: 15,
                stiffness: 100,
            });
        }, 1000);

        // 6. Button appears with scale
        setTimeout(() => {
            buttonOpacity.value = withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.exp),
            });
            buttonScale.value = withSpring(1, { damping: 12, stiffness: 150 });
        }, 1200);

        // 7. Footer links fade in
        setTimeout(() => {
            linksOpacity.value = withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.exp),
            });
            linksTranslateY.value = withSpring(0, {
                damping: 15,
                stiffness: 100,
            });
        }, 1400);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clearForms]);

    const validateForm = () => {
        const newErrors: { pin?: string } = {};

        if (!signInForm.pin) {
            newErrors.pin = 'PIN is required';
        } else if (signInForm.pin.length !== 8) {
            newErrors.pin = 'PIN must be exactly 8 digits';
        } else if (!/^\d{8}$/.test(signInForm.pin)) {
            newErrors.pin = 'PIN must contain only numbers';
        }

        setErrors('signIn', newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBiometricAuth = async () => {
        try {
            const result = await BiometricsUtils.authenticate({
                promptMessage: 'Sign in with your biometrics',
                fallbackLabel: 'Use PIN instead'
            });
            
            if (result.success) {
                // Auto-populate with a default PIN or skip PIN validation for biometric users
                updateSignInForm({ pin: '********' }); // Use placeholder
                router.replace('/(drawer)/till');
            } else {
                Alert.alert(
                    'Biometric Authentication Failed',
                    result.error || 'Please try again or use your PIN.'
                );
            }
        } catch (error) {
            console.error('Biometric authentication error:', error);
            Alert.alert(
                'Authentication Error',
                'Failed to authenticate with biometrics. Please use your PIN.'
            );
        }
    };

    const toggleBiometricMode = () => {
        setUseBiometrics(!uiState.biometric.useBiometrics);
    };

    // Enhanced animated styles for staggered entry
    const leftPanelAnimatedStyle = useAnimatedStyle(() => ({
        opacity: leftPanelOpacity.value,
        transform: [
            { translateX: leftPanelTranslateX.value },
            { scale: leftPanelScale.value },
        ],
    }));

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: logoScale.value },
            { rotate: `${logoRotate.value}deg` },
        ],
    }));

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerTranslateY.value }],
    }));

    const formAnimatedStyle = useAnimatedStyle(() => ({
        opacity: formOpacity.value,
        transform: [{ translateY: formTranslateY.value }],
    }));

    const inputAnimatedStyle = useAnimatedStyle(() => ({
        opacity: inputOpacity.value,
        transform: [{ translateY: inputTranslateY.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [{ scale: buttonScale.value }],
    }));

    const linksAnimatedStyle = useAnimatedStyle(() => ({
        opacity: linksOpacity.value,
        transform: [{ translateY: linksTranslateY.value }],
    }));

    const handleSignIn = async () => {
        if (!validateForm()) return;

        // Button press animation
        buttonScale.value = withTiming(0.95, { duration: 100 });

        try {
            await signIn(signInForm);
            buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            router.replace('/(drawer)/till');
        } catch {
            buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            Alert.alert(
                'Sign In Failed',
                'Please check your credentials and try again.'
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
                        <View className="flex flex-col gap-2 justify-center items-center p-6 space-y-2 rounded-lg bg-black/40">
                            <Animated.View
                                className="flex flex-col gap-2 items-center"
                                style={logoAnimatedStyle}
                            >
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
                            </Animated.View>
                            <Text className="px-4 -mt-14 max-w-2xl text-xl text-center text-white/80 font-primary">
                                {info?.company?.tagline}
                            </Text>
                        </View>
                    </ImageBackground>
                </Animated.View>

                {/* Right Section - Form */}
                <Animated.View
                    className="flex relative flex-col flex-1 gap-4 justify-center px-8 py-12 w-1/2 bg-white"
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
                    <View className="flex relative flex-col gap-10 justify-center items-center p-2 w-full h-full">
                        {/* Header */}
                        <Animated.View
                            className="space-y-2"
                            style={headerAnimatedStyle}
                        >
                            <Text className="text-3xl font-bold text-center text-primary font-primary">
                                {info?.auth?.signIn?.title}
                            </Text>
                            <Text className="text-lg text-center text-gray-600 font-primary">
                                {info?.auth?.signIn?.subtitle}
                            </Text>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View
                            className="flex flex-col gap-6 justify-center items-center w-full"
                            style={formAnimatedStyle}
                        >
                            {/* PIN Field or Biometric Auth */}
                            <Animated.View
                                className="flex flex-col gap-1 w-1/2"
                                style={inputAnimatedStyle}
                            >
                                {uiState.biometric.useBiometrics ? (
                                    /* Biometric Authentication Mode */
                                    <>
                                        <Text className="font-semibold text-center text-gray-700 uppercase text-md font-primary">
                                            Biometric Authentication
                                        </Text>
                                        <View className="flex flex-col gap-4 justify-center items-center p-8 w-full bg-blue-50 rounded-lg border border-blue-300">
                                            <Fingerprint size={48} color="#2d71f8" />
                                            <Text className="text-center text-gray-600 font-primary">
                                                Touch the fingerprint sensor to sign in
                                            </Text>
                                            <Pressable
                                                className="px-6 py-3 bg-blue-500 rounded-lg"
                                                onPress={handleBiometricAuth}
                                            >
                                                <Text className="font-semibold text-center text-white font-primary">
                                                    Authenticate
                                                </Text>
                                            </Pressable>
                                            <Pressable onPress={toggleBiometricMode}>
                                                <Text className="text-sm text-blue-600 font-primary">
                                                    Use PIN instead
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </>
                                ) : (
                                    /* PIN Input Mode */
                                    <>
                                        <Text className="font-semibold text-center text-gray-700 uppercase text-md font-primary">
                                            Enter Your PIN
                                        </Text>
                                        <View className="flex relative flex-row justify-center items-center w-full">
                                            <TextInput
                                                className={`w-full p-6 items-center justify-center flex-row border rounded-lg text-center text-xl font-mono tracking-wider font-primary text-primary ${
                                                    uiState.errors.signIn?.pin
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="12345678"
                                                value={signInForm.pin}
                                                onChangeText={(pin) =>
                                                    updateSignInForm({ pin })
                                                }
                                                keyboardType="numeric"
                                                maxLength={8}
                                                secureTextEntry
                                                autoCapitalize="none"
                                            />
                                            {/* Biometric Toggle Icon - Enhanced for prominence */}
                                            {uiState.biometric.available && (
                                                <Pressable
                                                    className="absolute right-4 p-3 bg-blue-500 rounded-full shadow-lg"
                                                    onPress={handleBiometricAuth}
                                                    style={{ elevation: 4 }}
                                                >
                                                    <Fingerprint size={28} color="#ffffff" />
                                                </Pressable>
                                            )}
                                        </View>
                                        {uiState.errors.signIn?.pin && (
                                            <Text className="text-sm text-red-600 font-primary">
                                                {uiState.errors.signIn.pin}
                                            </Text>
                                        )}
                                    </>
                                )}
                            </Animated.View>

                            {/* Sign In Button - Only show in PIN mode */}
                            {!uiState.biometric.useBiometrics && (
                                <Animated.View
                                    style={buttonAnimatedStyle}
                                    className="flex-col gap-2 justify-center items-center w-full"
                                >
                                    <Pressable
                                        className="justify-center items-center p-5 w-3/4 rounded-lg"
                                        style={{ backgroundColor: '#2d71f8' }}
                                        onPress={handleSignIn}
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
                                                Sign In{' '}
                                                {authState.isLoading ? '...' : ''}
                                            </Text>
                                        )}
                                    </Pressable>
                                    {/* Forgot PIN Link */}
                                    <View className="flex-row justify-center mt-2">
                                        <Link href="/(auth)/reset-password" asChild>
                                            <Pressable>
                                                <Text
                                                    className="text-blue-600 font-primary"
                                                    style={{ color: '#2d71f8' }}
                                                >
                                                    Forgot PIN?
                                                </Text>
                                            </Pressable>
                                        </Link>
                                    </View>
                                </Animated.View>
                            )}

                            {/* Error Message */}
                            {authState.error && (
                                <Text className="text-sm text-red-600 font-primary">
                                    {authState.error}
                                </Text>
                            )}
                        </Animated.View>

                        {/* Links */}
                        <Animated.View
                            className="absolute right-0 bottom-0 left-0"
                            style={linksAnimatedStyle}
                        >
                            <View className="flex-row gap-1 justify-center items-center">
                                <Text className="text-gray-600 font-primary">
                                    Don&apos;t have an account?
                                </Text>
                                <Link href="/(auth)/sign-up" asChild>
                                    <Pressable>
                                        <Text
                                            className="font-semibold text-center font-primary"
                                            style={{ color: '#2d71f8' }}
                                        >
                                            Sign Up
                                        </Text>
                                    </Pressable>
                                </Link>
                            </View>
                        </Animated.View>
                    </View>
                </Animated.View>
            </View>
        </ScrollView>
    );
}
