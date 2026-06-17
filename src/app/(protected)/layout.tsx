import ProtectedRoute from "@/components/auth/ProtectedRoutes";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return(
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}