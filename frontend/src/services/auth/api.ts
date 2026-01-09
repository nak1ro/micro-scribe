import { apiClient, API_ENDPOINTS } from '@/services/api';
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
} from '@/types/api/auth';

export const authApi = {
    register: async (data: RegisterRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    getMe: async (): Promise<UserResponse> => {
        const response = await apiClient.get<UserResponse>(API_ENDPOINTS.AUTH.ME);
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    },

    confirmEmail: async (userId: string, token: string): Promise<void> => {
        await apiClient.get(API_ENDPOINTS.AUTH.CONFIRM_EMAIL, {
            params: { userId, token },
        });
    },

    resendConfirmation: async (email: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.RESEND_CONFIRMATION, { email });
    },

    externalLogin: async (data: ExternalAuthRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(API_ENDPOINTS.AUTH.EXTERNAL_LOGIN, data);
        return response.data;
    },

    oauthCallback: async (data: OAuthCallbackRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>(API_ENDPOINTS.AUTH.OAUTH_CALLBACK, data);
        return response.data;
    },

    linkOAuthAccount: async (data: LinkOAuthAccountRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.LINK_OAUTH, data);
    },

    getLinkedAccounts: async (): Promise<LinkedAccountsResponse> => {
        const response = await apiClient.get<LinkedAccountsResponse>(API_ENDPOINTS.AUTH.LINKED_ACCOUNTS);
        return response.data;
    },

    unlinkOAuthAccount: async (provider: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.AUTH.UNLINK_OAUTH(provider));
    },
};
