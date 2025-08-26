import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SubscriptionCard } from "@/components/subscriptions/subscription-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CreditCard } from "lucide-react"
import Link from "next/link"

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
  })
}

export default async function SubscriptionsPage() {
  const user = await requireAuth()
  const subscriptions = await getSubscriptions(user.id)

  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE")
  const pausedSubscriptions = subscriptions.filter((s) => s.status === "PAUSED")
  const cancelledSubscriptions = subscriptions.filter((s) => s.status === "CANCELLED")

  const handleStatusChange = async (id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") => {
    "use server"
    // This would be handled by the client-side component
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
            <p className="text-muted-foreground mt-2">Manage your recurring money transfers</p>
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
            icon={CreditCard}
            title="No subscriptions yet"
            description="Create your first recurring transfer to automatically send money to Madagascar on a regular schedule"
            actionLabel="Create Subscription"
            onAction={() => {}}
          />
        ) : (
          <div className="space-y-8">
            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-emerald-600">Active Subscriptions</CardTitle>
                  <CardDescription>Your recurring transfers that are currently active</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activeSubscriptions.map((subscription) => (
                      <SubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paused Subscriptions */}
            {pausedSubscriptions.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-yellow-600">Paused Subscriptions</CardTitle>
                  <CardDescription>Subscriptions that are temporarily paused</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pausedSubscriptions.map((subscription) => (
                      <SubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancelled Subscriptions */}
            {cancelledSubscriptions.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-red-600">Cancelled Subscriptions</CardTitle>
                  <CardDescription>Subscriptions that have been cancelled</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cancelledSubscriptions.map((subscription) => (
                      <SubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
