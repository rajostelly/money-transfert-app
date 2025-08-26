import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotificationService } from "@/lib/notification-service";
import { AuditService } from "@/lib/audit-service";
import { SecurityService } from "@/lib/security";

const createTransferSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  amountCAD: z
    .number()
    .min(10, "Minimum amount is $10")
    .max(5000, "Maximum amount is $5000"),
  type: z.enum(["ONE_TIME", "SUBSCRIPTION"]),
  subscriptionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Log unauthorized access attempt
      await AuditService.logAuthEvent(
        null,
        "LOGIN_FAILED",
        request.headers.get("x-forwarded-for") || "unknown",
        request.headers.get("user-agent") || "unknown",
        { reason: "Invalid or missing token", endpoint: "/api/transfers" }
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Sanitize input data
    const sanitizedBody = {
      ...body,
      beneficiaryId: SecurityService.sanitizeInput(body.beneficiaryId || ""),
    };

    const { beneficiaryId, amountCAD, type, subscriptionId } =
      createTransferSchema.parse(sanitizedBody);

    // Verify beneficiary belongs to user
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: beneficiaryId,
        userId: user.id,
        isActive: true,
      },
    });

    if (!beneficiary) {
      // Log access attempt to non-existent or unauthorized beneficiary
      await AuditService.logTransferEvent(
        user.id,
        "CREATE",
        "FAILED",
        undefined,
        { beneficiaryId, error: "Beneficiary not found" },
        request.headers.get("x-forwarded-for") || "unknown",
        request.headers.get("user-agent") || "unknown"
      );
      return NextResponse.json(
        { error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    // Get current exchange rate
    const exchangeRate = await prisma.exchangeRate.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!exchangeRate) {
      await AuditService.logTransferEvent(
        user.id,
        "CREATE",
        "FAILED",
        undefined,
        { error: "Exchange rate not available" },
        request.headers.get("x-forwarded-for") || "unknown",
        request.headers.get("user-agent") || "unknown"
      );
      return NextResponse.json(
        { error: "Exchange rate not available" },
        { status: 500 }
      );
    }

    // Calculate amounts
    const rate = Number(exchangeRate.rate);
    const amountMGA = amountCAD * rate;
    const feeCAD = amountCAD * 0.025;
    const totalCAD = amountCAD + feeCAD;

    // Create transfer with audit trail
    const transfer = await prisma.transfer.create({
      data: {
        userId: user.id,
        beneficiaryId,
        subscriptionId,
        amountCAD,
        amountMGA,
        exchangeRate: rate,
        feeCAD,
        totalCAD,
        type,
        status: "PENDING",
      },
      include: {
        beneficiary: true,
        user: true,
      },
    });

    // Log successful transfer creation
    await AuditService.logTransferEvent(
      user.id,
      "CREATE",
      transfer.id,
      undefined,
      {
        // Mask sensitive data in audit log
        amountCAD: SecurityService.maskSensitiveData(amountCAD.toString(), 2),
        beneficiaryName: SecurityService.maskSensitiveData(beneficiary.name, 2),
        type,
        exchangeRate: rate,
      },
      request.headers.get("x-forwarded-for") || "unknown",
      request.headers.get("user-agent") || "unknown"
    );

    try {
      await NotificationService.createNotification(
        user.id,
        "TRANSFER_REMINDER",
        "Transfer Created",
        `Your transfer of $${amountCAD} CAD to ${beneficiary.name} has been created and is being processed.`
      );
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      // Don't fail the transfer if notification fails
    }

    return NextResponse.json(transfer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Transfer creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = { userId: user.id };
    if (status) where.status = status;
    if (type) where.type = type;

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        beneficiary: true,
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Transfers fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
