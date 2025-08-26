import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NotificationCenter } from "@/components/notifications/notification-center"

async function getNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

export default async function NotificationsPage() {
  const user = await requireAuth()
  const notifications = await getNotifications(user.id)

  return (
    <DashboardLayout>
      <NotificationCenter initialNotifications={notifications} />
    </DashboardLayout>
  )
}
