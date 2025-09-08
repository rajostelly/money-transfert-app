"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertTriangle, CreditCard, X } from "lucide-react";
import { format } from "date-fns";
import type { Notification } from "@prisma/client";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "TRANSFER_REMINDER":
        return <Bell className="h-4 w-4 text-blue-600" />;
      case "TRANSFER_COMPLETED":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "TRANSFER_FAILED":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "SUBSCRIPTION_CREATED":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "SUBSCRIPTION_CANCELLED":
        return <CreditCard className="h-4 w-4 text-red-600" />;
      case "PAYMENT_FAILED":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TRANSFER_COMPLETED":
      case "SUBSCRIPTION_CREATED":
        return "bg-green-forest-100 text-green-forest-800";
      case "TRANSFER_FAILED":
      case "PAYMENT_FAILED":
      case "SUBSCRIPTION_CANCELLED":
        return "bg-red-100 text-red-800";
      case "TRANSFER_REMINDER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "TRANSFER_REMINDER":
        return "Transfer Reminder";
      case "TRANSFER_COMPLETED":
        return "Transfer Completed";
      case "TRANSFER_FAILED":
        return "Transfer Failed";
      case "SUBSCRIPTION_CREATED":
        return "Subscription Created";
      case "SUBSCRIPTION_CANCELLED":
        return "Subscription Cancelled";
      case "PAYMENT_FAILED":
        return "Payment Failed";
      default:
        return "Notification";
    }
  };

  const handleMarkAsRead = async () => {
    if (notification.isRead) return;
    setIsLoading(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(notification.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`shadow-sm transition-all ${
        notification.isRead
          ? "bg-gray-50"
          : "bg-white border-l-4 border-l-emerald-500"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4
                  className={`text-sm font-medium ${
                    notification.isRead ? "text-gray-600" : "text-foreground"
                  }`}
                >
                  {notification.title}
                </h4>
                <Badge
                  className={getTypeColor(notification.type)}
                  variant="secondary"
                >
                  {getTypeLabel(notification.type)}
                </Badge>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-green-forest-500 rounded-full"></div>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsRead}
                    disabled={isLoading}
                    className="text-xs h-6 px-2"
                  >
                    Mark as read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <p
              className={`text-sm ${
                notification.isRead ? "text-gray-500" : "text-muted-foreground"
              } mb-2`}
            >
              {notification.message}
            </p>

            <p className="text-xs text-gray-400">
              {format(
                new Date(notification.createdAt),
                "MMM dd, yyyy 'at' HH:mm"
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
