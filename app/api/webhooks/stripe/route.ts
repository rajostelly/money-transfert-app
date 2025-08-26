import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email-service";
import { NotificationService } from "@/lib/notification-service";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  let event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(invoice: any) {
  console.log("Processing payment succeeded:", invoice.id);

  try {
    const subscriptionId = invoice.subscription;
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: {
        user: true,
        beneficiary: true,
      },
    });

    if (!subscription) {
      console.error("Subscription not found for Stripe ID:", subscriptionId);
      return;
    }

    // Get current exchange rate
    const exchangeRate = await prisma.exchangeRate.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!exchangeRate) {
      console.error("No exchange rate found");
      return;
    }

    const amountCAD = Number(subscription.amountCAD);
    const rate = Number(exchangeRate.rate);
    const amountMGA = amountCAD * rate;
    const feeCAD = amountCAD * 0.025;
    const totalCAD = amountCAD + feeCAD;

    // Create transfer record
    const transfer = await prisma.transfer.create({
      data: {
        userId: subscription.userId,
        beneficiaryId: subscription.beneficiaryId,
        subscriptionId: subscription.id,
        amountCAD,
        amountMGA,
        exchangeRate: rate,
        feeCAD,
        totalCAD,
        type: "SUBSCRIPTION",
        status: "PENDING",
      },
    });

    // Update next transfer date
    const nextDate = calculateNextTransferDate(subscription.frequency);
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { nextTransferDate: nextDate },
    });

    // Send confirmation email
    await emailService.sendTransferCompletedEmail(
      subscription.user.email,
      subscription.user.name,
      subscription.beneficiary.name,
      amountCAD,
      amountMGA,
      transfer.id
    );

    // Create notification
    await NotificationService.notifyTransferCompleted(
      subscription.userId,
      subscription.beneficiary.name,
      amountCAD
    );

    console.log(
      "Successfully processed payment for subscription:",
      subscription.id
    );
  } catch (error) {
    console.error("Error processing payment succeeded:", error);
  }
}

async function handlePaymentFailed(invoice: any) {
  console.log("Processing payment failed:", invoice.id);

  try {
    const subscriptionId = invoice.subscription;
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: {
        user: true,
        beneficiary: true,
      },
    });

    if (!subscription) {
      console.error("Subscription not found for Stripe ID:", subscriptionId);
      return;
    }

    // Pause subscription after payment failure
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "PAUSED" },
    });

    // Send payment failed email
    await emailService.sendPaymentFailedEmail(
      subscription.user.email,
      subscription.user.name,
      subscription.beneficiary.name,
      Number(subscription.amountCAD)
    );

    // Create notification
    await NotificationService.notifyPaymentFailed(
      subscription.userId,
      Number(subscription.amountCAD)
    );

    console.log(
      "Successfully handled payment failure for subscription:",
      subscription.id
    );
  } catch (error) {
    console.error("Error processing payment failed:", error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log("Processing subscription updated:", subscription.id);

  try {
    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) {
      console.error("Subscription not found for Stripe ID:", subscription.id);
      return;
    }

    // Update subscription status based on Stripe status
    let status = "ACTIVE";
    if (subscription.status === "paused") {
      status = "PAUSED";
    } else if (subscription.status === "canceled") {
      status = "CANCELLED";
    }

    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { status: status as any },
    });

    console.log("Successfully updated subscription:", dbSubscription.id);
  } catch (error) {
    console.error("Error processing subscription updated:", error);
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log("Processing subscription cancelled:", subscription.id);

  try {
    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      include: {
        user: true,
        beneficiary: true,
      },
    });

    if (!dbSubscription) {
      console.error("Subscription not found for Stripe ID:", subscription.id);
      return;
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { status: "CANCELLED" },
    });

    // Send cancellation email
    await emailService.sendSubscriptionCancelledEmail(
      dbSubscription.user.email,
      dbSubscription.user.name,
      dbSubscription.beneficiary.name
    );

    // Create notification
    await NotificationService.notifySubscriptionCancelled(
      dbSubscription.userId,
      dbSubscription.beneficiary.name
    );

    console.log(
      "Successfully handled subscription cancellation:",
      dbSubscription.id
    );
  } catch (error) {
    console.error("Error processing subscription cancelled:", error);
  }
}

function calculateNextTransferDate(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "bi-weekly":
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}
