"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative h-7 w-7 p-1.5 hover:bg-muted/50 transition-colors"
      onClick={() => router.push("/dashboard/notifications")}
    >
      <Bell className="h-2.5 w-2.5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-0.5 -right-0.5 h-3 w-3 p-0 bg-emerald-600 text-white text-[9px] flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
