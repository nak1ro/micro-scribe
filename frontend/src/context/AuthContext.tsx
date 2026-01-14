"use client";

import React, { createContext, useEffect, useState, useCallback, ReactNode, FC } from 'react';
import { UserResponse, LoginRequest, RegisterRequest } from '@/features/auth/types';
import { authApi } from '@/features/auth/api/client';
import { UNAUTHORIZED_EVENT } from '@/services/api';
import { signalRService } from '@/services/signalR';

interface AuthContextType {
    user: UserResponse | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    loginWithOAuth: (provider: string, code: string, redirectUri?: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const refreshUser = useCallback(async () => {
        try {
            const userData = await authApi.getMe();
            setUser(userData);
        } catch (error) {
            // If we can't get the user, we assume they are not logged in.
            setUser(null);
            console.debug('Failed to fetch user', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Connect/disconnect SignalR based on user state
    useEffect(() => {
        if (user && !isLoading) {
            signalRService.connect().catch((err) => {
                console.error("[Auth] Failed to connect SignalR:", err);
            });
        } else if (!user && !isLoading) {
            signalRService.disconnect();
        }
    }, [user, isLoading]);

    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            signalRService.disconnect();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
            }
        };
    }, []);

    const login = async (data: LoginRequest) => {
        const userData = await authApi.login(data);
        setUser(userData);
    };

    const loginWithOAuth = async (provider: string, code: string, redirectUri?: string) => {
        const userData = await authApi.oauthCallback({ provider, code, redirectUri });
        setUser(userData);
    };

    const register = async (data: RegisterRequest) => {
        const userData = await authApi.register(data);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await signalRService.disconnect();
            await authApi.logout();
        } finally {
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithOAuth,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
