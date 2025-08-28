import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen
                    name="sign-in"
                    options={{
                        title: 'Sign In',
                    }}
                />
                <Stack.Screen
                    name="sign-up"
                    options={{
                        title: 'Sign Up',
                    }}
                />
                <Stack.Screen
                    name="reset-password"
                    options={{
                        title: 'Reset Password',
                    }}
                />
                <Stack.Screen
                    name="new-password"
                    options={{
                        title: 'New Password',
                    }}
                />
                <Stack.Screen
                    name="verify-otp"
                    options={{
                        title: 'Verify OTP',
                    }}
                />
            </Stack>
        </>
    );
}
