"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authClient, AuthUser } from "@/services/auth.client";

interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;

    isAuthenticated: boolean;
    loading: boolean;

    login: (
        email: string,
        password: string,
    ) => Promise<void>;

    register: (
        name: string,
        email: string,
        password: string,
        phone?: string,
    ) => Promise<void>;

    logout: () => Promise<void>;

    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);

    const login = async (
        email: string,
        password: string,
    ) => {
        const response = await authClient.login({
            email,
            password
        });

        setUser(response.user);
        setAccessToken(response.accessToken);
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        phone?: string
    ) => {
        const response = await authClient.register({
            name,
            email,
            password,
            phone,
        });
    };

    const logout = async () => {
        try{
            await authClient.logout();
        } finally{
            setUser(null);
            setAccessToken(null);
        }
    };

    const refreshSession = async () => {
        try {
            const refreshResponse = await authClient.refresh();

            const newAccessToken = refreshResponse.accessToken;

            setAccessToken(newAccessToken);

            const meResponse = await authClient.me(newAccessToken);

            setUser(meResponse.user);
        } catch{
            setUser(null);
            setAccessToken(null);
        } finally{
            setLoading(false);
        }
    };

    useEffect(()=>{
        refreshSession();
    }, []);

    const value: AuthContextType = {
        user,
        accessToken,

        isAuthenticated:
            !!user &&
            !!accessToken,
        
        loading,

        login,
        register,
        logout,

        refreshSession,
    };

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
}