import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SystemSettings } from "@/components/admin/system-settings"

async function getSettings() {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/settings`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch settings")
  }

  return response.json()
}

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"])
  const settings = await getSettings()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-2">Configure global application settings</p>
        </div>
        <SystemSettings settings={settings} />
      </div>
    </DashboardLayout>
  )
}
