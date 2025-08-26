import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MADAGASCAR_TEAM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { confirmedBy } = await request.json();
    const transferId = params.id;

    // Update transfer status
    const transfer = await prisma.transfer.update({
      where: { id: transferId },
      data: {
        status: "COMPLETED",
        confirmedAt: new Date(),
        confirmedBy,
      },
      include: {
        user: true,
        beneficiary: true,
      },
    });

    // Create notifications
    try {
      await Promise.all([
        // Notify the sender
        NotificationService.createNotification(
          transfer.userId,
          "TRANSFER_COMPLETED",
          "Transfer Confirmed",
          `Your transfer of ${transfer.amountMGA.toLocaleString()} MGA to ${
            transfer.beneficiary.name
          } has been confirmed and is ready for pickup.`
        ),

        // Notify Madagascar team (optional)
        NotificationService.createNotification(
          user.id,
          "TRANSFER_COMPLETED",
          "Transfer Processed",
          `Transfer to ${transfer.beneficiary.name} has been manually confirmed.`
        ),
      ]);
    } catch (notificationError) {
      console.error("Failed to create notifications:", notificationError);
    }

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        status: transfer.status,
        confirmedAt: transfer.confirmedAt,
      },
    });
  } catch (error) {
    console.error("Failed to confirm transfer:", error);
    return NextResponse.json(
      { error: "Failed to confirm transfer" },
      { status: 500 }
    );
  }
}
