"use client";

import { useState } from "react";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Subscription, Beneficiary, Transfer } from "@prisma/client";

type SubscriptionWithDetails = Subscription & {
  beneficiary: Beneficiary;
  transfers: Transfer[];
};

interface SubscriptionListClientProps {
  activeSubscriptions: SubscriptionWithDetails[];
  pausedSubscriptions: SubscriptionWithDetails[];
  cancelledSubscriptions: SubscriptionWithDetails[];
}

export function SubscriptionListClient({
  activeSubscriptions,
  pausedSubscriptions,
  cancelledSubscriptions,
}: SubscriptionListClientProps) {
  const [subscriptions, setSubscriptions] = useState({
    active: activeSubscriptions,
    paused: pausedSubscriptions,
    cancelled: cancelledSubscriptions,
  });

  const handleStatusChange = async (
    id: string,
    status: "ACTIVE" | "PAUSED" | "CANCELLED"
  ) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        const updatedSubscription = await response.json();

        // Remove from current category
        const removeFromCategory = (category: SubscriptionWithDetails[]) =>
          category.filter((sub) => sub.id !== id);

        // Add to new category
        const addToCategory = (category: SubscriptionWithDetails[]) => [
          ...category,
          updatedSubscription,
        ];

        setSubscriptions((prev) => {
          const newState = {
            active: removeFromCategory(prev.active),
            paused: removeFromCategory(prev.paused),
            cancelled: removeFromCategory(prev.cancelled),
          };

          switch (status) {
            case "ACTIVE":
              newState.active = addToCategory(newState.active);
              break;
            case "PAUSED":
              newState.paused = addToCategory(newState.paused);
              break;
            case "CANCELLED":
              newState.cancelled = addToCategory(newState.cancelled);
              break;
          }

          return newState;
        });
      }
    } catch (error) {
      console.error("Failed to update subscription status:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Subscriptions */}
      {subscriptions.active.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-green-forest-600">
              Active Subscriptions
            </CardTitle>
            <CardDescription>
              Your recurring transfers that are currently active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.active.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paused Subscriptions */}
      {subscriptions.paused.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-green-olive-600">
              Paused Subscriptions
            </CardTitle>
            <CardDescription>
              Subscriptions that are temporarily paused
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.paused.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Subscriptions */}
      {subscriptions.cancelled.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">
              Cancelled Subscriptions
            </CardTitle>
            <CardDescription>
              Subscriptions that have been cancelled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.cancelled.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
