import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminExportButtons } from "@/components/admin/admin-export-buttons";
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Download,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

async function getAdminDashboardData() {
  const [
    users,
    transfers,
    subscriptions,
    pendingTransfers,
    activeSubscriptionsDetail,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.transfer.findMany({
      include: { user: true, beneficiary: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.transfer.count({ where: { status: "PENDING" } }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { user: true, beneficiary: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalVolume = transfers.reduce(
    (sum, transfer) => sum + Number(transfer.amountCAD),
    0
  );
  const totalFees = transfers.reduce(
    (sum, transfer) => sum + Number(transfer.feeCAD),
    0
  );

  return {
    stats: {
      totalUsers: users,
      totalVolume,
      totalFees,
      activeSubscriptions: subscriptions,
      pendingTransfers,
    },
    recentTransfers: transfers,
    activeSubscriptions: activeSubscriptionsDetail,
  };
}

export default async function AdminDashboardPage() {
  const user = await requireRole(["ADMIN"]);
  const data = await getAdminDashboardData();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage the TransferApp platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total Users"
            value={data.stats.totalUsers}
            description="Registered users"
            icon={Users}
          />
          <StatsCard
            title="Total Volume"
            value={`$${data.stats.totalVolume.toFixed(2)}`}
            description="CAD transferred"
            icon={DollarSign}
          />
          <StatsCard
            title="Total Fees"
            value={`$${data.stats.totalFees.toFixed(2)}`}
            description="Revenue generated"
            icon={TrendingUp}
          />
          <StatsCard
            title="Active Subscriptions"
            value={data.stats.activeSubscriptions}
            description="Recurring transfers"
            icon={CreditCard}
          />
          <StatsCard
            title="Pending Transfers"
            value={data.stats.pendingTransfers}
            description="Awaiting confirmation"
            icon={AlertTriangle}
          />
        </div>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild variant="outline" className="h-12">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12">
                <Link href="/admin/transfers">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Transfers
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12">
                <Link href="/admin/settings">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  System Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Reports & Exports</CardTitle>
            <CardDescription>Generate reports and export data</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminExportButtons />
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Active Subscriptions</CardTitle>
                <CardDescription>
                  Recently created recurring transfers
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/subscriptions">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.activeSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {subscription.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          to {subscription.beneficiary.name} •{" "}
                          {subscription.frequency}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ${subscription.amountCAD.toString()} CAD
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created{" "}
                        {format(
                          new Date(subscription.createdAt),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {subscription.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
              {data.activeSubscriptions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No active subscriptions found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Recent Transfers</CardTitle>
            <CardDescription>
              Latest transactions across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {transfer.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          to {transfer.beneficiary.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ${transfer.amountCAD.toString()} CAD
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transfer.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transfer.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : transfer.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transfer.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
