import { Text, View } from 'react-native';
import BaseProvider from '@/providers/base.provider';

export default function Settings() {
    return (
        <BaseProvider>
            <View className="flex-1 gap-6 justify-center items-center px-6 bg-gray-200/20">
                <Text className="mb-8 text-xl font-bold text-center text-gray-800 font-primary">
                    Inventory Page
                </Text>

                <Text className="text-base text-center text-gray-600 font-primary">
                    Inventory functionality coming soon...
                </Text>
            </View>
        </BaseProvider>
    );
}
