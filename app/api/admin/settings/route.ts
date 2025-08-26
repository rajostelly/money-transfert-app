import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  transferFeePercentage: z.string(),
  notificationDaysBefore: z.string(),
  minTransferAmount: z.string(),
  maxTransferAmount: z.string(),
  currentExchangeRate: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    // Require ADMIN role to access settings
    const user = await requireRole(["ADMIN"]);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.systemSettings.findMany();
    const exchangeRate = await prisma.exchangeRate.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      transferFeePercentage: settingsMap.TRANSFER_FEE_PERCENTAGE || "2.5",
      notificationDaysBefore: settingsMap.NOTIFICATION_DAYS_BEFORE || "3",
      minTransferAmount: settingsMap.MIN_TRANSFER_AMOUNT || "10.00",
      maxTransferAmount: settingsMap.MAX_TRANSFER_AMOUNT || "5000.00",
      currentExchangeRate: exchangeRate?.rate.toString() || "3200.00",
    });
  } catch (error) {
    console.error("Admin settings fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require ADMIN role to update settings
    const user = await requireRole(["ADMIN"]);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      transferFeePercentage,
      notificationDaysBefore,
      minTransferAmount,
      maxTransferAmount,
      currentExchangeRate,
    } = settingsSchema.parse(body);

    // Update system settings
    await Promise.all([
      prisma.systemSettings.upsert({
        where: { key: "TRANSFER_FEE_PERCENTAGE" },
        update: { value: transferFeePercentage },
        create: {
          key: "TRANSFER_FEE_PERCENTAGE",
          value: transferFeePercentage,
        },
      }),
      prisma.systemSettings.upsert({
        where: { key: "NOTIFICATION_DAYS_BEFORE" },
        update: { value: notificationDaysBefore },
        create: {
          key: "NOTIFICATION_DAYS_BEFORE",
          value: notificationDaysBefore,
        },
      }),
      prisma.systemSettings.upsert({
        where: { key: "MIN_TRANSFER_AMOUNT" },
        update: { value: minTransferAmount },
        create: { key: "MIN_TRANSFER_AMOUNT", value: minTransferAmount },
      }),
      prisma.systemSettings.upsert({
        where: { key: "MAX_TRANSFER_AMOUNT" },
        update: { value: maxTransferAmount },
        create: { key: "MAX_TRANSFER_AMOUNT", value: maxTransferAmount },
      }),
    ]);

    // Update exchange rate
    await prisma.exchangeRate.create({
      data: {
        fromCurrency: "CAD",
        toCurrency: "MGA",
        rate: Number.parseFloat(currentExchangeRate),
      },
    });

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Admin settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
