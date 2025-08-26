import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateBeneficiarySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().default("Madagascar"),
  operator: z.string().optional(),
});

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, city, country, operator } =
      updateBeneficiarySchema.parse(body);

    // Check if beneficiary exists and belongs to user
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        isActive: true,
      },
    });

    if (!existingBeneficiary) {
      return NextResponse.json(
        { error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    // Update beneficiary
    const beneficiary = await prisma.beneficiary.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        address: address || null,
        city,
        country,
        operator: operator || null,
      },
    });

    return NextResponse.json(beneficiary);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Beneficiary update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if beneficiary exists and belongs to user
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        isActive: true,
      },
    });

    if (!existingBeneficiary) {
      return NextResponse.json(
        { error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    // Check if beneficiary has active subscriptions
    const activeSubscriptions = await prisma.subscription.findFirst({
      where: {
        beneficiaryId: params.id,
        status: "ACTIVE",
      },
    });

    if (activeSubscriptions) {
      return NextResponse.json(
        {
          error:
            "Cannot delete beneficiary with active subscriptions. Please cancel all subscriptions first.",
        },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.beneficiary.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Beneficiary deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
