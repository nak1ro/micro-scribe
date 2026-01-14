export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ExternalAuthRequest {
    provider: string;
    idToken: string;
}

export interface OAuthCallbackRequest {
    provider: string;
    code: string;
    redirectUri?: string;
    state?: string | null;
}

export interface LinkOAuthAccountRequest {
    provider: string;
    idToken: string;
}

export interface ExternalLoginResponse {
    provider: string;
    providerKey: string;
    accessTokenExpiresAt: string | null;
}

export type LinkedAccountsResponse = ExternalLoginResponse[];

export interface UserResponse {
    id: string;
    email: string;
    emailConfirmed: boolean;
    roles: string[];
}

// Standardized auth error for API responses
export interface AuthError {
    status: number;
    message: string;
    detail?: string;
}
