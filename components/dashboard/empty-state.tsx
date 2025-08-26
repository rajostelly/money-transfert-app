"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Send,
  Users,
  DollarSign,
  Plus,
  ArrowRight,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle,
  Clock,
} from "lucide-react";

interface EmptyStateProps {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const iconMap = {
  CreditCard,
  Send,
  Users,
  DollarSign,
  Plus,
  ArrowRight,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle,
  Clock,
} as const;

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const Icon = iconMap[icon] || CreditCard;

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
        {actionLabel &&
          (actionHref || onAction) &&
          (actionHref ? (
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button
              onClick={onAction}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {actionLabel}
            </Button>
          ))}
      </CardContent>
    </Card>
  );
}
