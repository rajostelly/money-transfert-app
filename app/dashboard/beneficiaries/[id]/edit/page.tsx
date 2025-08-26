import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BeneficiaryForm } from "@/components/beneficiaries/beneficiary-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notFound } from "next/navigation";

async function getBeneficiary(id: string, userId: string) {
  const beneficiary = await prisma.beneficiary.findFirst({
    where: {
      id,
      userId,
      isActive: true,
    },
  });

  if (!beneficiary) {
    notFound();
  }

  return beneficiary;
}

interface PageProps {
  params: { id: string };
}

export default async function EditBeneficiaryPage({ params }: PageProps) {
  const user = await requireAuth();
  const beneficiary = await getBeneficiary(params.id, user.id);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Edit Beneficiary
          </h1>
          <p className="text-muted-foreground mt-2">
            Update {beneficiary.name}&apos;s information
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Beneficiary Details</CardTitle>
            <CardDescription>
              Make sure all information is correct before saving changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BeneficiaryForm beneficiary={beneficiary} mode="edit" />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
