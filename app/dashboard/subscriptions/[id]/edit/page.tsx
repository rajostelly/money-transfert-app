import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { SubscriptionEditForm } from "@/components/subscriptions/subscription-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EditSubscriptionPageProps {
  params: {
    id: string;
  };
}

async function EditSubscriptionPageContent({
  params,
}: EditSubscriptionPageProps) {
  const user = await requireAuth();

  const subscription = await prisma.subscription.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      beneficiary: true,
    },
  });

  if (!subscription) {
    notFound();
  }

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <SubscriptionEditForm
      subscription={subscription}
      beneficiaries={beneficiaries}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditSubscriptionPage({
  params,
}: EditSubscriptionPageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EditSubscriptionPageContent params={params} />
    </Suspense>
  );
}
