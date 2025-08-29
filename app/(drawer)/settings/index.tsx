import { Text, View } from 'react-native';
import BaseProvider from '@/providers/base.provider';

export default function Settings() {
    return (
        <BaseProvider>
            <View className="flex-1 items-center justify-center gap-6 px-6 bg-gray-200/20">
                <Text className="text-center font-primary text-xl font-bold text-gray-800 mb-8">
                    Settings Page
                </Text>

                <Text className="text-center font-primary text-base text-gray-600">
                    Settings functionality coming soon...
                </Text>
            </View>
        </BaseProvider>
    );
}
