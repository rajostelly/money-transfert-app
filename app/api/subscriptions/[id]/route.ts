import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSubscriptionSchema = z.object({
  beneficiaryId: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]).optional(),
  amountCAD: z.number().min(10).max(5000).optional(),
  frequency: z.enum(["weekly", "bi-weekly", "monthly"]).optional(),
  nextTransferDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updateData = updateSubscriptionSchema.parse(body);

    // If beneficiaryId is provided, verify it belongs to the user
    if (updateData.beneficiaryId) {
      const beneficiary = await prisma.beneficiary.findFirst({
        where: {
          id: updateData.beneficiaryId,
          userId: user.id,
        },
      });

      if (!beneficiary) {
        return NextResponse.json(
          { error: "Beneficiary not found" },
          { status: 404 }
        );
      }
    }

    // Verify subscription belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: updateData,
      include: {
        beneficiary: true,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify subscription belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to CANCELLED
    await prisma.subscription.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Subscription deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
