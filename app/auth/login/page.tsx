import { LoginForm } from "@/components/auth/login-form"
import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { getRoleBasedRedirect } from "@/lib/auth-utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { InitDbButton } from "@/components/auth/init-db-button"

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect(getRoleBasedRedirect(user.role))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">TransferApp</h1>
          <p className="text-muted-foreground">Secure money transfers to Madagascar</p>
        </div>
        <InitDbButton />
        <LoginForm />
      </div>
    </div>
  )
}
