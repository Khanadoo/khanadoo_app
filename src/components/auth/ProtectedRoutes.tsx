"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const router = useRouter();

    const {
        isAuthenticated,
        loading,
    } = useAuth();

    useEffect(()=>{
        if(
            !loading &&
            !isAuthenticated
        ) {
            router.replace("/login");
        }
    }, [
        loading,
        isAuthenticated,
        router,
    ]);

    if (loading) {
        return(
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}