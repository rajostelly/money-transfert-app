import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { MobileMoneyService } from "@/lib/mobile-money-service";
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

    const transferId = params.id;

    // Get transfer details
    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        user: true,
        beneficiary: true,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    if (transfer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Transfer is not pending" },
        { status: 400 }
      );
    }

    // Check if mobile money automation is supported
    if (!MobileMoneyService.isAutomationSupported(transfer.beneficiary.phone)) {
      return NextResponse.json(
        {
          error: "Mobile money automation not supported for this phone number",
        },
        { status: 400 }
      );
    }

    // Process mobile money transfer
    const mobileMoneyResult = await MobileMoneyService.sendMoney({
      recipientPhone: transfer.beneficiary.phone,
      amount: Number(transfer.amountMGA),
      currency: "MGA",
      reference: `TRANSFER_${transfer.id}`,
      transferId: transfer.id,
      beneficiaryName: transfer.beneficiary.name,
    });

    // Update transfer based on mobile money result
    const updatedTransfer = await prisma.transfer.update({
      where: { id: transferId },
      data: {
        status: mobileMoneyResult.success ? "COMPLETED" : "FAILED",
        autoProcessed: true,
        mobileMoneyTransactionId: mobileMoneyResult.transactionId,
        mobileMoneyError: mobileMoneyResult.error,
        confirmedAt: mobileMoneyResult.success ? new Date() : null,
        confirmedBy: mobileMoneyResult.success ? user.id : null,
      },
      include: {
        user: true,
        beneficiary: true,
      },
    });

    // Create appropriate notifications
    try {
      if (mobileMoneyResult.success) {
        await Promise.all([
          // Notify the sender of successful transfer
          NotificationService.createNotification(
            transfer.userId,
            "TRANSFER_COMPLETED",
            "Transfer Completed Automatically",
            `Your transfer of ${transfer.amountMGA.toLocaleString()} MGA to ${
              transfer.beneficiary.name
            } has been automatically processed via ${MobileMoneyService.getOperatorName(
              transfer.beneficiary.phone
            )}.`
          ),

          // Notify Madagascar team of successful automation
          NotificationService.createNotification(
            user.id,
            "TRANSFER_COMPLETED",
            "Transfer Auto-Processed",
            `Transfer to ${transfer.beneficiary.name} was automatically processed via Mobile Money. Transaction ID: ${mobileMoneyResult.transactionId}`
          ),
        ]);
      } else {
        await Promise.all([
          // Notify the sender of failed transfer
          NotificationService.createNotification(
            transfer.userId,
            "TRANSFER_FAILED",
            "Transfer Automation Failed",
            `Automatic processing of your transfer to ${transfer.beneficiary.name} failed. Our team will process it manually. Error: ${mobileMoneyResult.error}`
          ),

          // Notify Madagascar team of failed automation
          NotificationService.createNotification(
            user.id,
            "TRANSFER_FAILED",
            "Mobile Money Automation Failed",
            `Automatic processing for transfer to ${transfer.beneficiary.name} failed: ${mobileMoneyResult.error}. Manual processing required.`
          ),
        ]);
      }
    } catch (notificationError) {
      console.error("Failed to create notifications:", notificationError);
    }

    return NextResponse.json({
      success: mobileMoneyResult.success,
      transfer: {
        id: updatedTransfer.id,
        status: updatedTransfer.status,
        autoProcessed: updatedTransfer.autoProcessed,
        mobileMoneyTransactionId: updatedTransfer.mobileMoneyTransactionId,
        mobileMoneyError: updatedTransfer.mobileMoneyError,
      },
      mobileMoneyResult,
    });
  } catch (error) {
    console.error("Failed to automate transfer:", error);
    return NextResponse.json(
      { error: "Failed to automate transfer" },
      { status: 500 }
    );
  }
}
