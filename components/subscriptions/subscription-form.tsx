"use client";

import type React from "react";
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
import { Loader2, DollarSign, Calendar, Users } from "lucide-react";
import type { BeneficiaryWithRelations } from "@/lib/types";

interface SubscriptionFormProps {
  beneficiaries: BeneficiaryWithRelations[];
}

export function SubscriptionForm({ beneficiaries }: SubscriptionFormProps) {
  const [formData, setFormData] = useState({
    beneficiaryId: "",
    amountCAD: "",
    frequency: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateNextTransferDate = (frequency: string): Date => {
    const now = new Date();
    switch (frequency) {
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "bi-weekly":
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case "monthly":
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amountCAD: Number.parseFloat(formData.amountCAD),
          nextTransferDate: calculateNextTransferDate(formData.frequency),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create subscription");
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

  const amount = Number.parseFloat(formData.amountCAD) || 0;
  const fee = amount * 0.025;
  const total = amount + fee;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create Subscription</CardTitle>
          <CardDescription>
            Set up automatic recurring transfers to Madagascar
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
                  value={selectedBeneficiary}
                  onValueChange={setSelectedBeneficiary}
                >
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="Select a beneficiary" />
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
              {beneficiaries.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No beneficiaries found.{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-emerald-600"
                    onClick={() => router.push("/dashboard/beneficiaries/new")}
                  >
                    Add one first
                  </Button>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (CAD)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                    Creating...
                  </>
                ) : (
                  "Create Subscription"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
