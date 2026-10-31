
"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from "react";

import { authClient, AuthUser } from "@/services/auth.client";

interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;

    isAuthenticated: boolean;
    loading: boolean;
    loggingOut: boolean;

    login: (
        email: string,
        password: string,
    ) => Promise<void>;

    register: (
        name: string,
        email: string,
        password: string,
        phone: string,
    ) => Promise<void>;

    logout: () => Promise<void>;

    refreshSession: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    const logout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await authClient.logout();
        } finally {
            setUser(null);
            setAccessToken(null);
            setLoggingOut(false);
        }
    };

    const login = async (
        email: string,
        password: string,
    ) => {
        const response = await authClient.login({
            email,
            password,
        });

        setUser(response.user);
        setAccessToken(response.accessToken);
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        phone: string,
    ) => {
        await authClient.register({
            name,
            email,
            password,
            phone,
        });
    };

    const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

    const refreshSession = useCallback((): Promise<string | null> => {
        if (refreshPromiseRef.current) {
            return refreshPromiseRef.current;
        }

        const refreshPromise = (async (): Promise<string | null> => {
            try {
                const refreshResponse = await authClient.refresh();
                const newAccessToken = refreshResponse.accessToken;

                const meResponse = await authClient.me(newAccessToken);

                setAccessToken(newAccessToken);
                setUser(meResponse.user);

                return newAccessToken;
            } catch {
                setUser(null);
                setAccessToken(null);

                return null;
            } finally {
                setLoading(false);
            }
        })();

        refreshPromiseRef.current = refreshPromise;

        void refreshPromise.finally(() => {
            if (refreshPromiseRef.current === refreshPromise) {
                refreshPromiseRef.current = null;
            }
        });

        return refreshPromise;
    }, []);

    useEffect(() => {
        refreshSession();
    }, []);

    const value: AuthContextType = {
        user,
        accessToken,

        isAuthenticated: !!user && !!accessToken,

        loading,
        loggingOut,

        login,
        register,
        logout,

        refreshSession,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}
