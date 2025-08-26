"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  DollarSign,
  Calendar,
  Users,
  Pause,
  Play,
  X,
} from "lucide-react";
import type { Subscription, Beneficiary } from "@prisma/client";

interface SubscriptionEditFormProps {
  subscription: Subscription & {
    beneficiary: Beneficiary;
  };
  beneficiaries: Beneficiary[];
}

export function SubscriptionEditForm({
  subscription,
  beneficiaries,
}: SubscriptionEditFormProps) {
  const [formData, setFormData] = useState({
    beneficiaryId: subscription.beneficiaryId,
    amountCAD: subscription.amountCAD.toString(),
    frequency: subscription.frequency,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          beneficiaryId: formData.beneficiaryId,
          amountCAD: Number.parseFloat(formData.amountCAD),
          frequency: formData.frequency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update subscription");
      } else {
        setSuccess("Subscription updated successfully!");
        setTimeout(() => {
          router.push("/dashboard/subscriptions");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "ACTIVE" | "PAUSED" | "CANCELLED"
  ) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || `Failed to ${newStatus.toLowerCase()} subscription`
        );
      } else {
        const action =
          newStatus === "ACTIVE"
            ? "resumed"
            : newStatus === "PAUSED"
            ? "paused"
            : "cancelled";
        setSuccess(`Subscription ${action} successfully!`);
        setTimeout(() => {
          router.push("/dashboard/subscriptions");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const amount = Number.parseFloat(formData.amountCAD) || 0;
  const fee = amount * 0.025;
  const total = amount + fee;

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Status Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Status</CardTitle>
              <CardDescription>
                Subscription to {subscription.beneficiary.name}
              </CardDescription>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                subscription.status
              )}`}
            >
              {subscription.status.toLowerCase()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Current Amount</p>
              <p className="font-medium">
                ${subscription.amountCAD.toString()} CAD
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Frequency</p>
              <p className="font-medium capitalize">{subscription.frequency}</p>
            </div>
          </div>

          {/* Status Control Buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            {subscription.status === "ACTIVE" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("PAUSED")}
                disabled={isLoading}
                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}

            {subscription.status === "PAUSED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={isLoading}
                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}

            {(subscription.status === "ACTIVE" ||
              subscription.status === "PAUSED") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={isLoading}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {subscription.status !== "CANCELLED" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Subscription</CardTitle>
            <CardDescription>
              Modify the details of your recurring transfer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="beneficiary" className="text-sm font-medium">
                  Beneficiary
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Select
                    value={formData.beneficiaryId}
                    onValueChange={(value) =>
                      handleChange("beneficiaryId", value)
                    }
                  >
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries.map((beneficiary) => (
                        <SelectItem key={beneficiary.id} value={beneficiary.id}>
                          {beneficiary.name} - {beneficiary.city},{" "}
                          {beneficiary.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount (CAD)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="10"
                    max="5000"
                    placeholder="Enter amount"
                    value={formData.amountCAD}
                    onChange={(e) => handleChange("amountCAD", e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimum: $10 CAD, Maximum: $5,000 CAD
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm font-medium">
                  Frequency
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => handleChange("frequency", value)}
                  >
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {amount > 0 && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Transfer amount:</span>
                        <span>${amount.toFixed(2)} CAD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee (2.5%):</span>
                        <span>${fee.toFixed(2)} CAD</span>
                      </div>
                      <div className="flex justify-between font-medium text-base border-t pt-2">
                        <span>Total per transfer:</span>
                        <span>${total.toFixed(2)} CAD</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => router.push("/dashboard/subscriptions")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading || beneficiaries.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Subscription"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
