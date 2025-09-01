"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          "Password reset instructions have been sent to your email address."
        );
      } else {
        setStatus("error");
        setMessage(
          data.error || "Failed to send reset email. Please try again."
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  if (status === "success") {
    return (
      <Card className="w-full max-w-md mx-auto shadow-2xl border border-border/50 bg-card/95 backdrop-blur-sm dark:shadow-xl dark:shadow-black/20">
        <CardHeader className="space-y-3 text-center pb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            We've sent password reset instructions to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
            <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-400">
              {message}
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              If you don't see the email in your inbox within a few minutes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Try requesting another reset email</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                setStatus("idle");
                setMessage("");
                setEmail("");
              }}
              variant="outline"
              className="w-full"
            >
              Try Another Email
            </Button>

            <Link href="/auth?tab=signin">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border border-border/50 bg-card/95 backdrop-blur-sm dark:shadow-xl dark:shadow-black/20">
      <CardHeader className="space-y-3 text-center pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Enter your email address and we'll send you instructions to reset
            your password
          </CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-sm font-medium">
              Email Address
            </Label>
            <motion.div
              className="relative"
              variants={inputVariants}
              whileFocus="focus"
            >
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 border-2 focus:border-emerald-300 dark:focus:border-emerald-700 transition-all duration-300"
                required
                disabled={isLoading}
              />
            </motion.div>
          </div>

          <AnimatePresence>
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  variant="destructive"
                  className="border-red-200 dark:border-red-800"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {message}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="pt-2"
          >
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Instructions...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          </motion.div>
        </motion.form>

        <div className="pt-4 border-t">
          <Link href="/auth?tab=signin">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            Remember your password?
            <Link
              href="/auth?tab=signin"
              className="text-emerald-600 hover:text-emerald-700 ml-1"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
