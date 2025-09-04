import { requireAuth } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BeneficiaryForm } from "@/components/beneficiaries/beneficiary-form";

export default async function NewBeneficiaryPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Add Beneficiary
          </h1>
          <p className="text-muted-foreground mt-2">
            Add someone who will receive your money transfers
          </p>
        </div>
        <div className="max-w-2xl">
          <BeneficiaryForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
