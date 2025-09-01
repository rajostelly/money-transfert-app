"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { InitDbButton } from "@/components/auth/init-db-button";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AuthHeader() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleInitDb = async () => {
    setIsInitializing(true);
    setInitStatus("idle");

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        setInitStatus("success");
        setMessage("Database initialized successfully!");
      } else {
        setInitStatus("error");
        setMessage(data.error || "Failed to initialize database");
      }
    } catch (error) {
      setInitStatus("error");
      setMessage("Network error occurred");
    } finally {
      setIsInitializing(false);
      // Reset status after 3 seconds
      setTimeout(() => {
        setInitStatus("idle");
        setMessage("");
      }, 3000);
    }
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleInitDb}
              disabled={isInitializing}
              variant="outline"
              size="sm"
              className={`h-8 w-8 p-0 transition-all duration-300 ${
                initStatus === "success"
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : initStatus === "error"
                  ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                  : "hover:border-emerald-300 dark:hover:border-emerald-700"
              }`}
            >
              <Database
                className={`h-4 w-4 transition-all duration-300 ${
                  isInitializing ? "animate-pulse" : ""
                } ${
                  initStatus === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : initStatus === "error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {initStatus === "idle" && (
              <div>
                <p className="font-medium">Initialize Database</p>
                <p className="text-xs text-muted-foreground">
                  Set up test accounts and data
                </p>
              </div>
            )}
            {initStatus === "success" && (
              <div>
                <p className="font-medium text-emerald-600">{message}</p>
                <p className="text-xs text-muted-foreground">
                  Test accounts are ready to use
                </p>
              </div>
            )}
            {initStatus === "error" && (
              <div>
                <p className="font-medium text-red-600">{message}</p>
                <p className="text-xs text-muted-foreground">
                  Please try again
                </p>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ThemeToggle />
    </div>
  );
}
