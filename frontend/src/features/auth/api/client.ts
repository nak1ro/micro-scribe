import { apiClient } from '@/services/api';
import { AUTH_ENDPOINTS } from './routes';
import {
    LoginRequest,
    RegisterRequest,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    ExternalAuthRequest,
    OAuthCallbackRequest,
    LinkOAuthAccountRequest,
    LinkedAccountsResponse,
} from '@/features/auth/types';

export const authApi = {
    register: async (data: RegisterRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(AUTH_ENDPOINTS.REGISTER, data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(AUTH_ENDPOINTS.LOGIN, data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    },

    getMe: async (): Promise<UserResponse> => {
        const response = await apiClient.get<UserResponse>(AUTH_ENDPOINTS.ME);
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
        await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
    },

    confirmEmail: async (userId: string, token: string): Promise<void> => {
        await apiClient.get(AUTH_ENDPOINTS.CONFIRM_EMAIL, {
            params: { userId, token },
        });
    },

    resendConfirmation: async (email: string): Promise<void> => {
        await apiClient.post(AUTH_ENDPOINTS.RESEND_CONFIRMATION, { email });
    },

    refreshSession: async (): Promise<void> => {
        await apiClient.post(AUTH_ENDPOINTS.REFRESH);
    },

    externalLogin: async (data: ExternalAuthRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(AUTH_ENDPOINTS.EXTERNAL_LOGIN, data);
        return response.data;
    },

    oauthCallback: async (data: OAuthCallbackRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(AUTH_ENDPOINTS.OAUTH_CALLBACK, data);
        return response.data;
    },

    linkOAuthAccount: async (data: LinkOAuthAccountRequest): Promise<void> => {
        await apiClient.post(AUTH_ENDPOINTS.LINK_OAUTH, data);
    },

    getLinkedAccounts: async (): Promise<LinkedAccountsResponse> => {
        const response = await apiClient.get<LinkedAccountsResponse>(AUTH_ENDPOINTS.LINKED_ACCOUNTS);
        return response.data;
    },

    unlinkOAuthAccount: async (provider: string): Promise<void> => {
        await apiClient.delete(AUTH_ENDPOINTS.UNLINK_OAUTH(provider));
    },
};
