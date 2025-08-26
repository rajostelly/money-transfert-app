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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Search,
  Users,
} from "lucide-react";
import type { Beneficiary } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BeneficiaryListProps {
  beneficiaries: Beneficiary[];
}

export function BeneficiaryList({ beneficiaries }: BeneficiaryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const filteredBeneficiaries = beneficiaries.filter(
    (beneficiary) =>
      beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.phone.includes(searchTerm)
  );

  const handleDelete = async (beneficiaryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this beneficiary? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(beneficiaryId);
    try {
      const response = await fetch(`/api/beneficiaries/${beneficiaryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete beneficiary. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting beneficiary:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (beneficiaries.length === 0) {
    return (
      <EmptyState
        icon="Users"
        title="No beneficiaries yet"
        description="Add your first beneficiary to start sending money transfers"
        actionLabel="Add Beneficiary"
        actionHref="/dashboard/beneficiaries/new"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Search beneficiaries by name, city, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      {searchTerm && (
        <p className="text-sm text-muted-foreground">
          {filteredBeneficiaries.length} of {beneficiaries.length} beneficiaries
        </p>
      )}

      {/* Beneficiaries Grid */}
      {filteredBeneficiaries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No beneficiaries match your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBeneficiaries.map((beneficiary) => (
            <Card
              key={beneficiary.id}
              className="shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
                <CardTitle className="text-lg font-semibold truncate pr-2">
                  {beneficiary.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/beneficiaries/${beneficiary.id}/edit`}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(beneficiary.id)}
                      disabled={isDeleting === beneficiary.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting === beneficiary.id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {beneficiary.city}, {beneficiary.country}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{beneficiary.phone}</span>
                  </div>

                  {beneficiary.address && (
                    <div className="text-sm text-muted-foreground">
                      <p className="truncate" title={beneficiary.address}>
                        {beneficiary.address}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2 pt-2 mt-auto">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Link
                      href={`/dashboard/transfers/new?beneficiary=${beneficiary.id}`}
                    >
                      Send Money
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Link
                      href={`/dashboard/subscriptions/new?beneficiary=${beneficiary.id}`}
                    >
                      Subscribe
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
