"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Loader2, DollarSign, Users, TrendingUp, Info } from "lucide-react";
import type { Beneficiary } from "@prisma/client";

interface TransferFormProps {
  beneficiaries: Beneficiary[];
}

interface ExchangeRate {
  rate: number;
  fromCurrency: string;
  toCurrency: string;
}

export function TransferForm({ beneficiaries }: TransferFormProps) {
  const [formData, setFormData] = useState({
    beneficiaryId: "",
    amountCAD: "",
  });
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch current exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoadingRate(true);
      try {
        const response = await fetch("/api/exchange-rate");
        if (response.ok) {
          const rate = await response.json();
          setExchangeRate(rate);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amountCAD: Number.parseFloat(formData.amountCAD),
          type: "ONE_TIME",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create transfer");
      } else {
        router.push("/dashboard/transfers");
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
  const amountMGA = exchangeRate ? amount * exchangeRate.rate : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Send Money</CardTitle>
          <CardDescription>
            Send a one-time transfer to Madagascar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="beneficiary" className="text-sm font-medium">
                Beneficiary
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={formData.beneficiaryId}
                  onValueChange={(value) =>
                    handleChange("beneficiaryId", value)
                  }
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
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

            {/* Exchange Rate Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Current Exchange Rate
                  </span>
                </div>
                {isLoadingRate ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Loading current rate...
                    </span>
                  </div>
                ) : exchangeRate ? (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-blue-900">
                      1 CAD = {exchangeRate.rate.toLocaleString()} MGA
                    </p>
                    <p className="text-xs text-blue-700">
                      Rate updated in real-time
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">
                    Unable to load exchange rate
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Transfer Summary */}
            {amount > 0 && exchangeRate && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Transfer amount:</span>
                      <span>${amount.toFixed(2)} CAD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service fee (2.5%):</span>
                      <span>${fee.toFixed(2)} CAD</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span>Total to be charged:</span>
                      <span className="font-medium">
                        ${total.toFixed(2)} CAD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm bg-emerald-100 p-2 rounded">
                      <span className="text-emerald-800">
                        Recipient will receive:
                      </span>
                      <span className="font-semibold text-emerald-800">
                        {amountMGA.toLocaleString()} MGA
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your transfer will be processed within 24 hours. The recipient
                will be notified once the money is ready for pickup.
              </AlertDescription>
            </Alert>

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
                onClick={() => router.push("/dashboard/transfers")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={
                  isLoading || beneficiaries.length === 0 || !exchangeRate
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Send Money"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
