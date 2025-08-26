import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SubscriptionForm } from "@/components/subscriptions/subscription-form"

async function getBeneficiaries(userId: string) {
  return await prisma.beneficiary.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  })
}

export default async function NewSubscriptionPage() {
  const user = await requireAuth()
  const beneficiaries = await getBeneficiaries(user.id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Subscription</h1>
          <p className="text-muted-foreground mt-2">Set up automatic recurring transfers to Madagascar</p>
        </div>
        <SubscriptionForm beneficiaries={beneficiaries} />
      </div>
    </DashboardLayout>
  )
}
