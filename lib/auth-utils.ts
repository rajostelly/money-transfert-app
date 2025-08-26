import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "./auth"

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return null
  }

  const session = verifyToken(token)
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

export function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case "CLIENT":
      return "/dashboard"
    case "ADMIN":
      return "/admin"
    case "MADAGASCAR_TEAM":
      return "/madagascar"
    default:
      return "/dashboard"
  }
}
