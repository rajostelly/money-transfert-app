import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CreditCard,
  Send,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

async function getDashboardData(userId: string) {
  const [subscriptions, transfers, beneficiaries] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId, status: "ACTIVE" },
      include: { beneficiary: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.transfer.findMany({
      where: { userId },
      include: { beneficiary: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.beneficiary.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalTransferred = transfers.reduce(
    (sum, transfer) => sum + Number(transfer.amountCAD),
    0
  );
  const pendingTransfers = transfers.filter(
    (t) => t.status === "PENDING"
  ).length;

  return {
    subscriptions,
    transfers,
    beneficiaries,
    stats: {
      totalTransferred,
      activeSubscriptions: subscriptions.length,
      totalBeneficiaries: beneficiaries.length,
      pendingTransfers,
    },
  };
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const data = await getDashboardData(user.id);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your money transfer activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Transferred"
            value={`$${data.stats.totalTransferred.toFixed(2)}`}
            description="CAD sent to Madagascar"
            icon={DollarSign}
          />
          <StatsCard
            title="Active Subscriptions"
            value={data.stats.activeSubscriptions}
            description="Recurring transfers"
            icon={CreditCard}
          />
          <StatsCard
            title="Beneficiaries"
            value={data.stats.totalBeneficiaries}
            description="People you send to"
            icon={Users}
          />
          <StatsCard
            title="Pending Transfers"
            value={data.stats.pendingTransfers}
            description="Awaiting processing"
            icon={Send}
          />
        </div>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                asChild
                className="h-auto p-6 bg-emerald-600 hover:bg-emerald-700"
              >
                <Link
                  href="/dashboard/beneficiaries/new"
                  className="flex flex-col items-center space-y-2"
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Beneficiary</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-6 bg-transparent"
              >
                <Link
                  href="/dashboard/subscriptions/new"
                  className="flex flex-col items-center space-y-2"
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Create Subscription</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-6 bg-transparent"
              >
                <Link
                  href="/dashboard/transfers/new"
                  className="flex flex-col items-center space-y-2"
                >
                  <Send className="h-6 w-6" />
                  <span>Send Money</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Subscriptions */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Active Subscriptions</CardTitle>
                <CardDescription>Your recurring transfers</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/subscriptions">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.subscriptions.length === 0 ? (
                <EmptyState
                  icon="CreditCard"
                  title="No subscriptions yet"
                  description="Create your first recurring transfer to get started"
                  actionLabel="Create Subscription"
                  actionHref="/dashboard/subscriptions"
                />
              ) : (
                <div className="space-y-4">
                  {data.subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {subscription.beneficiary.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${subscription.amountCAD.toString()} CAD •{" "}
                          {subscription.frequency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          Next:{" "}
                          {format(
                            new Date(subscription.nextTransferDate),
                            "MMM dd"
                          )}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Transfers</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/transfers">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.transfers.length === 0 ? (
                <EmptyState
                  icon="Send"
                  title="No transfers yet"
                  description="Send your first money transfer to Madagascar"
                  actionLabel="Send Money"
                  actionHref="/dashboard/transfers"
                />
              ) : (
                <div className="space-y-4">
                  {data.transfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {transfer.beneficiary.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transfer.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          ${transfer.amountCAD.toString()} CAD
                        </p>
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
