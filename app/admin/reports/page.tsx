import { requireRole } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminReportsManager } from "@/components/admin/admin-reports-manager";

export default async function AdminReportsPage() {
  await requireRole(["ADMIN"]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Financial Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate and export financial reports
          </p>
        </div>
        <AdminReportsManager />
      </div>
    </DashboardLayout>
  );
}
