"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import type { SubscriptionWithRelations } from "@/lib/types";

interface SubscriptionCardProps {
  subscription: SubscriptionWithRelations;
  onStatusChange: (
    id: string,
    status: "ACTIVE" | "PAUSED" | "CANCELLED"
  ) => void;
}

export function SubscriptionCard({
  subscription,
  onStatusChange,
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (
    status: "ACTIVE" | "PAUSED" | "CANCELLED"
  ) => {
    setIsLoading(true);
    try {
      await onStatusChange(subscription.id, status);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "bi-weekly":
        return "Bi-weekly";
      case "monthly":
        return "Monthly";
      default:
        return frequency;
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {subscription.beneficiary.name}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status.toLowerCase()}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-5 w-5" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                {subscription.status === "ACTIVE" ? (
                  <Pause className="mr-2 h-5 w-5" />
                ) : (
                  <Play className="mr-2 h-5 w-5" />
                )}
                <span>
                  {subscription.status === "ACTIVE" ? "Pause" : "Resume"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-5 w-5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <span>
            {subscription.beneficiary.city}, {subscription.beneficiary.country}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">
                ${subscription.amountCAD.toString()} CAD
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Frequency</p>
              <p className="font-medium">
                {getFrequencyLabel(subscription.frequency)}
              </p>
            </div>
          </div>
        </div>

        {subscription.status === "ACTIVE" && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Next transfer</p>
            <p className="font-medium text-emerald-600">
              {format(new Date(subscription.nextTransferDate), "MMMM dd, yyyy")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
