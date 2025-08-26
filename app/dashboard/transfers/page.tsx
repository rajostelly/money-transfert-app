import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TransferCard } from "@/components/transfers/transfer-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Send } from "lucide-react"
import Link from "next/link"

async function getTransfers(userId: string) {
  return await prisma.transfer.findMany({
    where: { userId },
    include: {
      beneficiary: true,
      subscription: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function TransfersPage() {
  const user = await requireAuth()
  const transfers = await getTransfers(user.id)

  const pendingTransfers = transfers.filter((t) => t.status === "PENDING")
  const completedTransfers = transfers.filter((t) => t.status === "COMPLETED")
  const allTransfers = transfers

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transfers</h1>
            <p className="text-muted-foreground mt-2">View and manage your money transfers</p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/transfers/new">
              <Plus className="mr-2 h-4 w-4" />
              Send Money
            </Link>
          </Button>
        </div>

        {transfers.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No transfers yet"
            description="Send your first money transfer to Madagascar to get started"
            actionLabel="Send Money"
            onAction={() => {}}
          />
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="all">All ({allTransfers.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingTransfers.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTransfers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">All Transfers</CardTitle>
                  <CardDescription>Complete history of your money transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {allTransfers.map((transfer) => (
                      <TransferCard key={transfer.id} transfer={transfer} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-yellow-600">Pending Transfers</CardTitle>
                  <CardDescription>Transfers currently being processed</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingTransfers.length === 0 ? (
                    <EmptyState
                      icon={Send}
                      title="No pending transfers"
                      description="All your transfers have been processed"
                    />
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {pendingTransfers.map((transfer) => (
                        <TransferCard key={transfer.id} transfer={transfer} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-emerald-600">Completed Transfers</CardTitle>
                  <CardDescription>Successfully delivered transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  {completedTransfers.length === 0 ? (
                    <EmptyState
                      icon={Send}
                      title="No completed transfers yet"
                      description="Your completed transfers will appear here"
                    />
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {completedTransfers.map((transfer) => (
                        <TransferCard key={transfer.id} transfer={transfer} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
