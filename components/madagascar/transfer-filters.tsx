"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";

interface TransferFiltersProps {
  onFilterChange: (filters: TransferFilters) => void;
  beneficiaries: Array<{ id: string; name: string }>;
  operators: string[];
}

export interface TransferFilters {
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  beneficiary?: string;
  operator?: string;
  status?: string;
  searchTerm?: string;
}

export function TransferFilters({
  onFilterChange,
  beneficiaries,
  operators,
}: TransferFiltersProps) {
  const [filters, setFilters] = useState<TransferFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (
    key: keyof TransferFilters,
    value: string | number | undefined
  ) => {
    // Convert "all", "none" values to empty string for filtering
    const processedValue =
      value === "all" || value === "none" ? undefined : value;

    const newFilters = { ...filters, [key]: processedValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: TransferFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Transfers
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick search */}
        <div className="space-y-2">
          <Label htmlFor="search">Quick Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by beneficiary name, phone, or transfer ID..."
              value={filters.searchTerm || ""}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isExpanded && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Date range */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>

            {/* Amount range */}
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount (MGA)</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="Min amount"
                value={filters.minAmount || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "minAmount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Amount (MGA)</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="Max amount"
                value={filters.maxAmount || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "maxAmount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            {/* Beneficiary */}
            <div className="space-y-2">
              <Label htmlFor="beneficiary">Beneficiary</Label>
              <Select
                value={filters.beneficiary || "all"}
                onValueChange={(value) =>
                  handleFilterChange("beneficiary", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All beneficiaries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All beneficiaries</SelectItem>
                  {beneficiaries.map((beneficiary) => (
                    <SelectItem key={beneficiary.id} value={beneficiary.id}>
                      {beneficiary.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator */}
            <div className="space-y-2">
              <Label htmlFor="operator">Mobile Operator</Label>
              <Select
                value={filters.operator || "all"}
                onValueChange={(value) => handleFilterChange("operator", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All operators" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All operators</SelectItem>
                  {operators.map((operator) => (
                    <SelectItem key={operator} value={operator}>
                      {operator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
