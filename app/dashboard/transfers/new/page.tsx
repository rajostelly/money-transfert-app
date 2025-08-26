import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TransferForm } from "@/components/transfers/transfer-form"

async function getBeneficiaries(userId: string) {
  return await prisma.beneficiary.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  })
}

export default async function NewTransferPage() {
  const user = await requireAuth()
  const beneficiaries = await getBeneficiaries(user.id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Send Money</h1>
          <p className="text-muted-foreground mt-2">Send a one-time transfer to Madagascar</p>
        </div>
        <TransferForm beneficiaries={beneficiaries} />
      </div>
    </DashboardLayout>
  )
}
