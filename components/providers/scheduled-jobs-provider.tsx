"use client";

import { useEffect } from "react";

// This component initializes scheduled jobs on the client side
export function ScheduledJobsInitializer() {
  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (
      process.env.NODE_ENV === "production" ||
      process.env.ENABLE_SCHEDULED_JOBS === "true"
    ) {
      fetch("/api/admin/start-scheduled-jobs", {
        method: "POST",
      }).catch(console.error);
    }
  }, []);

  return null;
}
