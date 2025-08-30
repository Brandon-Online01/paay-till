import { Text, View, ScrollView, Pressable, Modal, TextInput, Alert } from 'react-native';
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
    Save,
    Plus,
    X,
    Smartphone,
    Calendar,
    MessageCircle,
    ArrowLeftRight,
    DollarSign,
    Zap,
} from 'lucide-react-native';
import BaseProvider from '@/providers/base.provider';
import info from '@/data/info.json';
import { useLayoutStore } from '@/store/layout.store';

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

interface UserProfile {
    firstName: string;
    lastName: string;
    emails: string[];
    currentPassword: string;
    newPassword: string;
}

interface IntegrationSettings {
    whatsapp: { enabled: boolean; apiKey: string; };
    email: { enabled: boolean; smtpServer: string; };
    calendar: { enabled: boolean; provider: string; };
    payments: {
        ozow: { enabled: boolean; merchantId: string; };
        payfast: { enabled: boolean; merchantId: string; };
        peach: { enabled: boolean; apiKey: string; };
        stripe: { enabled: boolean; publishableKey: string; };
    };
}

export default function Settings() {
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // Layout store
    const { cartPosition, setCartPosition } = useLayoutStore();
    
    // User profile state
    const [userProfile, setUserProfile] = useState<UserProfile>({
        firstName: info?.user?.firstName || 'Brandon',
        lastName: info?.user?.lastName || 'Nkawu',
        emails: [info?.user?.email || 'brandon.nkawu@orrbit.co.za'],
        currentPassword: '',
        newPassword: '',
    });
    
    // Integration settings state
    const [integrations, setIntegrations] = useState<IntegrationSettings>({
        whatsapp: { enabled: false, apiKey: '' },
        email: { enabled: false, smtpServer: '' },
        calendar: { enabled: false, provider: 'google' },
        payments: {
            ozow: { enabled: false, merchantId: '' },
            payfast: { enabled: false, merchantId: '' },
            peach: { enabled: false, apiKey: '' },
            stripe: { enabled: false, publishableKey: '' },
        },
    });

    const user = info?.user;

    // Save functions
    const saveUserProfile = () => {
        console.log('Saving user profile:', userProfile);
        // TODO: Implement actual save logic
        Alert.alert('Success', 'Profile saved successfully!');
        setHasUnsavedChanges(false);
    };
    
    const saveIntegrations = () => {
        console.log('Saving integrations:', integrations);
        // TODO: Implement actual save logic
        Alert.alert('Success', 'Integration settings saved successfully!');
    };
    
    const addEmailField = () => {
        setUserProfile(prev => ({
            ...prev,
            emails: [...prev.emails, '']
        }));
        setHasUnsavedChanges(true);
    };
    
    const removeEmailField = (index: number) => {
        if (userProfile.emails.length > 1) {
            setUserProfile(prev => ({
                ...prev,
                emails: prev.emails.filter((_, i) => i !== index)
            }));
            setHasUnsavedChanges(true);
        }
    };
    
    const updateEmailField = (index: number, value: string) => {
        setUserProfile(prev => ({
            ...prev,
            emails: prev.emails.map((email, i) => i === index ? value : email)
        }));
        setHasUnsavedChanges(true);
    };

    const generalSettings: SettingsSection[] = [
        {
            id: 'account',
            title: 'Account',
            icon: <User size={24} color="#059669" />,
            items: [
                {
                    id: 'profile',
                    title: 'Profile Information',
                    description: 'Real-time information and activities of your profile.',
                    action: () => setActiveModal('profile'),
                },
                {
                    id: 'security',
                    title: 'Security Settings',
                    description: 'Manage your account security and privacy.',
                    action: () => setActiveModal('security'),
                },
            ],
        },
        {
            id: 'integrations',
            title: 'Integrations',
            icon: <Zap size={24} color="#f59e0b" />,
            items: [
                {
                    id: 'communications',
                    title: 'Communications',
                    description: 'WhatsApp, Email, and Calendar integrations.',
                    action: () => setActiveModal('communications'),
                },
                {
                    id: 'payments',
                    title: 'Payment Gateways',
                    description: 'Ozow, PayFast, Peach, and Stripe integrations.',
                    action: () => setActiveModal('payments'),
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
                    action: () => setActiveModal('branch'),
                },
                {
                    id: 'staff',
                    title: 'Staff Management',
                    description: 'Manage staff accounts and permissions.',
                    action: () => setActiveModal('staff'),
                },
            ],
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            icon: <FileText size={24} color="#dc2626" />,
            items: [
                {
                    id: 'export-data',
                    title: 'Export Data',
                    description: 'Export your data for external analysis.',
                    action: () => setActiveModal('export'),
                },
                {
                    id: 'backup',
                    title: 'Backup & Restore',
                    description: 'Backup and restore your business data.',
                    action: () => setActiveModal('backup'),
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
                    action: () => setActiveModal('notifications'),
                },
            ],
        },
        {
            id: 'preferences',
            title: 'Interface Preferences',
            icon: <ArrowLeftRight size={24} color="#6b7280" />,
            items: [
                {
                    id: 'layout',
                    title: 'Layout Direction',
                    description: 'Set cart position and interface direction.',
                    action: () => setActiveModal('layout'),
                },
                {
                    id: 'language',
                    title: 'Language & Region',
                    description: 'Set your preferred language and region.',
                    action: () => setActiveModal('language'),
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
    
    // Modal components
    const renderProfileModal = () => (
        <Modal visible={activeModal === 'profile'} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-11/12 max-w-lg bg-white rounded-2xl p-6 max-h-4/5">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900 font-primary">Profile Information</Text>
                        <Pressable onPress={() => setActiveModal(null)} className="p-2">
                            <X size={24} color="#6b7280" />
                        </Pressable>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* First Name */}
                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">First Name</Text>
                            <TextInput
                                value={userProfile.firstName}
                                onChangeText={(value) => {
                                    setUserProfile(prev => ({ ...prev, firstName: value }));
                                    setHasUnsavedChanges(true);
                                }}
                                className="p-3 border border-gray-300 rounded-lg font-primary"
                                placeholder="Enter first name"
                            />
                        </View>
                        
                        {/* Last Name */}
                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold text-gray-700 font-primary">Last Name</Text>
                            <TextInput
                                value={userProfile.lastName}
                                onChangeText={(value) => {
                                    setUserProfile(prev => ({ ...prev, lastName: value }));
                                    setHasUnsavedChanges(true);
                                }}
                                className="p-3 border border-gray-300 rounded-lg font-primary"
                                placeholder="Enter last name"
                            />
                        </View>
                        
                        {/* Email Addresses */}
                        <View className="mb-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-sm font-semibold text-gray-700 font-primary">Email Addresses</Text>
                                <Pressable onPress={addEmailField} className="flex-row items-center p-2 bg-blue-50 rounded-lg">
                                    <Plus size={16} color="#2563eb" />
                                    <Text className="ml-1 text-sm font-medium text-blue-600 font-primary">Add</Text>
                                </Pressable>
                            </View>
                            
                            {userProfile.emails.map((email, index) => (
                                <View key={index} className="flex-row items-center mb-2">
                                    <TextInput
                                        value={email}
                                        onChangeText={(value) => updateEmailField(index, value)}
                                        className="flex-1 p-3 border border-gray-300 rounded-lg font-primary mr-2"
                                        placeholder="Enter email address"
                                        keyboardType="email-address"
                                    />
                                    {userProfile.emails.length > 1 && (
                                        <Pressable onPress={() => removeEmailField(index)} className="p-2">
                                            <X size={20} color="#ef4444" />
                                        </Pressable>
                                    )}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                    
                    <Pressable
                        onPress={saveUserProfile}
                        disabled={!hasUnsavedChanges}
                        className={`flex-row items-center justify-center p-3 rounded-lg mt-4 ${
                            hasUnsavedChanges ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    >
                        <Save size={20} color="#ffffff" />
                        <Text className="ml-2 font-semibold text-white font-primary">Save Changes</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
    
    const renderLayoutModal = () => (
        <Modal visible={activeModal === 'layout'} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-11/12 max-w-lg bg-white rounded-2xl p-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900 font-primary">Layout Settings</Text>
                        <Pressable onPress={() => setActiveModal(null)} className="p-2">
                            <X size={24} color="#6b7280" />
                        </Pressable>
                    </View>
                    
                    <View className="mb-6">
                        <Text className="mb-3 text-sm font-semibold text-gray-700 font-primary">Cart Position</Text>
                        <Text className="mb-4 text-xs text-gray-600 font-primary">Choose where the shopping cart appears on the till interface.</Text>
                        
                        <View className="space-y-2">
                            <Pressable
                                onPress={() => setCartPosition('left')}
                                className={`flex-row items-center p-3 rounded-lg border ${
                                    cartPosition === 'left' ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
                                }`}
                            >
                                <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                    cartPosition === 'left' ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                                }`} />
                                <Text className="text-gray-900 font-primary">Left Side</Text>
                            </Pressable>
                            
                            <Pressable
                                onPress={() => setCartPosition('right')}
                                className={`flex-row items-center p-3 rounded-lg border ${
                                    cartPosition === 'right' ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
                                }`}
                            >
                                <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                    cartPosition === 'right' ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                                }`} />
                                <Text className="text-gray-900 font-primary">Right Side (Default)</Text>
                            </Pressable>
                        </View>
                    </View>
                    
                    <Pressable
                        onPress={() => {
                            Alert.alert('Success', 'Layout settings saved!');
                            setActiveModal(null);
                        }}
                        className="flex-row items-center justify-center p-3 bg-green-500 rounded-lg"
                    >
                        <Save size={20} color="#ffffff" />
                        <Text className="ml-2 font-semibold text-white font-primary">Save Settings</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
    
    const renderIntegrationsModal = (type: 'communications' | 'payments') => (
        <Modal visible={activeModal === type} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-11/12 max-w-lg bg-white rounded-2xl p-6 max-h-4/5">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900 font-primary">
                            {type === 'communications' ? 'Communication' : 'Payment'} Integrations
                        </Text>
                        <Pressable onPress={() => setActiveModal(null)} className="p-2">
                            <X size={24} color="#6b7280" />
                        </Pressable>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {type === 'communications' ? (
                            <View>
                                {/* WhatsApp */}
                                <View className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <View className="flex-row items-center mb-2">
                                        <MessageCircle size={20} color="#25d366" />
                                        <Text className="ml-2 font-semibold text-gray-900 font-primary">WhatsApp</Text>
                                    </View>
                                    <TextInput
                                        value={integrations.whatsapp.apiKey}
                                        onChangeText={(value) => setIntegrations(prev => ({
                                            ...prev,
                                            whatsapp: { ...prev.whatsapp, apiKey: value }
                                        }))}
                                        placeholder="Enter WhatsApp API Key"
                                        className="p-3 border border-gray-300 rounded-lg font-primary"
                                    />
                                </View>
                                
                                {/* Email */}
                                <View className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <View className="flex-row items-center mb-2">
                                        <Mail size={20} color="#3b82f6" />
                                        <Text className="ml-2 font-semibold text-gray-900 font-primary">Email</Text>
                                    </View>
                                    <TextInput
                                        value={integrations.email.smtpServer}
                                        onChangeText={(value) => setIntegrations(prev => ({
                                            ...prev,
                                            email: { ...prev.email, smtpServer: value }
                                        }))}
                                        placeholder="Enter SMTP Server"
                                        className="p-3 border border-gray-300 rounded-lg font-primary"
                                    />
                                </View>
                                
                                {/* Calendar */}
                                <View className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <View className="flex-row items-center mb-2">
                                        <Calendar size={20} color="#f59e0b" />
                                        <Text className="ml-2 font-semibold text-gray-900 font-primary">Calendar</Text>
                                    </View>
                                    <Text className="text-sm text-gray-600 font-primary mb-2">Provider: {integrations.calendar.provider}</Text>
                                </View>
                            </View>
                        ) : (
                            <View>
                                {/* Ozow */}
                                <View className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <View className="flex-row items-center mb-2">
                                        <DollarSign size={20} color="#10b981" />
                                        <Text className="ml-2 font-semibold text-gray-900 font-primary">Ozow</Text>
                                    </View>
                                    <TextInput
                                        value={integrations.payments.ozow.merchantId}
                                        onChangeText={(value) => setIntegrations(prev => ({
                                            ...prev,
                                            payments: { ...prev.payments, ozow: { ...prev.payments.ozow, merchantId: value } }
                                        }))}
                                        placeholder="Enter Ozow Merchant ID"
                                        className="p-3 border border-gray-300 rounded-lg font-primary"
                                    />
                                </View>
                                
                                {/* PayFast */}
                                <View className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <View className="flex-row items-center mb-2">
                                        <CreditCard size={20} color="#dc2626" />
                                        <Text className="ml-2 font-semibold text-gray-900 font-primary">PayFast</Text>
                                    </View>
                                    <TextInput
                                        value={integrations.payments.payfast.merchantId}
                                        onChangeText={(value) => setIntegrations(prev => ({
                                            ...prev,
                                            payments: { ...prev.payments, payfast: { ...prev.payments.payfast, merchantId: value } }
                                        }))}
                                        placeholder="Enter PayFast Merchant ID"
                                        className="p-3 border border-gray-300 rounded-lg font-primary"
                                    />
                                </View>
                                
                                {/* Peach Payments */}
                                <View className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <View className="flex-row items-center mb-2">
                                        <Smartphone size={20} color="#f97316" />
                                        <Text className="ml-2 font-semibold text-gray-900 font-primary">Peach Payments</Text>
                                    </View>
                                    <TextInput
                                        value={integrations.payments.peach.apiKey}
                                        onChangeText={(value) => setIntegrations(prev => ({
                                            ...prev,
                                            payments: { ...prev.payments, peach: { ...prev.payments.peach, apiKey: value } }
                                        }))}
                                        placeholder="Enter Peach API Key"
                                        className="p-3 border border-gray-300 rounded-lg font-primary"
                                    />
                                </View>
                                
                                {/* Stripe */}
                                <View className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <View className="flex-row items-center mb-2">
                                        <CreditCard size={20} color="#6366f1" />
                                        <Text className="ml-2 font-semibold text-gray-900 font-primary">Stripe</Text>
                                    </View>
                                    <TextInput
                                        value={integrations.payments.stripe.publishableKey}
                                        onChangeText={(value) => setIntegrations(prev => ({
                                            ...prev,
                                            payments: { ...prev.payments, stripe: { ...prev.payments.stripe, publishableKey: value } }
                                        }))}
                                        placeholder="Enter Stripe Publishable Key"
                                        className="p-3 border border-gray-300 rounded-lg font-primary"
                                    />
                                </View>
                            </View>
                        )}
                    </ScrollView>
                    
                    <Pressable
                        onPress={saveIntegrations}
                        className="flex-row items-center justify-center p-3 bg-green-500 rounded-lg mt-4"
                    >
                        <Save size={20} color="#ffffff" />
                        <Text className="ml-2 font-semibold text-white font-primary">Save Integrations</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
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
                        {hasUnsavedChanges && (
                            <View className="mt-2 p-2 bg-yellow-100 rounded-lg">
                                <Text className="text-sm text-yellow-800 font-primary">
                                    You have unsaved changes
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Quick Profile Summary */}
                    <View className="p-4 bg-white rounded-lg border border-gray-200">
                        <View className="flex-row items-center">
                            <View className="justify-center items-center w-12 h-12 rounded-full bg-primary mr-3">
                                <Text className="text-lg font-bold text-white font-primary">
                                    {user?.initials || 'BN'}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-gray-900 font-primary">
                                    {userProfile.firstName} {userProfile.lastName}
                                </Text>
                                <Text className="text-sm text-gray-600 font-primary">
                                    {userProfile.emails[0]}
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500 font-primary">
                                Cart: {cartPosition === 'left' ? 'Left' : 'Right'}
                            </Text>
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

            {/* Modals */}
            {renderProfileModal()}
            {renderLayoutModal()}
            {renderIntegrationsModal('communications')}
            {renderIntegrationsModal('payments')}
            
            {/* Placeholder modals for other settings */}
            <Modal visible={activeModal === 'security'} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-11/12 max-w-lg bg-white rounded-2xl p-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-gray-900 font-primary">Security Settings</Text>
                            <Pressable onPress={() => setActiveModal(null)} className="p-2">
                                <X size={24} color="#6b7280" />
                            </Pressable>
                        </View>
                        <Text className="text-gray-600 font-primary mb-4">Security settings will be implemented here.</Text>
                        <Pressable onPress={() => setActiveModal(null)} className="p-3 bg-gray-200 rounded-lg">
                            <Text className="text-center font-semibold text-gray-800 font-primary">Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            
            {/* Additional placeholder modals */}
            {['notifications', 'language', 'branch', 'staff', 'export', 'backup'].map(modalType => (
                <Modal key={modalType} visible={activeModal === modalType} transparent animationType="fade">
                    <View className="flex-1 justify-center items-center bg-black/50">
                        <View className="w-11/12 max-w-lg bg-white rounded-2xl p-6">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xl font-bold text-gray-900 font-primary capitalize">
                                    {modalType} Settings
                                </Text>
                                <Pressable onPress={() => setActiveModal(null)} className="p-2">
                                    <X size={24} color="#6b7280" />
                                </Pressable>
                            </View>
                            <Text className="text-gray-600 font-primary mb-4">
                                {modalType} settings will be implemented here.
                            </Text>
                            <Pressable onPress={() => setActiveModal(null)} className="p-3 bg-gray-200 rounded-lg">
                                <Text className="text-center font-semibold text-gray-800 font-primary">Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            ))}
        </BaseProvider>
    );
}
