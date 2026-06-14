import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your account"
            />

            Dashboard content
        </DashboardLayout>
    );
}