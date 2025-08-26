import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { stripe } from "@/lib/stripe-server";
import { emailService } from "@/lib/email-service";
import { getCurrentUser } from "@/lib/auth-utils";

const createSubscriptionSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  amountCAD: z
    .number()
    .min(10, "Minimum amount is $10")
    .max(5000, "Maximum amount is $5000"),
  frequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  nextTransferDate: z.string().transform((str) => new Date(str)),
  paymentMethodId: z.string().min(1, "Payment method is required"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      beneficiaryId,
      amountCAD,
      frequency,
      nextTransferDate,
      paymentMethodId,
    } = createSubscriptionSchema.parse(body);

    // Verify beneficiary belongs to user
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: beneficiaryId,
        userId: user.id,
        isActive: true,
      },
    });

    if (!beneficiary) {
      return NextResponse.json(
        { error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create Stripe product and price
    const product = await stripe.products.create({
      name: `Transfer to ${beneficiary.name}`,
      description: `Recurring transfer of $${amountCAD} CAD to ${beneficiary.name}`,
    });

    // Map frequency to Stripe interval
    const intervalMapping = {
      weekly: "week",
      "bi-weekly": "week",
      monthly: "month",
    } as const;

    const intervalCount = frequency === "bi-weekly" ? 2 : 1;

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amountCAD * 100), // Convert to cents
      currency: "cad",
      recurring: {
        interval: intervalMapping[frequency],
        interval_count: intervalCount,
      },
    });

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
      metadata: {
        userId: user.id,
        beneficiaryId,
        frequency,
      },
    });

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        beneficiaryId,
        amountCAD,
        frequency,
        nextTransferDate,
        status: "ACTIVE",
        stripeSubscriptionId: stripeSubscription.id,
      },
      include: {
        beneficiary: true,
        user: true,
      },
    });

    // Send confirmation email
    await emailService.sendSubscriptionCreatedEmail(
      user.email,
      user.name,
      beneficiary.name,
      amountCAD,
      frequency
    );

    // Create notification for subscription creation
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Subscription created for ${beneficiary.name} with $${amountCAD} CAD every ${frequency}`,
        type: "SUBSCRIPTION_CREATED",
        title: "Subscription Created",
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Subscription creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
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

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: user.id,
      },
      include: {
        beneficiary: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
