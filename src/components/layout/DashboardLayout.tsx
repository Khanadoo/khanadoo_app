import Navbar from "./Navbar";
import { Sidebar } from "@/components/Sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navbar />

            <div className="page-shell grid gap-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
                <Sidebar />

                <main className="min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}