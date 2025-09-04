import { requireAuth } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BeneficiaryForm } from "@/components/beneficiaries/beneficiary-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewBeneficiaryPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Add Beneficiary
          </h1>
          <p className="text-muted-foreground mt-2">
            Add someone who will receive your money transfers
          </p>
        </div>
        <div className="max-w-2xl">
          <Card className="shadow-sm border-0 bg-card/50">
            <CardContent className="pt-6 px-6 pb-6">
              <BeneficiaryForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
