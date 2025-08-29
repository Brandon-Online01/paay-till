import { Text, View, ScrollView, Pressable, Image } from 'react-native';
import { useState } from 'react';
import { 
    User, 
    CreditCard, 
    Users, 
    Building, 
    FileText, 
    Bell, 
    Settings as SettingsIcon, 
    ChevronRight,
    Upload,
    Mail,
    Phone,
    Shield,
    Eye,
    EyeOff,
    BarChart3
} from 'lucide-react-native';
import BaseProvider from '@/providers/base.provider';
import info from '@/data/info.json';

interface SettingsSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    items: SettingsItem[];
}

interface SettingsItem {
    id: string;
    title: string;
    description?: string;
    action?: () => void;
}

export default function Settings() {
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const user = info?.user;

    const generalSettings: SettingsSection[] = [
        {
            id: 'account',
            title: 'Account',
            icon: <User size={24} color="#059669" />,
            items: [
                { id: 'profile', title: 'Profile Information', description: 'Real-time information and activities of your profile.' },
                { id: 'security', title: 'Security Settings', description: 'Manage your account security and privacy.' },
                { id: 'notifications', title: 'Notification Preferences', description: 'Configure how you receive notifications.' },
            ]
        },
        {
            id: 'financial',
            title: 'Financial & payments',
            icon: <CreditCard size={24} color="#2563eb" />,
            items: [
                { id: 'payment-methods', title: 'Payment Methods', description: 'Manage your payment methods and billing.' },
                { id: 'transactions', title: 'Transaction History', description: 'View your payment and transaction history.' },
                { id: 'invoices', title: 'Invoices & Receipts', description: 'Download invoices and receipts.' },
            ]
        },
        {
            id: 'business',
            title: 'Business Management',
            icon: <Building size={24} color="#7c3aed" />,
            items: [
                { id: 'branch-settings', title: 'Branch Settings', description: 'Configure branch-specific settings.' },
                { id: 'inventory', title: 'Inventory Management', description: 'Manage your inventory and stock levels.' },
                { id: 'staff', title: 'Staff Management', description: 'Manage staff accounts and permissions.' },
            ]
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            icon: <FileText size={24} color="#dc2626" />,
            items: [
                { id: 'sales-reports', title: 'Sales Reports', description: 'View detailed sales analytics and reports.' },
                { id: 'export-data', title: 'Export Data', description: 'Export your data for external analysis.' },
                { id: 'backup', title: 'Backup & Restore', description: 'Backup and restore your business data.' },
            ]
        }
    ];

    const systemSettings: SettingsSection[] = [
        {
            id: 'notifications',
            title: 'Notifications',
            icon: <Bell size={24} color="#f59e0b" />,
            items: [
                { id: 'push-notifications', title: 'Push Notifications', description: 'Configure push notification settings.' },
                { id: 'email-notifications', title: 'Email Notifications', description: 'Manage email notification preferences.' },
                { id: 'sms-notifications', title: 'SMS Notifications', description: 'Configure SMS notification settings.' },
            ]
        },
        {
            id: 'preferences',
            title: 'Preferences',
            icon: <SettingsIcon size={24} color="#6b7280" />,
            items: [
                { id: 'theme', title: 'Theme Settings', description: 'Customize the appearance of your app.' },
                { id: 'language', title: 'Language & Region', description: 'Set your preferred language and region.' },
                { id: 'accessibility', title: 'Accessibility', description: 'Configure accessibility options.' },
            ]
        }
    ];

    const renderSettingsSection = (section: SettingsSection) => (
        <View key={section.id} className="mb-6">
            <View className="flex-row items-center gap-3 mb-4 px-6">
                {section.icon}
                <Text className="text-lg font-semibold text-gray-900 font-primary">
                    {section.title}
                </Text>
            </View>
            
            <View className="mx-6 bg-white rounded-lg border border-gray-200">
                {section.items.map((item, index) => (
                    <Pressable
                        key={item.id}
                        onPress={item.action}
                        className={`p-4 flex-row items-center justify-between ${
                            index !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                    >
                        <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 font-primary">
                                {item.title}
                            </Text>
                            {item.description && (
                                <Text className="text-sm text-gray-600 font-primary mt-1">
                                    {item.description}
                                </Text>
                            )}
                        </View>
                        <ChevronRight size={20} color="#9ca3af" />
                    </Pressable>
                ))}
            </View>
        </View>
    );

    return (
        <BaseProvider>
            <ScrollView className="flex-1 bg-gray-50">
                {/* Header */}
                <View className="px-6 py-6 bg-white border-b border-gray-200">
                    <Text className="text-2xl font-bold text-gray-900 font-primary">
                        Settings
                    </Text>
                    <Text className="text-sm text-gray-600 font-primary mt-1">
                        Manage your account and application preferences
                    </Text>
                </View>

                {/* Profile Summary */}
                <View className="mx-6 mt-6 p-6 bg-white rounded-lg border border-gray-200">
                    <View className="flex-row items-center gap-4">
                        <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
                            <Text className="text-xl font-bold text-white font-primary">
                                {user?.initials || 'BN'}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 font-primary">
                                {user?.fullName || 'Brandon Nkawu'}
                            </Text>
                            <Text className="text-sm text-gray-600 font-primary">
                                {user?.title || 'Software Engineer | Orrbit Technologies'}
                            </Text>
                            <Text className="text-sm text-gray-500 font-primary">
                                {user?.email || 'brandon.nkawu@orrbit.co.za'}
                            </Text>
                        </View>
                        <Pressable className="p-2 rounded-lg bg-gray-100">
                            <Upload size={20} color="#6b7280" />
                        </Pressable>
                    </View>
                </View>

                {/* Account Section */}
                <View className="mt-8">
                    <Text className="px-6 mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide font-primary">
                        GENERAL
                    </Text>
                    {generalSettings.map(renderSettingsSection)}
                </View>

                {/* System Section */}
                <View className="mt-4">
                    <Text className="px-6 mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide font-primary">
                        SYSTEM
                    </Text>
                    {systemSettings.map(renderSettingsSection)}
                </View>

                {/* Account Details Card */}
                <View className="mx-6 mt-6 mb-8">
                    <Text className="mb-4 text-lg font-semibold text-gray-900 font-primary">
                        Account Details
                    </Text>
                    
                    <View className="bg-white rounded-lg border border-gray-200 p-6">
                        {/* Profile Picture */}
                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-gray-700 mb-3 font-primary">
                                Profile Picture
                            </Text>
                            <View className="flex-row items-center gap-4">
                                <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
                                    <Text className="text-xl font-bold text-white font-primary">
                                        {user?.initials || 'BN'}
                                    </Text>
                                </View>
                                <View className="flex-row gap-3">
                                    <Pressable className="px-4 py-2 bg-gray-100 rounded-lg">
                                        <Text className="text-sm font-semibold text-gray-700 font-primary">
                                            Upload new picture
                                        </Text>
                                    </Pressable>
                                    <Pressable className="px-4 py-2 bg-red-500 rounded-lg">
                                        <Text className="text-sm font-semibold text-white font-primary">
                                            Delete
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                            <Text className="text-xs text-gray-500 mt-2 font-primary">
                                PNG, JPEG under 15MB
                            </Text>
                        </View>

                        {/* Full Name */}
                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-gray-700 mb-3 font-primary">
                                Full name
                            </Text>
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Text className="text-xs text-gray-600 mb-2 font-primary">First name</Text>
                                    <View className="p-3 border border-gray-300 rounded-lg">
                                        <Text className="text-gray-900 font-primary">
                                            {user?.firstName || 'Brandon'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-gray-600 mb-2 font-primary">Last name</Text>
                                    <View className="p-3 border border-gray-300 rounded-lg">
                                        <Text className="text-gray-900 font-primary">
                                            {user?.lastName || 'Nkawu'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Contact Email */}
                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-gray-700 mb-2 font-primary">
                                Contact email
                            </Text>
                            <Text className="text-xs text-gray-600 mb-3 font-primary">
                                Manage your accounts email address for the invoices.
                            </Text>
                            <View className="flex-row items-center gap-3">
                                <View className="flex-1 flex-row items-center p-3 border border-gray-300 rounded-lg">
                                    <Mail size={16} color="#6b7280" />
                                    <Text className="ml-2 text-gray-900 font-primary">
                                        {user?.email || 'brandon.nkawu@orrbit.co.za'}
                                    </Text>
                                </View>
                                <Pressable className="flex-row items-center gap-2 px-4 py-3 border border-blue-200 rounded-lg">
                                    <Text className="text-blue-600 font-semibold font-primary">
                                        Add another email
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Password */}
                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-gray-700 mb-2 font-primary">
                                Password
                            </Text>
                            <Text className="text-xs text-gray-600 mb-3 font-primary">
                                Modify your current password.
                            </Text>
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Text className="text-xs text-gray-600 mb-2 font-primary">Current password</Text>
                                    <View className="flex-row items-center p-3 border border-gray-300 rounded-lg">
                                        <Text className="flex-1 text-gray-900 font-primary">
                                            {showPassword ? '12345678' : '••••••••'}
                                        </Text>
                                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <EyeOff size={16} color="#6b7280" />
                                            ) : (
                                                <Eye size={16} color="#6b7280" />
                                            )}
                                        </Pressable>
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-gray-600 mb-2 font-primary">New password</Text>
                                    <View className="flex-row items-center p-3 border border-gray-300 rounded-lg">
                                        <Text className="flex-1 text-gray-900 font-primary">
                                            {showNewPassword ? '••••••••' : '••••••••'}
                                        </Text>
                                        <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? (
                                                <EyeOff size={16} color="#6b7280" />
                                            ) : (
                                                <Eye size={16} color="#6b7280" />
                                            )}
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Integrated Accounts */}
                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-gray-700 mb-2 font-primary">
                                Integrated account
                            </Text>
                            <Text className="text-xs text-gray-600 mb-3 font-primary">
                                Manage your current integrated accounts.
                </Text>

                            <View className="space-y-3">
                                <View className="flex-row items-center justify-between p-4 border border-gray-200 rounded-lg mb-3">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-8 h-8 bg-orange-100 rounded items-center justify-center">
                                            <BarChart3 size={16} color="#f59e0b" />
                                        </View>
                                        <View>
                                            <Text className="font-semibold text-gray-900 font-primary">
                                                Google analytics
                                            </Text>
                                            <Text className="text-xs text-gray-600 font-primary">
                                                Navigate the Google Analytics interface and reports.
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="px-3 py-1 bg-green-100 rounded-full">
                                        <Text className="text-xs font-semibold text-green-800 font-primary">
                                            Connected
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-8 h-8 bg-blue-100 rounded items-center justify-center">
                                            <Text className="text-blue-600 font-bold font-primary">G</Text>
                                        </View>
                                        <View>
                                            <Text className="font-semibold text-gray-900 font-primary">
                                                Google analytics
                                            </Text>
                                            <Text className="text-xs text-gray-600 font-primary">
                                                Navigate the Google Analytics interface and reports.
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="px-3 py-1 bg-green-100 rounded-full">
                                        <Text className="text-xs font-semibold text-green-800 font-primary">
                                            Connected
                </Text>
            </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </BaseProvider>
    );
}