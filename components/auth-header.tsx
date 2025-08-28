import React from 'react';
import { View, Pressable } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { User, LogIn } from 'lucide-react-native';
import info from '../data/info.json';

export default function AuthHeader() {
    const pathname = usePathname();
    const isSignUpPage = pathname.includes('/sign-up');

    return (
        <View className="flex-row justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
            {/* Logo/Company Name */}
            <View className="flex-row items-center">
                <Pressable className="flex-row items-center">
                    <View className="w-8 h-8 bg-blue-600 rounded-full justify-center items-center mr-2">
                        <LogIn size={16} color="#ffffff" />
                    </View>
                    <View className="text-lg font-semibold text-gray-900">
                        {info?.company?.name || 'Orrbit'}
                    </View>
                </Pressable>
            </View>

            {/* Navigation Actions */}
            <View className="flex-row items-center space-x-4">
                {isSignUpPage ? (
                    // On Sign Up page, show Sign In as user icon link
                    <Link href="/(auth)/sign-in" asChild>
                        <Pressable className="flex-row items-center p-2 rounded-full hover:bg-gray-100">
                            <User size={20} color="#6b7280" />
                        </Pressable>
                    </Link>
                ) : (
                    // On other auth pages, show Sign Up as prominent button
                    <Link href="/(auth)/sign-up" asChild>
                        <Pressable className="flex-row items-center px-4 py-2 bg-blue-600 rounded-lg">
                            <LogIn size={16} color="#ffffff" />
                            <View className="ml-2 text-white font-medium">
                                Sign Up
                            </View>
                        </Pressable>
                    </Link>
                )}
            </View>
        </View>
    );
}
