import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe-server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfer = await prisma.transfer.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        beneficiary: true,
        subscription: true,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    if (transfer.status !== "FAILED") {
      return NextResponse.json(
        {
          error: "Can only retry failed transfers",
        },
        { status: 400 }
      );
    }

    // If this is a subscription transfer, try to retry the payment
    if (
      transfer.subscriptionId &&
      transfer.subscription?.stripeSubscriptionId
    ) {
      try {
        // Get the latest invoice for this subscription
        const invoices = await stripe.invoices.list({
          subscription: transfer.subscription.stripeSubscriptionId,
          limit: 1,
        });

        if (invoices.data.length > 0) {
          const invoice = invoices.data[0];

          // Attempt to pay the invoice
          if (invoice.status === "open") {
            await stripe.invoices.pay(invoice.id);
          }
        }

        // Update transfer status to pending
        await prisma.transfer.update({
          where: { id: transfer.id },
          data: {
            status: "PENDING",
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          message: "Transfer retry initiated successfully",
          transferId: transfer.id,
        });
      } catch (stripeError: any) {
        console.error("Stripe retry error:", stripeError);
        return NextResponse.json(
          {
            error: `Failed to retry payment: ${stripeError.message}`,
          },
          { status: 400 }
        );
      }
    } else {
      // For one-time transfers, just update status and let admin handle manually
      await prisma.transfer.update({
        where: { id: transfer.id },
        data: {
          status: "PENDING",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Transfer marked as pending for manual processing",
        transferId: transfer.id,
      });
    }
  } catch (error) {
    console.error("Transfer retry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
