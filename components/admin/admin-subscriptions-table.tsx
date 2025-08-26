"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  Download,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";

interface SubscriptionData {
  id: string;
  user: string;
  userEmail: string;
  beneficiary: string;
  beneficiaryLocation: string;
  amountCAD: number;
  frequency: string;
  status: string;
  createdAt: string;
  nextTransferDate: string;
  lastTransferDate: string;
  lastTransferStatus: string;
  totalTransfers: number;
  totalAmountTransferred: number;
  stripeSubscriptionId?: string;
}

interface AdminSubscriptionsTableProps {
  subscriptions: SubscriptionData[];
}

export function AdminSubscriptionsTable({
  subscriptions,
}: AdminSubscriptionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.beneficiary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || subscription.status === statusFilter;
    const matchesFrequency =
      frequencyFilter === "all" || subscription.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesFrequency;
  });

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

  const exportToCSV = (status: string = "all") => {
    const url = `/api/admin/subscriptions?format=csv&status=${
      status === "all" ? "ACTIVE" : status
    }`;
    window.open(url, "_blank");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Subscription Management</CardTitle>
            <CardDescription>
              Monitor and manage all recurring transfers
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => exportToCSV("ACTIVE")}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Active (CSV)
            </Button>
            <Button
              onClick={() => exportToCSV("all")}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export All (CSV)
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subscriptions Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Transfer</TableHead>
                <TableHead>Total Transfers</TableHead>
                <TableHead>Total Volume</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{subscription.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.userEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{subscription.beneficiary}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.beneficiaryLocation}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      ${subscription.amountCAD.toFixed(2)} CAD
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {subscription.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{subscription.nextTransferDate}</p>
                      {subscription.lastTransferDate !== "N/A" && (
                        <p className="text-xs text-muted-foreground">
                          Last: {subscription.lastTransferDate}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{subscription.totalTransfers}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      ${subscription.totalAmountTransferred.toFixed(2)} CAD
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {subscription.stripeSubscriptionId && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `https://dashboard.stripe.com/subscriptions/${subscription.stripeSubscriptionId}`,
                                "_blank"
                              )
                            }
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            View in Stripe
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No subscriptions found matching your criteria
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {
                filteredSubscriptions.filter((s) => s.status === "ACTIVE")
                  .length
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Active Subscriptions
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              $
              {filteredSubscriptions
                .filter((s) => s.status === "ACTIVE")
                .reduce((sum, s) => sum + s.amountCAD, 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Monthly Volume (CAD)
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {filteredSubscriptions.reduce(
                (sum, s) => sum + s.totalTransfers,
                0
              )}
            </p>
            <p className="text-sm text-muted-foreground">Total Transfers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              $
              {filteredSubscriptions
                .reduce((sum, s) => sum + s.totalAmountTransferred, 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Total Volume (CAD)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
