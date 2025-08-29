import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View, Pressable, ImageBackground } from 'react-native';
import { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';

export default function Index() {
    // Enhanced animation values for staggered landing page entry
    const backgroundOpacity = useSharedValue(0);
    
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.3);
    const logoRotate = useSharedValue(-20);
    
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(30);
    
    const buttonOpacity = useSharedValue(0);
    const buttonScale = useSharedValue(0.8);
    const buttonTranslateY = useSharedValue(20);

    useEffect(() => {
        // Staggered entrance animations for landing page
        // 1. Background fades in
        setTimeout(() => {
            backgroundOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
        }, 200);

        // 2. Logo appears with scale and rotation
        setTimeout(() => {
            logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });
            logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
            logoRotate.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.back(1.2)) });
        }, 600);

        // 3. Text content slides in from bottom
        setTimeout(() => {
            textOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) });
            textTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        }, 1000);

        // 4. Button appears with scale and slide
        setTimeout(() => {
            buttonOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });
            buttonScale.value = withSpring(1, { damping: 12, stiffness: 150 });
            buttonTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        }, 1400);
    }, []);

    // Animated styles
    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
    }));

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [
            { scale: logoScale.value },
            { rotate: `${logoRotate.value}deg` }
        ],
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [
            { scale: buttonScale.value },
            { translateY: buttonTranslateY.value }
        ],
    }));

    return (
        <Animated.View style={[{ flex: 1 }, backgroundAnimatedStyle]}>
            <ImageBackground
                source={require('../assets/images/waves.jpg')}
                className="flex-1"
                resizeMode="cover"
            >
                <View className="flex-1 justify-center items-center min-h-screen">
                    <View className="flex flex-col justify-center items-center p-8">
                        {/* Logo Section */}
                        <Animated.View className="flex flex-col gap-2 items-center" style={logoAnimatedStyle}>
                            <Image
                                source={require('../assets/images/logo.png')}
                                className="rounded-2xl"
                                contentFit="contain"
                                transition={300}
                                style={{
                                    width: 250,
                                    height: 250,
                                }}
                            />
                        </Animated.View>

                        {/* Subtitle */}
                        <View className="flex flex-col gap-4 items-center -mt-14">
                            <Animated.View style={textAnimatedStyle}>
                                <Text className="max-w-2xl text-lg leading-relaxed text-center text-white/90 font-primary">
                                    The ultimate POS solution for SMEs, designed for
                                    effortless setup and intuitive use, delivering
                                    groundbreaking accessibility like never before.
                                </Text>
                            </Animated.View>
                            <Animated.View style={buttonAnimatedStyle}>
                                <Link href="/(auth)/sign-in" asChild>
                                    <Pressable className="px-8 py-4 bg-blue-600 rounded-lg">
                                        <Text className="text-lg font-bold text-white uppercase font-primary">
                                            Get Started
                                        </Text>
                                    </Pressable>
                                </Link>
                            </Animated.View>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </Animated.View>
    );
}
