import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSubscriptionSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  amountCAD: z.number().min(10, "Minimum amount is $10").max(5000, "Maximum amount is $5000"),
  frequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  nextTransferDate: z.string().transform((str) => new Date(str)),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { beneficiaryId, amountCAD, frequency, nextTransferDate } = createSubscriptionSchema.parse(body)

    // Verify beneficiary belongs to user
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: beneficiaryId,
        userId: session.user.id,
        isActive: true,
      },
    })

    if (!beneficiary) {
      return NextResponse.json({ error: "Beneficiary not found" }, { status: 404 })
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        beneficiaryId,
        amountCAD,
        frequency,
        nextTransferDate,
        status: "ACTIVE",
      },
      include: {
        beneficiary: true,
      },
    })

    // Create notification for subscription creation
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        message: `Subscription created for ${beneficiary.name} with ${amountCAD} CAD every ${frequency}`,
        type: "SUBSCRIPTION_CREATED",
      },
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
