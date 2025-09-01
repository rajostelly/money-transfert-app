import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthHeader } from "@/components/auth/auth-header";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { getRoleBasedRedirect } from "@/lib/auth-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ResetPasswordPageProps {
  searchParams: { token?: string };
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(getRoleBasedRedirect(user.role));
  }

  const { token } = searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-emerald-50/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-950/10 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        </div>

        <AuthHeader />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-2">
              TransferApp
            </h1>
            <p className="text-muted-foreground">
              Secure and fast money transfers to Madagascar
            </p>
          </div>

          <Alert
            variant="destructive"
            className="border-red-200 dark:border-red-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Invalid or Missing Reset Token</p>
                <p className="text-sm">
                  This password reset link is invalid or has expired. Please
                  request a new password reset.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Link href="/auth/forgot-password">
              <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                Request New Reset Link
              </Button>
            </Link>

            <Link href="/auth?tab=signin">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>🔒 Your data is protected with bank-level security</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-emerald-50/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-950/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <AuthHeader />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="h-7 w-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-2">
            TransferApp
          </h1>
          <p className="text-muted-foreground">
            Secure and fast money transfers to Madagascar
          </p>
        </div>

        <ResetPasswordForm token={token} />

        <div className="text-center text-xs text-muted-foreground">
          <p>🔒 Your data is protected with bank-level security</p>
        </div>
      </div>
    </div>
  );
}
