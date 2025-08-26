import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserManagementTable } from "@/components/admin/user-management-table"

async function getUsers() {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/users`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }

  return response.json()
}

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"])
  const users = await getUsers()

  const handleStatusChange = async (userId: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") => {
    "use server"
    // This would be handled by the client-side component
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage all users and their access levels</p>
        </div>
        <UserManagementTable users={users} onStatusChange={handleStatusChange} />
      </div>
    </DashboardLayout>
  )
}
