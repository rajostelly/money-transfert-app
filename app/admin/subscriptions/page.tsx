import { requireRole } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminSubscriptionsTable } from "@/components/admin/admin-subscriptions-table";

async function getSubscriptions() {
  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/admin/subscriptions`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch subscriptions");
  }

  return response.json();
}

export default async function AdminSubscriptionsPage() {
  await requireRole(["ADMIN"]);
  const data = await getSubscriptions();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Subscription Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all recurring transfers
          </p>
        </div>
        <AdminSubscriptionsTable subscriptions={data.subscriptions} />
      </div>
    </DashboardLayout>
  );
}
