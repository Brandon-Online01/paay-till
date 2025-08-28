import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View, Pressable, ImageBackground } from 'react-native';

export default function Index() {
    return (
        <ImageBackground
            source={require('../assets/images/waves.jpg')}
            className="flex-1"
            resizeMode="cover"
        >
            <View className="flex-1 justify-center items-center min-h-screen">
                <View className="flex flex-col justify-center items-center p-8">
                    {/* Logo Section */}
                    <View className="flex flex-col gap-2 items-center">
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
                    </View>

                    {/* Subtitle */}
                    <View className="flex flex-col gap-4 items-center -mt-14">
                        <Text className="max-w-2xl text-lg leading-relaxed text-center text-white/90 font-primary">
                            The ultimate POS solution for SMEs, designed for
                            effortless setup and intuitive use, delivering
                            groundbreaking accessibility like never before.
                        </Text>
                        <Link href="/(auth)/sign-in" asChild>
                            <Pressable className="px-8 py-4 bg-blue-600 rounded-lg">
                                <Text className="text-lg font-bold text-white uppercase font-primary">
                                    Get Started
                                </Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
}
