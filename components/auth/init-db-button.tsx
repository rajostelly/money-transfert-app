"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, CheckCircle, AlertCircle } from "lucide-react"

export function InitDbButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleInitDb = async () => {
    setIsLoading(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Database initialized! You can now log in with test accounts.")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to initialize database")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleInitDb} disabled={isLoading} variant="outline" className="w-full bg-transparent">
        <Database className="w-4 h-4 mr-2" />
        {isLoading ? "Initializing Database..." : "Initialize Database"}
      </Button>

      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {status === "success" && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Test Accounts:</strong>
          </p>
          <p>• client1@test.com (password: password123)</p>
          <p>• admin@test.com (password: password123)</p>
          <p>• All other test emails use the same password</p>
        </div>
      )}
    </div>
  )
}
