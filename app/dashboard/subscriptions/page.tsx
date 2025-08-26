import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SubscriptionListClient } from "@/components/subscriptions/subscription-list-client";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getSubscriptions(userId: string) {
  return await prisma.subscription.findMany({
    where: { userId },
    include: {
      beneficiary: true,
      transfers: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function SubscriptionsPage() {
  const user = await requireAuth();
  const subscriptions = await getSubscriptions(user.id);

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "ACTIVE"
  );
  const pausedSubscriptions = subscriptions.filter(
    (s) => s.status === "PAUSED"
  );
  const cancelledSubscriptions = subscriptions.filter(
    (s) => s.status === "CANCELLED"
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Subscriptions
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your recurring money transfers
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/subscriptions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Subscription
            </Link>
          </Button>
        </div>

        {subscriptions.length === 0 ? (
          <EmptyState
            icon="CreditCard"
            title="No subscriptions yet"
            description="Create your first recurring transfer to automatically send money to Madagascar on a regular schedule"
            actionLabel="Create Subscription"
            actionHref="/dashboard/subscriptions/new"
          />
        ) : (
          <SubscriptionListClient
            activeSubscriptions={activeSubscriptions}
            pausedSubscriptions={pausedSubscriptions}
            cancelledSubscriptions={cancelledSubscriptions}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
