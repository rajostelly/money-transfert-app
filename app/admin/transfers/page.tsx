import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TransferManagementTable } from "@/components/admin/transfer-management-table"

async function getTransfers() {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/transfers`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch transfers")
  }

  return response.json()
}

export default async function AdminTransfersPage() {
  await requireRole(["ADMIN"])
  const transfers = await getTransfers()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transfer Management</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage all money transfers</p>
        </div>
        <TransferManagementTable transfers={transfers} />
      </div>
    </DashboardLayout>
  )
}
