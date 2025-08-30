import { Text, View, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import {
    User,
    CreditCard,
    Building,
    FileText,
    Bell,
    Settings as SettingsIcon,
    ChevronRight,
    Mail,
    Eye,
    EyeOff,
    BarChart3,
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
                {
                    id: 'profile',
                    title: 'Profile Information',
                    description:
                        'Real-time information and activities of your profile.',
                },
                {
                    id: 'security',
                    title: 'Security Settings',
                    description: 'Manage your account security and privacy.',
                },
                {
                    id: 'notifications',
                    title: 'Notification Preferences',
                    description: 'Configure how you receive notifications.',
                },
            ],
        },
        {
            id: 'financial',
            title: 'Financial & payments',
            icon: <CreditCard size={24} color="#2563eb" />,
            items: [
                {
                    id: 'payment-methods',
                    title: 'Payment Methods',
                    description: 'Manage your payment methods and billing.',
                },
                {
                    id: 'transactions',
                    title: 'Transaction History',
                    description: 'View your payment and transaction history.',
                },
                {
                    id: 'invoices',
                    title: 'Invoices & Receipts',
                    description: 'Download invoices and receipts.',
                },
            ],
        },
        {
            id: 'business',
            title: 'Business Management',
            icon: <Building size={24} color="#7c3aed" />,
            items: [
                {
                    id: 'branch-settings',
                    title: 'Branch Settings',
                    description: 'Configure branch-specific settings.',
                },
                {
                    id: 'inventory',
                    title: 'Inventory Management',
                    description: 'Manage your inventory and stock levels.',
                },
                {
                    id: 'staff',
                    title: 'Staff Management',
                    description: 'Manage staff accounts and permissions.',
                },
            ],
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            icon: <FileText size={24} color="#dc2626" />,
            items: [
                {
                    id: 'sales-reports',
                    title: 'Sales Reports',
                    description: 'View detailed sales analytics and reports.',
                },
                {
                    id: 'export-data',
                    title: 'Export Data',
                    description: 'Export your data for external analysis.',
                },
                {
                    id: 'backup',
                    title: 'Backup & Restore',
                    description: 'Backup and restore your business data.',
                },
            ],
        },
    ];

    const systemSettings: SettingsSection[] = [
        {
            id: 'notifications',
            title: 'Notifications',
            icon: <Bell size={24} color="#f59e0b" />,
            items: [
                {
                    id: 'push-notifications',
                    title: 'Push Notifications',
                    description: 'Configure push notification settings.',
                },
                {
                    id: 'email-notifications',
                    title: 'Email Notifications',
                    description: 'Manage email notification preferences.',
                },
                {
                    id: 'sms-notifications',
                    title: 'SMS Notifications',
                    description: 'Configure SMS notification settings.',
                },
            ],
        },
        {
            id: 'preferences',
            title: 'Preferences',
            icon: <SettingsIcon size={24} color="#6b7280" />,
            items: [
                {
                    id: 'theme',
                    title: 'Theme Settings',
                    description: 'Customize the appearance of your app.',
                },
                {
                    id: 'language',
                    title: 'Language & Region',
                    description: 'Set your preferred language and region.',
                },
                {
                    id: 'accessibility',
                    title: 'Accessibility',
                    description: 'Configure accessibility options.',
                },
            ],
        },
    ];

    const renderSettingsSection = (section: SettingsSection) => (
        <View key={section.id} className="flex-col gap-4">
            <View className="flex-row gap-3 items-center">
                {section.icon}
                <Text className="text-lg font-semibold text-gray-900 font-primary">
                    {section.title}
                </Text>
            </View>

            <View className="bg-white rounded-lg border border-gray-200">
                {section.items.map((item, index) => (
                    <Pressable
                        key={item.id}
                        onPress={item.action}
                        className={`p-4 flex-row items-center justify-between ${
                            index !== section.items.length - 1
                                ? 'border-b border-gray-100'
                                : ''
                        }`}
                    >
                        <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 font-primary">
                                {item.title}
                            </Text>
                            {item.description && (
                                <Text className="mt-1 text-sm text-gray-600 font-primary">
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
            <ScrollView className="flex-1">
                <View className="flex-col gap-6 px-6">
                    {/* Header */}
                    <View>
                        <Text className="text-2xl font-bold text-gray-900 font-primary">
                            Settings
                        </Text>
                        <Text className="text-sm text-gray-600 font-primary">
                            Manage your account and application preferences
                        </Text>
                    </View>

                    {/* Account Details Card */}
                    <View>
                        <Text className="text-lg font-semibold text-gray-900 font-primary">
                            Account Details
                        </Text>

                        <View className="p-6 mt-4 bg-white rounded-lg border border-gray-200">
                            <View className="flex-col gap-6">
                                {/* Profile Picture */}
                                <View>
                                    <Text className="mb-3 text-sm font-semibold text-gray-700 font-primary">
                                        Profile Picture
                                    </Text>
                                    <View className="flex-row gap-4 items-center">
                                        <View className="justify-center items-center w-16 h-16 rounded-full bg-primary">
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
                                    <Text className="mt-2 text-xs text-gray-500 font-primary">
                                        PNG, JPEG under 15MB
                                    </Text>
                                </View>

                                {/* Full Name */}
                                <View>
                                    <Text className="mb-3 text-sm font-semibold text-gray-700 font-primary">
                                        Full name
                                    </Text>
                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <Text className="mb-2 text-xs text-gray-600 font-primary">
                                                First name
                                            </Text>
                                            <View className="p-3 rounded-lg border border-gray-300">
                                                <Text className="text-gray-900 font-primary">
                                                    {user?.firstName ||
                                                        'Brandon'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="mb-2 text-xs text-gray-600 font-primary">
                                                Last name
                                            </Text>
                                            <View className="p-3 rounded-lg border border-gray-300">
                                                <Text className="text-gray-900 font-primary">
                                                    {user?.lastName || 'Nkawu'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Contact Email */}
                                <View>
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        Contact email
                                    </Text>
                                    <Text className="mb-3 text-xs text-gray-600 font-primary">
                                        Manage your accounts email address for
                                        the invoices.
                                    </Text>
                                    <View className="flex-row gap-3 items-center">
                                        <View className="flex-row flex-1 items-center p-3 rounded-lg border border-gray-300">
                                            <Mail size={16} color="#6b7280" />
                                            <Text className="ml-2 text-gray-900 font-primary">
                                                {user?.email ||
                                                    'brandon.nkawu@orrbit.co.za'}
                                            </Text>
                                        </View>
                                        <Pressable className="flex-row gap-2 items-center px-4 py-3 rounded-lg border border-blue-200">
                                            <Text className="font-semibold text-blue-600 font-primary">
                                                Add another email
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>

                                {/* Password */}
                                <View>
                                    <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">
                                        Password
                                    </Text>
                                    <Text className="mb-3 text-xs text-gray-600 font-primary">
                                        Modify your current password.
                                    </Text>
                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <Text className="mb-2 text-xs text-gray-600 font-primary">
                                                Current password
                                            </Text>
                                            <View className="flex-row items-center p-3 rounded-lg border border-gray-300">
                                                <Text className="flex-1 text-gray-900 font-primary">
                                                    {showPassword
                                                        ? '12345678'
                                                        : '••••••••'}
                                                </Text>
                                                <Pressable
                                                    onPress={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff
                                                            size={16}
                                                            color="#6b7280"
                                                        />
                                                    ) : (
                                                        <Eye
                                                            size={16}
                                                            color="#6b7280"
                                                        />
                                                    )}
                                                </Pressable>
                                            </View>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="mb-2 text-xs text-gray-600 font-primary">
                                                New password
                                            </Text>
                                            <View className="flex-row items-center p-3 rounded-lg border border-gray-300">
                                                <Text className="flex-1 text-gray-900 font-primary">
                                                    {showNewPassword
                                                        ? '••••••••'
                                                        : '••••••••'}
                                                </Text>
                                                <Pressable
                                                    onPress={() =>
                                                        setShowNewPassword(
                                                            !showNewPassword
                                                        )
                                                    }
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff
                                                            size={16}
                                                            color="#6b7280"
                                                        />
                                                    ) : (
                                                        <Eye
                                                            size={16}
                                                            color="#6b7280"
                                                        />
                                                    )}
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Settings Sections */}
                    <View className="flex-col gap-6">
                        {/* General Section */}
                        <View>
                            <Text className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase font-primary">
                                GENERAL
                            </Text>
                            <View className="flex-col gap-6">
                                {generalSettings.map(renderSettingsSection)}
                            </View>
                        </View>

                        {/* System Section */}
                        <View>
                            <Text className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase font-primary">
                                SYSTEM
                            </Text>
                            <View className="flex-col gap-6">
                                {systemSettings.map(renderSettingsSection)}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </BaseProvider>
    );
}
