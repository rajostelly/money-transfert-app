import { requireRole } from "@/lib/auth-utils";
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
import { Send, CheckCircle, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

async function getMadagascarDashboardData() {
  const [pendingTransfers, completedToday, totalCompleted] = await Promise.all([
    prisma.transfer.findMany({
      where: { status: "PENDING" },
      include: { user: true, beneficiary: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transfer.count({
      where: {
        status: "COMPLETED",
        confirmedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.transfer.count({ where: { status: "COMPLETED" } }),
  ]);

  const pendingAmount = pendingTransfers.reduce(
    (sum, transfer) => sum + Number(transfer.amountMGA),
    0
  );

  return {
    stats: {
      pendingTransfers: pendingTransfers.length,
      completedToday,
      totalCompleted,
      pendingAmount,
    },
    pendingTransfers,
  };
}

export default async function MadagascarDashboardPage() {
  const user = await requireRole(["MADAGASCAR_TEAM"]);
  const data = await getMadagascarDashboardData();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Madagascar Team Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Confirm and manage money transfers to beneficiaries
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <a href="/madagascar/transfers/enhanced">
              🔍 Advanced Transfer Management
            </a>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Pending Transfers"
            value={data.stats.pendingTransfers}
            description="Awaiting confirmation"
            icon={Clock}
          />
          <StatsCard
            title="Completed Today"
            value={data.stats.completedToday}
            description="Transfers confirmed"
            icon={CheckCircle}
          />
          <StatsCard
            title="Total Completed"
            value={data.stats.totalCompleted}
            description="All time"
            icon={Send}
          />
          <StatsCard
            title="Pending Amount"
            value={`${data.stats.pendingAmount.toLocaleString()} MGA`}
            description="Total pending value"
            icon={DollarSign}
          />
        </div>

        {/* Pending Transfers */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Pending Transfers</CardTitle>
            <CardDescription>
              Transfers waiting for confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.pendingTransfers.length === 0 ? (
              <EmptyState
                icon="CheckCircle"
                title="No pending transfers"
                description="All transfers have been processed. Great work!"
              />
            ) : (
              <div className="space-y-4">
                {data.pendingTransfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {transfer.beneficiary.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transfer.beneficiary.city},{" "}
                            {transfer.beneficiary.country}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            From: {transfer.user.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {transfer.amountMGA.toLocaleString()} MGA
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${transfer.amountCAD.toString()} CAD
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transfer.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
