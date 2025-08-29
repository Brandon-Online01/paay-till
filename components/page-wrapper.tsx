import { ReactNode } from 'react';
import { View, SafeAreaView } from 'react-native';
import Header from './header';

interface PageWrapperProps {
    children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
    return (
        <SafeAreaView className="flex-1 bg-gray-200/10">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <View className="flex-1">
                <View className="flex-1">{children}</View>
            </View>
        </SafeAreaView>
    );
}
