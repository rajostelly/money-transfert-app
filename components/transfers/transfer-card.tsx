import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, MapPin, Eye } from "lucide-react";
import { format } from "date-fns";
import type { Transfer, Beneficiary } from "@prisma/client";
import Link from "next/link";

type TransferWithBeneficiary = Transfer & {
  beneficiary: Beneficiary;
};

interface TransferCardProps {
  transfer: TransferWithBeneficiary;
}

export function TransferCard({ transfer }: TransferCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "SUBSCRIPTION" ? "Recurring" : "One-time";
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {transfer.beneficiary.name}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {getTypeLabel(transfer.type)}
          </Badge>
          <Badge className={getStatusColor(transfer.status)}>
            {transfer.status.toLowerCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {transfer.beneficiary.city}, {transfer.beneficiary.country}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Amount Sent</p>
              <p className="font-medium">
                ${transfer.amountCAD.toString()} CAD
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Amount Received</p>
              <p className="font-medium">
                {transfer.amountMGA.toLocaleString()} MGA
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Transfer Date</p>
            <p className="font-medium">
              {format(new Date(transfer.createdAt), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        {transfer.status === "COMPLETED" && transfer.confirmedAt && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Completed on</p>
            <p className="font-medium text-emerald-600">
              {format(
                new Date(transfer.confirmedAt),
                "MMMM dd, yyyy 'at' HH:mm"
              )}
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
          >
            <Link href={`/dashboard/transfers/${transfer.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
