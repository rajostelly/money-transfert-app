"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Settings, DollarSign, Clock, TrendingUp } from "lucide-react";

interface SystemSettingsProps {
  settings: {
    transferFeePercentage: string;
    notificationDaysBefore: string;
    minTransferAmount: string;
    maxTransferAmount: string;
    currentExchangeRate: string;
  };
}

export function SystemSettings({ settings }: SystemSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to update settings");
        setIsError(true);
      } else {
        setMessage("Settings updated successfully");
        setIsError(false);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>System Settings</span>
        </CardTitle>
        <CardDescription>Configure global application settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transferFee" className="text-sm font-medium">
                Transfer Fee Percentage
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                <Input
                  id="transferFee"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="2.5"
                  value={formData.transferFeePercentage}
                  onChange={(e) =>
                    handleChange("transferFeePercentage", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Percentage fee charged on transfers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationDays" className="text-sm font-medium">
                Notification Days Before
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                <Input
                  id="notificationDays"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="3"
                  value={formData.notificationDaysBefore}
                  onChange={(e) =>
                    handleChange("notificationDaysBefore", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Days before transfer to send notification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minAmount" className="text-sm font-medium">
                Minimum Transfer Amount (CAD)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                <Input
                  id="minAmount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="10.00"
                  value={formData.minTransferAmount}
                  onChange={(e) =>
                    handleChange("minTransferAmount", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount" className="text-sm font-medium">
                Maximum Transfer Amount (CAD)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                <Input
                  id="maxAmount"
                  type="number"
                  step="0.01"
                  min="100"
                  placeholder="5000.00"
                  value={formData.maxTransferAmount}
                  onChange={(e) =>
                    handleChange("maxTransferAmount", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="exchangeRate" className="text-sm font-medium">
                Current Exchange Rate (CAD to MGA)
              </Label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="3200.00"
                  value={formData.currentExchangeRate}
                  onChange={(e) =>
                    handleChange("currentExchangeRate", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Current exchange rate from CAD to MGA
              </p>
            </div>
          </div>

          {message && (
            <Alert variant={isError ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Settings...
              </>
            ) : (
              "Update Settings"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
