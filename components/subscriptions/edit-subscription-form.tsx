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
import { Loader2, Users, DollarSign, Calendar } from "lucide-react";
import type { Subscription, Beneficiary } from "@prisma/client";

interface SubscriptionWithBeneficiary extends Subscription {
  beneficiary: Beneficiary;
}

interface EditSubscriptionFormProps {
  subscription: SubscriptionWithBeneficiary;
  beneficiaries: Beneficiary[];
}

export function EditSubscriptionForm({
  subscription,
  beneficiaries,
}: EditSubscriptionFormProps) {
  const [formData, setFormData] = useState({
    beneficiaryId: subscription.beneficiaryId,
    amountCAD: subscription.amountCAD.toString(),
    frequency: subscription.frequency,
    status: subscription.status,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          beneficiaryId: formData.beneficiaryId,
          amountCAD: parseFloat(formData.amountCAD),
          frequency: formData.frequency,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update subscription");
      } else {
        router.push("/dashboard/subscriptions");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this subscription?")) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/subscriptions/${subscription.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        });

        if (response.ok) {
          router.push("/dashboard/subscriptions");
          router.refresh();
        } else {
          setError("Failed to cancel subscription");
        }
      } catch (error) {
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const amount = parseFloat(formData.amountCAD) || 0;
  const fee = amount * 0.025;
  const total = amount + fee;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Subscription</CardTitle>
          <CardDescription>
            Modify your recurring transfer settings
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

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard/subscriptions")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
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
    </div>
  );
}
