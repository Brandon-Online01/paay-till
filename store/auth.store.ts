import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
    AuthStore,
    AuthStatus,
    UserRole,
    SignInFormData,
    SignUpFormData,
    ForgotPasswordFormData,
    ResetPasswordFormData,
    OtpVerificationFormData,
    User,
} from '../types';

/**
 * Optimized authentication store with better performance patterns
 */
export const useAuthStore = create<AuthStore>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        authState: {
            status: AuthStatus.IDLE,
            user: null,
            error: null,
            isLoading: false,
        },

        signInForm: { pin: '' },
        signUpForm: { businessName: '', businessEmail: '', pin: '' },
        forgotPasswordForm: { email: '' },
        resetPasswordForm: { token: '', password: '', confirmPassword: '' },
        otpForm: { code: '' },

        // Optimized actions with better error handling
        signIn: async (credentials: SignInFormData) => {
            const { setLoading, setError } = get();

            try {
                setLoading(true);
                setError(null);

                // Simulate API call - replace with actual authentication
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

                console.log('Sign In data:', credentials);

                // Mock successful authentication with PIN
                const mockUser: User = {
                    id: Date.now().toString(),
                    email: `user${credentials.pin}@orrbit.co.za`,
                    name: `User ${credentials.pin}`,
                    role: UserRole.STAFF,
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set({
                    authState: {
                        status: AuthStatus.AUTHENTICATED,
                        user: mockUser,
                        error: null,
                        isLoading: false,
                    },
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Sign in failed';
                setError(errorMessage);
                set({
                    authState: {
                        status: AuthStatus.ERROR,
                        user: null,
                        error: errorMessage,
                        isLoading: false,
                    },
                });
                throw error;
            }
        },

        signUp: async (userData: SignUpFormData) => {
            const { setLoading, setError } = get();

            try {
                setLoading(true);
                setError(null);

                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1200));

                console.log('Sign Up data:', userData);

                const mockUser: User = {
                    id: Date.now().toString(),
                    email: userData.businessEmail,
                    name: userData.businessName,
                    role: UserRole.STAFF,
                    emailVerified: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set({
                    authState: {
                        status: AuthStatus.AUTHENTICATED,
                        user: mockUser,
                        error: null,
                        isLoading: false,
                    },
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Sign up failed';
                setError(errorMessage);
                set({
                    authState: {
                        status: AuthStatus.ERROR,
                        user: null,
                        error: errorMessage,
                        isLoading: false,
                    },
                });
                throw error;
            }
        },

        signOut: () => {
            const { clearForms } = get();
            set({
                authState: {
                    status: AuthStatus.UNAUTHENTICATED,
                    user: null,
                    error: null,
                    isLoading: false,
                },
            });
            clearForms();
            
            // Show signed out notification
            setTimeout(() => {
                if ((global as any).showToast) {
                    (global as any).showToast(
                        'Signed Out Successfully',
                        'info',
                        3000,
                        '👋'
                    );
                } else {
                    console.log('👋 Signed Out Successfully');
                }
            }, 500);
        },

        forgotPassword: async (email: string) => {
            const { setLoading, setError } = get();

            try {
                setLoading(true);
                setError(null);

                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 800));

                console.log('Forgot Password data:', { email });
                setLoading(false);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Forgot password failed';
                setError(errorMessage);
                setLoading(false);
                throw error;
            }
        },

        resetPassword: async (data: ResetPasswordFormData) => {
            const { setLoading, setError } = get();

            try {
                setLoading(true);
                setError(null);

                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000));

                console.log('Reset Password data:', data);
                setLoading(false);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Reset password failed';
                setError(errorMessage);
                setLoading(false);
                throw error;
            }
        },

        verifyOtp: async (code: string) => {
            const { setLoading, setError } = get();

            try {
                setLoading(true);
                setError(null);

                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 600));

                console.log('OTP Verification data:', { code });
                setLoading(false);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'OTP verification failed';
                setError(errorMessage);
                setLoading(false);
                throw error;
            }
        },

        // Optimized form updates with shallow comparison
        updateSignInForm: (data: Partial<SignInFormData>) => {
            set((state) => ({
                signInForm: { ...state.signInForm, ...data },
            }));
        },

        updateSignUpForm: (data: Partial<SignUpFormData>) => {
            set((state) => ({
                signUpForm: { ...state.signUpForm, ...data },
            }));
        },

        updateForgotPasswordForm: (data: Partial<ForgotPasswordFormData>) => {
            set((state) => ({
                forgotPasswordForm: { ...state.forgotPasswordForm, ...data },
            }));
        },

        updateResetPasswordForm: (data: Partial<ResetPasswordFormData>) => {
            set((state) => ({
                resetPasswordForm: { ...state.resetPasswordForm, ...data },
            }));
        },

        updateOtpForm: (data: Partial<OtpVerificationFormData>) => {
            set((state) => ({
                otpForm: { ...state.otpForm, ...data },
            }));
        },

        // Optimized utility functions
        clearForms: () => {
            set({
                signInForm: { pin: '' },
                signUpForm: { businessName: '', businessEmail: '', pin: '' },
                forgotPasswordForm: { email: '' },
                resetPasswordForm: {
                    token: '',
                    password: '',
                    confirmPassword: '',
                },
                otpForm: { code: '' },
            });
        },

        setError: (error: string | null) => {
            set((state) => ({
                authState: { ...state.authState, error },
            }));
        },

        setLoading: (loading: boolean) => {
            set((state) => ({
                authState: { ...state.authState, isLoading: loading },
            }));
        },
    }))
);
