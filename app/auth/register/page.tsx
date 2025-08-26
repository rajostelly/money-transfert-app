import { RegisterForm } from "@/components/auth/register-form"
import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { getRoleBasedRedirect } from "@/lib/auth-utils"

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect(getRoleBasedRedirect(user.role))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">TransferApp</h1>
          <p className="text-muted-foreground">Join thousands sending money to Madagascar</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
