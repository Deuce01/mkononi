import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import ProtectedRoute from "@/components/layout/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            <aside className="hidden md:block">
                <DashboardSidebar />
            </aside>
            <main>{children}</main>
        </div>
    </ProtectedRoute>
  );
}
