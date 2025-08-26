import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BeneficiaryList } from "@/components/beneficiaries/beneficiary-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getBeneficiaries(userId: string) {
  return await prisma.beneficiary.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });
}

export default async function BeneficiariesPage() {
  const user = await requireAuth();
  const beneficiaries = await getBeneficiaries(user.id);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">
              Beneficiaries
            </h1>
            <p className="text-muted-foreground">
              Manage your money transfer recipients
            </p>
          </div>
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap flex-shrink-0"
          >
            <Link href="/dashboard/beneficiaries/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Beneficiary
            </Link>
          </Button>
        </div>

        {/* Stats Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your beneficiaries summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-emerald-600">
                  {beneficiaries.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Beneficiaries
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600">
                  {
                    beneficiaries.filter((b) => b.country === "Madagascar")
                      .length
                  }
                </div>
                <p className="text-sm text-muted-foreground">In Madagascar</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(beneficiaries.map((b) => b.city)).size}
                </div>
                <p className="text-sm text-muted-foreground">Cities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beneficiaries List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Beneficiaries</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            People you can send money to. Click on a beneficiary to edit their
            details.
          </p>
          <BeneficiaryList beneficiaries={beneficiaries} />
        </div>
      </div>
    </DashboardLayout>
  );
}
