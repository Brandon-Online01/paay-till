/**
 * Simplified authentication types for better performance and reusability
 */

/**
 * User roles in the system
 */
export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    STAFF = 'staff',
    CUSTOMER = 'customer',
}

/**
 * User information
 */
export interface User {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    emailVerified?: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

/**
 * Authentication status
 */
export enum AuthStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    AUTHENTICATED = 'authenticated',
    UNAUTHENTICATED = 'unauthenticated',
    ERROR = 'error',
}

/**
 * Auth state
 */
export interface AuthState {
    status: AuthStatus;
    user: User | null;
    error: string | null;
    isLoading: boolean;
}

/**
 * Shared authentication data interface
 */
export interface AuthData {
    businessName?: string;
    businessEmail?: string;
    email?: string;
    pin?: string;
    newPassword?: string;
    otp?: string;
}

/**
 * Form data interfaces
 */
export interface SignInFormData {
    pin: string;
}

export interface SignUpFormData {
    businessName: string;
    businessEmail: string;
    pin: string;
}

export interface ForgotPasswordFormData {
    email: string;
}

export interface ResetPasswordFormData {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface OtpVerificationFormData {
    code: string;
}

/**
 * UI State interfaces
 */
export interface UIState {
    errors: {
        signIn?: { pin?: string };
        signUp?: { businessName?: string; businessEmail?: string; pin?: string };
        forgotPassword?: { email?: string };
        resetPassword?: { pin?: string; confirmPin?: string };
        otpVerification?: { code?: string };
    };
    successMessages: {
        resetPassword?: string;
    };
    biometric: {
        available: boolean;
        useBiometrics: boolean;
    };
    passwordVisibility: {
        showPassword: boolean;
        showConfirmPassword: boolean;
    };
}

/**
 * Auth store interface
 */
export interface AuthStore {
    // State
    authState: AuthState;
    uiState: UIState;
    signInForm: SignInFormData;
    signUpForm: SignUpFormData;
    forgotPasswordForm: ForgotPasswordFormData;
    resetPasswordForm: ResetPasswordFormData;
    otpForm: OtpVerificationFormData;

    // Actions
    signIn: (credentials: SignInFormData) => Promise<void>;
    signUp: (userData: SignUpFormData) => Promise<void>;
    signOut: () => void;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (data: ResetPasswordFormData) => Promise<void>;
    verifyOtp: (code: string) => Promise<void>;

    // Form updates
    updateSignInForm: (data: Partial<SignInFormData>) => void;
    updateSignUpForm: (data: Partial<SignUpFormData>) => void;
    updateForgotPasswordForm: (data: Partial<ForgotPasswordFormData>) => void;
    updateResetPasswordForm: (data: Partial<ResetPasswordFormData>) => void;
    updateOtpForm: (data: Partial<OtpVerificationFormData>) => void;

    // UI State updates
    setErrors: (page: keyof UIState['errors'], errors: any) => void;
    clearErrors: (page?: keyof UIState['errors']) => void;
    setSuccessMessage: (page: keyof UIState['successMessages'], message: string) => void;
    clearSuccessMessages: (page?: keyof UIState['successMessages']) => void;
    setBiometricAvailable: (available: boolean) => void;
    setUseBiometrics: (useBiometrics: boolean) => void;
    togglePasswordVisibility: (field: keyof UIState['passwordVisibility']) => void;
    checkBiometricAvailability: () => Promise<void>;

    // Utilities
    clearForms: () => void;
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
}
