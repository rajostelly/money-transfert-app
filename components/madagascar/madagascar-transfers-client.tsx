"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  TransferFilters,
  type TransferFilters as FilterType,
} from "@/components/madagascar/transfer-filters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Smartphone,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { MobileMoneyService } from "@/lib/mobile-money-service";

interface Transfer {
  id: string;
  userId: string;
  beneficiaryId: string;
  amountCAD: number;
  amountMGA: number;
  exchangeRate: number;
  status: string;
  autoProcessed: boolean;
  mobileMoneyTransactionId?: string;
  mobileMoneyError?: string;
  createdAt: string;
  confirmedAt?: string;
  user: { id: string; name: string; email: string };
  beneficiary: {
    id: string;
    name: string;
    phone: string;
    city: string;
    country: string;
    address?: string;
    operator?: string;
  };
}

interface MadagascarTransfersClientProps {
  transfers: Transfer[];
  beneficiaries: Array<{ id: string; name: string; operator?: string }>;
  operators: string[];
  user: { id: string; name: string };
}

export function MadagascarTransfersClient({
  transfers,
  beneficiaries,
  operators,
  user,
}: MadagascarTransfersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const [isAutomating, setIsAutomating] = useState<string | null>(null);

  const handleFilterChange = (filters: FilterType) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });

    router.push(`/madagascar/transfers/enhanced?${params.toString()}`);
  };

  const confirmTransfer = async (transferId: string) => {
    setIsConfirming(transferId);
    try {
      const response = await fetch(
        `/api/madagascar/transfers/${transferId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmedBy: user.id }),
        }
      );

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to confirm transfer:", error);
    } finally {
      setIsConfirming(null);
    }
  };

  const automateTransfer = async (transferId: string) => {
    setIsAutomating(transferId);
    try {
      const response = await fetch(
        `/api/madagascar/transfers/${transferId}/automate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to automate transfer:", error);
    } finally {
      setIsAutomating(null);
    }
  };

  const pendingTransfers = transfers.filter((t) => t.status === "PENDING");
  const completedTransfers = transfers.filter((t) => t.status === "COMPLETED");
  const failedTransfers = transfers.filter((t) => t.status === "FAILED");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Transfer Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and process money transfers with filtering and automation
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {pendingTransfers.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {completedTransfers.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {transfers.filter((t) => t.autoProcessed).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Automated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {beneficiaries.filter((b) => b.operator).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mobile Money Ready
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <TransferFilters
          onFilterChange={handleFilterChange}
          beneficiaries={beneficiaries}
          operators={operators}
        />

        {/* Transfers List */}
        {transfers.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No transfers found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see transfers.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {transfers.map((transfer) => (
              <Card key={transfer.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center space-x-2">
                      <span>{transfer.beneficiary.name}</span>
                      {transfer.autoProcessed && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          <Zap className="mr-1 h-3 w-3" />
                          Auto
                        </Badge>
                      )}
                    </CardTitle>

                    <div className="flex items-center space-x-2">
                      {transfer.beneficiary.operator && (
                        <Badge variant="outline" className="text-xs">
                          <Smartphone className="mr-1 h-3 w-3" />
                          {transfer.beneficiary.operator}
                        </Badge>
                      )}

                      <Badge
                        className={
                          transfer.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : transfer.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : transfer.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {transfer.status === "PENDING" && (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {transfer.status === "COMPLETED" && (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        )}
                        {transfer.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Transfer from {transfer.user.name} •{" "}
                    {format(
                      new Date(transfer.createdAt),
                      "MMMM dd, yyyy 'at' HH:mm"
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          Transfer Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Amount (CAD):
                            </span>
                            <span className="font-medium">
                              ${transfer.amountCAD.toString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Amount (MGA):
                            </span>
                            <span className="font-medium">
                              {transfer.amountMGA.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Exchange Rate:
                            </span>
                            <span className="font-medium">
                              1 CAD = {transfer.exchangeRate.toLocaleString()}{" "}
                              MGA
                            </span>
                          </div>
                          {transfer.mobileMoneyTransactionId && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Mobile Money ID:
                              </span>
                              <span className="font-medium font-mono text-xs">
                                {transfer.mobileMoneyTransactionId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {transfer.mobileMoneyError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-700">
                            <strong>Mobile Money Error:</strong>{" "}
                            {transfer.mobileMoneyError}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          Beneficiary Information
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.beneficiary.phone}</span>
                            {transfer.beneficiary.operator && (
                              <span className="text-muted-foreground">
                                (
                                {MobileMoneyService.getOperatorName(
                                  transfer.beneficiary.phone
                                )}
                                )
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {transfer.beneficiary.city},{" "}
                              {transfer.beneficiary.country}
                            </span>
                          </div>
                          {transfer.beneficiary.address && (
                            <div className="text-sm text-muted-foreground">
                              {transfer.beneficiary.address}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {transfer.status === "PENDING" && (
                        <div className="space-y-2">
                          {/* Auto-process button */}
                          {MobileMoneyService.isAutomationSupported(
                            transfer.beneficiary.phone
                          ) && (
                            <Button
                              onClick={() => automateTransfer(transfer.id)}
                              disabled={isAutomating === transfer.id}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              {isAutomating === transfer.id
                                ? "Processing..."
                                : "Auto-Process via Mobile Money"}
                            </Button>
                          )}

                          {/* Manual confirm button */}
                          <Button
                            onClick={() => confirmTransfer(transfer.id)}
                            disabled={isConfirming === transfer.id}
                            variant={
                              MobileMoneyService.isAutomationSupported(
                                transfer.beneficiary.phone
                              )
                                ? "outline"
                                : "default"
                            }
                            className={
                              !MobileMoneyService.isAutomationSupported(
                                transfer.beneficiary.phone
                              )
                                ? "w-full bg-emerald-600 hover:bg-emerald-700"
                                : "w-full"
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {isConfirming === transfer.id
                              ? "Confirming..."
                              : "Manual Confirm"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
