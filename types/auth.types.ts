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
 * Auth store interface
 */
export interface AuthStore {
    // State
    authState: AuthState;
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

    // Utilities
    clearForms: () => void;
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
}
